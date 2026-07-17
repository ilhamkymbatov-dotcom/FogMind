import { Button } from '../components/Button'
import { Container } from '../components/Container'
import styles from './HomePage.module.css'

function HomePage() {
  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.inner}>
          <h1 className={styles.wordmark}>FogMind</h1>
          <Button variant="primary" size="md">
            Get started
          </Button>
        </div>
      </Container>
    </div>
  )
}

export default HomePage
