import { Map, User, Wrench, ShoppingBag, Tag, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { useGameStore } from '@/stores/gameStore'
import Logo from '@/components/Logo'

const navItems = [
  { to: '/', label: 'Atlas', icon: Map },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/build', label: 'Build', icon: Wrench },
  { to: '/store', label: 'Store', icon: ShoppingBag },
  { to: '/market', label: 'Market', icon: Tag },
  { to: '/admin', label: 'Admin', icon: Settings },
]

export function Sidebar() {
  const player = useGameStore(s => s.player)

  return (
    <aside className="w-64 h-screen glass border-r border-line flex flex-col shrink-0">
      <div className="p-6 border-b border-line">
        <Logo size={20} />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-accent/20 text-accent border border-line/50 glow-accent'
                : 'text-text-muted hover:text-text/90 hover:bg-surface/60'
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-line">
        <div className="glass rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold">
              {player.username[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{player.username}</p>
              <p className="text-xs text-accent/60">Lv.{player.level} · {player.insightPoints} MP</p>
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-1.5">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: `${(player.xp % 100)}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
