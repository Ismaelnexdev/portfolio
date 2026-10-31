import { describe, expect, it } from "vitest";
import {
  ContentError,
  parseDiaryEntry,
  parseProject,
  slugFromFileName,
} from "./parse";

const diary = (header: string, body = "Texto.") => `---\n${header}\n---\n\n${body}\n`;

const validDiary = `title: Olá
date: 2026-10-30
kind: nota
summary: Um resumo.`;

const validProject = `title: Projeto
date: 2026-10-30
summary: Um resumo.
stack:
  - Next.js
  - TypeScript`;

describe("slugFromFileName", () => {
  it("tira o .md e, se pedido, a data do início", () => {
    expect(slugFromFileName("2026-10-30-ola-mundo.md", true)).toBe("ola-mundo");
    expect(slugFromFileName("2026-10-30-ola-mundo.md", false)).toBe("2026-10-30-ola-mundo");
    expect(slugFromFileName("angola-em-dados.md")).toBe("angola-em-dados");
  });
});

describe("parseDiaryEntry", () => {
  it("lê uma entrada válida", () => {
    const entry = parseDiaryEntry(diary(validDiary, "## Título\n\nUm **texto**."), "2026-10-30-ola.md");

    expect(entry).toMatchObject({
      slug: "ola",
      title: "Olá",
      date: "2026-10-30",
      kind: "nota",
      summary: "Um resumo.",
      draft: false,
      readingMinutes: 1,
    });
    expect(entry.link).toBeUndefined();
    expect(entry.html).toContain("<h2>Título</h2>");
    expect(entry.html).toContain("<strong>texto</strong>");
  });

  it("aceita a data escrita entre aspas e a ligação opcional", () => {
    const entry = parseDiaryEntry(
      diary(`${validDiary.replace("2026-10-30", '"2026-10-30"')}\nlink: https://exemplo.pt`),
      "ola.md",
    );
    expect(entry.date).toBe("2026-10-30");
    expect(entry.link).toBe("https://exemplo.pt");
  });

  it("calcula o tempo de leitura", () => {
    const body = Array(450).fill("palavra").join(" ");
    expect(parseDiaryEntry(diary(validDiary, body), "ola.md").readingMinutes).toBe(2);
  });

  it("diz o ficheiro e o campo quando falta algo", () => {
    const without = (field: string) =>
      validDiary.split("\n").filter((line) => !line.startsWith(`${field}:`)).join("\n");

    expect(() => parseDiaryEntry(diary(without("title")), "a.md")).toThrow(/a\.md: falta o campo "title"/);
    expect(() => parseDiaryEntry(diary(without("summary")), "a.md")).toThrow(/"summary"/);
    expect(() => parseDiaryEntry(diary(without("kind")), "a.md")).toThrow(/"kind"/);
  });

  it("rejeita datas inexistentes ou mal escritas", () => {
    for (const bad of ["2026-02-31", "30/10/2026", "hoje"]) {
      expect(() =>
        parseDiaryEntry(diary(validDiary.replace("2026-10-30", bad)), "a.md"),
      ).toThrow(/"date"/);
    }
  });

  it("rejeita um tipo desconhecido", () => {
    expect(() => parseDiaryEntry(diary(validDiary.replace("nota", "outro")), "a.md")).toThrow(
      /projeto, aprendizagem, nota/,
    );
  });

  it("rejeita ligações que não são https", () => {
    expect(() => parseDiaryEntry(diary(`${validDiary}\nlink: http://exemplo.pt`), "a.md")).toThrow(/https/);
    expect(() => parseDiaryEntry(diary(`${validDiary}\nlink: isto não é um endereço`), "a.md")).toThrow(/válido/);
  });

  it("rejeita textos acima do limite", () => {
    const long = "x".repeat(201);
    expect(() => parseDiaryEntry(diary(validDiary.replace("Um resumo.", long)), "a.md")).toThrow(/201 carateres/);
  });

  it("rejeita endereços com maiúsculas, acentos ou espaços", () => {
    for (const name of ["2026-10-30-Ola.md", "2026-10-30-olá.md", "2026-10-30-ola mundo.md"]) {
      expect(() => parseDiaryEntry(diary(validDiary), name)).toThrow(/minúsculas sem acentos/);
    }
  });

  it("rejeita um valor que não é true ou false em draft", () => {
    expect(() => parseDiaryEntry(diary(`${validDiary}\ndraft: talvez`), "a.md")).toThrow(/"draft"/);
    expect(parseDiaryEntry(diary(`${validDiary}\ndraft: true`), "a.md").draft).toBe(true);
  });

  it("explica um cabeçalho que não se consegue ler", () => {
    expect(() => parseDiaryEntry(diary("title: [sem fechar"), "a.md")).toThrow(ContentError);
  });
});

describe("parseProject", () => {
  it("lê um projeto válido", () => {
    const project = parseProject(
      diary(`${validProject}\ndemo: https://a.pt\nrepo: https://b.pt\nfeatured: true`),
      "meu-projeto.md",
    );

    expect(project).toMatchObject({
      slug: "meu-projeto",
      title: "Projeto",
      stack: ["Next.js", "TypeScript"],
      demo: "https://a.pt",
      repo: "https://b.pt",
      featured: true,
      draft: false,
    });
  });

  it("exige uma lista de tecnologias", () => {
    const withoutStack = validProject.split("stack:")[0];
    expect(() => parseProject(diary(withoutStack), "a.md")).toThrow(/"stack"/);
    expect(() => parseProject(diary(`${withoutStack}stack: []`), "a.md")).toThrow(/"stack"/);
    expect(() => parseProject(diary(`${withoutStack}stack: [1, 2]`), "a.md")).toThrow(/"stack"/);
  });

  it("não usa a data do início do nome do ficheiro", () => {
    expect(parseProject(diary(validProject), "2026-10-30-x.md").slug).toBe("2026-10-30-x");
  });
});

describe("o cabeçalho dos ficheiros", () => {
  it("aceita ficheiros do Windows (fins de linha CRLF) e com BOM", () => {
    const windows = diary(validDiary, "Primeira linha.\nSegunda linha.").replace(/\n/g, "\r\n");
    expect(parseDiaryEntry(windows, "a.md").title).toBe("Olá");
    expect(parseDiaryEntry(`\uFEFF${windows}`, "a.md").title).toBe("Olá");
  });

  it("diz quando falta o cabeçalho", () => {
    expect(() => parseDiaryEntry("Só texto, sem cabeçalho.", "a.md")).toThrow(
      /a\.md: o ficheiro tem de começar por um cabeçalho/,
    );
  });

  it("explica o problema dos dois pontos e aceita-os entre aspas", () => {
    const unquoted = validDiary.replace("title: Olá", "title: Olá: mundo");
    expect(() => parseDiaryEntry(diary(unquoted), "a.md")).toThrow(/dois pontos/);

    const quoted = validDiary.replace("title: Olá", 'title: "Olá: mundo"');
    expect(parseDiaryEntry(diary(quoted), "a.md").title).toBe("Olá: mundo");
  });

  it("não deixa uma data impossível passar para o mês seguinte", () => {
    // O leitor antigo transformava 2026-02-31 em 3 de março, sem avisar.
    expect(() =>
      parseDiaryEntry(diary(validDiary.replace("2026-10-30", "2026-02-31")), "a.md"),
    ).toThrow(/"date"/);
  });
});
