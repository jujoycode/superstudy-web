import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/commonUtil'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

const SelectMd = forwardRef<HTMLSelectElement, SelectProps>(function SelectMd(
  { placeholder, children, className, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('select', className)} {...props}>
      {placeholder && (
        <option value={undefined} selected disabled hidden>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

const SelectXs = forwardRef<HTMLSelectElement, SelectProps>(function SelectXs(
  { placeholder, children, className, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('select-xs', className)} {...props}>
      {placeholder && (
        <option value={undefined} selected disabled hidden>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

const SelectSm = forwardRef<HTMLSelectElement, SelectProps>(function SelectSm(
  { placeholder, children, className, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('select-sm', className)} {...props}>
      {placeholder && (
        <option value={undefined} selected disabled hidden>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

const SelectLg = forwardRef<HTMLSelectElement, SelectProps>(function SelectLg(
  { placeholder, children, className, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('select-lg', className)} {...props}>
      {placeholder && (
        <option value={undefined} selected disabled hidden>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

const SelectXl = forwardRef<HTMLSelectElement, SelectProps>(function SelectXl(
  { placeholder, children, className, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('select-xl', className)} {...props}>
      {placeholder && (
        <option value={undefined} selected disabled hidden>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
})

export const Select = Object.assign(SelectMd, { xs: SelectXs, sm: SelectSm, lg: SelectLg, xl: SelectXl })
