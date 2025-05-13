import { ComponentPropsWithoutRef, ElementType } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

const defaultButtonElement = 'button'

export type ButtonProps<T extends ElementType = typeof defaultButtonElement> = ComponentPropsWithoutRef<T> & {
  as?: T
}

export function Button<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement
  return (
    <Component
      className={cn('text-14 flex h-9 items-center justify-center rounded-md px-3 whitespace-nowrap', className)}
      {...props}
    />
  )
}

Button.xs = function ButtonXs<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement
  return (
    <Component
      className={cn(
        'text-12 flex h-5 items-center justify-center rounded-sm px-1 font-light whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}

Button.sm = function ButtonSm<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement
  return (
    <Component
      className={cn('text-13 flex h-7 items-center justify-center rounded px-2 whitespace-nowrap', className)}
      {...props}
    />
  )
}

Button.lg = function ButtonLg<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement
  return (
    <Component
      className={cn(
        'text-15 flex h-11 items-center justify-center rounded-lg px-4 font-medium whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}

Button.xl = function ButtonXl<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement
  return (
    <Component
      className={cn(
        'text-16 flex h-13 items-center justify-center rounded-lg px-4 font-bold whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}
