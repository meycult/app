import { useState, useEffect, useCallback } from 'react'
import { Card, Button } from '@/components/ui/ui'
import { apiFetch } from '@/lib/api'

interface Treasury {
  treasury_address: string
  on_chain_fate: number
  on_chain_eth: number
  escrow_liability: number
  withdrawable_fee_revenue: number
  ledger_usdc: number
}

interface Redemption {
  redemption_id: string
  player_id: string
  fate_burned: number
  status: string
}

export function AdminTreasury() {
  const [t, setT] = useState<Treasury | null>(null)
  const [queue, setQueue] = useState<Redemption[]>([])
  const [msg, setMsg] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [status, q] = await Promise.all([
        apiFetch('/resolve/treasury/status'),
        apiFetch('/redemption/admin/queue'),
      ])
      setT(status)
      setQueue(q.queue ?? [])
    } catch (e) { setMsg((e as Error).message) }
  }, [])

  useEffect(() => { load() }, [load])

  const approve = async (id: string) => {
    setBusy(true); setMsg('')
    try {
      const r = await apiFetch(`/redemption/admin/${id}/approve`, { method: 'POST' })
      setMsg(`Burned. Send ${r.usdc_to_send} USDC to the user, then mark paid.`)
      await load()
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  const markPaid = async (id: string) => {
    setBusy(true)
    try { await apiFetch(`/redemption/admin/${id}/paid`, { method: 'POST' }); await load() }
    catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  const withdrawFees = async () => {
    setBusy(true); setMsg('')
    try {
      const r = await apiFetch('/fee/withdraw', { method: 'POST', body: JSON.stringify({ amount: Number(feeAmount) }) })
      setMsg(`Withdrew ${r.burned} Fate — send ${r.usdc_to_send} USDC to house wallet.`)
      setFeeAmount(''); await load()
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      {msg && <Card className="p-3 border-accent/30 bg-accent/10"><p className="text-xs text-accent break-words">{msg}</p></Card>}

      <Card className="p-4">
        <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider mb-3">Treasury</h3>
        {t ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div><p className="text-lg font-bold text-amber-400">{t.on_chain_fate.toFixed(0)}</p><p className="text-[10px] text-text-muted">Fate (on-chain)</p></div>
            <div><p className="text-lg font-bold text-sky-400">{t.on_chain_eth.toFixed(4)}</p><p className="text-[10px] text-text-muted">ETH (gas)</p></div>
            <div><p className="text-lg font-bold text-emerald-400">{t.ledger_usdc.toFixed(2)}</p><p className="text-[10px] text-text-muted">USDC reserve</p></div>
            <div><p className="text-lg font-bold text-red-400">{t.escrow_liability.toFixed(0)}</p><p className="text-[10px] text-text-muted">Escrow liability</p></div>
            <div><p className="text-lg font-bold text-violet-400">{t.withdrawable_fee_revenue.toFixed(2)}</p><p className="text-[10px] text-text-muted">Withdrawable fees</p></div>
          </div>
        ) : <p className="text-xs text-text-muted">Loading…</p>}
        <p className="font-mono text-[10px] text-text-muted mt-3 break-all">{t?.treasury_address}</p>
      </Card>

      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider">Withdraw Fees (5% rake)</h3>
        <div className="flex gap-2">
          <input value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} type="number" placeholder="Fate amount" className="flex-1 px-3 py-2 rounded-lg bg-surface border border-line text-sm" />
          <Button variant="accent" size="md" onClick={withdrawFees} disabled={busy || !feeAmount}>Withdraw</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider mb-3">Redemption Queue ({queue.length})</h3>
        {queue.length === 0 ? <p className="text-xs text-text-muted">No pending redemptions.</p> : (
          <div className="space-y-2">
            {queue.map((r) => (
              <div key={r.redemption_id} className="flex items-center justify-between glass rounded-lg p-2 text-xs">
                <span className="font-mono">{r.fate_burned} Fate · <span className="text-text-muted">{r.status}</span></span>
                <div className="flex gap-1">
                  {r.status === 'pending' && <Button variant="accent" size="xs" onClick={() => approve(r.redemption_id)} disabled={busy}>Approve+Burn</Button>}
                  {r.status === 'burned' && <Button variant="ghost" size="xs" onClick={() => markPaid(r.redemption_id)} disabled={busy}>Mark Paid</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
