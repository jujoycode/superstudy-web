import { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from 'src/lib/tailwind-merge';

const defaultButtonElement = 'button';

export type ButtonProps<T extends ElementType = typeof defaultButtonElement> = ComponentPropsWithoutRef<T> & {
  as?: T;
};

export function Button<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement;
  return (
    <Component
      className={cn('flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-14', className)}
      {...props}
    />
  );
}

Button.xs = function ButtonXs<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement;
  return (
    <Component
      className={cn(
        'flex h-5 items-center justify-center whitespace-nowrap rounded-sm px-1 text-12 font-light',
        className,
      )}
      {...props}
    />
  );
};

Button.sm = function ButtonSm<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement;
  return (
    <Component
      className={cn('flex h-7 items-center justify-center whitespace-nowrap rounded px-2 text-13', className)}
      {...props}
    />
  );
};

Button.lg = function ButtonLg<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement;
  return (
    <Component
      className={cn(
        'flex h-11 items-center justify-center whitespace-nowrap rounded-lg px-4 text-15 font-medium',
        className,
      )}
      {...props}
    />
  );
};

Button.xl = function ButtonXl<T extends ElementType = typeof defaultButtonElement>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || defaultButtonElement;
  return (
    <Component
      className={cn(
        'flex h-13 items-center justify-center whitespace-nowrap rounded-lg px-4 text-16 font-bold',
        className,
      )}
      {...props}
    />
  );
};
