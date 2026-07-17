import type { ReactNode } from 'react'
import { useTranslation, type TranslationKey } from '../i18n'
import { Container } from './Container'
import { ScrollReveal } from './motion/ScrollReveal'
import styles from './FeatureSection.module.css'

export interface FeatureSectionProps {
  titleKey: TranslationKey
  bodyKey: TranslationKey
  /** The visual block, built from icons and bordered panels. No images. */
  visual: ReactNode
  /** Flips the section so the visual sits left of the text on wide screens. */
  reverse?: boolean
}

/**
 * One large alternating section: heading and body on one side, an icon built
 * visual on the other. The pages alternate `reverse` to get the Apple style
 * left right rhythm. On narrow screens everything stacks, text first.
 */
export function FeatureSection({ titleKey, bodyKey, visual, reverse = false }: FeatureSectionProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.section}>
      <Container>
        <ScrollReveal>
          <div className={[styles.grid, reverse ? styles.reverse : ''].filter(Boolean).join(' ')}>
            <div className={styles.text}>
              <h2 className={styles.title}>{t(titleKey)}</h2>
              <p className={styles.body}>{t(bodyKey)}</p>
            </div>
            <div>{visual}</div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  )
}
