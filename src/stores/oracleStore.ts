import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { OracleProfile } from '@/types'

interface OracleState {
  oracle: OracleProfile
  setOracle: (oracle: OracleProfile) => void
  fetchProfile: () => Promise<void>
  initialize: (playerId: string, cult: string) => Promise<void>
}

const defaultOracle: OracleProfile = {
  playerId: '',
  cult: '',
  level: 1,
  xp: 0,
}

export const useOracleStore = create<OracleState>()(
  persist(
    (set, get) => ({
      oracle: defaultOracle,

      setOracle: (oracle: OracleProfile) => set({ oracle }),

      fetchProfile: async () => {
        const { oracle } = get()
        if (!oracle.playerId) return

        const { data } = await supabase
          .from('oracles')
          .select('*')
          .eq('player_id', oracle.playerId)
          .maybeSingle()

        if (data) {
          set({
            oracle: {
              playerId: data.player_id,
              cult: data.cult,
              level: data.level ?? 1,
              xp: data.xp ?? 0,
            },
          })
        }
      },

      initialize: async (playerId: string, cult: string) => {
        await supabase
          .from('oracles')
          .upsert({
            player_id: playerId,
            cult,
            level: 1,
            xp: 0,
          }, { onConflict: 'player_id' })

        set({
          oracle: {
            playerId,
            cult,
            level: 1,
            xp: 0,
          },
        })
      },
    }),
    {
      name: 'meycult-oracle-store',
      partialize: (state) => ({ oracle: state.oracle }),
    }
  )
)
