interface IconProps {
  size?: number
  className?: string
}

export function InfluenceIcon({ size = 16, className }: IconProps) {
  return (
    <img
      src="/products/influence.png"
      alt="MeyInfluence"
      className={className ? `inline-block align-middle ${className}` : 'inline-block align-middle'}
      style={{ width: size, height: size }}
    />
  )
}
