import type { Lang } from '../types.ts';

// Comment timestamps are Indonesian and the copy quotes WIB clock times, so the
// zone stays pinned whichever language the interface is in. Only the locale —
// month names, decimal and thousands separators — follows the language.
const ZONE = 'Asia/Jakarta';
const LOCALE: Record<Lang, string> = { id: 'id-ID', en: 'en-GB' };

export function formatters(lang: Lang) {
  const locale = LOCALE[lang];
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: ZONE });
  const dateTime = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONE,
  });
  const whole = new Intl.NumberFormat(locale);
  const decimals = new Map<number, Intl.NumberFormat>();

  return {
    /** "2024-08-14" → "14 Agu 2024". Read as UTC so the day never shifts with the viewer's zone. */
    date(iso: string) {
      const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
      return Number.isNaN(d.getTime()) ? iso : date.format(d);
    },
    time(iso: string) {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? '' : time.format(d);
    },
    /** "19 Agu 09.12", in WIB. */
    dateTime(iso: string) {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? iso : dateTime.format(d);
    },
    /** 4182 → "4.182" in Indonesian, "4,182" in English. */
    count: (n: number) => whole.format(n),
    /** A score written out to a fixed number of places: "0,84" or "0.84". */
    num(n: number, digits: number) {
      let f = decimals.get(digits);
      if (!f) {
        f = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
        decimals.set(digits, f);
      }
      return f.format(n);
    },
  };
}

export type Formatters = ReturnType<typeof formatters>;

export const percent = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 100);

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
