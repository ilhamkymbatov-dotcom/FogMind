import { useTranslation } from '../i18n'
import { Button } from './Button'
import { SIGNUP_URL } from '../lib/appUrl'
import { Container } from './Container'
import { ScrollReveal } from './motion/ScrollReveal'
import styles from './CtaBand.module.css'

/** The closing call to action band shared by the content pages. */
export function CtaBand() {
  const { t } = useTranslation()

  return (
    <section className={styles.cta}>
      <Container>
        <ScrollReveal>
          <div className={styles.inner}>
            <h2 className={styles.title}>{t('cta.title')}</h2>
            <Button href={SIGNUP_URL} variant="primary" size="lg">
              {t('cta.button')}
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  )
}
