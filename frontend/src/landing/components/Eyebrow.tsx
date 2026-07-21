import { useTranslation, type TranslationKey } from '../../i18n'
import styles from './Eyebrow.module.css'

/** Which supporting hue the label carries. Pages pick one and stay with it. */
export type EyebrowTone = 'warm' | 'ink' | 'moss' | 'plum' | 'sand'

interface EyebrowProps {
  labelKey: TranslationKey
  tone?: EyebrowTone
}

/**
 * The small label that sits above a heading, with a short rule in its own hue.
 * The tone is how a page signals which room it is in, so it is set per section
 * rather than fixed to one accent.
 */
export function Eyebrow({ labelKey, tone = 'warm' }: EyebrowProps) {
  const { t } = useTranslation()

  return (
    <span className={[styles.eyebrow, styles[tone]].join(' ')}>
      <span className={styles.rule} aria-hidden="true" />
      {t(labelKey)}
    </span>
  )
}
