import { clsx } from 'clsx'

export function ChipGroup({ options, selected, onChange }: { options: { label: string; value: string }[]; selected: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border', selected === opt.value ? 'bg-accent/20 border-accent/30 text-accent' : 'border-line text-text-muted hover:text-text/70')}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function DropdownFilter({ label, options, value, onChange }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-surface border border-line/30 rounded-md px-2 py-1 text-xs text-text focus:border-accent/50 focus:outline-none">
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
