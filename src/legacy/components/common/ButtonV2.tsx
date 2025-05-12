import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonV2Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'solid' | 'outline';
  size?: 32 | 40 | 48;
  color: 'orange800' | 'gray700' | 'orange100' | 'gray100' | 'orange700' | 'gray400';
}

const buttonStyles = {
  solid: {
    orange800:
      'bg-primary-orange-800 text-white active:bg-primary-orange-850 disabled:bg-primary-orange-50 disabled:text-primary-orange-400 disabled:cursor-not-allowed cursor:pointer',
    gray700:
      'bg-primary-gray-700 text-white active:bg-primary-gray-800 disabled:bg-primary-gray-100 disabled:text-primary-gray-400 disabled:cursor-not-allowed cursor:pointer',
    orange100:
      'bg-primary-orange-100 text-primary-orange-800 active:bg-primary-orange-400 disabled:bg-primary-gray-100 disabled:text-primary-gray-400 disabled:cursor-not-allowed cursor:pointer',
    gray100:
      'bg-primary-gray-100 text-primary-gray-900 active:bg-primary-gray-300 disabled:bg-primary-gray-100 disabled:text-primary-gray-400 disabled:cursor-not-allowed cursor:pointer',
  },
  outline: {
    orange700:
      'border border-primary-orange-700 text-primary-orange-800 active:border-primary-orange-700 active:bg-primary-orange-100 disabled:border-primary-gray-100 disabled:text-primary-gray-400 disabled:bg-primary-gray-200 disabled:cursor-not-allowed cursor:pointer',
    gray400:
      'border border-primary-gray-400 text-primary-gray-900 active:border-primary-gray-100 active:bg-primary-gray-400 disabled:border-primary-gray-200 disabled:text-primary-gray-400 disabled:bg-primary-gray-100 disabled:cursor-not-allowed cursor:pointer',
  },
};

const sizeStyles = {
  32: 'min-w-[64px] rounded-[6px] text-[14px] font-medium px-3 h-8',
  40: 'min-w-[80px] rounded-[8px] text-[15px] font-medium px-4 h-10',
  48: 'min-w-[80px] rounded-[8px] text-[16px] font-semibold px-4 h-12',
};

export const ButtonV2 = forwardRef<HTMLButtonElement, ButtonV2Props>(function ButtonV2(
  { className, variant, color, size = 32, ...props },
  ref,
) {
  const isOutlineGray400AndSize48 = variant === 'outline' && color === 'gray400' && size === 48;
  const buttonClassNames = twMerge(
    clsx(
      buttonStyles[variant][color as keyof (typeof buttonStyles)[typeof variant]],
      sizeStyles[size],
      {
        'text-primary-gray-700': isOutlineGray400AndSize48,
        'text-primary-gray-900': variant === 'outline' && color === 'gray700' && size !== 48,
      },
      className,
    ),
  );

  return <button ref={ref} className={buttonClassNames} {...props} />;
});
