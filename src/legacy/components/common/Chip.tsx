import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, ...props }: ChipProps) {
  return <button className={clsx('chip', selected && 'chip-selected', className)} {...props} />;
}
