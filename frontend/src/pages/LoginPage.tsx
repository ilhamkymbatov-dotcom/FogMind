import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthCard, authStyles as s } from '../components/AuthCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      await signIn(email.trim(), password)
      // The auth listener updates the session; the public only guard then
      // sends an authenticated visitor on, but navigate explicitly too.
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back to FogMind."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className={s.link}>
            Create an account
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
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        {error ? (
          <div className={s.error} role="alert">
            {error}
          </div>
        ) : null}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Signing in' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}

export default LoginPage
