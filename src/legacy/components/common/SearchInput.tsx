import { InputHTMLAttributes } from 'react';
import { cn } from 'src/lib/tailwind-merge';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: () => void;
}

export function SearchInput({ onSearch, className, ...props }: SearchInputProps) {
  return (
    <input
      className={cn('rounded-full border border-gray-200 placeholder:text-gray-400 focus:border-brand-1', className)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
      {...props}
    />
  );
}
