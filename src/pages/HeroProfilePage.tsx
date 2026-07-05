import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Sword, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, TabBar } from '@/components/ui/ui'
import { VirtueBar } from '@/components/ui/virtues'
import type { VirtueName } from '@/types'

const ALIGN_LABELS: Record<string, string> = {
  LG: 'Lawful Good', NG: 'Neutral Good', CG: 'Chaotic Good',
  LN: 'Lawful Neutral', TN: 'True Neutral', CN: 'Chaotic Neutral',
  LE: 'Lawful Evil', NE: 'Neutral Evil', CE: 'Chaotic Evil',
}

const CULT_COLORS: Record<string, string> = {
  architects: '#06b6d4', wardens: '#f59e0b', legion: '#ef4444',
  operatives: '#10b981', tribunal: '#cbd5e1', monastics: '#8b5cf6',
}

const VIRTUE_ORDER: VirtueName[] = ['wisdom', 'courage', 'prudence', 'skill', 'temperance', 'justice']

type HeroTab = 'overview' | 'quests' | 'leaderboard' | 'community' | 'activity'

const TAB_OPTIONS: { id: HeroTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'quests', label: 'Quests' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'community', label: 'Community' },
  { id: 'activity', label: 'Activity' },
]

interface HeroData {
  hero_id: string
  handle: string
  name: string
  title: string | null
  hero_type: string
  alignment: string | null
  cult: string
  bio: string | null
  slot_type: string
  avatar_url: string | null
  primary_virtue: string | null
  secondary_virtue: string | null
}

interface VirtueValue {
  name: string
  value: number
}

export function HeroPage() {
  const { heroId } = useParams<{ heroId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<HeroTab>('overview')
  const [hero, setHero] = useState<HeroData | null>(null)
  const [virtues, setVirtues] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!heroId) return
    setLoading(true)
    const handle = heroId.startsWith('@') ? heroId : `@${heroId}`

    supabase
      .from('heroes')
      .select('*')
      .eq('handle', handle)
      .single()
      .then(({ data: heroData }) => {
        if (heroData) {
          setHero(heroData)
          supabase
            .from('virtues')
            .select('name, value')
            .eq('entity_type', 'hero')
            .eq('entity_id', heroData.hero_id)
            .then(({ data: virtueData }) => {
              const v: Record<string, number> = {}
              virtueData?.forEach((row: VirtueValue) => { v[row.name] = row.value })
              setVirtues(v)
            })
        }
        setLoading(false)
      })
  }, [heroId])

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
        <p className="text-xl">Hero "{heroId}" not found</p>
        <button onClick={() => navigate('/network')} className="text-sm text-text-muted hover:text-accent transition-colors">
          ← Back to Network
        </button>
      </div>
    )
  }

  const cultColor = CULT_COLORS[hero.cult] ?? '#666'
  const virtueSum = Object.values(virtues).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      {/* ── Hero Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold shrink-0"
          style={{ borderColor: cultColor + '60', color: cultColor }}>
          {hero.name[0]}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-text truncate">{hero.name}</h2>
          <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
            <span>{hero.handle}</span>
            {hero.title && <span className="text-text/60">{hero.title}</span>}
            {hero.alignment && (
              <span className="capitalize text-text/40">{ALIGN_LABELS[hero.alignment] ?? hero.alignment}</span>
            )}
            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded border border-line/30">{hero.hero_type}</span>
          </div>
        </div>
      </div>

      <TabBar tabs={TAB_OPTIONS} active={tab} onChange={setTab} />

      {/* ═══════ OVERVIEW ═══════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Bio + Stats */}
          <Card variant="reflect">
            <div className="flex items-center gap-2 mb-3" style={{ color: cultColor }}>
              <Shield size={16} />
              <span className="font-bold text-sm capitalize">{hero.cult}</span>
            </div>
            <p className="text-text/70 text-sm leading-relaxed">{hero.bio}</p>
            <div className="flex gap-4 mt-4 text-xs text-text-muted flex-wrap">
              <div className="flex items-center gap-1">
                <Sword size={12} />
                <span className="capitalize">Primary Virtue: {hero.primary_virtue}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={12} />
                <span className="capitalize">Secondary Virtue: {hero.secondary_virtue}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="capitalize">Slot: {hero.slot_type}</span>
              </div>
            </div>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent">--</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Active Quests</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent">--</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Hero Effects</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent">--</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Followers</p>
            </Card>
          </div>

          {/* Virtues + Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold mb-4 text-text/80">Virtues</h3>
              <div className="space-y-4">
                {VIRTUE_ORDER.map((v) => (
                  <VirtueBar key={v} virtue={v} value={virtues[v] ?? 0} />
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between">
                <span className="text-xs text-text-muted">Total Virtue Power</span>
                <span className="font-mono text-sm text-premium-400">{virtueSum} / 120</span>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4">Equipped Items</h3>
              <p className="text-sm text-text-muted py-4 text-center">
                Items not yet seeded. Hero items will display here.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════ QUESTS ═══════ */}
      {tab === 'quests' && (
        <Card>
          <h3 className="text-lg font-bold mb-4">Quests</h3>
          <p className="text-sm text-text-muted py-8 text-center">
            Quests linked to this hero will appear here.
          </p>
        </Card>
      )}

      {/* ═══════ LEADERBOARD ═══════ */}
      {tab === 'leaderboard' && (
        <Card>
          <h3 className="text-lg font-bold mb-4">Leaderboard</h3>
          <p className="text-sm text-text-muted py-8 text-center">
            Follower rankings coming soon.
          </p>
        </Card>
      )}

      {/* ═══════ COMMUNITY ═══════ */}
      {tab === 'community' && (
        <Card>
          <h3 className="text-lg font-bold mb-4">Community</h3>
          <p className="text-sm text-text-muted py-8 text-center">
            Discussion and feed coming soon.
          </p>
        </Card>
      )}

      {/* ═══════ ACTIVITY ═══════ */}
      {tab === 'activity' && (
        <Card>
          <h3 className="text-lg font-bold mb-4">Activity</h3>
          <p className="text-sm text-text-muted py-8 text-center">
            Hero activity feed coming soon.
          </p>
        </Card>
      )}
    </div>
  )
}
