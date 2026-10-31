export type DiaryKind = "projeto" | "aprendizagem" | "nota";

export const DIARY_KINDS: readonly DiaryKind[] = ["projeto", "aprendizagem", "nota"];

/** Uma entrada do diário: tudo o que a pessoa faz e quer registar. */
export interface DiaryEntry {
  /** Vem do nome do ficheiro, sem a data nem o `.md`. */
  slug: string;
  title: string;
  /** AAAA-MM-DD */
  date: string;
  kind: DiaryKind;
  summary: string;
  /** Uma ligação opcional (por exemplo, o projeto de que se fala). */
  link?: string;
  draft: boolean;
  /** O texto já convertido em HTML. */
  html: string;
  readingMinutes: number;
}

export interface Project {
  slug: string;
  title: string;
  /** AAAA-MM-DD */
  date: string;
  summary: string;
  stack: string[];
  demo?: string;
  repo?: string;
  featured: boolean;
  draft: boolean;
  html: string;
}
