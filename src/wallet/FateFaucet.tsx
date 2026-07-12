import { useState } from 'react'
import { useFateMint } from '@/hooks/useFate'
import { useWallet } from '@/hooks/useWallet'
import { Card } from '@/components/ui/ui'
import { MeyFate } from '@/components/TokenText'

export function FateFaucet() {
  const [amount, setAmount] = useState('100')
  const { address } = useWallet()
  const { mint, isPending, isConfirming, isConfirmed, error } = useFateMint()

  const handleMint = () => {
    if (!address) return
    const parsed = BigInt(Math.floor(parseFloat(amount) * 1e18).toString())
    mint(address as `0x${string}`, parsed)
  }

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-text/80 uppercase tracking-wider flex items-center gap-1"><MeyFate /> Faucet</h3>
      <p className="text-xs text-text-muted">Mint test <MeyFate /> tokens to your connected wallet (admin only).</p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-line text-sm text-text"
          placeholder="Amount"
          min="1"
        />
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming || !address}
          className="px-4 py-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-600/30
            text-sm font-medium hover:bg-amber-600/30 disabled:opacity-50 transition-colors"
        >
          {isConfirming ? 'Confirming…' : isPending ? 'Sending…' : 'Mint Fate'}
        </button>
      </div>
      {isConfirmed && <p className="text-xs text-emerald-400">Minted successfully!</p>}
      {error && <p className="text-xs text-red-400">Error: {error.message}</p>}
    </Card>
  )
}
