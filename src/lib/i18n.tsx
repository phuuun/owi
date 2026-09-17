import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../types';
import { formatters, type Formatters } from './format';
import { DICT, type Strings } from './strings';

export const LANGS: Lang[] = ['id', 'en'];

const STORAGE_KEY = 'owi-lang';

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Every string the interface writes itself. */
  t: Strings;
  /** Dates, clock times and numbers in the current language. */
  fmt: Formatters;
}

const I18nContext = createContext<I18n | null>(null);

// Storage can be unavailable (private windows, blocked site data); the choice is
// a convenience, so a failure to read or write it must not take the page down.
function storedLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'id' ? saved : 'id';
  } catch {
    return 'id';
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(storedLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Nothing to do: the language still applies for this visit.
    }
  }, [lang]);

  const value = useMemo<I18n>(() => ({ lang, setLang, t: DICT[lang], fmt: formatters(lang) }), [lang]);

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n needs a <LangProvider> above it');
  return value;
}
