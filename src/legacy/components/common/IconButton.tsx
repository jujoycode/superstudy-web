import { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/legacy/lib/tailwind-merge'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string
}

export function IconButton({ to, className, ...props }: IconButtonProps) {
  const button = <button className={cn('flex h-10 w-10 items-center justify-center', className)} {...props} />
  return to ? <Link to={to} children={button} /> : button
}
