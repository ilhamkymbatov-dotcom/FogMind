import { useTranslation, type TranslationKey } from '../i18n'
import { Container } from './Container'
import { ScrollReveal } from './motion/ScrollReveal'
import styles from './PageHero.module.css'

export interface PageHeroProps {
  titleKey: TranslationKey
  subtitleKey: TranslationKey
}

/** The opening section of a content page: a large centered title and one line. */
export function PageHero({ titleKey, subtitleKey }: PageHeroProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.hero}>
      <Container>
        <ScrollReveal>
          <div className={styles.inner}>
            <h1 className={styles.title}>{t(titleKey)}</h1>
            <p className={styles.subtitle}>{t(subtitleKey)}</p>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  )
}
