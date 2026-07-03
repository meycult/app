import { Link } from 'react-router-dom'
import { ParticleCanvas } from '@/components/decor/ParticleCanvas'
import Logo from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

export function HeroPage() {
  const { user } = useAuth()

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg overflow-hidden">
      <ParticleCanvas />
      <div className="relative z-10 text-center px-4">
        <Logo size={36} className="justify-center mb-8" />
        <div className="flex items-center justify-center gap-4 mt-8">
          {user ? (
            <Link
              to="/atlas"
              className="px-6 py-3 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors"
            >
              Enter Atlas
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-3 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-lg border border-accent/30 text-accent font-bold text-sm uppercase tracking-wider hover:bg-accent/10 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
