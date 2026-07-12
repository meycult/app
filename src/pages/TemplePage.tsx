import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuestStore } from '@/stores/questStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWagerStore } from '@/stores/wagerStore'
import { Card } from '@/components/ui/ui'
import { Search, Flame, BarChart2, Globe, Trophy, Bitcoin, Building2, Landmark, User } from 'lucide-react'
import { clsx } from 'clsx'
import type { Category, HeroType } from '@/types'

const CATEGORY_COLORS: Record<Category, string> = {
  POLITICS: '#3b82f6', TECH: '#8b5cf6', CRYPTO: '#f59e0b', SPORTS: '#22c55e', CULTURE: '#ec4899',
  WORLD: '#dc2626', FINANCE: '#06b6d4', SCIENCE: '#6366f1', AI: '#d946ef', GAMING: '#84cc16', ENTERTAINMENT: '#f97316',
}

const CATEGORY_LABELS: Record<Category, string> = {
  POLITICS: 'Politics', TECH: 'Tech', CRYPTO: 'Crypto', SPORTS: 'Sports', CULTURE: 'Culture',
  WORLD: 'World', FINANCE: 'Finance', SCIENCE: 'Science', AI: 'AI', GAMING: 'Gaming', ENTERTAINMENT: 'Entertainment',
}

type SortBy = 'ending-soon' | 'ending-late' | 'volume' | 'trending'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'ending-soon', label: 'Ending soonest' },
  { value: 'ending-late', label: 'Ending latest' },
  { value: 'volume', label: 'Highest volume' },
  { value: 'trending', label: 'Most active' },
]

const CULT_COLORS: Record<string, string> = {
  driftless: '#06b6d4', leviathan: '#3b82f6', masonry: '#f59e0b', recurrence: '#ef4444',
}

const HERO_TYPE_LABELS: Record<HeroType, { label: string; icon: typeof User }> = {
  person: { label: 'People', icon: User },
  nation: { label: 'Nations', icon: Globe },
  sports_team: { label: 'Sports', icon: Trophy },
  crypto: { label: 'Crypto', icon: Bitcoin },
  corporation: { label: 'Corps', icon: Building2 },
  organization: { label: 'Orgs', icon: Landmark },
}

function rarityTier(d: number): { label: string; color: string } {
  if (d >= 85) return { label: 'Mythic', color: '#ef4444' }
  if (d >= 60) return { label: 'Rare', color: '#f0c040' }
  if (d >= 40) return { label: 'Uncommon', color: '#8b5cf6' }
  if (d >= 25) return { label: 'Refined', color: '#3b82f6' }
  if (d >= 15) return { label: 'Shifting', color: '#22c55e' }
  return { label: 'Common', color: '#9ca3af' }
}

function formatVolume(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return `${v}`
}

function formatDeadline(closesIn: string, now: number): { text: string; urgent: boolean } {
  if (!closesIn) return { text: '', urgent: false }
  const d = new Date(closesIn)
  if (isNaN(d.getTime())) return { text: '', urgent: false }
  const diff = d.getTime() - now
  if (diff < 0) return { text: 'Closed', urgent: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  if (days >= 2) return { text: `Closes ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, urgent: false }
  if (days >= 1) return { text: `Ends in ${days}d ${hours}h`, urgent: true }
  if (hours >= 1) return { text: `Ends in ${hours}h ${mins}m`, urgent: true }
  return { text: `Ends in ${mins}m ${secs}s`, urgent: true }
}

export function TemplePage() {
  const quests = useQuestStore((s) => s.quests)
  const fetchQuests = useQuestStore((s) => s.fetchQuests)
  const player = usePlayerStore((s) => s.player)
  const wagers = useWagerStore((s) => s.wagers)
  const fetchWagers = useWagerStore((s) => s.fetchMine)
  const navigate = useNavigate()

  const [sortBy, setSortBy] = useState<SortBy>('ending-soon')
  const [myBets, setMyBets] = useState(false)
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set())
  const [search, setSearch] = useState('')
  const [heroTypeFilter, setHeroTypeFilter] = useState<HeroType | ''>('')
  const [now, setNow] = useState(Date.now())

  useEffect(() => { fetchQuests() }, [fetchQuests])
  useEffect(() => { if (player.id) fetchWagers(player.id) }, [player.id, fetchWagers])
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) { next.delete(cat) } else { next.add(cat) }
      return next
    })
  }

  const sortedQuests = useMemo(() => {
    let result = [...quests]
    if (myBets) {
      result = result.filter((q) => wagers.some((w) => w.questId === q.questId && w.result === 'PENDING'))
    } else {
      result = result.filter((q) => q.status === 'ACTIVE')
      // Never show closed (past-deadline) quests on the default board
      result = result.filter((q) => {
        const t = new Date(q.closesIn).getTime()
        return isNaN(t) || t > now
      })
    }
    if (activeCategories.size > 0) result = result.filter((q) => activeCategories.has(q.category))
    if (heroTypeFilter) {
      result = result.filter((q) => q.heroes.some((h) => h.heroType === heroTypeFilter))
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((q) => q.question.toLowerCase().includes(term))
    }
    const ts = (s: string) => { const t = new Date(s).getTime(); return isNaN(t) ? Infinity : t }
    switch (sortBy) {
      case 'ending-soon': result.sort((a, b) => ts(a.closesIn) - ts(b.closesIn)); break
      case 'ending-late': result.sort((a, b) => (ts(b.closesIn) === Infinity ? -1 : ts(b.closesIn)) - (ts(a.closesIn) === Infinity ? -1 : ts(a.closesIn))); break
      case 'volume': result.sort((a, b) => b.volume - a.volume); break
      case 'trending': result.sort((a, b) => b.engagement - a.engagement); break
    }
    return result
  }, [quests, sortBy, myBets, activeCategories, search, wagers, heroTypeFilter, now])

  const activeCount = wagers.filter((w) => w.result === 'PENDING').length

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-accent">Quests</h2>
          <p className="text-text-muted mt-1">A celestial map of prophecies — each a fate to be wagered</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quests..."
              className="bg-surface/60 border border-line/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text w-full sm:w-48 focus:outline-none focus:border-accent/40"
            />
          </div>
          <div className="text-center">
            <p className="text-text-muted text-[10px]">Active</p>
            <p className="text-accent font-bold">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-surface/60 border border-line/50 rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent/40 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setMyBets((v) => !v)}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5',
            myBets ? 'bg-accent/10 border-accent/40 text-accent' : 'border-line text-text-muted hover:text-text/80'
          )}
        >
          <Flame size={12} /> My Bets
        </button>
        <div className="w-px h-5 bg-line/40 mx-1" />
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
          const active = activeCategories.has(cat)
          const color = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border',
                active ? 'text-white' : 'border-line text-text-muted hover:text-text/70'
              )}
              style={active ? { backgroundColor: color + '26', borderColor: color + '66', color } : undefined}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          )
        })}
        {activeCategories.size > 0 && (
          <button onClick={() => setActiveCategories(new Set())} className="text-[10px] text-text-muted hover:text-accent ml-1">Clear</button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(Object.keys(HERO_TYPE_LABELS) as HeroType[]).map((ht) => {
          const active = heroTypeFilter === ht
          const { label, icon: Icon } = HERO_TYPE_LABELS[ht]
          return (
            <button
              key={ht}
              onClick={() => setHeroTypeFilter(active ? '' : ht)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border flex items-center gap-1',
                active ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'border-line text-text-muted hover:text-text/70'
              )}
            >
              <Icon size={11} /> {label}
            </button>
          )
        })}
        {heroTypeFilter && (
          <button onClick={() => setHeroTypeFilter('')} className="text-[10px] text-text-muted hover:text-accent ml-1">Clear</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedQuests.map((quest, i) => {
          const catColor = CATEGORY_COLORS[quest.category]
          const hasBet = wagers.some((w) => w.questId === quest.questId && w.result === 'PENDING')
          const deadline = formatDeadline(quest.closesIn, now)
          const isResolved = quest.status === 'RESOLVED' || quest.status === 'SETTLED'
          const heroIds = quest.heroes.slice(0, 4)
          const moreHeroes = quest.heroes.length - 4
          const yesProb = quest.market?.yesProbability ?? 50
          const noProb = quest.market?.noProbability ?? 50
          const isPolymarket = quest.sourceType === 'polymarket'

          return (
            <motion.div
              key={quest.questId}
              className="h-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Card
                className={clsx(
                  'h-full flex flex-col cursor-pointer hover:scale-[1.02] transition-all duration-200 relative',
                  hasBet && !isResolved && 'border-accent/60',
                  isResolved && 'opacity-50'
                )}
                onClick={() => navigate(`/quest/${quest.questId}`)}
              >
                {hasBet && !isResolved && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse z-10" style={{ boxShadow: '0 0 6px #ef444480' }} />
                )}
                {isResolved && (
                  <div className="absolute inset-0 bg-bg/40 rounded-2xl z-10 flex items-center justify-center">
                    <span className={clsx(
                      'text-lg font-bold px-4 py-1.5 rounded-lg',
                      quest.resolutionOutcome === 'YES' ? 'text-green-400 bg-green-400/10 border border-green-400/30' : 'text-red-400 bg-red-400/10 border border-red-400/30'
                    )}>
                      {quest.resolutionOutcome === 'YES' ? '✓ YES' : '✗ NO'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: catColor + '20', color: catColor }}>
                      {CATEGORY_LABELS[quest.category]}
                    </span>
                    {(() => { const rt = rarityTier(quest.rarityDensity); return (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border" style={{ color: rt.color, borderColor: rt.color + '40', backgroundColor: rt.color + '12' }}>
                        {rt.label}
                      </span>
                    )})()}
                    {isPolymarket && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border text-cyan-400 border-cyan-400/40 bg-cyan-400/10" title="Synced from Polymarket">
                        PM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {deadline.text && (deadline.urgent && !isResolved ? (
                      <span className="text-[10px] text-amber-400 font-medium tabular-nums">{deadline.text}</span>
                    ) : (
                      <span className="text-[10px] text-text-muted tabular-nums">{deadline.text}</span>
                    ))}
                  </div>
                </div>

                <p className="text-sm font-bold leading-snug line-clamp-2 mb-3">{quest.question}</p>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-400 w-7 shrink-0">YES</span>
                    <div className="flex-1 h-2 rounded-full bg-green-500/10">
                      <div className="h-full rounded-full bg-green-500/60 transition-all" style={{ width: `${yesProb}%` }} />
                    </div>
                    <span className="text-[10px] text-green-400 font-mono w-8 text-right">{yesProb}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-400 w-7 shrink-0">NO</span>
                    <div className="flex-1 h-2 rounded-full bg-red-500/10">
                      <div className="h-full rounded-full bg-red-500/60 transition-all" style={{ width: `${noProb}%` }} />
                    </div>
                    <span className="text-[10px] text-red-400 font-mono w-8 text-right">{noProb}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] mb-2">
                  <span className="text-text-muted flex items-center gap-1">
                    <BarChart2 size={10} /> {formatVolume(quest.volume)} vol
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-auto flex-wrap">
                  {heroIds.map((hero) => (
                    <button
                      key={hero.heroId}
                      onClick={(e) => { e.stopPropagation(); navigate(`/hero/${hero.handle}`) }}
                      className="text-[9px] px-1.5 py-0.5 rounded border font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        color: CULT_COLORS[hero.cult] ?? '#6b7280',
                        borderColor: (CULT_COLORS[hero.cult] ?? '#6b7280') + '40',
                        backgroundColor: (CULT_COLORS[hero.cult] ?? '#6b7280') + '12',
                      }}
                      title={hero.title ?? ''}
                    >
                      {hero.name}
                    </button>
                  ))}
                  {moreHeroes > 0 && <span className="text-[9px] text-text-muted">+{moreHeroes}</span>}
                </div>
              </Card>
            </motion.div>
          )
        })}
        {sortedQuests.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-muted text-lg">No quests match your filters.</p>
            <button onClick={() => { setSortBy('ending-soon'); setMyBets(false); setActiveCategories(new Set()); setSearch(''); setHeroTypeFilter('') }} className="mt-2 text-xs text-accent hover:text-accent underline">
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
