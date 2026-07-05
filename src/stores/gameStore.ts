import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Player, Player as PlayerT } from '@/types'

interface GameState {
  player: Player
  setPlayer: (player: Player) => void
  updatePlayer: (partial: Partial<Player>) => void
  hydrateFromUser: (user: User) => void
  fetchProfile: () => Promise<void>
  completeOnboarding: (handle: string, cult: string, alias?: string) => Promise<void>
  updateProfile: (partial: { alias?: string }) => Promise<void>
}

const defaultPlayer: Player = {
  id: '',
  handle: '',
  alias: undefined,
  avatarUrl: '',
  level: 1,
  xp: 0,
  insightPoints: 100,
  cult: 'TODO: SET REAL CULT AFTER ONBOARDING',
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
  onboardingComplete: false,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: defaultPlayer,

      setPlayer: (player: PlayerT) => set({ player }),

      updatePlayer: (partial: Partial<PlayerT>) =>
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

        const { data: oracle } = await supabase
          .from('oracles')
          .select('*')
          .eq('oracle_id', player.id)
          .single()

        if (oracle) {
          set((state) => ({
            player: {
              ...state.player,
              handle: oracle.handle || state.player.handle,
              alias: oracle.alias,
              cult: oracle.cult || state.player.cult,
              level: oracle.level ?? state.player.level,
              xp: oracle.xp ?? state.player.xp,
              skillPoints: oracle.skill_points ?? state.player.skillPoints,
              glyph: oracle.glyph ?? state.player.glyph,
              fate: oracle.fate ?? state.player.fate,
              title: oracle.title,
              frame: oracle.frame,
              nameColor: oracle.name_color,
              profileBackground: oracle.profile_background,
              predictionFlair: oracle.prediction_flair,
              avatarDecoration: oracle.avatar_decoration,
              badgeEffect: oracle.badge_effect,
              starterPackPurchased: oracle.starter_pack_purchased ?? false,
              status: oracle.status,
              joinedAt: oracle.joined_at || state.player.joinedAt,
              onboardingComplete: oracle.onboarding_complete ?? false,
            },
          }))
        }
      },

      completeOnboarding: async (handle: string, cult: string, alias?: string) => {
        const { player } = get()
        if (!player.id) return

        await supabase
          .from('oracles')
          .update({ handle, cult, alias, onboarding_complete: true })
          .eq('oracle_id', player.id)

        await supabase
          .from('oracle_onboardings')
          .delete()
          .eq('oracle_id', player.id)

        set((state) => ({
          player: {
            ...state.player,
            handle,
            alias,
            cult,
            onboardingComplete: true,
          },
        }))
      },

      updateProfile: async (partial) => {
        const { player } = get()
        if (!player.id) return

        const updates: Record<string, string> = {}
        if (partial.alias !== undefined) updates.alias = partial.alias

        if (Object.keys(updates).length === 0) return

        await supabase
          .from('oracles')
          .update(updates)
          .eq('oracle_id', player.id)

        set((state) => ({
          player: {
            ...state.player,
            ...(partial.alias !== undefined ? { alias: partial.alias } : {}),
          },
        }))
      },
    }),
    {
      name: 'meycult-game-state',
      partialize: (state) => ({ player: state.player }),
    }
  )
)
