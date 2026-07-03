import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  setSession: (session: Session | null) => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  user: null,
  loading: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (data.session) {
      set({ session: data.session, user: data.session.user })
    }
    return { error }
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (data.session) {
      set({ session: data.session, user: data.session.user })
    }
    return { error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },
}))
