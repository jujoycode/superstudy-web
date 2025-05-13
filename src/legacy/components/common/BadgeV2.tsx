import clsx from 'clsx'
import { HTMLAttributes } from 'react'

export type BadgeV2Color = 'orange' | 'green' | 'blue' | 'red' | 'gray' | 'brown' | 'navy' | 'dark_green'
interface BadgeV2Props extends HTMLAttributes<HTMLSpanElement> {
  size?: 24 | 20 | 16
  type: 'solid_strong' | 'solid_regular' | 'line'
  color: BadgeV2Color
}

const BadgeStyles = {
  solid_strong: {
    orange: 'bg-primary-orange-800 text-white',
    green: 'bg-primary-green-800 text-white',
    blue: 'bg-primary-blue-800 text-white',
    red: 'bg-primary-red-800 text-white',
    gray: 'bg-primary-gray-500 text-white',
    navy: 'bg-[#405472] text-white',
    dark_green: 'bg-[#3D6D5F] text-white',
    brown: 'bg-[#6D4A3D] text-white',
  },
  solid_regular: {
    orange: 'bg-primary-orange-100 text-primary-orange-800',
    green: 'bg-primary-green-100 text-primary-green-800',
    blue: 'bg-primary-blue-100 text-primary-blue-800',
    red: 'bg-primary-red-100 text-primary-red-800',
    gray: 'bg-primary-gray-100 text-primary-gray-700',
    navy: 'bg-[#EEF2F8] text-[#405472]',
    dark_green: 'bg-[#EDF3F1] text-[#3D6D5F]',
    brown: 'bg-[#F2ECEA] text-[#6D4A3D]',
  },
  line: {
    orange: 'border border-primary-orange-400 bg-white text-primary-orange-800',
    green: 'border border-primary-green-400 bg-white text-primary-green-800',
    blue: 'border border-primary-blue-400 bg-white text-primary-blue-800',
    red: 'border border-primary-red-400 bg-white text-primary-red-800',
    gray: 'border border-primary-gray-400 bg-white text-primary-gray-700',
    navy: 'border border-[#A2ADBD] bg-white text-[#405472]',
    dark_green: 'border border-[#A0B7B0] bg-white text-[#3D6D5F]',
    brown: 'border border-[#CCC2BE] bg-white text-[#6D4A3D]',
  },
}
const sizeStyles = {
  16: 'text-11 font-medium px-1 py-px rounded flex items-center h-4 w-max',
  20: 'text-xs font-medium px-1.5 py-0.5 rounded flex items-center h-5 w-max',
  24: 'text-13 font-medium px-2 py-[3px] rounded flex items-center h-6 w-max',
}

export function BadgeV2({ className, size = 24, type = 'solid_regular', color = 'gray', ...props }: BadgeV2Props) {
  const spanClassNames = clsx(BadgeStyles[type]?.[color], sizeStyles[size], className)
  return <span className={spanClassNames} {...props} />
}
