import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlayerStore } from '@/stores/playerStore'
import { useOracleStore } from '@/stores/oracleStore'
import { supabase } from '@/lib/supabase'
import { ParticleCanvas } from '@/components/decor/ParticleCanvas'
import Logo from '@/components/Logo'
import { clsx } from 'clsx'

const CULTS = [
  { id: 'driftless', name: 'The Driftless', description: 'Air · Clarity — Empty, yet inexhaustible. Masters of detachment who see through the fog.', color: '#06b6d4', virtue: 'Clarity', bonus: '+10% when holding positions untouched for a cycle' },
  { id: 'leviathan', name: 'Leviathan', description: 'Water · Humility — Grace flows downward. The lowest place is the highest.', color: '#3b82f6', virtue: 'Humility', bonus: 'Grace Pool: tithe winnings for mercy on ruin' },
  { id: 'masonry', name: 'The Masonry', description: 'Earth · Endurance — Bear and forbear. The ground does not flee the storm.', color: '#f59e0b', virtue: 'Endurance', bonus: 'Grounding Lock: outcome-independent returns' },
  { id: 'recurrence', name: 'The Recurrence', description: 'Fire · Overcoming — Burn, and become. Loss is the only fuel that matters.', color: '#ef4444', virtue: 'Overcoming', bonus: 'Will-to-Power: losses multiply future payout' },
]

export function OnboardingPage() {
  const { user } = useAuth()
  const completePlayerOnboarding = usePlayerStore((s) => s.completeOnboarding)
  const initializeOracle = useOracleStore((s) => s.initialize)
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [handle, setHandle] = useState('')
  const [alias, setAlias] = useState('')
  const [selectedCult, setSelectedCult] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const checkHandle = useCallback(async (val: string) => {
    if (val.length < 3) { setHandleStatus('idle'); return }
    setHandleStatus('checking')
    const { data } = await supabase
      .from('players')
      .select('handle, id')
      .eq('handle', val)
      .maybeSingle()
    if (!data || (user && data.id === user.id)) {
      setHandleStatus('available')
    } else {
      setHandleStatus('taken')
      const base = val.replace(/\d+$/, '')
      for (let num = 1; num < 50; num++) {
        const { data: d } = await supabase
          .from('players')
          .select('id')
          .eq('handle', `${base}${num}`)
          .maybeSingle()
        if (!d) {
          setHandle(`${base}${num}`)
          setHandleStatus('available')
          return
        }
      }
    }
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => { checkHandle(handle) }, 500)
    return () => clearTimeout(timer)
  }, [handle, checkHandle])

  useEffect(() => {
    if (!user) return
    setHandle(user.email?.split('@')[0] || '')
    setAlias('')

    supabase
      .from('player_onboarding')
      .select('*')
      .eq('player_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setStep(data.step ?? 0)
          if (data.chosen_handle) setHandle(data.chosen_handle)
          if (data.chosen_alias) setAlias(data.chosen_alias)
          if (data.chosen_cult) setSelectedCult(data.chosen_cult)
        }
        setLoaded(true)
      })
  }, [user])

  useEffect(() => {
    if (!user || !loaded || step !== 1) return
    const timer = setTimeout(() => {
      saveOnboarding({ chosen_handle: handle, chosen_alias: alias })
    }, 800)
    return () => clearTimeout(timer)
  }, [alias, handle])

  const saveOnboarding = async (partial: { step?: number; chosen_handle?: string; chosen_alias?: string; chosen_cult?: string }) => {
    if (!user) return
    await supabase.from('player_onboarding').upsert({
      player_id: user.id,
      step,
      chosen_handle: partial.chosen_handle ?? handle,
      chosen_alias: partial.chosen_alias ?? alias,
      chosen_cult: partial.chosen_cult ?? selectedCult,
      ...partial,
    }, { onConflict: 'player_id' })
  }

  const handleHandleChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30)
    setHandle(clean)
  }

  const handleNext = async () => {
    if (step === 0) {
      await saveOnboarding({ step: 1 })
      setStep(1)
    } else if (step === 1) {
      if (handle.length < 3 || handleStatus !== 'available' || alias.trim().length === 0) return
      await saveOnboarding({ chosen_handle: handle, chosen_alias: alias, step: 2 })
      setStep(2)
    } else if (step === 2) {
      if (!selectedCult) return
      await saveOnboarding({ chosen_cult: selectedCult, step: 3 })
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleFinish = async () => {
    setSaving(true)
    await completePlayerOnboarding(handle, alias || undefined)
    if (user) await initializeOracle(user.id, selectedCult)
    await supabase
      .from('player_onboarding')
      .delete()
      .eq('player_id', user!.id)
    navigate('/quests', { replace: true })
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const canNext =
    (step === 0) ||
    (step === 1 && handle.length >= 3 && handleStatus === 'available' && alias.trim().length > 0) ||
    (step === 2 && selectedCult !== '')

  const selectedCultData = CULTS.find((c) => c.id === selectedCult)

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg overflow-hidden">
      <ParticleCanvas />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass rounded-xl p-8 glow-accent">
          <div className="flex justify-center mb-6">
            <Logo size={28} />
          </div>

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div className="text-center">
              <h1 className="text-xl font-heading uppercase tracking-wider text-text mb-2">Welcome, Oracle</h1>
              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                The MeyCult markets await your foresight.
                Predict the outcomes of quests across politics, tech, crypto,
                sports, and more. Join a cult, equip your heroes, and forge your fate.
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors"
              >
                Begin
              </button>
            </div>
          )}

          {/* ── Step 1: ID + Alias ── */}
          {step === 1 && (
            <div>
              <p className="text-xs text-text-muted text-center mb-1 uppercase tracking-widest">Step 1 of 3</p>
              <h2 className="text-lg font-heading text-center mb-6 text-text">Choose Your Identity</h2>

              <label className="text-xs text-text-muted block mb-1">ID</label>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-text-muted text-sm">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => handleHandleChange(e.target.value)}
                  maxLength={30}
                  className="flex-1 bg-surface border border-line/30 rounded-lg px-4 py-3 text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none text-sm"
                  autoFocus
                />
                <div className="w-[80px] shrink-0 flex items-center text-xs font-bold">
                  {handleStatus === 'checking' && (
                    <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  )}
                  {handleStatus === 'available' && (
                    <span className="text-green-400 whitespace-nowrap">✓ Available</span>
                  )}
                  {handleStatus === 'taken' && (
                    <span className="text-red-400 whitespace-nowrap">✗ Taken</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-text-muted mb-4">Your unique ID. 3–30 chars, lowercase, letters, numbers, hyphens.</p>

              <label className="text-xs text-text-muted block mb-1">Alias</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value.slice(0, 24))}
                placeholder="GodEmperor"
                maxLength={24}
                className="w-full bg-surface border border-line/30 rounded-lg px-4 py-3 text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none text-sm mb-1"
              />
              <p className="text-[10px] text-text-muted mb-6">What other oracles see. Up to 24 characters.</p>

              <div className="flex gap-3">
                <button type="button" onClick={handleBack} className="flex-1 py-2.5 rounded-lg border border-line/50 text-text-muted text-sm hover:bg-surface/50 transition-colors">Back</button>
                <button type="button" onClick={handleNext} disabled={!canNext} className="flex-1 py-2.5 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Cult Selection ── */}
          {step === 2 && (
            <div>
              <p className="text-xs text-text-muted text-center mb-1 uppercase tracking-widest">Step 2 of 3</p>
              <h2 className="text-lg font-heading text-center mb-4 text-text">Choose Your Cult</h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {CULTS.map((cult) => (
                  <button
                    key={cult.id}
                    type="button"
                    onClick={() => setSelectedCult(cult.id)}
                    className={clsx(
                      'glass rounded-lg p-3 text-left transition-all text-sm hover:glow-accent',
                      selectedCult === cult.id && 'glow-accent'
                    )}
                    style={selectedCult === cult.id ? { borderColor: '#22e06a', borderWidth: '1.5px' } : undefined}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cult.color }} />
                      <span className="font-bold text-text text-xs">{cult.name}</span>
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed">{cult.description}</p>
                    <p className="text-[10px] mt-1 font-medium" style={{ color: cult.color }}>Virtue: {cult.virtue}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleBack} className="flex-1 py-2.5 rounded-lg border border-line/50 text-text-muted text-sm hover:bg-surface/50 transition-colors">Back</button>
                <button type="button" onClick={handleNext} disabled={!canNext} className="flex-1 py-2.5 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && selectedCultData && (
            <div className="text-center">
              <p className="text-xs text-text-muted mb-1 uppercase tracking-widest">Step 3 of 3</p>
              <h2 className="text-lg font-heading mb-6 text-text">Your Oracle Profile</h2>
              <div className="glass rounded-lg p-4 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center text-lg font-bold text-accent">
                    {(alias || handle)[0]?.toUpperCase() || 'O'}
                  </div>
                  <div>
                    <p className="font-bold text-text">{alias || handle}</p>
                    <p className="text-xs text-text-muted">@{handle}</p>
                  </div>
                </div>
                <div className="border-t border-line/30 pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedCultData.color }} />
                    <span className="font-bold text-text text-sm">{selectedCultData.name}</span>
                  </div>
                  <p className="text-xs text-text-muted">{selectedCultData.description}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span style={{ color: selectedCultData.color }}>Virtue: {selectedCultData.virtue}</span>
                    <span className="text-text-muted">{selectedCultData.bonus}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleBack} className="flex-1 py-2.5 rounded-lg border border-line/50 text-text-muted text-sm hover:bg-surface/50 transition-colors">Back</button>
                <button type="button" onClick={handleFinish} disabled={saving} className="flex-1 py-3 rounded-lg bg-accent text-bg font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-40">
                  {saving ? 'Saving...' : 'Enter the Network'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
