import { clsx } from 'clsx'
import type { BadgeTier, BadgeCategory } from '@/types'

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: 'border-amber-600 text-amber-600 bg-amber-600/10',
  silver: 'border-slate-300 text-slate-300 bg-slate-300/10',
  gold: 'border-yellow-400 text-yellow-400 bg-yellow-400/10',
  platinum: 'border-zinc-200 text-zinc-200 bg-zinc-200/10',
}

export function TierBadge({ tier }: { tier: BadgeTier; size?: 'sm' | 'md' }) {
  return (
    <span className={clsx('font-bold uppercase border rounded-full px-2 py-0.5 text-[10px] tracking-wider', TIER_COLORS[tier])}>
      {tier}
    </span>
  )
}

const BADGE_CATEGORY_ICONS: Record<BadgeCategory, string> = {
  VIRTUE: '⬡', LOYALTY: '♥', COLLECTION: '◆', MARKET: '◈',
}

export function BadgeCategoryChip({ category, active, onClick }: { category: BadgeCategory | 'ALL'; active: boolean; onClick: () => void }) {
  const label = category === 'ALL' ? 'All' : category.charAt(0) + category.slice(1).toLowerCase()
  const icon = category === 'ALL' ? '' : BADGE_CATEGORY_ICONS[category]
  return (
    <button onClick={onClick} className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border', active ? 'bg-accent/20 border-accent/30 text-accent' : 'border-line text-text-muted hover:text-text/70')}>
      {icon} {label}
    </button>
  )
}
