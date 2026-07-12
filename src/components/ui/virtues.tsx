import type { VirtueName, VirtueTierLevel } from '@/types'
import { Eye, Droplets, Shield, Flame } from 'lucide-react'
import { useState } from 'react'

export const VIRTUE_META: Record<VirtueName, { label: string; desc: string; color: string; tierDescs: Record<VirtueTierLevel, string>; icon: typeof Eye }> = {
  clarity: { label: 'Clarity', desc: 'Info revealed before betting', color: '#06b6d4', icon: Eye, tierDescs: { 0: 'Base info only', 1: 'Trend direction arrows on quests', 2: 'Hero category W/L records visible', 3: 'Signal Reliability star rating' } },
  humility: { label: 'Humility', desc: 'Grace through surrender', color: '#3b82f6', icon: Droplets, tierDescs: { 0: 'Standard wagers', 1: 'Grace Pool contributions enabled', 2: 'Servant Wager bonuses active', 3: 'Absolution rite available' } },
  endurance: { label: 'Endurance', desc: 'Steadfast through setbacks', color: '#f59e0b', icon: Shield, tierDescs: { 0: 'Full loss exposure', 1: '10% loss recovery', 2: 'Grounding Lock active', 3: 'Earthquake double payouts' } },
  overcoming: { label: 'Overcoming', desc: 'Rise stronger from loss', color: '#ef4444', icon: Flame, tierDescs: { 0: 'No streak mechanics', 1: 'Ash Pool contributions', 2: 'Eternal Recurrence enabled', 3: 'Will-to-Power max multiplier' } },
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
        <div
          className="h-full rounded-full virtue-bar-fill"
          style={{
            width: `${pct}%`,
            '--virtue-color': meta.color,
            background: `linear-gradient(90deg, ${meta.color}, color-mix(in srgb, ${meta.color} 50%, #ffffff), ${meta.color})`,
            backgroundSize: '200% 100%',
          } as React.CSSProperties}
        />
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
