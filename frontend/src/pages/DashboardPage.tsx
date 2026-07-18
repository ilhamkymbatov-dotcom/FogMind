import { Waypoints } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './DashboardPage.module.css'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      <p className={styles.greeting}>Signed in as {user?.email}</p>
      <h1 className={styles.title}>Your knowledge maps</h1>

      <div className={styles.empty}>
        <Waypoints className={styles.emptyIcon} size={32} aria-hidden="true" />
        <h2 className={styles.emptyTitle}>No maps yet</h2>
        <p className={styles.emptyBody}>
          Upload your first study material to build a knowledge map. That feature arrives soon.
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
