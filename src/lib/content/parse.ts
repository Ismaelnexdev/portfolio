import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { isValidIsoDate } from "./dates";
import {
  DIARY_KINDS,
  type DiaryEntry,
  type DiaryKind,
  type Project,
} from "./types";

/** Erro num ficheiro de conteúdo. A mensagem diz qual ficheiro e qual campo. */
export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`);
    this.name = "ContentError";
  }
}

type Data = Record<string, unknown>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const WORDS_PER_MINUTE = 200;

/** Nome do ficheiro → endereço. Só minúsculas, números e hífenes. */
export function slugFromFileName(fileName: string, stripDate = false): string {
  let slug = fileName.replace(/\.md$/, "");
  if (stripDate) slug = slug.replace(DATE_PREFIX, "");
  return slug;
}

/** O cabeçalho fica entre duas linhas com ---. Aceita também ficheiros do Windows (CRLF). */
const FRONT_MATTER =
  /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/;

function readFile(raw: string, file: string): { data: Data; body: string } {
  const match = FRONT_MATTER.exec(raw);
  if (!match) {
    throw new ContentError(
      file,
      "o ficheiro tem de começar por um cabeçalho, entre duas linhas com ---.",
    );
  }

  let data: unknown;
  try {
    data = parseYaml(match[1]);
  } catch (error) {
    const reason =
      error instanceof Error ? error.message.split("\n")[0] : "erro desconhecido";
    throw new ContentError(
      file,
      `não foi possível ler o cabeçalho (${reason}). Se algum texto tiver dois pontos (:), escreve-o entre aspas.`,
    );
  }

  if (data === null || data === undefined) data = {};
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new ContentError(file, "o cabeçalho tem de ser uma lista de campos (campo: valor).");
  }
  return { data: data as Data, body: match[2] };
}

function text(data: Data, key: string, file: string, max: number): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ContentError(file, `falta o campo "${key}" (texto).`);
  }
  if (value.length > max) {
    throw new ContentError(
      file,
      `o campo "${key}" tem ${value.length} carateres e o máximo é ${max}.`,
    );
  }
  return value.trim();
}

/** A data fica como texto AAAA-MM-DD e tem de existir no calendário. */
function date(data: Data, file: string): string {
  const value = data.date;
  const iso = typeof value === "string" ? value.trim() : "";
  if (!isValidIsoDate(iso)) {
    throw new ContentError(
      file,
      `o campo "date" tem de ser uma data real no formato AAAA-MM-DD (por exemplo 2026-10-30).`,
    );
  }
  return iso;
}

function optionalUrl(data: Data, key: string, file: string): string | undefined {
  const value = data[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new ContentError(file, `o campo "${key}" tem de ser um endereço.`);
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ContentError(file, `o campo "${key}" não é um endereço válido: ${value}`);
  }
  if (url.protocol !== "https:") {
    throw new ContentError(file, `o campo "${key}" tem de começar por https://`);
  }
  return value;
}

function flag(data: Data, key: string, file: string): boolean {
  const value = data[key];
  if (value === undefined) return false;
  if (typeof value !== "boolean") {
    throw new ContentError(file, `o campo "${key}" tem de ser true ou false.`);
  }
  return value;
}

function slugOf(fileName: string, stripDate: boolean): string {
  const slug = slugFromFileName(fileName, stripDate);
  if (!SLUG.test(slug)) {
    throw new ContentError(
      fileName,
      `o nome do ficheiro dá o endereço "${slug}", que só pode ter letras minúsculas sem acentos, números e hífenes.`,
    );
  }
  return slug;
}

function render(body: string): string {
  return marked.parse(body, { async: false });
}

export function parseDiaryEntry(raw: string, fileName: string): DiaryEntry {
  const { data, body } = readFile(raw, fileName);
  const slug = slugOf(fileName, true);

  const kind = data.kind;
  if (typeof kind !== "string" || !DIARY_KINDS.includes(kind as DiaryKind)) {
    throw new ContentError(
      fileName,
      `o campo "kind" tem de ser um destes: ${DIARY_KINDS.join(", ")}.`,
    );
  }

  const words = body.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: text(data, "title", fileName, 100),
    date: date(data, fileName),
    kind: kind as DiaryKind,
    summary: text(data, "summary", fileName, 200),
    link: optionalUrl(data, "link", fileName),
    draft: flag(data, "draft", fileName),
    html: render(body),
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
}

export function parseProject(raw: string, fileName: string): Project {
  const { data, body } = readFile(raw, fileName);
  const slug = slugOf(fileName, false);

  const stack = data.stack;
  if (
    !Array.isArray(stack) ||
    stack.length === 0 ||
    !stack.every((item) => typeof item === "string" && item.trim() !== "")
  ) {
    throw new ContentError(
      fileName,
      `o campo "stack" tem de ser uma lista com pelo menos uma tecnologia.`,
    );
  }

  return {
    slug,
    title: text(data, "title", fileName, 80),
    date: date(data, fileName),
    summary: text(data, "summary", fileName, 220),
    stack: stack.map((item) => String(item).trim()),
    demo: optionalUrl(data, "demo", fileName),
    repo: optionalUrl(data, "repo", fileName),
    featured: flag(data, "featured", fileName),
    draft: flag(data, "draft", fileName),
    html: render(body),
  };
}
