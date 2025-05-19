import { ReactComponent as ChevronDown } from '@/assets/icons/chevron-down.svg'
import { ReactComponent as ChevronUp } from '@/assets/icons/chevron-up.svg'
import { ReactComponent as Bell } from '@/assets/icons/new-bell.svg'
import { ReactComponent as World } from '@/assets/icons/new-world.svg'
import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { ReactComponent as RightFillArrow } from '@/assets/svg/RightFillArrow.svg'
import { ReactComponent as RightUpArrow } from '@/assets/svg/RightUpArrow.svg'

type IconName = 'logo' | 'world' | 'bell' | 'rightFillArrow' | 'rightUpArrow' | 'chevronDown' | 'chevronUp'

export type IconProps = {
  name: IconName
  color?: 'primary' | 'secondary' | 'tertiary' | 'gray-400'
  size?: 'sm' | 'md' | 'lg'
  customSize?: {
    width: string
    height: string
  }
  fill?: boolean
  stroke?: boolean
  className?: string
}

const sizeOptions = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

const colorOptions = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  'gray-400': 'text-gray-400',
}

/**
 * Icon 컴포넌트
 */
export function Icon({
  name,
  color,
  size = 'md',
  customSize,
  fill = false,
  stroke = false,
  className = '',
}: IconProps) {
  const IconComponent = {
    logo: Logo,
    world: World,
    bell: Bell,
    rightFillArrow: RightFillArrow,
    rightUpArrow: RightUpArrow,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
  }[name]

  const sizeClass = sizeOptions[size] || sizeOptions.md
  const colorClass = color ? colorOptions[color] : ''

  return (
    <div className={`inline-flex ${customSize ? '' : sizeClass} ${colorClass} ${className}`}>
      <IconComponent
        fill={fill ? 'currentColor' : 'none'}
        stroke={stroke ? 'currentColor' : 'none'}
        width={customSize?.width}
        height={customSize?.height}
        color={colorClass}
      />
    </div>
  )
}
