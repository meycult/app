import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@/hooks/useWallet'
import { useFateBalance } from '@/hooks/useFate'
import { useInfluenceBalance } from '@/hooks/useInfluence'
import { useRedeem } from '@/hooks/useRedeem'
import { Card } from '@/components/ui/ui'
import { usePlayerStore } from '@/stores/playerStore'
import { FateFaucet } from '@/wallet/FateFaucet'
import { apiFetch } from '@/lib/api'
import { MeyFate, MeyInfluence } from '@/components/TokenText'

export function WalletPage() {
  const { address, isConnected, connect, disconnect } = useWallet()
  const { data: fateBalance } = useFateBalance(address ?? undefined)
  const { data: influenceBalance } = useInfluenceBalance(address ?? undefined)
  const { player } = usePlayerStore()
  const navigate = useNavigate()
  const { redeem, step, error } = useRedeem()
  const [redeemAmount, setRedeemAmount] = useState('')
  const [redeemMsg, setRedeemMsg] = useState('')
  const [amoeClaimed, setAmoeClaimed] = useState<boolean | null>(null)
  const [amoeAmount, setAmoeAmount] = useState(1)
  const [amoeBusy, setAmoeBusy] = useState(false)
  const [amoeMsg, setAmoeMsg] = useState('')

  const fmt = (val: bigint | undefined) =>
    val !== undefined ? (Number(val) / 1e18).toLocaleString() : '—'

  const fateNum = fateBalance !== undefined ? Number(fateBalance) / 1e18 : 0

  const loadAmoe = useCallback(async () => {
    if (!player.id) return
    try {
      const s = await apiFetch('/amoe/status')
      setAmoeClaimed(s.claimed_today)
      setAmoeAmount(s.daily_amount)
    } catch { /* ignore */ }
  }, [player.id])

  useEffect(() => { loadAmoe() }, [loadAmoe])

  const claimAmoe = async () => {
    if (!address) return
    setAmoeBusy(true); setAmoeMsg('')
    try {
      await apiFetch('/amoe/claim', { method: 'POST', body: JSON.stringify({ to_address: address }) })
      setAmoeMsg('Claimed! Free Influence sent to your wallet.')
      setAmoeClaimed(true)
    } catch (e) { setAmoeMsg((e as Error).message) }
    setAmoeBusy(false)
  }

  const handleRedeem = async () => {
    const amt = Number(redeemAmount)
    if (!address || !amt || amt < 50) { setRedeemMsg('Minimum redemption is 50 Fate (played through).'); return }
    if (amt > fateNum) { setRedeemMsg('Insufficient Fate.'); return }
    setRedeemMsg('')
    const ok = await redeem(amt, address)
    if (ok) { setRedeemMsg('Redemption requested. USDC will be sent after admin approval.'); setRedeemAmount('') }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-3xl font-bold text-accent">Wallet</h2>
        <p className="text-text-muted mt-1 flex items-center gap-1 flex-wrap">Your on-chain purse. <MeyFate /> for wagering, <MeyInfluence /> for standing.</p>
      </div>

      {!isConnected ? (
        <Card className="p-8 text-center space-y-4">
          <p className="text-text-muted">Connect your wallet to view balances and manage funds.</p>
          <button
            onClick={connect}
            className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors"
          >
            Connect Wallet
          </button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glow" className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text/80"><MeyFate size={20} /> Balance</span>
              </div>
              <p className="text-3xl font-bold text-accent font-mono">{fmt(fateBalance)}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">MEYFTE · $1 pegged</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => navigate('/store')}
                  className="px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/40 text-xs text-accent font-medium hover:bg-accent/30 transition-colors"
                >
                  Buy <MeyFate />
                </button>
              </div>
            </Card>
            <Card variant="reflect" className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text/80"><MeyInfluence size={20} /></span>
              </div>
              <p className="text-3xl font-bold text-accent font-mono">{fmt(influenceBalance)}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">MEYINF · Soulbound</p>
              <p className="text-xs text-text-muted">Earned through participation. Cannot be transferred.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => navigate('/store')}
                  className="px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/40 text-xs text-accent font-medium hover:bg-accent/30 transition-colors"
                >
                  Buy <MeyInfluence />
                </button>
              </div>
            </Card>
          </div>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider">Free Daily Influence</h3>
                <p className="text-xs text-text-muted mt-1 flex items-center gap-1 flex-wrap">No purchase necessary. Claim {amoeAmount} free <MeyInfluence /> every day.</p>
              </div>
              <button
                onClick={claimAmoe}
                disabled={amoeBusy || amoeClaimed === true || !isConnected}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-sm text-emerald-400 font-medium hover:bg-emerald-500/30 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {amoeClaimed ? 'Claimed today' : amoeBusy ? 'Claiming…' : 'Claim free Influence'}
              </button>
            </div>
            {amoeMsg && <p className="text-xs text-accent">{amoeMsg}</p>}
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider flex items-center gap-1">Cash Out — <MeyFate /> → USDC</h3>
            <p className="text-xs text-text-muted">Redeem Fate 1:1 for USDC. Only Fate played through (wagered at least once) is redeemable. Min 50 Fate, processed after review.</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Fate amount"
                min={50}
                className="flex-1 px-3 py-2 rounded-lg bg-surface border border-line text-sm text-text"
              />
              <button
                onClick={handleRedeem}
                disabled={step === 'transferring' || step === 'confirming' || step === 'requesting'}
                className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/40 text-sm text-accent font-medium hover:bg-accent/30 disabled:opacity-50 transition-colors"
              >
                {step === 'transferring' ? 'Confirm…' : step === 'confirming' ? 'Confirming…' : step === 'requesting' ? 'Requesting…' : 'Redeem'}
              </button>
            </div>
            {redeemMsg && <p className="text-xs text-accent">{redeemMsg}</p>}
            {error && <p className="text-xs text-red-400 break-words">{error}</p>}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider mb-3">Connected Wallets</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-text">{address!.slice(0, 6)}...{address!.slice(-4)}</span>
              <span className="text-[10px] text-text-muted ml-auto">Base Sepolia</span>
              <button
                onClick={disconnect}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </Card>

          {player.isAdmin && <FateFaucet />}
        </>
      )}
    </div>
  )
}
