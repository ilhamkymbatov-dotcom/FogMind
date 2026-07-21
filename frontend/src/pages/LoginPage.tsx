import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorKey, useTranslation, type TranslationKey } from '../i18n'
import { AuthCard, authStyles as s } from '../components/AuthCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

function LoginPage() {
  const { signIn } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<TranslationKey | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('auth.err.enterEmailPassword')
      return
    }

    setLoading(true)
    try {
      await signIn(email.trim(), password)
      // The auth listener updates the session; the public only guard then
      // sends an authenticated visitor on, but navigate explicitly too.
      navigate('/app', { replace: true })
    } catch (err) {
      setError(errorKey(err))
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footer={
        <>
          {t('login.footerPrompt')}{' '}
          <Link to="/signup" className={s.link}>
            {t('login.footerLink')}
          </Link>
        </>
      }
    >
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        {error ? (
          <div className={s.error} role="alert">
            {t(error)}
          </div>
        ) : null}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </Button>
      </form>
    </AuthCard>
  )
}

export default LoginPage
