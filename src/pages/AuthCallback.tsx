import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function AuthCallback() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    supabase
      .from('oracles')
      .select('onboarding_complete')
      .eq('oracle_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        navigate(data?.onboarding_complete ? '/coming-soon' : '/onboarding', { replace: true })
      })
  }, [user, loading, navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
