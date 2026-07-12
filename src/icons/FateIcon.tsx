interface IconProps {
  size?: number
  className?: string
}

export function FateIcon({ size = 16, className }: IconProps) {
  return (
    <img
      src="/products/fate.png"
      alt="MeyFate"
      className={className ? `inline-block align-middle ${className}` : 'inline-block align-middle'}
      style={{ width: size, height: size }}
    />
  )
}
