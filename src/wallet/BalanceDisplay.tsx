import { useWallet } from '@/hooks/useWallet'
import { useFateBalance } from '@/hooks/useFate'
import { useInfluenceBalance } from '@/hooks/useInfluence'
import { MeyFate, MeyInfluence } from '@/components/TokenText'

export function BalanceDisplay() {
  const { address, isConnected } = useWallet()
  const { data: fateBalance } = useFateBalance(address ?? undefined)
  const { data: influenceBalance } = useInfluenceBalance(address ?? undefined)

  if (!isConnected) return null

  const fmt = (val: bigint | undefined) =>
    val !== undefined ? (Number(val) / 1e18).toLocaleString() : '…'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-xs">
        <MeyFate size={14} />
        <span className="font-mono text-accent font-medium">{fmt(fateBalance)}</span>
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface/50 text-xs">
        <MeyInfluence size={14} />
        <span className="font-mono text-accent font-medium">{fmt(influenceBalance)}</span>
      </div>
    </div>
  )
}
