const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
] as const;

const MONTHS_SHORT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parts(isoDate: string): { year: number; month: number; day: number } {
  const match = ISO_DATE.exec(isoDate);
  if (!match) throw new RangeError(`Data inválida: ${isoDate}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** É uma data AAAA-MM-DD que existe mesmo no calendário (rejeita 2026-02-31). */
export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** "2026-10-30" → "30 de outubro de 2026" */
export function formatLongDate(isoDate: string): string {
  const { year, month, day } = parts(isoDate);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

/** "2026-10-30" → "30 out" */
export function formatShortDate(isoDate: string): string {
  const { month, day } = parts(isoDate);
  return `${day} ${MONTHS_SHORT[month - 1]}`;
}

/** "2026-10-30" → "out 2026" */
export function formatMonthYear(isoDate: string): string {
  const { year, month } = parts(isoDate);
  return `${MONTHS_SHORT[month - 1]} ${year}`;
}
