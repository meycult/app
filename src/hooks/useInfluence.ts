import { useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { MeyInfluenceABI } from '@/config/abis/MeyInfluence'
import { CONTRACTS } from '@/config/contracts'

export function useInfluenceBalance(address?: string) {
  return useReadContract({
    abi: MeyInfluenceABI,
    address: CONTRACTS[baseSepolia.id].MEYINF,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  })
}
