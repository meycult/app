import { useState, useRef, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Map, Wallet, ShoppingBag, User, Settings, UserCog, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import { usePlayerStore } from '@/stores/playerStore'
import { useOracleStore } from '@/stores/oracleStore'
import Logo from '@/components/Logo'
import { WalletButton } from '@/wallet/WalletButton'
import { BalanceDisplay } from '@/wallet/BalanceDisplay'

const navItems = [
  { to: '/quests', label: 'Quests', icon: Map },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/store', label: 'Shop', icon: ShoppingBag },
]

const userMenuItems = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/account', label: 'Account', icon: UserCog },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const player = usePlayerStore(s => s.player)
  const oracle = useOracleStore(s => s.oracle)
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <aside className="w-64 h-screen glass border-r border-line flex flex-col shrink-0">
      <div className="p-6 border-b border-line">
        <Logo size={20} />
      </div>

      <div className="px-4 pt-4 space-y-3 border-b border-line/50 pb-4">
        <WalletButton />
        <BalanceDisplay />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
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

      <div className="p-4 border-t border-line relative" ref={dropdownRef}>
        {dropdownOpen && (
          <div className="absolute bottom-full right-4 z-50 mb-1 w-48">
            <div className="glass rounded-xl border border-line overflow-hidden shadow-xl">
              {userMenuItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => { setDropdownOpen(false); onNavigate?.() }}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text hover:bg-accent/10'
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
              {player.isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => { setDropdownOpen(false); onNavigate?.() }}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-line/50',
                    isActive ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text hover:bg-accent/10'
                  )}
                >
                  <Settings size={16} />
                  Admin
                </NavLink>
              )}
            </div>
          </div>
        )}

        <div className="glass rounded-xl p-3 cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 shrink-0 overflow-hidden">
              <img
                src={player.avatarUrl || '/icon.png'}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.png' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{player.alias || player.handle}</p>
              <p className="text-xs text-accent/60">Lv.{oracle.level} · {oracle.xp} XP</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
              className="p-1 rounded hover:bg-surface/60 transition-colors"
            >
              <ChevronUp size={16} className={clsx('transition-transform', dropdownOpen && 'rotate-180')} />
            </button>
          </div>
          <div className="w-full bg-surface rounded-full h-1.5 mt-2">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: `${(oracle.xp % 100)}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
