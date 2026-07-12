import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '@/components/ui/ui'
import { useWallet } from '@/hooks/useWallet'
import { usePurchasePack, useUsdcBalance } from '@/hooks/useStore'
import { usePlayerStore } from '@/stores/playerStore'
import { API_URL } from '@/config/contracts'
import { supabase } from '@/lib/supabase'
import { MeyFate, MeyInfluence } from '@/components/TokenText'
import { Gift, Check, ChevronLeft, ChevronRight } from 'lucide-react'

interface Pack {
  pack_id: string
  name: string
  tier: 'base' | 'supporter'
  price_usd: number
  influence: number
  fate: number
  merch_item: string | null
}

const MERCH_LABEL: Record<string, string> = {
  beanie: 'Beanie', cup: 'Mug', shirt: 'Tee', 'joggers+tee': 'Joggers + Tee', full_set: 'Full 5-piece Set',
}

function imgs(item: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => `/products/cult-${item}-meycult-${i}.jpg`)
}
function interleave(...lists: string[][]): string[] {
  const out: string[] = []
  const max = Math.max(...lists.map((l) => l.length))
  for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
}
const BEANIE = imgs('beanie', 7)
const MUG = imgs('mug', 6)
const TEE = imgs('tee', 8)
const JOGGERS = imgs('joggers', 6)
const HOODIE = imgs('hoodie', 4)
const MERCH_IMAGES: Record<string, string[]> = {
  beanie: BEANIE,
  cup: MUG,
  shirt: TEE,
  'joggers+tee': interleave(JOGGERS, TEE),
  full_set: interleave(BEANIE, MUG, TEE, JOGGERS, HOODIE),
}

function MerchCarousel({ item }: { item: string }) {
  const images = MERCH_IMAGES[item] ?? []
  const [idx, setIdx] = useState(0)
  if (images.length === 0) return null
  const go = (d: number) => setIdx((prev) => (prev + d + images.length) % images.length)
  return (
    <div className="relative rounded-lg overflow-hidden bg-surface/60 border border-line/40 mb-3">
      <img src={images[idx]} alt={MERCH_LABEL[item] ?? item} className="w-full h-40 object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1) }} className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-bg/70 hover:bg-bg text-text">
            <ChevronLeft size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); go(1) }} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-bg/70 hover:bg-bg text-text">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-accent' : 'bg-text-muted/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function StorePage() {
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const player = usePlayerStore((s) => s.player)
  const { data: usdcBal } = useUsdcBalance(address ?? undefined)
  const { purchase, step, error, result } = usePurchasePack()

  const [packs, setPacks] = useState<Pack[]>([])
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [busyPack, setBusyPack] = useState<string | null>(null)

  const usdc = usdcBal ? Number(usdcBal) / 1e6 : 0

  const loadPurchases = useCallback(async () => {
    if (!player.id) return
    const { data: { session } } = await supabase.auth.getSession()
    const resp = await fetch(`${API_URL}/store/purchases`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    })
    if (resp.ok) {
      const d = await resp.json()
      setOwned(new Set((d.purchases ?? []).map((p: { pack_id: string }) => p.pack_id)))
    }
  }, [player.id])

  useEffect(() => {
    fetch(`${API_URL}/store/packs`).then((r) => r.json()).then((d) => setPacks(d.packs ?? []))
    loadPurchases()
  }, [loadPurchases])

  const handleBuy = async (pack: Pack) => {
    if (!address) { navigate('/wallet'); return }
    setBusyPack(pack.pack_id)
    const ok = await purchase(pack.pack_id, pack.price_usd, address)
    if (ok) await loadPurchases()
    setBusyPack(null)
  }

  const base = packs.filter((p) => p.tier === 'base')
  const supporter = packs.filter((p) => p.tier === 'supporter')

  const renderPack = (pack: Pack) => {
    const isOwned = owned.has(pack.pack_id)
    const isBusy = busyPack === pack.pack_id
    const oneTime = pack.tier === 'supporter'
    const disabled = isBusy || (oneTime && isOwned) || (isConnected && usdc < pack.price_usd)
    return (
      <Card key={pack.pack_id} variant={pack.tier === 'supporter' ? 'glow' : undefined} className="flex flex-col p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-accent">{pack.name}</h3>
          <span className="text-xl font-bold">${pack.price_usd}</span>
        </div>
        {pack.merch_item && <MerchCarousel item={pack.merch_item} />}
        <div className="space-y-1.5 my-3 flex-1">
          <p className="text-sm flex items-center gap-2">{pack.influence.toLocaleString()} <MeyInfluence /></p>
          <p className="text-sm flex items-center gap-2">{pack.fate} <MeyFate /> <span className="text-[10px] text-text-muted">(free bonus)</span></p>
          {pack.merch_item && (
            <p className="text-sm flex items-center gap-2"><Gift size={14} className="text-emerald-400" /> {MERCH_LABEL[pack.merch_item] ?? pack.merch_item} <span className="text-[10px] text-text-muted">(one-time)</span></p>
          )}
        </div>
        {oneTime && isOwned ? (
          <Button variant="ghost" size="md" disabled className="w-full"><Check size={14} className="inline mr-1" /> Owned</Button>
        ) : (
          <Button variant="accent" size="md" onClick={() => handleBuy(pack)} disabled={disabled} className="w-full">
            {isBusy ? (step === 'paying' ? 'Confirm in wallet…' : step === 'confirming' ? 'Confirming…' : 'Delivering…')
              : !isConnected ? `Buy — $${pack.price_usd} USDC`
              : usdc < pack.price_usd ? 'Insufficient USDC'
              : `Buy — $${pack.price_usd} USDC`}
          </Button>
        )}
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-accent">Shop</h2>
          <p className="text-text-muted mt-1 flex items-center gap-1 flex-wrap">Buy <MeyInfluence /> to play. Every pack includes bonus <MeyFate /> — free.</p>
        </div>
        {isConnected && <div className="text-right text-sm"><p className="text-text-muted text-[10px]">USDC Balance</p><p className="font-mono text-accent">${usdc.toFixed(2)}</p></div>}
      </div>

      {error && <Card className="p-3 border-red-400/30 bg-red-400/10"><p className="text-xs text-red-400 break-words">{error}</p></Card>}
      {result && step === 'done' && <Card className="p-3 border-green-400/30 bg-green-400/10"><p className="text-xs text-green-400">Purchase complete! Tokens delivered to your wallet.{(result.merch_item as string) ? ' Merch will be fulfilled manually — we\u2019ll be in touch.' : ''}</p></Card>}

      <div>
        <h3 className="text-sm font-bold text-text/60 uppercase tracking-wider mb-3">Influence Packs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{base.map(renderPack)}</div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-text/60 uppercase tracking-wider mb-3">Supporter Packs <span className="text-[10px] text-text-muted normal-case">— one-time, incl. merch + future loot</span></h3>
        <p className="text-[10px] text-amber-400/80 mb-3">⚠️ Supporter pack merch is not available on testnet. Packs give MeyInfluence + MeyFate only.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{supporter.map(renderPack)}</div>
      </div>

      <p className="text-[11px] text-text-muted text-center">Supporter packs accrue new digital cosmetics over time — buy once, keep earning loot as we ship content.</p>
      <p className="text-[11px] text-text-muted text-center flex items-center justify-center gap-1 flex-wrap"><strong className="text-text/70">No purchase necessary.</strong> Claim free <MeyInfluence /> daily in your <button onClick={() => navigate('/wallet')} className="text-accent underline">Wallet</button>.</p>

      <div className="border-t border-line/30 pt-6">
        <h3 className="text-sm font-bold text-text/60 uppercase tracking-wider mb-3 text-center">Official Gear — Physical Merch</h3>
        <p className="text-xs text-text-muted text-center mb-4">Shipped worldwide. Visit <a href="https://merch.meycult.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">merch.meycult.com</a> to browse and order.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { n: 'Cult Tee', i: '/products/cult-tee-meycult-0.jpg' },
            { n: 'Cult Mug', i: '/products/cult-mug-meycult-0.jpg' },
            { n: 'Cult Beanie', i: '/products/cult-beanie-meycult-0.jpg' },
            { n: 'Cult Hoodie', i: '/products/cult-hoodie-meycult-0.jpg' },
            { n: 'Cult Joggers', i: '/products/cult-joggers-meycult-0.jpg' },
          ].map((p) => (
            <a key={p.n} href="https://merch.meycult.com" target="_blank" rel="noopener noreferrer"
              className="glass rounded-xl border border-line/40 overflow-hidden hover:border-accent/40 transition-all group">
              <div className="aspect-square bg-surface/20 flex items-center justify-center p-3">
                <img src={p.i} alt={p.n} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-2 text-center border-t border-line/30">
                <p className="text-[10px] font-medium text-text uppercase tracking-wider">{p.n}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-4">
          <a href="https://merch.meycult.com" target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-all inline-block">
            Shop Merch →
          </a>
        </div>
      </div>
    </div>
  )
}
