import type { ReactNode } from 'react'
import { useTranslation, type TranslationKey } from '../i18n'
import { Container } from './Container'
import { Parallax } from './motion/Parallax'
import { Stagger, StaggerItem } from './motion/Stagger'
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
 * visual on the other. The heading, body and visual reveal in sequence, and
 * the visual drifts on a gentle parallax so it moves at a slightly different
 * rate than the text. On narrow screens everything stacks, text first.
 */
export function FeatureSection({ titleKey, bodyKey, visual, reverse = false }: FeatureSectionProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.section}>
      <Container>
        <Stagger className={[styles.grid, reverse ? styles.reverse : ''].filter(Boolean).join(' ')}>
          <div className={styles.text}>
            <StaggerItem>
              <h2 className={styles.title}>{t(titleKey)}</h2>
            </StaggerItem>
            <StaggerItem>
              <p className={styles.body}>{t(bodyKey)}</p>
            </StaggerItem>
          </div>
          <StaggerItem>
            <Parallax>{visual}</Parallax>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  )
}
