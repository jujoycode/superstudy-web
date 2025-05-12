import { HTMLAttributes } from 'react';
import { cn } from 'src/lib/tailwind-merge';

interface BottomFixedProps extends HTMLAttributes<HTMLDivElement> {}

export function BottomFixed({ className, ...props }: BottomFixedProps) {
  return <div className={cn('fixed inset-x-0 bottom-0 w-full bg-white', className)} {...props} />;
}
