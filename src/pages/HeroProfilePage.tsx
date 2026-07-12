import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHeroStore } from '@/stores/heroStore'
import { Card, TabBar } from '@/components/ui/ui'
import { VirtueBar } from '@/components/ui/virtues'
import type { VirtueName, Hero } from '@/types'

const CULT_COLORS: Record<string, string> = {
  driftless: '#06b6d4', leviathan: '#3b82f6', masonry: '#f59e0b', recurrence: '#ef4444',
}

const VIRTUE_ORDER: VirtueName[] = ['clarity', 'humility', 'endurance', 'overcoming']

type HeroTab = 'overview' | 'quests' | 'leaderboard'

const TAB_OPTIONS: { id: HeroTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'quests', label: 'Quests' },
  { id: 'leaderboard', label: 'Leaderboard' },
]

export function HeroPage() {
  const { heroId } = useParams<{ heroId: string }>()
  const navigate = useNavigate()
  const fetchByHandle = useHeroStore((s) => s.fetchByHandle)

  const [hero, setHero] = useState<Hero | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<HeroTab>('overview')

  useEffect(() => {
    if (!heroId) return
    setLoading(true)
    fetchByHandle(heroId).then((h) => { setHero(h); setLoading(false) })
  }, [heroId, fetchByHandle])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hero) {
    return (
      <div className="text-accent p-8 text-center space-y-4">
        <p className="text-xl">Hero not found</p>
        <button onClick={() => navigate('/quests')} className="text-sm text-text-muted hover:text-accent transition-colors">
          ← Back to Temple
        </button>
      </div>
    )
  }

  const cultColor = CULT_COLORS[hero.cult] ?? '#666'
  const virtueSum = Object.values(hero.virtues).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-3xl font-bold text-accent">Hero</h2>
        <p className="text-text-muted mt-1">Every legend begins with a first wager.</p>
      </div>

      {/* Combined Header Card */}
      <Card variant="glow">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full border-2 shrink-0 overflow-hidden flex items-center justify-center"
            style={{ borderColor: cultColor + '60' }}>
            <img src={hero.avatarUrl || '/icon.png'} alt={hero.name} className="w-full h-full object-cover p-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-text truncate">{hero.name}</h2>
            <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap mt-1">
              <span>{hero.handle}</span>
              {hero.title && <span className="text-text/60">{hero.title}</span>}
              <span className="uppercase text-[10px] px-1.5 py-0.5 rounded border border-line/30 capitalize">{hero.cult}</span>
              <span className="font-mono">{hero.mp} MP</span>
            </div>
            {hero.bio && <p className="text-text/70 text-sm leading-relaxed mt-3 border-t border-line/30 pt-3">{hero.bio}</p>}
          </div>
        </div>
      </Card>

      <TabBar tabs={TAB_OPTIONS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent">{hero.mp}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">MP</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent">{virtueSum}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Total Virtue</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent">--</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Active Quests</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-bold mb-4 text-text/80">Virtues</h3>
            <div className="space-y-4">
              {VIRTUE_ORDER.map((v) => (
                <VirtueBar key={v} virtue={v} value={hero.virtues[v] ?? 8} />
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between">
              <span className="text-xs text-text-muted">Total Virtue Power</span>
              <span className="font-mono text-sm text-premium-400">{virtueSum} / 80</span>
            </div>
          </Card>
        </div>
      )}

      {tab === 'quests' && (
        <Card>
          <h3 className="text-lg font-bold mb-4">Active Quests</h3>
          <p className="text-sm text-text-muted">Quest data coming soon.</p>
        </Card>
      )}

      {tab === 'leaderboard' && (
        <Card>
          <h3 className="text-lg font-bold mb-4">Follower Rankings</h3>
          <p className="text-sm text-text-muted">Leaderboard coming soon.</p>
        </Card>
      )}
    </div>
  )
}
