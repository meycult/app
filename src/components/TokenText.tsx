import { FateIcon } from '@/icons/FateIcon'
import { InfluenceIcon } from '@/icons/InfluenceIcon'

interface TokenTextProps {
  size?: number
  icon?: boolean
  className?: string
}

const wrap = { fontWeight: 700, whiteSpace: 'nowrap' as const }

export function MeyFate({ size = 14, icon = true, className }: TokenTextProps) {
  return (
    <span style={wrap} className={className}>
      {icon && <><FateIcon size={size} />{' '}</>}
      <span style={{ color: 'var(--color-text)' }}>Mey</span>
      <span style={{ color: 'var(--color-accent)' }}>Fate</span>
    </span>
  )
}

export function MeyInfluence({ size = 14, icon = true, className }: TokenTextProps) {
  return (
    <span style={wrap} className={className}>
      {icon && <><InfluenceIcon size={size} />{' '}</>}
      <span style={{ color: 'var(--color-text)' }}>Mey</span>
      <span style={{ color: 'var(--color-accent)' }}>Influence</span>
    </span>
  )
}
