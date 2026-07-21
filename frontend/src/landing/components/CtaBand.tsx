import { useTranslation } from '../../i18n'
import { Button } from './Button'
import { Container } from './Container'
import { Surface } from './motion/Surface'
import styles from './CtaBand.module.css'

export type CtaTone = 'warm' | 'ink' | 'moss' | 'plum' | 'sand'

/**
 * The closing call to action shared by the content pages. It takes the tone of
 * the page it ends, so the last room still belongs to that page.
 */
export function CtaBand({ tone = 'warm' }: { tone?: CtaTone } = {}) {
  const { t } = useTranslation()

  return (
    <section className={[styles.cta, styles[tone]].join(' ')}>
      <Container>
        <Surface from="below" distance={54}>
          <div className={styles.inner}>
            <h2 className={styles.title}>{t('cta.title')}</h2>
            <p className={styles.body}>{t('cta.body')}</p>
            <Button to="/signup" variant="primary" size="lg">
              {t('cta.button')}
            </Button>
          </div>
        </Surface>
      </Container>
    </section>
  )
}
