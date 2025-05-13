import { HTMLAttributes, LabelHTMLAttributes } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn('', className)} {...props} />
}

Label.col = function LabelCol({ className, ...props }: LabelProps) {
  return <label className={cn('flex flex-col gap-1', className)} {...props} />
}

Label.row = function LabelRow({ className, ...props }: LabelProps) {
  return <label className={cn('flex items-center gap-2', className)} {...props} />
}

export interface LabelTextProps extends HTMLAttributes<HTMLParagraphElement> {}

Label.Text = function LabelText({ className, ...props }: LabelTextProps) {
  return <p className={cn('text-13 text-gray-500', className)} {...props} />
}

export interface LabelErrorProps extends HTMLAttributes<HTMLParagraphElement> {}

Label.Error = function LabelError({ className, ...props }: LabelErrorProps) {
  return <p className={cn('text-13 whitespace-pre text-red-500', className)} {...props} />
}
