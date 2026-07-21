import { useTranslation, type TranslationKey } from '../../i18n'
import styles from './Eyebrow.module.css'

/**
 * The small label that sits above a heading. It carries a short warm accent
 * rule so a section announces itself before the headline lands.
 */
export function Eyebrow({ labelKey }: { labelKey: TranslationKey }) {
  const { t } = useTranslation()

  return (
    <span className={styles.eyebrow}>
      <span className={styles.rule} aria-hidden="true" />
      {t(labelKey)}
    </span>
  )
}
