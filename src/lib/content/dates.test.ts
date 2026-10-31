import { describe, expect, it } from "vitest";
import {
  formatLongDate,
  formatMonthYear,
  formatShortDate,
  isValidIsoDate,
} from "./dates";

describe("isValidIsoDate", () => {
  it("aceita datas que existem", () => {
    expect(isValidIsoDate("2026-10-30")).toBe(true);
    expect(isValidIsoDate("2028-02-29")).toBe(true); // ano bissexto
  });

  it("rejeita datas que não existem ou mal escritas", () => {
    expect(isValidIsoDate("2026-02-31")).toBe(false);
    expect(isValidIsoDate("2027-02-29")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("30-10-2026")).toBe(false);
    expect(isValidIsoDate("2026-1-5")).toBe(false);
    expect(isValidIsoDate("")).toBe(false);
  });
});

describe("formatação em português", () => {
  it("escreve a data por extenso", () => {
    expect(formatLongDate("2026-10-30")).toBe("30 de outubro de 2026");
    expect(formatLongDate("2026-03-01")).toBe("1 de março de 2026");
  });

  it("escreve a data curta e o mês", () => {
    expect(formatShortDate("2026-10-30")).toBe("30 out");
    expect(formatShortDate("2026-01-05")).toBe("5 jan");
    expect(formatMonthYear("2026-10-30")).toBe("out 2026");
  });

  it("falha com uma data mal escrita", () => {
    expect(() => formatLongDate("hoje")).toThrow(RangeError);
  });
});
