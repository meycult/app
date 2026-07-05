import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const redirectBase = import.meta.env.DEV
  ? 'http://localhost:5173'
  : 'https://app.meycult.com'

export const REDIRECT_BASE = redirectBase

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
