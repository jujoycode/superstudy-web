import { ReactComponent as Bell } from '@/assets/icons/bell.svg'
import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { ReactComponent as World } from '@/assets/svg/world.svg'

export type IconProps = {
  name: 'logo' | 'world' | 'bell'
  color?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  fill?: boolean
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
}

/**
 * Icon 컴포넌트
 */
export function Icon({ name, color, size = 'md', fill = false, className = '' }: IconProps) {
  const IconComponent = {
    logo: Logo,
    world: World,
    bell: Bell,
  }[name]

  const sizeClass = sizeMap[size] || sizeMap.md
  const colorClass = color ? colorMap[color] : ''

  return (
    <div className={`inline-flex ${sizeClass} ${colorClass} ${className}`}>
      <IconComponent fill={fill ? 'currentColor' : 'none'} width="100%" height="100%" />
    </div>
  )
}
