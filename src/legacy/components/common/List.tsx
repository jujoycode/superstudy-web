import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface ListProps extends HTMLAttributes<HTMLUListElement> {}

export function List({ className, ...props }: ListProps) {
  return <ul className={clsx('list', className)} {...props} />;
}
