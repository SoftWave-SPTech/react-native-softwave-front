/** Extrai número de `cli_12` ou `"12"`. */
export function parseClienteId(value: string | undefined | null): number | null {
  if (value == null || value === '') return null;
  const m = /^cli_(\d+)$/i.exec(value.trim());
  if (m) return Number(m[1]);
  const n = Number(value.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Extrai número de `proc_3` ou `"3"`. */
export function parseProcessoIdNum(value: string | undefined | null): number | null {
  if (value == null || value === '') return null;
  const m = /^proc_(\d+)$/i.exec(value.trim());
  if (m) return Number(m[1]);
  const n = Number(value.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}
