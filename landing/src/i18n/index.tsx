import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { en, type Dictionary, type TranslationKey } from './en'
import { ru } from './ru'
import { kk } from './kk'

export type Language = 'en' | 'ru' | 'kk'

export const LANGUAGES: readonly Language[] = ['en', 'ru', 'kk']

const DICTIONARIES: Record<Language, Dictionary> = { en, ru, kk }

const STORAGE_KEY = 'fogmind.lang'

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ru' || stored === 'kk') {
      return stored
    }
  } catch {
    // Private browsing can make localStorage throw. English is the default.
  }
  return 'en'
}

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readStoredLanguage)

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Persistence is best effort. The in memory state still switches.
    }
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => DICTIONARIES[lang][key],
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useTranslation must be used inside I18nProvider')
  }
  return ctx
}

export type { TranslationKey }
