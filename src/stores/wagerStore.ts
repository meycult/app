import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Wager } from '@/types'

interface WagerState {
  wagers: Wager[]
  loading: boolean
  fetchMine: (playerId: string) => Promise<void>
}

export const useWagerStore = create<WagerState>()((set) => ({
  wagers: [],
  loading: false,

  fetchMine: async (playerId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('quest_wagers')
      .select('*')
      .eq('player_id', playerId)
      .order('placed_at', { ascending: false })

    const wagers: Wager[] = (data ?? []).map((w: {
      wager_id: string; quest_id: string; player_id: string;
      player_hero_id: string | null; outcome: 'YES' | 'NO';
      amount: number; entry_probability: number | null;
      result: 'PENDING' | 'WON' | 'LOST'; payout: number;
      net_profit: number; placed_at: string; resolved_at: string | null
    }) => ({
      wagerId: w.wager_id,
      questId: w.quest_id,
      playerId: w.player_id,
      playerHeroId: w.player_hero_id,
      outcome: w.outcome,
      amount: w.amount,
      entryProbability: w.entry_probability,
      result: w.result,
      payout: w.payout,
      netProfit: w.net_profit,
      placedAt: w.placed_at,
      resolvedAt: w.resolved_at,
    }))

    set({ wagers, loading: false })
  },
}))
