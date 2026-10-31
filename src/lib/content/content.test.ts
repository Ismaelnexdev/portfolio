import { describe, expect, it } from "vitest";
import { loadDiary, loadProjects } from "./load";

// Estes testes leem os textos verdadeiros da pasta content/.
// Se um texto tiver um erro (data inexistente, campo em falta, ligação sem https),
// a CI falha antes de o erro chegar ao site.
describe("o conteúdo do site", () => {
  it("todas as entradas do diário são válidas", async () => {
    const entries = await loadDiary({ includeDrafts: true });
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.html.length).toBeGreaterThan(0);
    }
  });

  it("todos os projetos são válidos e há pelo menos um em destaque", async () => {
    const projects = await loadProjects({ includeDrafts: true });
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some((project) => project.featured)).toBe(true);
  });
});
