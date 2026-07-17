import { useTranslation } from '../i18n'
import { Container } from '../components/Container'
import styles from './PlaceholderPage.module.css'

function HowItWorksPage() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      <Container>
        <h1 className={styles.title}>{t('nav.howItWorks')}</h1>
        <p className={styles.body}>{t('placeholder.howItWorks')}</p>
      </Container>
    </div>
  )
}

export default HowItWorksPage
