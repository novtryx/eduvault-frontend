/**
 * The backend stores every monetary amount in kobo (integer, ₦1 = 100 kobo)
 * — see FeeStructure.amountKobo / Payment.amountKobo / Plan.priceKobo.
 * This is the ONLY place naira <-> kobo conversion and formatting happens
 * on the frontend, so a formatting bug (or a stray float) can't silently
 * creep into a financial calculation anywhere else in the app.
 *
 * The frontend never re-derives expected/collected/outstanding totals —
 * those numbers always come from a backend response. This file only
 * formats numbers the backend already gave us.
 */

const KOBO_PER_NAIRA = 100;

export function koboToNaira(kobo: number): number {
  return kobo / KOBO_PER_NAIRA;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * KOBO_PER_NAIRA);
}

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const nairaFormatterWithKobo = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a kobo amount as ₦-prefixed naira, e.g. 3610000000 -> "₦36,100,000" */
export function formatKobo(kobo: number | null | undefined, opts?: { showKobo?: boolean }): string {
  if (kobo === null || kobo === undefined) return '—';
  const naira = koboToNaira(kobo);
  const formatted = opts?.showKobo ? nairaFormatterWithKobo.format(naira) : nairaFormatter.format(naira);
  // Intl gives "NGN" or "₦" depending on runtime ICU data; normalize to ₦.
  return formatted.replace('NGN', '₦').replace('₦ ', '₦');
}

/** Formats a kobo amount without the currency symbol, e.g. "36,100,000" */
export function formatKoboPlain(kobo: number | null | undefined): string {
  if (kobo === null || kobo === undefined) return '—';
  return new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(koboToNaira(kobo));
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(fractionDigits)}%`;
}
