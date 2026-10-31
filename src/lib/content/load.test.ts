import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDiary, loadProjects } from "./load";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "conteudo-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const entry = (title: string, date: string, extra = "") =>
  `---\ntitle: ${title}\ndate: ${date}\nkind: nota\nsummary: Resumo.\n${extra}---\n\nTexto.\n`;

const write = (name: string, content: string) => writeFile(path.join(dir, name), content);

describe("loadDiary", () => {
  it("ordena do mais recente para o mais antigo, e por título no mesmo dia", async () => {
    await write("2026-01-01-a.md", entry("Antiga", "2026-01-01"));
    await write("2026-03-01-b.md", entry("Recente B", "2026-03-01"));
    await write("2026-03-01-c.md", entry("Recente A", "2026-03-01"));

    const titles = (await loadDiary({ dir })).map((e) => e.title);
    expect(titles).toEqual(["Recente A", "Recente B", "Antiga"]);
  });

  it("esconde os rascunhos, a não ser que se peça", async () => {
    await write("2026-01-01-a.md", entry("Pública", "2026-01-01"));
    await write("2026-01-02-b.md", entry("Rascunho", "2026-01-02", "draft: true\n"));

    expect((await loadDiary({ dir, includeDrafts: false })).map((e) => e.title)).toEqual(["Pública"]);
    expect(await loadDiary({ dir, includeDrafts: true })).toHaveLength(2);
  });

  it("ignora ficheiros que não são .md", async () => {
    await write("2026-01-01-a.md", entry("Texto", "2026-01-01"));
    await write(".gitkeep", "");
    await write("notas.txt", "isto não conta");

    expect(await loadDiary({ dir })).toHaveLength(1);
  });

  it("devolve uma lista vazia se a pasta não existir", async () => {
    expect(await loadDiary({ dir: path.join(dir, "nao-existe") })).toEqual([]);
  });

  it("recusa dois textos com o mesmo endereço", async () => {
    await write("2026-01-01-igual.md", entry("Um", "2026-01-01"));
    await write("2026-02-01-igual.md", entry("Dois", "2026-02-01"));

    await expect(loadDiary({ dir })).rejects.toThrow(/"igual" já é usado/);
  });

  it("diz qual ficheiro está errado", async () => {
    await write("2026-01-01-bom.md", entry("Bom", "2026-01-01"));
    await write("2026-01-02-mau.md", "---\ntitle: Sem resto\n---\n");

    await expect(loadDiary({ dir })).rejects.toThrow(/2026-01-02-mau\.md/);
  });
});

describe("loadProjects", () => {
  it("lê projetos", async () => {
    await write(
      "meu-projeto.md",
      "---\ntitle: P\ndate: 2026-01-01\nsummary: R.\nstack: [A]\n---\n\nTexto.\n",
    );
    const projects = await loadProjects({ dir });
    expect(projects.map((p) => p.slug)).toEqual(["meu-projeto"]);
  });
});
