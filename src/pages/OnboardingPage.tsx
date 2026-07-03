import { useNavigate } from 'react-router-dom'
import { ParticleCanvas } from '@/components/decor/ParticleCanvas'
import Logo from '@/components/Logo'

export function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg overflow-hidden">
      <ParticleCanvas />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass rounded-xl p-8 glow-accent text-center">
          <div className="flex justify-center mb-6">
            <Logo size={28} />
          </div>
          <h1 className="text-xl font-heading uppercase tracking-wider text-text mb-2">
            Welcome to MeyFate
          </h1>
          <p className="text-text-muted text-sm mb-8 leading-relaxed">
            You are now an Oracle. Read the fates, place your bets, and let the market decide.
          </p>
          <button
            type="button"
            onClick={() => navigate('/atlas', { replace: true })}
            className="w-full py-3 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors"
          >
            Enter the Atlas
          </button>
        </div>
      </div>
    </div>
  )
}
