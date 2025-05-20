import { cn } from '@/utils/commonUtil'
import { InputHTMLAttributes, forwardRef, useEffect, useState } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { onClick, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      onClick={(e) => (e.stopPropagation(), onClick?.(e))}
      className={cn(
        'checkbox',
        props.disabled ? 'cursor-not-allowed bg-gray-100 opacity-60' : 'cursor-pointer',
        className,
      )}
      {...props}
    />
  )
})

export function useCheckbox<T>(items: T[] = []) {
  const [checks, setChecks] = useState<boolean[]>([])

  useEffect(() => setChecks(Array(items.length).fill(false)), [items[0]])

  const allChecked = checks.length > 0 && checks.every((check) => check)

  return {
    items: items.filter((_, i) => checks[i]),
    checked: (index: number) => checks[index] ?? false,
    allChecked,
    allUnchecked: checks.every((check) => !check),
    click: (index: number) => setChecks((prev) => prev.map((check, i) => (i === index ? !check : check))),
    clickAll: () => setChecks(Array(items.length).fill(!allChecked)),
    clear: () => setChecks(Array(items.length).fill(false)),
  }
}
