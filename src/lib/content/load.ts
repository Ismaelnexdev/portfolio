import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ContentError, parseDiaryEntry, parseProject } from "./parse";
import type { DiaryEntry, Project } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface LoadOptions {
  /** Pasta com os ficheiros .md. */
  dir?: string;
  /** Mostra também os rascunhos. Por defeito, só fora de produção. */
  includeDrafts?: boolean;
}

interface Dated {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
}

async function loadFolder<T extends Dated>(
  dir: string,
  parse: (raw: string, fileName: string) => T,
  includeDrafts: boolean,
): Promise<T[]> {
  let files: string[];
  try {
    files = await readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const items: T[] = [];
  const seen = new Map<string, string>();

  for (const fileName of files.filter((file) => file.endsWith(".md")).sort()) {
    const item = parse(await readFile(path.join(dir, fileName), "utf8"), fileName);

    const other = seen.get(item.slug);
    if (other) {
      throw new ContentError(
        fileName,
        `o endereço "${item.slug}" já é usado por ${other}.`,
      );
    }
    seen.set(item.slug, fileName);

    if (item.draft && !includeDrafts) continue;
    items.push(item);
  }

  // Mais recentes primeiro; no mesmo dia, por título.
  return items.sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  );
}

const showDrafts = (options: LoadOptions) =>
  options.includeDrafts ?? process.env.NODE_ENV !== "production";

export function loadDiary(options: LoadOptions = {}): Promise<DiaryEntry[]> {
  return loadFolder(
    options.dir ?? path.join(CONTENT_DIR, "diario"),
    parseDiaryEntry,
    showDrafts(options),
  );
}

export function loadProjects(options: LoadOptions = {}): Promise<Project[]> {
  return loadFolder(
    options.dir ?? path.join(CONTENT_DIR, "projetos"),
    parseProject,
    showDrafts(options),
  );
}
