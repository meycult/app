import { useState, useEffect, useCallback } from 'react'
import { Card, Button } from '@/components/ui/ui'
import { apiFetch } from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface ResolvableQuest {
  quest_id: string
  question: string
  status: string
  resolution_outcome: string | null
}

export function AdminResolution() {
  const [quests, setQuests] = useState<ResolvableQuest[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('quests')
      .select('quest_id, question, status, resolution_outcome')
      .eq('source_type', 'polymarket')
      .in('status', ['ACTIVE', 'LOCKED', 'RESOLVING', 'RESOLVED'])
      .order('volume', { ascending: false })
      .limit(50)
    setQuests((data as ResolvableQuest[]) ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const poll = async () => {
    setBusy(true); setMsg('')
    try {
      const r = await apiFetch('/resolve/poll', { method: 'POST' })
      setMsg(`Checked ${r.checked}, resolved ${r.resolved}.`)
      await load()
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  const settle = async (id: string) => {
    setBusy(true); setMsg('')
    try {
      const r = await apiFetch(`/resolve/settle/${id}`, { method: 'POST' })
      const f = r.pools?.FATE ?? {}
      const i = r.pools?.INFLUENCE ?? {}
      setMsg(`Settled ${r.outcome}. Fate: ${f.winners ?? 0}W/${f.losers ?? 0}L fee ${f.fee ?? 0} · INF: ${i.winners ?? 0}W/${i.losers ?? 0}L.`)
      await load()
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  const manual = async (id: string, outcome: 'YES' | 'NO') => {
    setBusy(true); setMsg('')
    try {
      const r = await apiFetch('/resolve/manual', { method: 'POST', body: JSON.stringify({ quest_id: id, outcome }) })
      const f = r.pools?.FATE ?? {}
      setMsg(`Resolved ${outcome} + settled (Fate ${f.winners ?? 0} winners).`)
      await load()
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">Poll Polymarket for resolutions, then settle payouts (parimutuel, 5% fee).</p>
        <Button variant="accent" size="sm" onClick={poll} disabled={busy}>Poll resolutions</Button>
      </div>
      {msg && <Card className="p-3 border-accent/30 bg-accent/10"><p className="text-xs text-accent break-words">{msg}</p></Card>}
      <Card className="p-4">
        <div className="space-y-2">
          {quests.map((q) => (
            <div key={q.quest_id} className="flex items-center justify-between glass rounded-lg p-2 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{q.question}</p>
                <p className="text-[10px] text-text-muted">{q.status}{q.resolution_outcome ? ` · ${q.resolution_outcome}` : ''}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {q.status === 'RESOLVED' && <Button variant="accent" size="xs" onClick={() => settle(q.quest_id)} disabled={busy}>Settle</Button>}
                {q.status !== 'RESOLVED' && q.status !== 'SETTLED' && (
                  <>
                    <Button variant="ghost" size="xs" onClick={() => manual(q.quest_id, 'YES')} disabled={busy}>YES</Button>
                    <Button variant="ghost" size="xs" onClick={() => manual(q.quest_id, 'NO')} disabled={busy}>NO</Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {quests.length === 0 && <p className="text-xs text-text-muted">No quests.</p>}
        </div>
      </Card>
    </div>
  )
}
