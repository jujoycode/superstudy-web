import { cn } from '@/utils/commonUtil'
import { InputHTMLAttributes, forwardRef } from 'react'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ className, ...props }, ref) {
  return <input ref={ref} type="radio" className={cn('radio', className)} {...props} />
})
