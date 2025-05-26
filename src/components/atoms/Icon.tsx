import { ReactComponent as Check } from '@/assets/icons/check.svg'
import { ReactComponent as ChevronDown } from '@/assets/icons/chevron-down.svg'
import { ReactComponent as ChevronUp } from '@/assets/icons/chevron-up.svg'
import { ReactComponent as Bell } from '@/assets/icons/new-bell.svg'
import { ReactComponent as World } from '@/assets/icons/new-world.svg'
import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { ReactComponent as RightFillArrow } from '@/assets/svg/RightFillArrow.svg'
import { ReactComponent as RightUpArrow } from '@/assets/svg/RightUpArrow.svg'
import { ReactComponent as UnderFillArrow } from '@/assets/svg/UnderFillArrow.svg'

type IconName =
  | 'logo'
  | 'world'
  | 'bell'
  | 'check'
  | 'chevronUp'
  | 'chevronDown'
  | 'rightFillArrow'
  | 'underFillArrow'
  | 'rightUpArrow'

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
  strokeWidth?: number
  className?: string
  onClick?: () => void
}

const sizeOptions = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

const colorOptions = {
  primary: 'text-primary-800',
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
  strokeWidth,
  className = '',
  onClick,
}: IconProps) {
  const sizeClass = sizeOptions[size] || sizeOptions.md
  const colorClass = color ? colorOptions[color] : ''

  const IconComponent = {
    logo: Logo,
    world: World,
    bell: Bell,
    check: Check,
    rightUpArrow: RightUpArrow,
    rightFillArrow: RightFillArrow,
    underFillArrow: UnderFillArrow,
    chevronUp: ChevronUp,
    chevronDown: ChevronDown,
  }[name]

  return (
    <div className={`inline-flex ${customSize ? '' : sizeClass} ${colorClass} ${className}`} onClick={onClick}>
      <IconComponent
        fill={fill ? 'currentColor' : 'none'}
        stroke={stroke ? 'currentColor' : 'none'}
        width={customSize?.width}
        strokeWidth={strokeWidth}
        height={customSize?.height}
        color={colorClass}
      />
    </div>
  )
}
