import React, { forwardRef, InputHTMLAttributes, ReactNode, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { cn } from '@/utils/commonUtil'

import { Typography } from './Typography'
import type { TypographyProps } from './Typography'

interface RadioProps<T = any> extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  size?: 16 | 20 | 24
  value: T
  onChange?: (value: T) => void
}

interface RadioBasicProps<T = any> extends RadioProps<T> {
  label?: string
  labelClassName?: string
  labelTypographyVariant?: TypographyProps['variant']
}

interface RadioBoxProps<T = any> extends RadioProps<T> {
  type?: 'large' | 'medium'
  image?: string
  title?: string
  content?: string
  showImage?: boolean
}

interface RadioLabelProps<T = any> extends RadioProps<T> {
  title: string
  currentNum: number
  TotalNum: number
  type?: 'number' | 'count'
}

interface RadioChipProps<T = any> extends RadioProps<T> {
  label: string
}

interface RadioGroupProps<T = any> {
  children: ReactNode
  selectedValue?: T
  onChange?: (value: T) => void
  className?: string
}

const RadioIndicator = ({ size = 24, checked, disabled }: { size: number; checked?: boolean; disabled?: boolean }) => {
  return (
    <span
      className={cn('flex items-center justify-center rounded-full border-2 transition-colors', {
        'border-gray-200 bg-white': !disabled,
        'border-gray-200 bg-gray-100': disabled,
        'cursor-not-allowed': disabled,
      })}
      style={{ width: size, height: size }}
    >
      {checked && (
        <span
          className={cn('rounded-full', {
            'bg-primary-800': !disabled,
            'bg-gray-300': disabled,
          })}
          style={{
            width: `${size * 0.5}px`,
            height: `${size * 0.5}px`,
          }}
        />
      )}
    </span>
  )
}

const Basic = forwardRef<HTMLInputElement, RadioBasicProps>(function Basic(
  { size = 24, value, onChange, label, labelTypographyVariant = 'body3', labelClassName, className, ...props },
  ref,
) {
  const handleLabelClick = () => {
    if (!props.disabled && onChange) {
      onChange(value)
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!props.disabled) {
      ;``
      onChange?.(e.target.checked)
    }
  }
  return (
    <label
      onClick={handleLabelClick}
      className={cn(`flex items-center ${props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`)}
    >
      <input ref={ref} type="radio" value={value} className="sr-only" {...props} onChange={handleInputChange} />
      <RadioIndicator size={size} checked={props.checked} disabled={props.disabled} />
      {label && (
        <Typography
          variant={labelTypographyVariant}
          className={twMerge(cn({ 'cursor-not-allowed': props.disabled }, labelClassName))}
        >
          {label}
        </Typography>
      )}
    </label>
  )
})

const Box = forwardRef<HTMLInputElement, RadioBoxProps>(function Box(
  { type = 'large', size = 24, image, showImage = true, title, value, content, onChange, ...props },
  ref,
) {
  const handleLabelClick = () => {
    if (!props.disabled && onChange) {
      onChange(value)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!props.disabled) {
      ;``
      onChange?.(e.target.checked)
    }
  }

  if (type === 'medium') {
    return (
      <label
        onClick={handleLabelClick}
        className={cn(
          `flex w-full flex-row items-start gap-2 overflow-hidden rounded-lg border border-gray-200 px-4 py-[14px]`,
          props.checked && 'border-primary-400',
          props.disabled || 'cursor-pointer',
        )}
      >
        <RadioIndicator size={20} checked={props.checked} disabled={props.disabled} />
        <div className="flex flex-1 flex-col">
          {content && (
            <Typography variant="body2" className="text-[15px] font-medium text-gray-900">
              {content}
            </Typography>
          )}
        </div>

        <input ref={ref} type="radio" className="sr-only" value={value} onChange={handleInputChange} {...props} />
      </label>
    )
  }

  // 기본 type: large
  return (
    <label
      onClick={handleLabelClick}
      className={`flex w-full cursor-pointer flex-row items-center gap-4 rounded-xl border border-gray-200 p-6 shadow-[0_4px_8px_0_#F4F6F8] ${
        props.checked && 'border-primary-400 shadow-[0_4px_8px_0_#ffe8db]'
      } ${props.disabled && 'bg-gray-100'} overflow-hidden`}
    >
      {showImage && image && (
        <div className="h-12 w-12 overflow-hidden rounded-xl">
          <img src={image} alt="" className="rounded-xl object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {title && <Typography variant="title3">{title}</Typography>}
        {content && <Typography variant="body3">{content}</Typography>}
      </div>
      <input ref={ref} type="radio" className="sr-only" value={value} onChange={handleInputChange} {...props} />
      <RadioIndicator size={size} checked={props.checked} disabled={props.disabled} />
    </label>
  )
})

const Label = forwardRef<HTMLInputElement, RadioLabelProps>(function Box(
  { size = 24, title, value, onChange, currentNum, TotalNum, type = 'count', ...props },
  ref,
) {
  const handleLabelClick = () => {
    if (!props.disabled && onChange) {
      onChange(value)
    }
  }
  return (
    <label
      onClick={handleLabelClick}
      className={`flex w-full cursor-pointer flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-[0_4px_8px_0_#F4F6F8] ${
        props.checked && 'border-primary-800 shadow-[0_4px_8px_0_#ffe8db]'
      } ${props.disabled && 'bg-gray-50'} overflow-hidden`}
    >
      <div className="flex flex-col justify-start gap-1">
        <Typography variant="body3" className="text-gray-700">
          {title}
        </Typography>
        <div className="flex flex-row items-end justify-start gap-2">
          <Typography variant="title1" className="font-semibold text-gray-900">
            {currentNum}
            {type === 'count' ? '명' : '개'}
          </Typography>
          <Typography variant="caption2" className="flex h-6 flex-col justify-center text-gray-500">
            /&nbsp;{TotalNum}
            {type === 'count' ? '명' : '개'}
          </Typography>
        </div>
      </div>
      <input ref={ref} type="radio" className="sr-only" value={value} {...props} />
    </label>
  )
})

const Chip = forwardRef<HTMLInputElement, RadioChipProps>(function Chip(
  { checked = false, disabled = false, onChange, label, ...props },
  ref,
) {
  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!disabled && onChange) {
      onChange(!checked as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <label
      onClick={handleLabelClick}
      className={`inline-flex h-10 items-center justify-center gap-2.5 rounded-lg px-4 py-[9px] ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked
          ? disabled
            ? 'bg-gray-400 text-white'
            : 'bg-gray-700 text-white'
          : disabled
            ? 'bg-gray-50 text-gray-400'
            : 'bg-gray-50 text-gray-700'
      }`}
    >
      <input ref={ref} type="checkbox" checked={checked} disabled={disabled} className="hidden" {...props} />
      <div className="w-max shrink grow basis-0 text-center font-['Pretendard'] text-[15px] leading-snug font-medium">
        {label}
      </div>
    </label>
  )
})

const Group = <T,>({ children, selectedValue, onChange, className }: RadioGroupProps<T>) => {
  const [selected, setSelected] = useState<T | undefined>(selectedValue)

  useEffect(() => {
    if (selectedValue !== undefined) {
      setSelected(selectedValue)
    }
  }, [selectedValue])

  const handleRadioChange = (value: T) => {
    setSelected(value)
    onChange?.(value)
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.props && typeof child.props === 'object' && 'value' in child.props
          ? React.cloneElement(
              child as React.ReactElement<{
                value: T
                checked?: boolean
                onChange?: () => void
              }>,
              {
                checked: child.props.value === selected,
                onChange: () => handleRadioChange((child.props as { value: T }).value),
              },
            )
          : child,
      )}
    </div>
  )
}

export const RadioV2 = {
  Basic,
  Box,
  Chip,
  Label,
  Group,
}
