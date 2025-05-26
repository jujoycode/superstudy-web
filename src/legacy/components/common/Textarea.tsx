import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/commonUtil'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn('textarea', className)} {...props} />
})
