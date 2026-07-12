import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { MeyFateABI } from '@/config/abis/MeyFate'
import { CONTRACTS } from '@/config/contracts'

export function useFateBalance(address?: string) {
  return useReadContract({
    abi: MeyFateABI,
    address: CONTRACTS[baseSepolia.id].MEYFTE,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  })
}

export function useFateMint() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const mint = (to: `0x${string}`, amount: bigint) => {
    writeContract({
      abi: MeyFateABI,
      address: CONTRACTS[baseSepolia.id].MEYFTE,
      functionName: 'mint',
      args: [to, amount],
    })
  }

  return { mint, hash, error, isPending, isConfirming, isConfirmed }
}
