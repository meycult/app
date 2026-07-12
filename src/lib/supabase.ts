import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const redirectBase = import.meta.env.DEV
  ? 'http://localhost:5173'
  : 'https://app.meycult.com'

export const REDIRECT_BASE = redirectBase

// Cross-subdomain session: share login across app.meycult.com + shop.meycult.com
// via cookies scoped to .meycult.com. Chunked to stay under the ~4KB cookie limit.
const CHUNK = 3200

function onMeycult(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('meycult.com')
}

function cookieDomainAttr(): string {
  return onMeycult() ? '; domain=.meycult.com' : ''
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${cookieDomainAttr()}; max-age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/${cookieDomainAttr()}; max-age=0; SameSite=Lax; Secure`
}

const cookieStorage = {
  getItem(key: string): string | null {
    const count = readCookie(`${key}.n`)
    if (count) {
      let out = ''
      for (let i = 0; i < Number(count); i++) out += readCookie(`${key}.${i}`) ?? ''
      return out || null
    }
    return readCookie(key)
  },
  setItem(key: string, value: string): void {
    // clear any prior chunks
    const prev = readCookie(`${key}.n`)
    if (prev) for (let i = 0; i < Number(prev); i++) deleteCookie(`${key}.${i}`)
    deleteCookie(key)

    if (value.length <= CHUNK) {
      writeCookie(key, value)
      deleteCookie(`${key}.n`)
      return
    }
    const parts = Math.ceil(value.length / CHUNK)
    for (let i = 0; i < parts; i++) writeCookie(`${key}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK))
    writeCookie(`${key}.n`, String(parts))
  },
  removeItem(key: string): void {
    const count = readCookie(`${key}.n`)
    if (count) for (let i = 0; i < Number(count); i++) deleteCookie(`${key}.${i}`)
    deleteCookie(`${key}.n`)
    deleteCookie(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'meycult-auth',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    ...(onMeycult() ? { storage: cookieStorage } : {}),
  },
})
