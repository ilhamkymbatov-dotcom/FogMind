import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthCard, authStyles as s } from '../components/AuthCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

function SignupPage() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and a password.')
      return
    }
    if (password.length < 6) {
      setError('Please use a password of at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const { session } = await signUp(email.trim(), password, displayName)
      // Email confirmation is on, so success gives a user but no session.
      // Show the confirmation screen rather than assuming a login.
      if (!session) {
        setConfirmSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmSent) {
    return (
      <AuthCard
        title="Confirm your email"
        footer={
          <>
            Already confirmed?{' '}
            <Link to="/login" className={s.link}>
              Sign in
            </Link>
          </>
        }
      >
        <div className={s.notice}>
          <MailCheck className={s.noticeIcon} size={28} aria-hidden="true" />
          <p className={s.noticeBody}>
            We sent a confirmation link to <span className={s.noticeEmail}>{email.trim()}</span>.
            Open it to finish setting up your account, then sign in.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start turning your material into maps you can learn."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className={s.link}>
            Sign in
          </Link>
        </>
      }
    >
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          label="Display name (optional)"
          type="text"
          autoComplete="name"
          placeholder="How should we greet you"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
        />
        {error ? (
          <div className={s.error} role="alert">
            {error}
          </div>
        ) : null}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}

export default SignupPage
