import { LANGUAGES, useTranslation, type Language } from '../i18n'
import styles from './LanguageSwitcher.module.css'

const LABELS: Record<Language, string> = {
  en: 'EN',
  ru: 'RU',
  kk: 'KK',
}

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()

  return (
    <div className={styles.switcher} role="group" aria-label="Language">
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={[styles.option, code === lang ? styles.active : ''].filter(Boolean).join(' ')}
          aria-pressed={code === lang}
          onClick={() => setLang(code)}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  )
}
