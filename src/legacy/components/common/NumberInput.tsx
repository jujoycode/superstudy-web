import clsx from 'clsx'
import { InputHTMLAttributes, forwardRef } from 'react'

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { className, ...props },
  ref,
) {
  const preventWheel = (e: any) => {
    e.target.blur()
    e.stopPropagation()
    setTimeout(() => {
      e.target.focus()
    }, 0)
  }

  return <input ref={ref} type="number" className={clsx('text-input', className)} {...props} onWheel={preventWheel} />
})
