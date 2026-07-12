import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuestStore } from '@/stores/questStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWagerStore } from '@/stores/wagerStore'
import { useWallet } from '@/hooks/useWallet'
import { useFateBalance } from '@/hooks/useFate'
import { useInfluenceBalance } from '@/hooks/useInfluence'
import { usePlaceWager } from '@/hooks/useWager'
import { Card, RarityBadge, Button } from '@/components/ui/ui'
import { FateIcon } from '@/icons/FateIcon'
import { InfluenceIcon } from '@/icons/InfluenceIcon'
import { MeyFate, MeyInfluence } from '@/components/TokenText'
import { supabase } from '@/lib/supabase'
import { BarChart2, Clock, Users, MessageSquare, Trophy, Activity, Diamond } from 'lucide-react'
import { clsx } from 'clsx'
import type { QuestDetail, LootEntry, QuestComment, Wager, QuestActivity } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  POLITICS: '#3b82f6', TECH: '#8b5cf6', CRYPTO: '#f59e0b', SPORTS: '#22c55e', CULTURE: '#ec4899',
  WORLD: '#dc2626', FINANCE: '#06b6d4', SCIENCE: '#6366f1', AI: '#d946ef', GAMING: '#84cc16', ENTERTAINMENT: '#f97316',
}

const CULT_COLORS: Record<string, string> = {
  driftless: '#06b6d4', leviathan: '#3b82f6', masonry: '#f59e0b', recurrence: '#ef4444',
}

function formatVolume(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return `${v}`
}

function formatDeadline(closesIn: string): string {
  const d = new Date(closesIn)
  if (isNaN(d.getTime())) return closesIn
  const diff = d.getTime() - Date.now()
  if (diff < 0) return 'Closed'
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d remaining`
  const hours = Math.floor(diff / 3600000)
  return `${hours}h remaining`
}

const ACTIVITY_ICONS: Record<string, string> = {
  wager: '💰', price_move: '📈', hero_action: '👑', effect_trigger: '⚡', resolution: '✓',
}

type DetailTab = 'overview' | 'discussion' | 'leaderboard' | 'activity' | 'voting'

const TABS: { id: DetailTab; label: string; icon: typeof Diamond }[] = [
  { id: 'overview', label: 'Overview', icon: Diamond },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'voting', label: 'Voting', icon: Users },
]

export function QuestDetailPage() {
  const { questId } = useParams<{ questId: string }>()
  const navigate = useNavigate()
  const fetchQuestDetail = useQuestStore((s) => s.fetchQuestDetail)
  const player = usePlayerStore((s) => s.player)
  const wagers = useWagerStore((s) => s.wagers)
  const fetchWagers = useWagerStore((s) => s.fetchMine)
  const { address, isConnected } = useWallet()
  const { data: fateBalance } = useFateBalance(address ?? undefined)
  const { data: influenceBalance } = useInfluenceBalance(address ?? undefined)
  const { place, step, error: wagerError } = usePlaceWager()

  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES')
  const [amount, setAmount] = useState(100)
  const [currency, setCurrency] = useState<'FATE' | 'INFLUENCE'>('FATE')
  const [placing, setPlacing] = useState(false)
  const [tab, setTab] = useState<DetailTab>('overview')
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const fateBalanceNum = fateBalance ? Number(fateBalance) / 1e18 : 0
  const influenceBalanceNum = influenceBalance ? Number(influenceBalance) / 1e18 : 0
  const currentBalance = currency === 'FATE' ? fateBalanceNum : influenceBalanceNum

  useEffect(() => {
    if (!questId) return
    setLoading(true)
    fetchQuestDetail(questId).then((q) => { setQuest(q); setLoading(false) })
    if (player.id) fetchWagers(player.id)
  }, [questId, fetchQuestDetail, player.id, fetchWagers])

  const existingWager = wagers.find((w) => w.questId === questId && w.result === 'PENDING')

  const handlePlaceWager = async () => {
    if (!quest || !player.id || !address) return
    setPlacing(true)
    const yesProb = quest.market?.yesProbability ?? 50
    const entryProb = outcome === 'YES' ? yesProb : 100 - yesProb
    const ok = await place({ questId: quest.questId, outcome, amount, entryProbability: entryProb, address, currency })
    if (ok && player.id) await fetchWagers(player.id)
    setPlacing(false)
  }

  const handlePostComment = async () => {
    if (!questId || !player.id || !commentText.trim()) return
    setPostingComment(true)
    await supabase.from('quest_comments').insert({
      quest_id: questId,
      player_id: player.id,
      text: commentText.trim(),
    })
    setCommentText('')
    setPostingComment(false)
    const updated = await fetchQuestDetail(questId)
    if (updated) setQuest(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-text-muted text-lg">Quest not found.</p>
        <button onClick={() => navigate('/quests')} className="mt-2 text-accent hover:underline text-sm">Back to Quests</button>
      </div>
    )
  }

  const catColor = CATEGORY_COLORS[quest.category] ?? '#6b7280'
  const yesProb = quest.market?.yesProbability ?? 50
  const noProb = quest.market?.noProbability ?? 50
  const isOpen = quest.status === 'ACTIVE'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-accent">Quest</h2>
          <p className="text-text-muted mt-1">Each quest a prophecy. Each wager a verdict.</p>
        </div>
      </div>

      {/* Combined Header + Market + Wager */}
      <div className="lg:flex lg:gap-4 lg:items-stretch">
        <Card variant="glow" className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: catColor + '20', color: catColor }}>
              {quest.category}
            </span>
            {quest.status !== 'ACTIVE' && (
              <span className={clsx(
                'text-[10px] font-bold px-2 py-0.5 rounded-md',
                quest.resolutionOutcome === 'YES' ? 'text-green-400 bg-green-400/10 border border-green-400/30' :
                quest.resolutionOutcome === 'NO' ? 'text-red-400 bg-red-400/10 border border-red-400/30' :
                'text-text-muted bg-line/10 border border-line/30'
              )}>
                {quest.resolutionOutcome === 'YES' ? '✓ YES' : quest.resolutionOutcome === 'NO' ? '✗ NO' : quest.status}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold mb-2">{quest.question}</h1>
          {quest.description && <p className="text-sm text-text-muted mb-4">{quest.description}</p>}

          <div className="space-y-2 mb-4">
            <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-2">Market</h3>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-green-400 font-bold w-8">YES</span>
                <div className="flex-1 h-3 rounded-full bg-green-500/10">
                  <div className="h-full rounded-full bg-green-500/60 transition-all" style={{ width: `${yesProb}%` }} />
                </div>
                <span className="text-sm text-green-400 font-mono font-bold w-12 text-right">{yesProb}%</span>
              </div>
              <p className="text-[10px] text-text-muted ml-10">{formatVolume(quest.market?.yesVolume ?? 0)} vol</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-red-400 font-bold w-8">NO</span>
                <div className="flex-1 h-3 rounded-full bg-red-500/10">
                  <div className="h-full rounded-full bg-red-500/60 transition-all" style={{ width: `${noProb}%` }} />
                </div>
                <span className="text-sm text-red-400 font-mono font-bold w-12 text-right">{noProb}%</span>
              </div>
              <p className="text-[10px] text-text-muted ml-10">{formatVolume(quest.market?.noVolume ?? 0)} vol</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap border-t border-line/30 pt-3">
            <span className="flex items-center gap-1"><BarChart2 size={12} /> {formatVolume(quest.volume)} volume</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {formatDeadline(quest.closesIn)}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {quest.engagement} engagement</span>
          </div>
        </Card>

        {/* Right: Wager */}
        <div className="lg:w-72 lg:shrink-0 mt-4 lg:mt-0 lg:flex">
          {isOpen && !existingWager && player.id ? (
            <Card variant="glow" className="flex-1 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider">Place Wager</h3>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">Bal: <span className="text-accent font-mono">{currentBalance.toFixed(0)}</span> {currency === 'FATE' ? <FateIcon size={12} /> : <InfluenceIcon size={12} />}</span>
                </div>
                <div className="flex gap-1 mb-3 p-0.5 rounded-lg bg-surface/60 border border-line/50">
                  <button onClick={() => setCurrency('FATE')} className={clsx('flex-1 py-1.5 rounded-md text-[11px] transition-all flex items-center justify-center gap-1', currency === 'FATE' ? 'bg-accent/20 border border-accent/40' : 'opacity-60')}><MeyFate size={13} /></button>
                  <button onClick={() => setCurrency('INFLUENCE')} className={clsx('flex-1 py-1.5 rounded-md text-[11px] transition-all flex items-center justify-center gap-1', currency === 'INFLUENCE' ? 'bg-accent/20 border border-accent/40' : 'opacity-60')}><MeyInfluence size={13} /></button>
                </div>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setOutcome('YES')} className={clsx('flex-1 py-2 rounded-lg text-sm font-bold border transition-all', outcome === 'YES' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-line text-text-muted hover:text-text')}>YES {yesProb}%</button>
                  <button onClick={() => setOutcome('NO')} className={clsx('flex-1 py-2 rounded-lg text-sm font-bold border transition-all', outcome === 'NO' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-line text-text-muted hover:text-text')}>NO {noProb}%</button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between items-center text-xs text-text-muted mb-1">
                    <span>Amount</span>
                    <input
                      type="number"
                      min={1}
                      value={amount}
                      onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                      className="w-24 px-2 py-1 rounded-md bg-surface border border-line text-right text-xs text-text focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <input type="range" min={10} max={1000} step={10} value={Math.min(amount, 1000)} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-accent" />
                  <div className="flex justify-between text-[10px] text-text-muted"><span>10</span><span>1000+</span></div>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed mb-2">{currency === 'FATE' ? <>Parimutuel: winners split the losing pool (5% house fee). <MeyFate /> is $1-pegged & redeemable.</> : <><MeyInfluence /> is free-to-play & soulbound — wagered gaslessly. Not redeemable for cash.</>}</p>
                {wagerError && <p className="text-[10px] text-red-400 mb-2 break-words">{wagerError}</p>}
              </div>
              {!isConnected ? (
                <Button variant="accent" size="md" onClick={() => navigate('/wallet')} className="w-full mt-auto">Connect wallet</Button>
              ) : currentBalance < amount ? (
                <Button variant="accent" size="md" onClick={() => navigate('/store')} className="w-full mt-auto">Insufficient {currency === 'FATE' ? 'Fate' : 'Influence'} — get more</Button>
              ) : (
                <Button variant="accent" size="md" onClick={handlePlaceWager} disabled={placing || amount <= 0} className="w-full mt-auto">
                  {step === 'transferring' ? 'Confirm in wallet…' : step === 'confirming' ? 'Confirming on-chain…' : step === 'recording' ? 'Recording…' : `Wager ${amount} ${currency === 'FATE' ? 'Fate' : 'INF'} on ${outcome}`}
                </Button>
              )}
            </Card>
          ) : existingWager ? (
            <Card variant="glow" className="flex-1">
              <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-2">Your Wager</h3>
              <p className="text-sm text-text flex items-center gap-1"><span className={existingWager.outcome === 'YES' ? 'text-green-400' : 'text-red-400'}>{existingWager.outcome}</span> — {existingWager.amount} <FateIcon size={12} /> — <span className={clsx(existingWager.result === 'WON' ? 'text-green-400' : existingWager.result === 'LOST' ? 'text-red-400' : 'text-text-muted')}>{existingWager.result}</span></p>
              {existingWager.result === 'WON' && <p className="text-xs text-green-400 mt-1">Payout: {existingWager.payout} Fate (+{existingWager.netProfit})</p>}
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <p className="text-sm text-text-muted text-center py-4">{!player.id ? 'Sign in to place wagers.' : `Quest is ${quest.status.toLowerCase()}.`}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface/60 rounded-lg p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap', tab === t.id ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-muted hover:text-text/70')}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview — Heroes + Relics + Loot */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-3">Associated Heroes</h3>
            {quest.heroes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quest.heroes.map((hero) => (
                  <button
                    key={hero.heroId}
                    onClick={() => navigate(`/hero/${hero.handle}`)}
                    className="flex items-center gap-3 glass rounded-lg p-3 text-left hover:border-accent/40 transition-all border border-line/30"
                  >
                    <div
                      className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: (CULT_COLORS[hero.cult] ?? '#6b7280') + '20' }}
                    >
                      <img src={hero.avatarUrl || '/icon.png'} alt={hero.name} className="w-full h-full object-cover p-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{hero.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{hero.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            color: CULT_COLORS[hero.cult] ?? '#6b7280',
                            backgroundColor: (CULT_COLORS[hero.cult] ?? '#6b7280') + '18',
                          }}
                        >
                          {hero.cult}
                        </span>
                        <span className="text-[10px] text-text-muted">{hero.mp} MP</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No heroes assigned to this quest.</p>
            )}
          </Card>
          <div className="lg:grid lg:grid-cols-2 gap-4 space-y-4 lg:space-y-0">
          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-4">Active Relics</h3>
            {quest.relics.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {quest.relics.map((relic, i) => (
                  <div key={`${relic.name}-${relic.heroName}-${i}`} className="glass rounded-lg p-3 border border-line/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{relic.name}</span>
                      <RarityBadge rarity={relic.rarity} />
                    </div>
                    <p className="text-xs text-text-muted mb-1">{relic.effectName}: {relic.effectDescription}</p>
                    <p className="text-[10px] text-text-muted/60">Source: {relic.heroName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No relics active on this quest.</p>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-4">Loot Table</h3>
            {quest.lootTable.length === 0 ? (
              <p className="text-sm text-text-muted">No items can be earned from this quest.</p>
            ) : (
              <div className="space-y-2">
                {quest.lootTable.map((lt: LootEntry) => (
                  <div key={lt.lootId} className="flex items-center justify-between glass rounded-lg p-3">
                    <p className="text-sm font-medium">{lt.itemName}</p>
                    <div className="flex items-center gap-3">
                      <RarityBadge rarity={lt.itemRarity} />
                      <span className="text-xs text-text-muted font-mono">{Math.round(lt.chance * 100)}% drop</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          </div>
        </div>
      )}

      {/* Discussion */}
      {tab === 'discussion' && (
        <Card>
          <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-4">Discussion</h3>
          {player.id ? (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your prophecy..."
                className="flex-1 bg-surface border border-line/30 rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment() }}
              />
              <Button variant="accent" size="sm" onClick={handlePostComment} disabled={postingComment || !commentText.trim()}>
                {postingComment ? '...' : 'Post'}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-text-muted mb-4">Sign in to join the discussion.</p>
          )}
          {quest.comments.length === 0 ? (
            <p className="text-sm text-text-muted">No discussion yet. Be the first oracle to weigh in.</p>
          ) : (
            <div className="space-y-3">
              {quest.comments.map((c: QuestComment) => (
                <div key={c.commentId} className="glass rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-accent">Oracle</span>
                    <span className="text-[10px] text-text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text">{c.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                    <span>▲ {c.upvotes}</span>
                    <span>▼ {c.downvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <Card>
          <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-4">Leaderboard</h3>
          {quest.leaderboard.length === 0 ? (
            <p className="text-sm text-text-muted">No wagers placed yet. Be the first to wager.</p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center text-[10px] text-text-muted uppercase tracking-wider px-3 pb-2 border-b border-line/30">
                <span className="w-8">#</span>
                <span className="flex-1">Player</span>
                <span className="w-16 text-right">Amount</span>
                <span className="w-12 text-center">Side</span>
              </div>
              {quest.leaderboard.map((w: Wager, i: number) => (
                <div key={w.wagerId} className="flex items-center glass rounded-lg p-2 px-3 text-sm">
                  <span className="w-8 text-text-muted font-mono text-xs">{i + 1}</span>
                  <span className="flex-1 text-text/80">Oracle</span>
                  <span className="w-16 text-right font-mono text-xs flex items-center justify-end gap-1">{w.amount} <FateIcon size={11} /></span>
                  <span className={clsx('w-12 text-center text-xs font-bold', w.outcome === 'YES' ? 'text-green-400' : 'text-red-400')}>{w.outcome}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Activity */}
      {tab === 'activity' && (
        <Card>
          <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-4">Activity Feed</h3>
          {quest.activities.length === 0 ? (
            <p className="text-sm text-text-muted">No activity yet on this quest.</p>
          ) : (
            <div className="space-y-2">
              {quest.activities.map((a: QuestActivity) => (
                <div key={a.activityId} className="flex items-start gap-3 glass rounded-lg p-3">
                  <span className="text-sm mt-0.5">{ACTIVITY_ICONS[a.type] ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text">{a.text}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Voting */}
      {tab === 'voting' && (
        <Card>
          <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-4">Conclave Voting</h3>
          <p className="text-sm text-text-muted">Tier-based voting on quest loot and modifiers. Coming soon — your cult tokens will power your voice.</p>
        </Card>
      )}
    </div>
  )
}
