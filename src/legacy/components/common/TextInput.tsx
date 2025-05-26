import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/commonUtil'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ className, ...props }, ref) {
  return <input ref={ref} type="text" className={cn('text-input', className)} {...props} onWheel={() => {}} />
})
