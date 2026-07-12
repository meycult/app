import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useDisconnect } from 'wagmi'
import { useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'

export function useWallet() {
  const { login, authenticated, ready, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address: wagmiAddress, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { linkWallet, fetchWallets, player } = usePlayerStore()

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
  const embeddedAddress = embeddedWallet?.address

  const activeAddress = wagmiAddress || embeddedAddress || null

  useEffect(() => {
    if (activeAddress && player.id) {
      linkWallet(activeAddress.toLowerCase())
      fetchWallets()
    }
  }, [activeAddress, player.id])

  return {
    address: activeAddress,
    isConnected: authenticated && !!activeAddress,
    isReady: ready,
    chainId,
    connect: () => login(),
    disconnect: () => {
      disconnect()
      logout()
    },
  }
}
