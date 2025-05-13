import clsx from 'clsx'
import { InputHTMLAttributes, forwardRef } from 'react'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ className, ...props }, ref) {
  return <input ref={ref} type="radio" className={clsx('radio', className)} {...props} />
})
