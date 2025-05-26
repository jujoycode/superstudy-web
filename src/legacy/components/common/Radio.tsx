import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/commonUtil'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ className, ...props }, ref) {
  return <input ref={ref} type="radio" className={cn('radio', className)} {...props} />
})
