import { useState } from 'react'
import { useWriteContract, useConfig } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { baseSepolia } from 'wagmi/chains'
import { MeyFateABI } from '@/config/abis/MeyFate'
import { CONTRACTS, TREASURY_ADDRESS, API_URL } from '@/config/contracts'
import { supabase } from '@/lib/supabase'

export type WagerStep = 'idle' | 'transferring' | 'confirming' | 'recording' | 'done' | 'error'

interface PlaceParams {
  questId: string
  outcome: 'YES' | 'NO'
  amount: number
  entryProbability: number
  address: string
  currency: 'FATE' | 'INFLUENCE'
}

export function usePlaceWager() {
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<WagerStep>('idle')
  const [error, setError] = useState<string | null>(null)

  const place = async (p: PlaceParams): Promise<boolean> => {
    setError(null)
    try {
      let hash = ''
      if (p.currency === 'FATE') {
        // Fate: user transfers stake to the treasury (escrow)
        setStep('transferring')
        const amountWei = BigInt(Math.floor(p.amount * 1e18))
        hash = await writeContractAsync({
          abi: MeyFateABI,
          address: CONTRACTS[baseSepolia.id].MEYFTE,
          functionName: 'transfer',
          args: [TREASURY_ADDRESS, amountWei],
        })
        setStep('confirming')
        await waitForTransactionReceipt(config, { hash: hash as `0x${string}` })
      }
      // Influence: soulbound -> backend burns it (gasless, no user tx)

      setStep('recording')
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${API_URL}/wager/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          quest_id: p.questId,
          outcome: p.outcome,
          amount: p.amount,
          entry_probability: p.entryProbability,
          currency: p.currency,
          tx_hash: hash,
          from_address: p.address,
        }),
      })
      if (!resp.ok) {
        const t = await resp.text()
        throw new Error(t.slice(0, 200))
      }
      setStep('done')
      return true
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
      return false
    }
  }

  return { place, step, error, reset: () => { setStep('idle'); setError(null) } }
}
