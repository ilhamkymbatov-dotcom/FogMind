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

/**
 * Keys that carry one value per plural category rather than a single string.
 *
 * A base of 'streak.dayUnit' means the dictionary holds 'streak.dayUnit.one',
 * '.few', '.many' and '.other'. Every base must define all four in English, and
 * because the other dictionaries are typed against English they cannot omit
 * any, so the lookup below can never miss.
 */
export type PluralBase = 'streak.dayUnit'

/**
 * Chooses the plural form for a count.
 *
 * Intl.PluralRules does the categorising, which matters most for Russian: one
 * день, two дня, five дней, and then twenty one день again, a rule no amount of
 * string concatenation gets right. Kazakh reports one and other, which is
 * correct for it, since a Kazakh noun stays singular after a numeral and both
 * forms are simply "күн".
 */
function pluralForm(lang: Language, base: PluralBase, count: number): string {
  const dictionary = DICTIONARIES[lang]
  const category = new Intl.PluralRules(lang).select(count)
  const key = `${base}.${category}` as TranslationKey
  return dictionary[key] ?? dictionary[`${base}.other` as TranslationKey]
}

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey, vars?: Vars) => string
  /** The correctly declined form of a counted noun, for example days. */
  plural: (base: PluralBase, count: number) => string
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
      plural: (base, count) => pluralForm(lang, base, count),
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
