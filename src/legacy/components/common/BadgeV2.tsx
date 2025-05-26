import { HTMLAttributes } from 'react'
import { cn } from '@/utils/commonUtil'

export type BadgeV2Color = 'orange' | 'green' | 'blue' | 'red' | 'gray' | 'brown' | 'navy' | 'dark_green'
interface BadgeV2Props extends HTMLAttributes<HTMLSpanElement> {
  size?: 24 | 20 | 16
  type: 'solid_strong' | 'solid_regular' | 'line'
  color: BadgeV2Color
}

const BadgeStyles = {
  solid_strong: {
    orange: 'bg-primary-800 text-white',
    green: 'bg-old-primary-green-800 text-white',
    blue: 'bg-old-primary-blue-800 text-white',
    red: 'bg-old-primary-red-800 text-white',
    gray: 'bg-gray-500 text-white',
    navy: 'bg-[#405472] text-white',
    dark_green: 'bg-[#3D6D5F] text-white',
    brown: 'bg-[#6D4A3D] text-white',
  },
  solid_regular: {
    orange: 'bg-primary-100 text-primary-800',
    green: 'bg-old-primary-green-100 text-old-primary-green-800',
    blue: 'bg-old-primary-blue-100 text-old-primary-blue-800',
    red: 'bg-old-primary-red-100 text-old-primary-red-800',
    gray: 'bg-gray-100 text-gray-700',
    navy: 'bg-[#EEF2F8] text-[#405472]',
    dark_green: 'bg-[#EDF3F1] text-[#3D6D5F]',
    brown: 'bg-[#F2ECEA] text-[#6D4A3D]',
  },
  line: {
    orange: 'border border-primary-400 bg-white text-primary-800',
    green: 'border border-old-primary-green-400 bg-white text-old-primary-green-800',
    blue: 'border border-old-primary-blue-400 bg-white text-old-primary-blue-800',
    red: 'border border-old-primary-red-400 bg-white text-old-primary-red-800',
    gray: 'border border-gray-400 bg-white text-gray-700',
    navy: 'border border-[#A2ADBD] bg-white text-[#405472]',
    dark_green: 'border border-[#A0B7B0] bg-white text-[#3D6D5F]',
    brown: 'border border-[#CCC2BE] bg-white text-[#6D4A3D]',
  },
}
const sizeStyles = {
  16: 'text-[11px] font-medium px-1 py-px rounded-sm flex items-center h-4 w-max',
  20: 'text-[12px] font-medium px-1.5 py-0.5 rounded-sm flex items-center h-5 w-max',
  24: 'text-[13px] font-medium px-2 py-[3px] rounded-sm flex items-center h-6 w-max',
}

export function BadgeV2({ className, size = 24, type = 'solid_regular', color = 'gray', ...props }: BadgeV2Props) {
  const spanClassNames = cn(BadgeStyles[type]?.[color], sizeStyles[size], className)
  return <span className={spanClassNames} {...props} />
}
