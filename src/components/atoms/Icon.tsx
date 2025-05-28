import * as LucideIcons from 'lucide-react'
import { useMemo } from 'react'
import { ReactComponent as Check } from '@/assets/icons/check.svg'
import { ReactComponent as ChevronDown } from '@/assets/icons/chevron-down.svg'
import { ReactComponent as ChevronLeft } from '@/assets/icons/chevron-left.svg'
import { ReactComponent as ChevronRight } from '@/assets/icons/chevron-right.svg'
import { ReactComponent as ChevronUp } from '@/assets/icons/chevron-up.svg'
import { ReactComponent as Bell } from '@/assets/icons/new-bell.svg'
import { ReactComponent as World } from '@/assets/icons/new-world.svg'
import { ReactComponent as ssSearch } from '@/assets/icons/search.svg'
import { ReactComponent as Logo } from '@/assets/svg/logo.svg'
import { ReactComponent as RightFillArrow } from '@/assets/svg/RightFillArrow.svg'
import { ReactComponent as RightUpArrow } from '@/assets/svg/RightUpArrow.svg'
import { ReactComponent as ssDownload } from '@/assets/svg/ssDownload.svg'
import { ReactComponent as UnderFillArrow } from '@/assets/svg/UnderFillArrow.svg'
import { ReactComponent as ssCalendar } from '@/assets/svg/ssCalendar.svg'

type LucideIconName = keyof typeof LucideIcons

export type IconName =
  | 'logo'
  | 'world'
  | 'bell'
  | 'check'
  | 'chevronUp'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'rightFillArrow'
  | 'underFillArrow'
  | 'rightUpArrow'
  | 'ssDownload'
  | 'ssSearch'
  | 'ssCalendar'
  | LucideIconName

export type IconProps = {
  name: IconName
  color?: 'primary' | `${string}-${number}`
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

function getColorOptions(color: 'primary' | `${string}-${number}`): string {
  switch (color) {
    case 'primary':
      return 'text-primary-800'

    default:
      return `text-${color}`
  }
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
  strokeWidth = 1.5,
  className = '',
  onClick,
}: IconProps) {
  const sizeClass = sizeOptions[size] || sizeOptions.md
  const colorClass = color ? getColorOptions(color) : ''

  const CustomIcons = useMemo(
    () => ({
      logo: Logo,
      world: World,
      bell: Bell,
      check: Check,
      rightUpArrow: RightUpArrow,
      rightFillArrow: RightFillArrow,
      underFillArrow: UnderFillArrow,
      chevronUp: ChevronUp,
      chevronDown: ChevronDown,
      chevronLeft: ChevronLeft,
      chevronRight: ChevronRight,
      ssDownload: ssDownload,
      ssSearch: ssSearch,
      ssCalendar: ssCalendar,
    }),
    [],
  )

  const IconComponent = CustomIcons[name as keyof typeof CustomIcons] || LucideIcons[name as LucideIconName]

  return (
    <div className={`inline-flex ${customSize ? '' : sizeClass} ${colorClass} ${className}`} onClick={onClick}>
      <IconComponent
        color={colorClass}
        fill={fill ? 'currentColor' : 'none'}
        stroke={stroke ? 'currentColor' : 'none'}
        strokeWidth={strokeWidth}
        width={customSize?.width}
        height={customSize?.height}
      />
    </div>
  )
}
