import { useWallet } from '@/hooks/useWallet'

export function WalletButton() {
  const { isConnected, connect, isReady } = useWallet()

  if (!isReady) return null

  // When connected, don't show the wallet id in the navbar (manage on Wallet page)
  if (isConnected) return null

  return (
    <button
      onClick={connect}
      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
        bg-accent/20 text-accent border border-line/50 hover:bg-accent/30 transition-all duration-200"
    >
      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      Connect Wallet
    </button>
  )
}
