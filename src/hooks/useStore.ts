import { useState } from 'react'
import { useWriteContract, useConfig, useReadContract } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { USDC_ADDRESS, ERC20_TRANSFER_ABI, TREASURY_ADDRESS, API_URL } from '@/config/contracts'
import { supabase } from '@/lib/supabase'

export type PurchaseStep = 'idle' | 'paying' | 'confirming' | 'delivering' | 'done' | 'error'

export function useUsdcBalance(address?: string) {
  return useReadContract({
    abi: ERC20_TRANSFER_ABI,
    address: USDC_ADDRESS,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  })
}

export function usePurchasePack() {
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<PurchaseStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const purchase = async (packId: string, priceUsd: number, address: string): Promise<boolean> => {
    setError(null)
    setResult(null)
    try {
      setStep('paying')
      const amount = BigInt(Math.round(priceUsd * 1e6)) // USDC 6 decimals
      const hash = await writeContractAsync({
        abi: ERC20_TRANSFER_ABI,
        address: USDC_ADDRESS,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, amount],
      })

      setStep('confirming')
      await waitForTransactionReceipt(config, { hash })

      setStep('delivering')
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${API_URL}/store/purchase/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ pack_id: packId, tx_hash: hash, from_address: address }),
      })
      if (!resp.ok) {
        const t = await resp.text()
        throw new Error(t.slice(0, 200))
      }
      setResult(await resp.json())
      setStep('done')
      return true
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
      return false
    }
  }

  return { purchase, step, error, result, reset: () => { setStep('idle'); setError(null); setResult(null) } }
}
