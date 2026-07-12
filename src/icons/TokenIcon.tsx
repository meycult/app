import { FateIcon } from './FateIcon'
import { InfluenceIcon } from './InfluenceIcon'
import type { SVGProps } from 'react'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  size?: number
}

const icons = {
  fate: FateIcon,
  influence: InfluenceIcon,
} as const

type Token = keyof typeof icons

interface TokenIconProps extends IconProps {
  token: Token
}

export function TokenIcon({ token, ...props }: TokenIconProps) {
  const Icon = icons[token]
  return <Icon {...props} />
}
