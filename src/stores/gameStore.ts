import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Player, Player as PlayerT } from '@/types'

interface GameState {
  player: Player
  setPlayer: (player: Player) => void
  updatePlayer: (partial: Partial<Player>) => void
  hydrateFromUser: (user: User) => void
}

const defaultPlayer: Player = {
  id: '',
  username: 'Oracle',
  avatarUrl: '',
  level: 1,
  xp: 0,
  insightPoints: 100,
  faction: 'legion',
  virtues: { wisdom: 8, courage: 8, prudence: 8, skill: 8, temperance: 8, justice: 8 },
  virtueXP: { wisdom: 0, courage: 0, prudence: 0, skill: 0, temperance: 0, justice: 0 },
  badges: [],
  inventory: [],
  equippedItems: {},
  followedHeroes: [],
  skillPoints: 0,
  unlockedCards: [],
  deckSlots: [],
  maxDeckSlots: 4,
  predictions: [],
  totalPredictions: 0,
  correctPredictions: 0,
  joinedAt: new Date().toISOString(),
  glyph: 0,
  fate: 0,
  marketListings: [],
  mythicVotes: [],
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      player: defaultPlayer,

      setPlayer: (player: PlayerT) => set({ player }),

      updatePlayer: (partial: Partial<PlayerT>) =>
        set((state) => ({ player: { ...state.player, ...partial } })),

      hydrateFromUser: (user: User) =>
        set((state) => ({
          player: {
            ...state.player,
            id: user.id,
            username: (user.user_metadata.full_name as string) || user.email?.split('@')[0] || 'Oracle',
            avatarUrl: (user.user_metadata.avatar_url as string) || '',
            joinedAt: user.created_at || state.player.joinedAt,
          },
        })),
    }),
    {
      name: 'meyfate-game-state',
      partialize: (state) => ({ player: state.player }),
    }
  )
)
