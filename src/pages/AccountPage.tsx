import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlayerStore } from '@/stores/playerStore'
import { useOracleStore } from '@/stores/oracleStore'
import { TabBar, Button, Card } from '@/components/ui/ui'

type AccountTab = 'profile' | 'appearance' | 'security'

const TABS: { id: AccountTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'security', label: 'Security' },
]

function Setting({ label, desc, value, children }: { label: string; desc?: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-8 py-4 border-b border-line/20 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-text/80">{label}</p>
        {desc && <p className="text-[10px] text-text-muted mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0 text-right text-sm">
        {children || <span className="text-text/50">{value}</span>}
      </div>
    </div>
  )
}

export function AccountPage() {
  const { user, signOut } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const oracle = useOracleStore((s) => s.oracle)
  const updateAlias = usePlayerStore((s) => s.updateAlias)
  const navigate = useNavigate()
  const [tab, setTab] = useState<AccountTab>('profile')
  const [editAlias, setEditAlias] = useState(player.alias || player.handle || '')
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    await updateAlias(editAlias || player.handle)
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-3xl font-bold text-accent">Account</h2>
        <p className="text-text-muted mt-1">Your vessel. Your sigil. Your oath.</p>
      </div>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-3">Display</h3>
            <Setting label="Alias" desc="What other oracles see">
              <input
                type="text"
                value={editAlias}
                onChange={(e) => setEditAlias(e.target.value.slice(0, 24))}
                placeholder="GodEmperor"
                maxLength={24}
                className="w-48 bg-surface border border-line/30 rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none text-right"
              />
            </Setting>
            <Setting label="ID">
              <span className="text-text/50 font-mono">@{player.handle}</span>
            </Setting>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-3">Account Info</h3>
            <Setting label="Email">
              <span className="text-text/50">{user?.email}</span>
            </Setting>
            <Setting label="Cult" desc="Cult selection coming soon">
              <span className="text-text/60 capitalize">{oracle.cult || 'Uninitiated'}</span>
            </Setting>
            <Setting label="Joined">
              <span className="text-text/50">
                {new Date(player.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </Setting>
          </Card>

          <div className="flex justify-end">
            <Button size="sm" variant="accent" onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-3">Cosmetics</h3>
            <p className="text-xs text-text-muted">
              Cosmetics coming soon. Visit the{' '}
              <button onClick={() => navigate('/store')} className="text-accent hover:underline">Store</button>
              {' '}to preview items.
            </p>
          </Card>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-text/70 uppercase tracking-wider mb-3">Session</h3>
            <Setting label="Sign Out" desc="Sign out of your account on this device">
              <Button size="sm" variant="ghost" onClick={handleSignOut}>Sign Out</Button>
            </Setting>
          </Card>

          <Card variant="glow">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
            <Setting label="Delete Account" desc="Permanent — all predictions, items, and data will be lost">
              <Button size="sm" variant="danger" disabled>Delete</Button>
            </Setting>
          </Card>
        </div>
      )}
    </div>
  )
}
