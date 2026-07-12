import { useNavigate } from 'react-router-dom'
import { Shield, Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { useOracleStore } from '@/stores/oracleStore'
import { useWagerStore } from '@/stores/wagerStore'
import { Card, RarityBadge } from '@/components/ui/ui'
import { ChipGroup, DropdownFilter } from '@/components/ui/filters'
import { TierBadge } from '@/components/ui/badges'
import { clsx } from 'clsx'
import type { VirtueName, PredictionResult, BadgeCategory } from '@/types'

function ComingSoon() {
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-line/30 text-text-muted ml-2 align-middle uppercase tracking-wider">Coming soon</span>
}

// ── Sample data for sections not yet in DB ──

const CULT_INFO: Record<string, { name: string; description: string; color: string; linkedVirtue: string }> = {
  driftless: { name: 'The Driftless', description: 'Air · Clarity — Masters of detachment. They see through the fog.', color: '#06b6d4', linkedVirtue: 'clarity' },
  leviathan: { name: 'Leviathan', description: 'Water · Humility — Grace flows downward to the lowest.', color: '#3b82f6', linkedVirtue: 'humility' },
  masonry: { name: 'The Masonry', description: 'Earth · Endurance — They bear the weight. The ground does not flee.', color: '#f59e0b', linkedVirtue: 'endurance' },
  recurrence: { name: 'The Recurrence', description: 'Fire · Overcoming — Burn, and become. Loss is fuel.', color: '#ef4444', linkedVirtue: 'overcoming' },
}

const SAMPLE_ITEMS = [
  { id: 'item-scroll', name: 'Scholar Scroll', description: 'An ancient scroll of market wisdom.', flavorText: 'Those who do not study history...', itemClass: 'equipment' as const, slotType: 'data' as const, rarity: 'uncommon' as const, statBonuses: { wisdom: 2, prudence: 1 }, passiveCost: 2, uniqueEffect: undefined },
  { id: 'item-charm', name: 'Lucky Charm', description: 'A four-leaf clover pressed in resin.', flavorText: 'Luck is just unrecognized pattern recognition.', itemClass: 'equipment' as const, slotType: 'data' as const, rarity: 'uncommon' as const, statBonuses: { skill: 2 }, passiveCost: 1, uniqueEffect: undefined },
  { id: 'item-ledger', name: 'Oracle Ledger', description: 'An ancient leather-bound ledger.', flavorText: 'In the short run the market is a voting machine...', itemClass: 'equipment' as const, slotType: 'capital' as const, rarity: 'rare' as const, statBonuses: { prudence: 5, temperance: 2 }, passiveCost: 3, uniqueEffect: { id: 'ef-valueinvest', name: 'Value Investor', description: '+30% if you hold prediction >48h.' } },
  { id: 'item-visor', name: 'Tech Visor', description: 'A holographic visor that overlays market data.', flavorText: 'The future renders in real-time.', itemClass: 'equipment' as const, slotType: 'vision' as const, rarity: 'mythic' as const, statBonuses: { wisdom: 5, skill: 2 }, passiveCost: 12, uniqueEffect: { id: 'ef-techprophet', name: 'Tech Prophet', description: '+20% payout on all Tech quests.' } },
]

const SAMPLE_FOLLOWED_HEROES = [
  { id: 'elon', handle: 'elonmusk', name: 'Elon Musk', slotType: 'vision' as const },
  { id: 'buffett', handle: 'warrenbuffett', name: 'Warren Buffett', slotType: 'capital' as const },
]

const SAMPLE_BADGE_CHAINS = [
  { id: 'seer', name: 'Seer', category: 'VIRTUE' as BadgeCategory, description: 'Wisdom milestones — seeing beyond the surface.', icon: 'Eye', tiers: [
    { name: 'Seer I: Initiate', tier: 'bronze' as const, tierIndex: 0, unlocked: true, description: 'Reach Wisdom 5', triggerDescription: 'Reach Wisdom 5' },
    { name: 'Seer II: Diviner', tier: 'silver' as const, tierIndex: 1, unlocked: false, progress: 8, progressMax: 10, description: 'Reach Wisdom 10', triggerDescription: 'Reach Wisdom 10' },
    { name: 'Seer III: Clairvoyant', tier: 'gold' as const, tierIndex: 2, unlocked: false, description: 'Reach Wisdom 15', triggerDescription: 'Reach Wisdom 15' },
    { name: 'Seer IV: Omniscient', tier: 'platinum' as const, tierIndex: 3, unlocked: false, description: 'Reach Wisdom 20', triggerDescription: 'Reach Wisdom 20' },
  ]},
  { id: 'disciple', name: 'Disciple', category: 'LOYALTY' as BadgeCategory, description: 'Follow one hero through many predictions.', icon: 'Heart', tiers: [
    { name: 'Disciple I: Acolyte', tier: 'bronze' as const, tierIndex: 0, unlocked: true, description: '10 bets with one hero', triggerDescription: '10 bets with one hero' },
    { name: 'Disciple II: Devotee', tier: 'silver' as const, tierIndex: 1, unlocked: false, progress: 1, progressMax: 25, description: '25 bets with one hero', triggerDescription: '25 bets' },
    { name: 'Disciple III: Zealot', tier: 'gold' as const, tierIndex: 2, unlocked: false, description: '50 bets with one hero', triggerDescription: '50 bets' },
    { name: 'Disciple IV: Avatar', tier: 'platinum' as const, tierIndex: 3, unlocked: false, description: '100 bets with one hero', triggerDescription: '100 bets' },
  ]},
  { id: 'oracle', name: 'Oracle', category: 'MARKET' as BadgeCategory, description: 'Consecutive prediction wins.', icon: 'Flame', tiers: [
    { name: 'Oracle I: Lucky', tier: 'bronze' as const, tierIndex: 0, unlocked: true, description: 'Win 3 in a row', triggerDescription: '3 streak' },
    { name: 'Oracle II: Prescient', tier: 'silver' as const, tierIndex: 1, unlocked: false, progress: 2, progressMax: 5, description: 'Win 5 in a row', triggerDescription: '5 streak' },
    { name: 'Oracle III: Prophet', tier: 'gold' as const, tierIndex: 2, unlocked: false, description: 'Win 10 in a row', triggerDescription: '10 streak' },
    { name: 'Oracle IV: Fateweaver', tier: 'platinum' as const, tierIndex: 3, unlocked: false, description: 'Win 20 in a row', triggerDescription: '20 streak' },
  ]},
]

const SAMPLE_PREDICTIONS = [
  { id: 'p1', questId: 'q1', questQuestion: 'Will Bitcoin exceed $150,000 by December 31, 2026?', questCategory: 'CRYPTO' as const, outcome: 'YES' as const, amount: 100, entryProbability: 40, result: 'PENDING' as PredictionResult, payout: 0, netProfit: 0, placedAt: '2026-07-02T09:15:00Z', heroFollowedName: 'Elon Musk', heroFollowedTitle: 'The Technoking', equippedItems: [], virtueBonuses: [] },
  { id: 'p2', questId: 'q3', questQuestion: 'Will OpenAI release GPT-6 by end of 2026?', questCategory: 'TECH' as const, outcome: 'NO' as const, amount: 150, entryProbability: 62, result: 'PENDING' as PredictionResult, payout: 0, netProfit: 0, placedAt: '2026-07-01T14:30:00Z', equippedItems: [], virtueBonuses: [] },
  { id: 'p3', questId: 'q5', questQuestion: 'Will Taylor Swift release a new album in 2026?', questCategory: 'CULTURE' as const, outcome: 'YES' as const, amount: 200, entryProbability: 68, result: 'WON' as PredictionResult, payout: 294, netProfit: 94, placedAt: '2026-06-30T11:00:00Z', resolvedAt: '2026-07-01T08:00:00Z', heroFollowedName: 'Taylor Swift', heroFollowedTitle: 'The Pop Sovereign', equippedItems: [{ slot: 'data', itemId: 'item-scroll', itemName: 'Scholar Scroll', rarity: 'uncommon' as const, effectDescription: '+2 Wisdom, +1 Prudence' }], virtueBonuses: [{ virtue: 'wisdom' as VirtueName, virtueValue: 11, bonusDescription: '+11% payout (Wisdom Adept)', modifierType: 'multiplier' as const, modifierValue: 1.11 }] },
  { id: 'p4', questId: 'q8', questQuestion: 'Will Russia and Ukraine sign a ceasefire agreement in 2026?', questCategory: 'POLITICS' as const, outcome: 'NO' as const, amount: 80, entryProbability: 44, result: 'LOST' as PredictionResult, payout: 0, netProfit: -80, placedAt: '2026-06-30T16:45:00Z', resolvedAt: '2026-07-01T12:00:00Z', equippedItems: [], virtueBonuses: [] },
  { id: 'p5', questId: 'q7', questQuestion: 'Will Tesla stock reach $500 per share by end of 2026?', questCategory: 'TECH' as const, outcome: 'NO' as const, amount: 120, entryProbability: 70, result: 'WON' as PredictionResult, payout: 171, netProfit: 51, placedAt: '2026-06-27T20:00:00Z', resolvedAt: '2026-06-29T18:00:00Z', heroFollowedName: 'Elon Musk', heroFollowedTitle: 'The Technoking', equippedItems: [{ slot: 'vision', itemId: 'item-charm', itemName: 'Lucky Charm', rarity: 'uncommon' as const, effectDescription: '+2 Skill' }], virtueBonuses: [{ virtue: 'skill' as VirtueName, virtueValue: 15, bonusDescription: '+15% payout (Skill Master)', modifierType: 'multiplier' as const, modifierValue: 1.15 }] },
]

const RESULT_COLORS: Record<PredictionResult, string> = { WON: 'text-green-400 bg-green-500/10', LOST: 'text-red-400 bg-red-500/10', PENDING: 'text-text-muted bg-line/20' }

function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-30 bottom-full left-0 mb-1 w-56 glass rounded-lg p-2 border border-accent/40 shadow-lg text-xs">
          {content}
        </div>
      )}
    </div>
  )
}

export function OraclePage() {
  const player = usePlayerStore((s) => s.player)
  const oracle = useOracleStore((s) => s.oracle)
  const wagers = useWagerStore((s) => s.wagers)
  const fetchWagers = useWagerStore((s) => s.fetchMine)
  const navigate = useNavigate()

  useEffect(() => { if (player.id) fetchWagers(player.id) }, [player.id, fetchWagers])

  const cult = CULT_INFO[oracle.cult] ?? { name: 'Uninitiated', description: 'Join a cult to unlock your powers.', color: '#666', linkedVirtue: 'wisdom' }

  // Real win/loss stats from the player's on-chain-backed wagers
  const wonCount = wagers.filter((w) => w.result === 'WON').length
  const lostCount = wagers.filter((w) => w.result === 'LOST').length
  const pendingCount = wagers.filter((w) => w.result === 'PENDING').length
  const winRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0
  const netPL = wagers.reduce((sum, w) => sum + (w.netProfit || 0), 0)

  const activeTax = SAMPLE_ITEMS.filter((i) => ['item-scroll', 'item-charm'].includes(i.id)).reduce((sum, i) => sum + i.passiveCost, 0)

  // Inventory filter state
  const [invSearch, setInvSearch] = useState('')
  const [invState, setInvState] = useState('ALL')
  const [invSlot, setInvSlot] = useState('ALL')
  const [invClass, setInvClass] = useState('ALL')
  const equippedIds = ['item-scroll', 'item-charm']

  const filteredInventory = useMemo(() => {
    return SAMPLE_ITEMS.filter((item) => {
      if (invSearch && !item.name.toLowerCase().includes(invSearch.toLowerCase())) return false
      if (invState === 'EQUIPPED' && !equippedIds.includes(item.id)) return false
      if (invState === 'UNEQUIPPED' && equippedIds.includes(item.id)) return false
      if (invSlot !== 'ALL' && item.slotType !== invSlot) return false
      if (invClass !== 'ALL' && item.itemClass !== invClass) return false
      return true
    })
  }, [invSearch, invState, invSlot, invClass])

  // History filter state
  const [histResult, setHistResult] = useState('ALL')
  const [histCategory, setHistCategory] = useState('ALL')
  const [histDate, setHistDate] = useState('ALL')
  const [expandedPred, setExpandedPred] = useState<string | null>(null)

  const filteredPredictions = useMemo(() => {
    let preds = [...SAMPLE_PREDICTIONS].reverse()
    if (histResult !== 'ALL') preds = preds.filter((p) => p.result === histResult)
    if (histCategory !== 'ALL') preds = preds.filter((p) => p.questCategory === histCategory)
    if (histDate === 'WEEK') {
      const weekAgo = new Date(Date.now() - 7 * 86400000)
      preds = preds.filter((p) => new Date(p.placedAt) > weekAgo)
    } else if (histDate === 'MONTH') {
      const monthAgo = new Date(Date.now() - 30 * 86400000)
      preds = preds.filter((p) => new Date(p.placedAt) > monthAgo)
    }
    return preds
  }, [histResult, histCategory, histDate])

  // Badge state
  const [badgeCat, setBadgeCat] = useState<BadgeCategory | 'ALL'>('ALL')
  const visibleChains = badgeCat === 'ALL' ? SAMPLE_BADGE_CHAINS : SAMPLE_BADGE_CHAINS.filter((c) => c.category === badgeCat)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-accent">Profile</h2>
          <p className="text-text-muted mt-1">Your oracular character sheet — carved in stone, reforged by fire.</p>
        </div>
      </div>

      {/* ── Identity Bar ── */}
      <Card variant="glow" className="flex items-center gap-6 p-6">
        <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: cult.color + '20', borderColor: cult.color + '60', color: cult.color }}>
          {(player.alias || player.handle || 'O')[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{player.alias || player.handle || 'Oracle'}</h3>
          {player.alias && <p className="text-xs text-text-muted">@{player.handle}</p>}
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-text-muted text-sm">Lv.{oracle.level}</span>
            <span className="text-premium-400 font-mono text-sm">{oracle.xp} XP</span>
            <Tooltip content={<><p className="font-medium" style={{ color: cult.color }}>{cult.name}</p><p className="text-text-muted">{cult.description}</p><p className="text-text-muted mt-1 capitalize">Linked virtue: {cult.linkedVirtue}</p></>}>
              <span className="text-sm flex items-center gap-1 cursor-help" style={{ color: cult.color }}><Shield size={14} /> {cult.name}</span>
            </Tooltip>
          </div>
          <div className="w-full bg-surface rounded-full h-2 mt-3">
            <div className="bg-accent h-2 rounded-full xp-fill" style={{ width: `${oracle.xp % 100}%` }} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-text-muted">Win Rate</p>
          <p className="text-2xl font-bold text-green-400">{winRate}%</p>
          <p className="text-xs text-text-muted">{wonCount}W &middot; {lostCount}L &middot; {pendingCount}P</p>
          <p className={clsx('text-xs font-mono mt-1', netPL >= 0 ? 'text-green-400' : 'text-red-400')}>{netPL >= 0 ? '+' : ''}{netPL} Fate net</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Equipped Items + Followed Heroes ── */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold mb-4">Equipped Items <ComingSoon /></h3>
            <div className="space-y-2">
              {SAMPLE_FOLLOWED_HEROES.map((hero) => {
                const itemId = hero.slotType === 'vision' ? 'item-charm' : hero.slotType === 'capital' ? 'item-scroll' : undefined
                const equipped = itemId ? SAMPLE_ITEMS.find((i) => i.id === itemId) : null
                return (
                  <div key={hero.slotType} className="glass rounded-lg p-3 flex items-center gap-3">
                    <span className="text-sm font-medium text-text/70 capitalize w-24 shrink-0">{hero.slotType}</span>
                    <div className="flex-1 min-w-0">
                      {equipped ? (
                        <Tooltip content={<><p className="font-bold">{equipped.name}</p><RarityBadge rarity={equipped.rarity} /><p className="text-text-muted italic">&ldquo;{equipped.flavorText}&rdquo;</p>{Object.entries(equipped.statBonuses).map(([k, v]) => <p key={k} className="text-text/60 capitalize">+{v} {k}</p>)}{equipped.uniqueEffect && <p className="text-premium-400 mt-1">{equipped.uniqueEffect.name}: {equipped.uniqueEffect.description}</p>}<p className="text-text-muted">Passive cost: {equipped.passiveCost}%</p></>}>
                          <div className="flex items-center gap-2 cursor-help">
                            <p className="text-sm font-medium text-premium-400">{equipped.name}</p>
                            <RarityBadge rarity={equipped.rarity} />
                            {equipped.passiveCost > 0 && <span className="text-[10px] text-text-muted">{equipped.passiveCost}% tax</span>}
                          </div>
                        </Tooltip>
                      ) : (
                        <p className="text-xs text-text-muted">Empty</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {activeTax > 0 && (
              <p className="text-xs text-text-muted mt-3 pt-2 border-t border-line/50">
                Active Tax: <span className={clsx(activeTax <= 3 ? 'text-green-400' : activeTax <= 8 ? 'text-yellow-400' : 'text-red-400')}>{activeTax}%</span> of winnings
              </p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-4">Heroes Followed <ComingSoon /></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SAMPLE_FOLLOWED_HEROES.map((hero) => (
                <Tooltip key={hero.id} content={<><p className="font-medium">{hero.name}</p><p className="text-text-muted capitalize">Unlocks: {hero.slotType} equipment slot</p></>}>
                  <div
                    className="glass rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:border-accent/40 transition-colors"
                    onClick={() => navigate(`/hero/${hero.handle}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-xs">{hero.name[0]}</div>
                    <div>
                      <p className="text-xs font-medium">{hero.name}</p>
                      <p className="text-[9px] text-text-muted capitalize">{hero.slotType} slot</p>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Inventory ── */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-accent" />
            <h3 className="text-lg font-bold">Inventory <ComingSoon /></h3>
            <span className="text-xs text-text-muted ml-auto">{SAMPLE_ITEMS.length} items</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 bg-surface rounded px-2 py-1 flex-1 min-w-[120px]">
              <Search size={12} className="text-text-muted" />
              <input placeholder="Search..." value={invSearch} onChange={(e) => setInvSearch(e.target.value)} className="bg-transparent text-xs outline-none flex-1" />
            </div>
            <DropdownFilter label="Slot" options={[
              { label: 'All', value: 'ALL' }, { label: 'Vision', value: 'vision' }, { label: 'Algorithm', value: 'algorithm' },
              { label: 'Network', value: 'network' }, { label: 'Conduit', value: 'conduit' }, { label: 'Capital', value: 'capital' },
              { label: 'Data', value: 'data' }, { label: 'Narrative', value: 'narrative' }, { label: 'Resonance', value: 'resonance' },
              { label: 'Cascade', value: 'cascade' }, { label: 'Anomaly', value: 'anomaly' },
            ]} value={invSlot} onChange={setInvSlot} />
            <DropdownFilter label="Class" options={[
              { label: 'All', value: 'ALL' }, { label: 'Equipment', value: 'equipment' }, { label: 'Weapon', value: 'weapon' }, { label: 'Active', value: 'active' },
            ]} value={invClass} onChange={setInvClass} />
            <ChipGroup options={[
              { label: 'All', value: 'ALL' }, { label: 'Equipped', value: 'EQUIPPED' }, { label: 'Unequipped', value: 'UNEQUIPPED' },
            ]} selected={invState} onChange={setInvState} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredInventory.map((item) => {
              const isEquipped = equippedIds.includes(item.id)
              return (
                <div key={item.id} className={clsx('glass rounded-lg p-3 transition-all', isEquipped ? 'border-accent/40' : 'hover:border-accent/40')}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <RarityBadge rarity={item.rarity} />
                  </div>
                  <p className="text-[9px] text-text-muted mt-1 capitalize">{item.slotType} &middot; {item.itemClass}</p>
                  {Object.entries(item.statBonuses).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(item.statBonuses).map(([k, v]) => (
                        <span key={k} className="text-[9px] text-text/60">+{v} {k}</span>
                      ))}
                    </div>
                  )}
                  {item.passiveCost > 0 && <span className="text-[9px] text-text-muted block mt-1">{item.passiveCost}% tax</span>}
                  {isEquipped && <span className="text-[9px] text-accent block mt-1">Equipped</span>}
                </div>
              )
            })}
          </div>
        </Card>

        {/* ── Badges ── */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Badges <ComingSoon /></h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['ALL', 'VIRTUE', 'LOYALTY', 'COLLECTION', 'MARKET'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setBadgeCat(cat)}
                className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border', badgeCat === cat ? 'bg-accent/10 border-accent/40 text-accent' : 'border-line text-text-muted hover:text-text/70')}
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleChains.map((chain) => {
              let currentTier = chain.tiers[0]!
              for (let i = chain.tiers.length - 1; i >= 0; i--) {
                if (chain.tiers[i]!.unlocked) { currentTier = chain.tiers[i]!; break }
                if ((chain.tiers[i] as { progress?: number }).progress !== undefined) { currentTier = chain.tiers[i]!; break }
              }
              const isMaxed = chain.tiers[3]!.unlocked

              return (
                <Tooltip key={chain.id} content={<div className="space-y-1"><p className="font-medium">{chain.name} — {chain.description}</p><p className="text-text-muted">{currentTier.name}</p><p className="text-text-muted">{currentTier.triggerDescription}</p>{(currentTier as { progress?: number }).progress !== undefined && !currentTier.unlocked && <p className="text-text-muted">Progress: {(currentTier as { progress: number }).progress}/{(currentTier as { progressMax?: number }).progressMax ?? 0}</p>}</div>}>
                  <div className={clsx('glass rounded-lg p-4 text-center cursor-help transition-all', currentTier.unlocked ? 'border-accent/30' : '')}>
                    <div className="text-2xl mb-1">{currentTier.unlocked ? '\u{1F3C6}' : isMaxed ? '\u{1F451}' : '\u{1F512}'}</div>
                    <p className="text-xs font-bold">{chain.name}</p>
                    <TierBadge tier={currentTier.tier} />
                    <p className="text-[10px] text-text-muted mt-1">{currentTier.name.split(': ')[1] ?? currentTier.name}</p>
                    {(currentTier as { progress?: number }).progress !== undefined && !currentTier.unlocked && (
                      <div className="w-full bg-surface rounded-full h-1.5 mt-2">
                        <div className="bg-accent h-1.5 rounded-full" style={{ width: `${Math.min(100, (((currentTier as { progress: number }).progress!) / ((currentTier as { progressMax?: number }).progressMax ?? 1)) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                </Tooltip>
              )
            })}
          </div>
        </Card>

        {/* ── Prediction History ── */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Prediction History</h3>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <ChipGroup options={[
              { label: 'All', value: 'ALL' }, { label: 'Won', value: 'WON' }, { label: 'Lost', value: 'LOST' }, { label: 'Pending', value: 'PENDING' },
            ]} selected={histResult} onChange={setHistResult} />
            <DropdownFilter label="Cat" options={[
              { label: 'All', value: 'ALL' }, { label: 'Politics', value: 'POLITICS' }, { label: 'Tech', value: 'TECH' },
              { label: 'Crypto', value: 'CRYPTO' }, { label: 'Culture', value: 'CULTURE' },
            ]} value={histCategory} onChange={setHistCategory} />
            <ChipGroup options={[
              { label: 'All Time', value: 'ALL' }, { label: 'Month', value: 'MONTH' }, { label: 'Week', value: 'WEEK' },
            ]} selected={histDate} onChange={setHistDate} />
            {(histResult !== 'ALL' || histCategory !== 'ALL' || histDate !== 'ALL') && (
              <button onClick={() => { setHistResult('ALL'); setHistCategory('ALL'); setHistDate('ALL') }} className="text-[10px] text-accent hover:underline">Clear</button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { label: 'Bets', value: filteredPredictions.length.toString() },
              { label: 'Win Rate', value: filteredPredictions.filter((p) => p.result !== 'PENDING').length > 0 ? `${Math.round((filteredPredictions.filter((p) => p.result === 'WON').length / filteredPredictions.filter((p) => p.result !== 'PENDING').length) * 100)}%` : '\u2500\u2500' },
              { label: 'Net P/L', value: `${filteredPredictions.reduce((s, p) => s + p.netProfit, 0) >= 0 ? '+' : ''}${filteredPredictions.reduce((s, p) => s + p.netProfit, 0)} MP` },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-lg px-3 py-1.5 text-center">
                <p className="text-[9px] text-text-muted">{stat.label}</p>
                <p className="text-xs font-mono font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {filteredPredictions.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No predictions found. Place your first bet on the Network!</p>
            ) : (
              filteredPredictions.map((p) => {
                const isExpanded = expandedPred === p.id
                return (
                  <div key={p.id}>
                    <div onClick={() => setExpandedPred(isExpanded ? null : p.id)} className="flex items-center gap-3 p-3 glass rounded-lg cursor-pointer hover:border-accent/40 transition-all">
                      <div className={clsx('p-1.5 rounded', RESULT_COLORS[p.result])}>
                        {p.result === 'WON' ? <CheckCircle size={16} /> : p.result === 'LOST' ? <XCircle size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.questQuestion}</p>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className={p.outcome === 'YES' ? 'text-green-400' : 'text-red-400'}>{p.outcome}</span>
                          <span>{p.amount} MP</span>
                          <span>@{p.entryProbability}%</span>
                          <span>{new Date(p.placedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {p.result === 'WON' && <span className="text-green-400 font-mono text-sm font-bold">+{p.payout}</span>}
                        {p.result === 'LOST' && <span className="text-red-400 font-mono text-sm">-{p.amount}</span>}
                        {p.result === 'PENDING' && <span className="text-text-muted font-mono text-sm">{'\u2500\u2500'}</span>}
                      </div>
                      {isExpanded ? <ChevronUp size={14} className="text-text-muted shrink-0" /> : <ChevronDown size={14} className="text-text-muted shrink-0" />}
                    </div>
                    {isExpanded && (
                      <div className="glass rounded-lg p-4 ml-3 border-t border-line/50 space-y-2">
                        {p.heroFollowedName && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold">{p.heroFollowedName[0]}</div>
                            <span className="text-xs text-text/60">{p.heroFollowedName} &mdash; {p.heroFollowedTitle}</span>
                          </div>
                        )}
                        {p.equippedItems.length > 0 && (
                          <div>
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">Items Equipped</span>
                            {p.equippedItems.map((ei, i) => (
                              <div key={i} className="text-xs text-text-muted ml-2">{'\u21B3'} {ei.itemName} ({ei.rarity}): {ei.effectDescription}</div>
                            ))}
                          </div>
                        )}
                        {p.virtueBonuses.length > 0 && (
                          <div>
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">Virtue Bonuses</span>
                            {p.virtueBonuses.map((vb, i) => (
                              <div key={i} className="text-xs text-text-muted ml-2 capitalize">{'\u21B3'} {vb.virtue} {vb.virtueValue}: {vb.bonusDescription}</div>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-text-muted">
                          Placed: {new Date(p.placedAt).toLocaleString()}
                          {p.resolvedAt && <span> &middot; Resolved: {new Date(p.resolvedAt).toLocaleString()}</span>}
                        </div>
                        {p.result === 'WON' && (
                          <div className="text-xs text-text-muted">
                            Payout: {p.amount} &times; (100/{p.entryProbability}) = {p.payout} MP &middot; Net: +{p.netProfit} MP
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
