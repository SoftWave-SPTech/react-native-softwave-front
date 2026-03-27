/** Valores em centavos (inteiro), ex.: 500000 = R$ 5.000,00 */
export function formatCentavosBRL(centavos: number): string {
  const reais = centavos / 100;
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Interpreta texto digitado (ex.: "5000", "5.000,00", "R$ 50") para centavos. */
export function parseValorInputToCentavos(text: string): number | null {
  const trimmed = text.replace(/\s/g, '').replace(/R\$\s?/gi, '');
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const n = Number.parseFloat(normalized);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

/** `2026-03-12` → `12/03/2026` */
export function formatDateIsoToBR(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** `12/03/2026` → `2026-03-12` */
export function parseDateBRToIso(br: string): string | null {
  const m = br.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const dd = m[1].padStart(2, '0');
  const mm = m[2].padStart(2, '0');
  return `${m[3]}-${mm}-${dd}`;
}
