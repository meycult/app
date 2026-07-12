import { useState, useCallback } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { Card, TabBar } from '@/components/ui/ui'
import { CONTRACTS, CHAIN_ID } from '@/config/contracts'
import { FateFaucet } from '@/wallet/FateFaucet'
import { supabase } from '@/lib/supabase'
import { clsx } from 'clsx'
import { AdminResolution } from '@/pages/admin/AdminResolution'
import { AdminTreasury } from '@/pages/admin/AdminTreasury'

const POLYMARKET_API_URL = import.meta.env.VITE_POLYMARKET_API_URL ?? 'https://meycult-api.vercel.app'

const TABS = [
  { id: 'polymarket', label: 'Polymarket' },
  { id: 'resolution', label: 'Resolution' },
  { id: 'treasury', label: 'Treasury' },
  { id: 'faucet', label: 'Fate Faucet' },
  { id: 'contracts', label: 'Contracts' },
]

interface SyncStatus {
  syncedAt: string | null
  status: string
  message: string
  created: number
  updated: number
  resolved: number
  errors: number
  loading: boolean
}

export function AdminPage() {
  const { player } = usePlayerStore()
  const [tab, setTab] = useState(TABS[0].id)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncedAt: null, status: 'idle', message: '', created: 0, updated: 0, resolved: 0, errors: 0, loading: false,
  })

  const triggerSync = useCallback(async () => {
    setSyncStatus((s) => ({ ...s, loading: true, message: 'Syncing...' }))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ''

      const resp = await fetch(`${POLYMARKET_API_URL}/sync/polymarket`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })

      if (!resp.ok) {
        const err = await resp.text()
        setSyncStatus((s) => ({ ...s, loading: false, status: 'error', message: err.slice(0, 200) }))
        return
      }

      const data = await resp.json()
      setSyncStatus({
        syncedAt: data.synced_at ?? null,
        status: data.status,
        message: data.status === 'cooldown' ? 'In cooldown (55 min)' : `Created: ${data.created}, Updated: ${data.updated}, Errors: ${data.errors}`,
        created: data.created,
        updated: data.updated,
        resolved: data.resolved,
        errors: data.errors,
        loading: false,
      })
    } catch (e) {
      setSyncStatus((s) => ({ ...s, loading: false, status: 'error', message: `Network error: ${(e as Error).message}` }))
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await fetch(`${POLYMARKET_API_URL}/sync/status`)
      if (!resp.ok) return
      const data = await resp.json()
      setSyncStatus((s) => ({
        ...s,
        syncedAt: data.synced_at ?? null,
        status: data.status,
        message: data.message ?? '',
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        resolved: data.resolved ?? 0,
        errors: data.errors ?? 0,
      }))
    } catch { /* ignore */ }
  }, [])

  if (!player.isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
        <p className="text-text-muted mt-2">Only administrators can access this page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-3xl font-bold text-accent">Admin</h2>
        <p className="text-text-muted mt-1">Quest management, contract state, and system tools.</p>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'resolution' && <AdminResolution />}
      {tab === 'treasury' && <AdminTreasury />}

      {tab === 'faucet' && (
        <div className="space-y-4">
          <FateFaucet />
          <Card className="p-4">
            <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider mb-2">Instructions</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Enter an amount of Fate tokens (testnet) and click "Mint Fate". The tokens will be sent
              to your connected wallet address on Base Sepolia. You must have the MINTER_ROLE on the
              MeyFate contract to use this. The deployer address has this role.
            </p>
          </Card>
        </div>
      )}

      {tab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-bold text-amber-400">MeyFate (MEYFTE)</h3>
            <p className="font-mono text-[10px] text-text-muted break-all">
              {CONTRACTS[CHAIN_ID].MEYFTE}
            </p>
            <p className="text-xs text-text-muted">$1-pegged premium wagering currency</p>
          </Card>
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-bold text-violet-400">MeyInfluence (MEYINF)</h3>
            <p className="font-mono text-[10px] text-text-muted break-all">
              {CONTRACTS[CHAIN_ID].MEYINF}
            </p>
            <p className="text-xs text-text-muted">Soulbound F2P utility token</p>
          </Card>
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">QuestFragment (QFRAG)</h3>
            <p className="font-mono text-[10px] text-text-muted break-all">
              {CONTRACTS[CHAIN_ID].QFRAG}
            </p>
            <p className="text-xs text-text-muted">ERC-1155 prediction outcome NFT</p>
          </Card>
          <Card className="p-4 self-start md:col-span-3">
            <p className="text-xs text-text-muted">
              Chain: Base Sepolia (84532) · Contracts pending deployment.
              Update <code className="text-accent">src/config/contracts.ts</code> with deployed addresses.
            </p>
          </Card>
        </div>
      )}

      {tab === 'polymarket' && (
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400">Polymarket Sync</h3>
            <p className="text-xs text-text-muted">
              Automatically seed quests from Polymarket events. The sync fetches trending events,
              extracts quests + heroes via LLM, and upserts them into the quest system.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={triggerSync}
                disabled={syncStatus.loading}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {syncStatus.loading ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={fetchStatus}
                className="px-3 py-2 rounded-lg text-xs font-bold border border-line text-text-muted hover:text-text/80 transition-all"
              >
                Refresh Status
              </button>
            </div>
            {syncStatus.message && (
              <div className={clsx(
                'text-xs p-3 rounded-lg border',
                syncStatus.status === 'error' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                syncStatus.status === 'cooldown' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' :
                'text-green-400 border-green-400/30 bg-green-400/10'
              )}>
                {syncStatus.message}
              </div>
            )}
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider mb-3">Last Sync Result</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{syncStatus.created}</p>
                <p className="text-[10px] text-text-muted">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{syncStatus.updated}</p>
                <p className="text-[10px] text-text-muted">Updated</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{syncStatus.resolved}</p>
                <p className="text-[10px] text-text-muted">Resolved</p>
              </div>
              <div>
                <p className={clsx('text-2xl font-bold', syncStatus.errors > 0 ? 'text-red-400' : 'text-text-muted')}>{syncStatus.errors}</p>
                <p className="text-[10px] text-text-muted">Errors</p>
              </div>
            </div>
            {syncStatus.syncedAt && (
              <p className="text-[10px] text-text-muted text-center mt-3">
                Last synced: {new Date(syncStatus.syncedAt).toLocaleString()}
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
