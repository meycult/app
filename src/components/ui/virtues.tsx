import type { VirtueName, VirtueTierLevel } from '@/types'
import { Eye, Flame, Shield, Target, Timer, Scale } from 'lucide-react'
import { useState } from 'react'

export const VIRTUE_META: Record<VirtueName, { label: string; desc: string; color: string; tierDescs: Record<VirtueTierLevel, string>; icon: typeof Eye }> = {
  wisdom: { label: 'Wisdom', desc: 'Info revealed before betting', color: '#06b6d4', icon: Eye, tierDescs: { 0: 'Base info only', 1: 'Trend direction arrows on quests', 2: 'Hero category W/L records visible', 3: 'Signal Reliability star rating' } },
  courage: { label: 'Courage', desc: 'Max bet size + gambits', color: '#ef4444', icon: Flame, tierDescs: { 0: 'Max bet 200 MP', 1: 'Max 500 MP, +5% conviction bonus', 2: 'Max 1,200 MP, Double Down 1/day', 3: 'Max 3,000 MP, All-In Gambit' } },
  prudence: { label: 'Prudence', desc: 'Risk + loss recovery', color: '#f59e0b', icon: Shield, tierDescs: { 0: 'Full loss exposure', 1: '10% loss recovery', 2: '20% recovery + Daily Safety Net', 3: '30% recovery + Resilience Ramp' } },
  skill: { label: 'Skill', desc: 'Timing + entry pricing', color: '#10b981', icon: Target, tierDescs: { 0: 'Standard entry pricing', 1: '+5% Quick Draw, +8% Sniper', 2: '+10% QD, +12% SE, Price Lock', 3: '+15% QD, +18% SE, Flash Bet' } },
  temperance: { label: 'Temperance', desc: 'Streaks + discipline', color: '#8b5cf6', icon: Timer, tierDescs: { 0: 'No streak mechanics', 1: '+5% per win streak, Cool Head', 2: '+50% max streak, Meditation', 3: '+75% max streak, Zen Master' } },
  justice: { label: 'Justice', desc: 'Diversity + contrarian', color: '#cbd5e1', icon: Scale, tierDescs: { 0: 'No diversity bonus', 1: '+4% per category (max 20%)', 2: '+6% per cat, Contrarian Justice', 3: '+8% per cat, Nemesis +50%' } },
}

const TIER_NAMES: Record<VirtueTierLevel, string> = { 0: 'Novice', 1: 'Initiate', 2: 'Adept', 3: 'Master' }

export function getVirtueTier(value: number): VirtueTierLevel {
  if (value >= 15) return 3
  if (value >= 10) return 2
  if (value >= 5) return 1
  return 0
}

export function VirtueBar({ virtue, value }: { virtue: VirtueName; value: number }) {
  const meta = VIRTUE_META[virtue]
  const tier = getVirtueTier(value)
  const pct = (value / 20) * 100
  const Icon = meta.icon
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="space-y-1.5 group relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: meta.color }} />
          <span className="text-sm text-text/80 font-medium">{meta.label}</span>
          <span className="text-[11px] font-bold" style={{ color: meta.color }}>{TIER_NAMES[tier]}</span>
          <span className="text-[10px] text-text-muted hidden sm:inline">{meta.desc}</span>
        </div>
        <span className="font-mono text-sm font-bold" style={{ color: meta.color }}>{value}</span>
      </div>
      <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: meta.color, opacity: 0.85 }} />
      </div>
      {showTooltip && (
        <div className="absolute z-30 bottom-full left-0 mb-1 w-60 glass rounded-lg p-2 border border-line/30 shadow-lg text-[11px]">
          <p className="text-text/80 font-medium">Current: {TIER_NAMES[tier]}</p>
          <p className="text-text/60">{meta.tierDescs[tier]}</p>
          {tier < 3 && (
            <p className="text-text-muted mt-1">Next: {TIER_NAMES[(tier + 1) as VirtueTierLevel]} — {meta.tierDescs[(tier + 1) as VirtueTierLevel]}</p>
          )}
        </div>
      )}
    </div>
  )
}
