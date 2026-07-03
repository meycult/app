import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-muted">{label}</span>
        <span className="text-text font-mono">{value}</span>
      </div>
      <div className="w-full bg-surface rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-surface text-text-muted border-surface',
  uncommon: 'bg-green-900/40 text-green-400 border-green-700/40',
  rare: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  mythic: 'bg-premium-500/20 text-premium-400 border-premium-500/40',
}

export function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span className={clsx('text-[10px] font-bold uppercase px-2 py-0.5 rounded border tracking-widest', RARITY_COLORS[rarity] ?? RARITY_COLORS.common)}>
      {rarity}
    </span>
  )
}

export function Card({ children, className, glow = false, onClick, draggable, onDragStart }: { children: ReactNode; className?: string; glow?: boolean; onClick?: () => void; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void }) {
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={clsx(
        'glass rounded-xl p-4 transition-all duration-300',
        glow && 'glow-accent',
        onClick && 'cursor-pointer hover:border-accent/50 hover:glow-accent',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'accent', size = 'md', className, onClick, disabled }: {
  children: ReactNode; variant?: 'accent' | 'premium' | 'ghost' | 'danger'; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string; onClick?: () => void; disabled?: boolean
}) {
  const variants = {
    accent: 'bg-accent hover:bg-accent/80 text-text border-accent/50',
    premium: 'bg-premium-500/20 hover:bg-premium-500/30 text-premium-400 border-premium-500/40',
    ghost: 'bg-transparent hover:bg-surface/50 text-text-muted border-line/20',
    danger: 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-700/40',
  }
  const sizes = {
    xs: 'px-2 py-1 text-[10px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={clsx('rounded-lg border font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}>
      {children}
    </button>
  )
}

export function TabBar<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string; icon?: string }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface/60 rounded-lg p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
            active === t.id
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'text-text-muted hover:text-text/70'
          )}
        >
          {t.icon && <span className="mr-1">{t.icon}</span>}{t.label}
        </button>
      ))}
    </div>
  )
}
