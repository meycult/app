import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Player, WalletAddress } from '@/types'

interface PlayerState {
  player: Player
  wallets: WalletAddress[]
  setPlayer: (player: Player) => void
  updatePlayer: (partial: Partial<Player>) => void
  hydrateFromUser: (user: User) => void
  fetchProfile: () => Promise<void>
  completeOnboarding: (handle: string, alias?: string) => Promise<void>
  updateAlias: (alias: string) => Promise<void>
  linkWallet: (address: string) => Promise<void>
  fetchWallets: () => Promise<void>
}

const defaultPlayer: Player = {
  id: '',
  handle: '',
  alias: undefined,
  avatarUrl: '',
  onboardingComplete: false,
  joinedAt: new Date().toISOString(),
  isAdmin: false,
  walletAddresses: [],
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      player: defaultPlayer,
      wallets: [],

      setPlayer: (player: Player) => set({ player }),

      updatePlayer: (partial: Partial<Player>) =>
        set((state) => ({ player: { ...state.player, ...partial } })),

      hydrateFromUser: (user: User) =>
        set((state) => ({
          player: {
            ...state.player,
            id: user.id,
            handle: user.email?.split('@')[0] || '',
            alias: (user.user_metadata.full_name as string) || undefined,
            avatarUrl: (user.user_metadata.avatar_url as string) || '',
            joinedAt: user.created_at || state.player.joinedAt,
          },
        })),

      fetchProfile: async () => {
        const { player } = get()
        if (!player.id) return

        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('id', player.id)
          .maybeSingle()

        if (data) {
          set((state) => ({
            player: {
              ...state.player,
              handle: data.handle || state.player.handle,
              alias: data.alias,
              avatarUrl: data.avatar_url || state.player.avatarUrl,
              onboardingComplete: data.onboarding_complete ?? false,
              joinedAt: data.created_at || state.player.joinedAt,
              isAdmin: data.is_admin ?? false,
            },
          }))
        }
      },

      completeOnboarding: async (handle: string, alias?: string) => {
        const { player } = get()
        if (!player.id) return

        await supabase
          .from('players')
          .upsert({
            id: player.id,
            handle,
            alias: alias || null,
            onboarding_complete: true,
          }, { onConflict: 'id' })

        set((state) => ({
          player: {
            ...state.player,
            handle,
            alias,
            onboardingComplete: true,
          },
        }))
      },

      updateAlias: async (alias: string) => {
        const { player } = get()
        if (!player.id) return

        await supabase
          .from('players')
          .update({ alias })
          .eq('id', player.id)

        set((state) => ({
          player: { ...state.player, alias },
        }))
      },

      fetchWallets: async () => {
        const { player } = get()
        if (!player.id) return

        const { data } = await supabase
          .from('wallet_addresses')
          .select('*')
          .eq('player_id', player.id)

        if (data) {
          set({ wallets: data })
        }
      },

      linkWallet: async (address: string) => {
        const { player, wallets } = get()
        if (!player.id) return
        if (wallets.some((w) => w.address.toLowerCase() === address.toLowerCase())) return

        await supabase
          .from('wallet_addresses')
          .upsert({
            player_id: player.id,
            address: address.toLowerCase(),
            chain_id: 84532,
          }, { onConflict: 'player_id, address' })

        get().fetchWallets()
      },
    }),
    {
      name: 'meycult-player-store',
      partialize: (state) => ({ player: state.player }),
    }
  )
)
