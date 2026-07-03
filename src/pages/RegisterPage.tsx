import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ParticleCanvas } from '@/components/decor/ParticleCanvas'
import Logo from '@/components/Logo'

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error, isNewUser } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      navigate(isNewUser ? '/onboarding' : '/atlas', { replace: true })
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg overflow-hidden">
      <ParticleCanvas />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass rounded-xl p-8 glow-accent">
          <div className="flex justify-center mb-8">
            <Logo size={28} />
          </div>

          <h1 className="text-xl font-heading text-center mb-6 uppercase tracking-wider text-text">
            Create Account
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-no/10 border border-no/30 text-no text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-line/30 text-text text-sm placeholder:text-text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
                placeholder="oracle@meyfate.io"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-line/30 text-text text-sm placeholder:text-text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
                placeholder="Min. 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
