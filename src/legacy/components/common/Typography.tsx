import clsx from 'clsx';
import { HTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant:
    | 'heading'
    | 'title1'
    | 'title2'
    | 'title3'
    | 'body1'
    | 'body2'
    | 'body3'
    | 'caption'
    | 'caption2'
    | 'caption3';
}

const styles = {
  heading: 'text-[#121316] text-[32px] leading-10 font-bold',
  title1: 'text-[#121316] text-2xl font-bold',
  title2: 'text-[#121316] text-[18px] leading-[26px] font-semibold',
  title3: 'text-[#121316] text-base leading-6 font-semibold',
  body1: 'text-[#121316] text-base font-normal',
  body2: 'text-[#121316] text-[15px] font-normal',
  body3: 'text-[#121316] text-[14px] leading-5 font-normal',
  caption: 'text-[#121316] text-[13px] leading-[18px] font-normal',
  caption2: 'text-[#121316] text-[12px] leading-[16px] font-normal',
  caption3: 'text-[#121316] text-[11px] leading-[14px] font-medium',
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography({
  className,
  variant,
  ...props
}) {
  const Component =
    variant === 'heading'
      ? 'h1'
      : variant === 'title1'
      ? 'h2'
      : variant === 'title2'
      ? 'h3'
      : variant === 'title3'
      ? 'h3'
      : variant === 'caption' || variant === 'caption2' || variant === 'caption3'
      ? 'span'
      : 'p';

  const combinedClassName = twMerge(clsx(styles[variant], 'whitespace-pre-wrap', className));

  return <Component className={combinedClassName} {...props} />;
});
