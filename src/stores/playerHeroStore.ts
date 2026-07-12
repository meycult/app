import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { PlayerHero } from '@/types'

interface PlayerHeroState {
  playerHeroes: PlayerHero[]
  loading: boolean
  fetchMine: (playerId: string) => Promise<void>
  create: (playerId: string, heroId: string) => Promise<void>
}

export const usePlayerHeroStore = create<PlayerHeroState>()((set) => ({
  playerHeroes: [],
  loading: false,

  fetchMine: async (playerId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('player_heroes')
      .select('*')
      .eq('player_id', playerId)

    const heroes: PlayerHero[] = (data ?? []).map((ph: {
      player_hero_id: string; player_id: string; hero_id: string;
      level: number; xp: number; virtues: Record<string, number>
    }) => ({
      playerHeroId: ph.player_hero_id,
      playerId: ph.player_id,
      heroId: ph.hero_id,
      level: ph.level,
      xp: ph.xp,
      virtues: ph.virtues as PlayerHero['virtues'],
    }))

    set({ playerHeroes: heroes, loading: false })
  },

  create: async (playerId: string, heroId: string) => {
    const { data: hero } = await supabase
      .from('heroes')
      .select('virtues')
      .eq('hero_id', heroId)
      .single()

    await supabase
      .from('player_heroes')
      .insert({
        player_id: playerId,
        hero_id: heroId,
        level: 1,
        xp: 0,
        virtues: hero?.virtues ?? { wisdom: 8, courage: 8, prudence: 8, skill: 8, temperance: 8, justice: 8 },
      })
  },
}))
