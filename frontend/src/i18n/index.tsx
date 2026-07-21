import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { en, type Dictionary, type TranslationKey } from './en'
import { ru } from './ru'
import { kk } from './kk'

export type Language = 'en' | 'ru' | 'kk'

export const LANGUAGES: readonly Language[] = ['en', 'ru', 'kk']

const DICTIONARIES: Record<Language, Dictionary> = { en, ru, kk }

// One key for the whole site, so a language chosen on the landing pages carries
// straight into the signed in app and back.
const STORAGE_KEY = 'fogmind.lang'

const KEYS = new Set(Object.keys(en))

/** Narrows an arbitrary string to a known translation key. */
export function isTranslationKey(value: string): value is TranslationKey {
  return KEYS.has(value)
}

/**
 * Turns a caught error into a translation key. Data layer functions throw
 * Error(key), so a known key is used directly; anything else (a raw Supabase
 * message) falls back to a generic message rather than leaking English.
 */
export function errorKey(err: unknown): TranslationKey {
  const message = err instanceof Error ? err.message : ''
  return isTranslationKey(message) ? message : 'common.somethingWrong'
}

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ru' || stored === 'kk') return stored
  } catch {
    // Private browsing can make localStorage throw. English is the default.
  }
  return 'en'
}

type Vars = Record<string, string | number>

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (whole, name) => (name in vars ? String(vars[name]) : whole))
}

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readStoredLanguage)

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Persistence is best effort; the in memory state still switches.
    }
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => interpolate(DICTIONARIES[lang][key], vars),
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used inside I18nProvider')
  return ctx
}

export type { TranslationKey }
