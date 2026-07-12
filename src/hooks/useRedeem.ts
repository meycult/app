import { useState } from 'react'
import { useWriteContract, useConfig } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { baseSepolia } from 'wagmi/chains'
import { MeyFateABI } from '@/config/abis/MeyFate'
import { CONTRACTS, TREASURY_ADDRESS, API_URL } from '@/config/contracts'
import { supabase } from '@/lib/supabase'

export type RedeemStep = 'idle' | 'transferring' | 'confirming' | 'requesting' | 'done' | 'error'

export function useRedeem() {
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<RedeemStep>('idle')
  const [error, setError] = useState<string | null>(null)

  const redeem = async (amount: number, address: string): Promise<boolean> => {
    setError(null)
    try {
      setStep('transferring')
      const amountWei = BigInt(Math.floor(amount * 1e18))
      const hash = await writeContractAsync({
        abi: MeyFateABI,
        address: CONTRACTS[baseSepolia.id].MEYFTE,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, amountWei],
      })
      setStep('confirming')
      await waitForTransactionReceipt(config, { hash })
      setStep('requesting')
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${API_URL}/redemption/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
        body: JSON.stringify({ fate_amount: amount, tx_hash: hash, from_address: address }),
      })
      if (!resp.ok) throw new Error((await resp.text()).slice(0, 200))
      setStep('done')
      return true
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
      return false
    }
  }

  return { redeem, step, error, reset: () => { setStep('idle'); setError(null) } }
}
