import { LANGUAGES, useTranslation, type Language } from '../i18n'
import styles from './LanguageSwitcher.module.css'

/**
 * Display labels only. The locale code stays 'kk' everywhere; Kazakh reads as
 * KZ to users, who recognise the country code rather than the ISO code.
 */
const LABELS: Record<Language, string> = { en: 'EN', ru: 'RU', kk: 'KZ' }

export function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation()

  return (
    <div className={styles.switcher} role="group" aria-label={t('lang.label')}>
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
