import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorKey, useTranslation, type TranslationKey } from '../i18n'
import { AuthCard, authStyles as s } from '../components/AuthCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

function SignupPage() {
  const { signUp } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<TranslationKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('auth.err.enterEmailPassword')
      return
    }
    if (password.length < 6) {
      setError('auth.err.passwordTooShort')
      return
    }

    setLoading(true)
    try {
      const { session } = await signUp(email.trim(), password, displayName)
      // Email confirmation is on, so success gives a user but no session.
      if (!session) setConfirmSent(true)
    } catch (err) {
      setError(errorKey(err))
    } finally {
      setLoading(false)
    }
  }

  if (confirmSent) {
    return (
      <AuthCard
        title={t('signup.confirmTitle')}
        footer={
          <>
            {t('signup.confirmFooterPrompt')}{' '}
            <Link to="/login" className={s.link}>
              {t('signup.confirmFooterLink')}
            </Link>
          </>
        }
      >
        <div className={s.notice}>
          <MailCheck className={s.noticeIcon} size={28} aria-hidden="true" />
          <p className={s.noticeBody}>{t('signup.confirmBody', { email: email.trim() })}</p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t('signup.title')}
      subtitle={t('signup.subtitle')}
      footer={
        <>
          {t('signup.footerPrompt')}{' '}
          <Link to="/login" className={s.link}>
            {t('signup.footerLink')}
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
          autoComplete="new-password"
          placeholder={t('signup.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label={t('signup.displayName')}
          type="text"
          autoComplete="name"
          placeholder={t('signup.displayNamePlaceholder')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
        />
        {error ? (
          <div className={s.error} role="alert">
            {t(error)}
          </div>
        ) : null}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? t('signup.submitting') : t('signup.submit')}
        </Button>
      </form>
    </AuthCard>
  )
}

export default SignupPage
