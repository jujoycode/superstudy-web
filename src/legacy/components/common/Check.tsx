import React, { forwardRef, InputHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/utils/commonUtil'

import { Typography } from './Typography'

interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  size?: 24 | 20 | 16
}

interface CheckBoxProps extends CheckProps {
  label: string
}

interface CheckGroupProps<T = any> {
  children: ReactNode
  selectedValues?: T[]
  onChange?: (selectedValues: T[]) => void
  className?: string
}

const Basic = forwardRef<HTMLInputElement, CheckProps>(function Basic(
  { checked = false, disabled = false, onChange, size = 24, ...props },
  ref,
) {
  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.(e.target.checked)
    }
  }

  const renderIcon = () => {
    if (checked) {
      return disabled ? (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            className="fill-primary-400"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            className="fill-primary-800"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    } else {
      return disabled ? (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="#F4F6F8"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="#D8DBDF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17 2.5H7C4.51472 2.5 2.5 4.51472 2.5 7V17C2.5 19.4853 4.51472 21.5 7 21.5H17C19.4853 21.5 21.5 19.4853 21.5 17V7C21.5 4.51472 19.4853 2.5 17 2.5ZM7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="#D8DBDF"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="#D8DBDF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  }

  return (
    <label
      style={{
        display: 'inline-block',
        position: 'relative',
        width: size,
        height: size,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={handleLabelClick}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleInputChange}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          position: 'absolute',
        }}
        {...props}
      />
      {renderIcon()}
    </label>
  )
})

const Box = forwardRef<HTMLInputElement, CheckBoxProps>(function Box(
  { checked = false, disabled = false, onChange, size, label, value, ...props },
  ref,
) {
  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!disabled) {
      onChange?.(!checked)
    }
  }
  const renderIcon = () => {
    if (checked) {
      return disabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            className="fill-primary-400"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            className="fill-primary-800"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    } else {
      return disabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="#F4F6F8"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="#D8DBDF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17 2.5H7C4.51472 2.5 2.5 4.51472 2.5 7V17C2.5 19.4853 4.51472 21.5 7 21.5H17C19.4853 21.5 21.5 19.4853 21.5 17V7C21.5 4.51472 19.4853 2.5 17 2.5ZM7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="#D8DBDF"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="#D8DBDF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  }

  return (
    <label
      onClick={handleLabelClick}
      className={`flex items-center gap-2 rounded-lg border px-4 py-3.5 ${
        checked ? (disabled ? 'border-primary-100' : 'border-primary-400') : 'border-gray-200'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="hidden"
        value={value}
        {...props}
      />
      {renderIcon()}
      <Typography
        variant="body3"
        className={cn('font-medium break-words', checked && 'text-gray-900', !checked && disabled && 'text-gray-400')}
      >
        {label}
      </Typography>
    </label>
  )
})

const BoxNB = forwardRef<HTMLInputElement, CheckBoxProps>(function Box(
  { checked = false, disabled = false, onChange, size, label, value, ...props },
  ref,
) {
  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!disabled) {
      onChange?.(!checked)
    }
  }
  const renderIcon = () => {
    if (checked) {
      return disabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            className="fill-primary-400"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            className="fill-primary-800"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    } else {
      return disabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="#F4F6F8"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="#D8DBDF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17 2.5H7C4.51472 2.5 2.5 4.51472 2.5 7V17C2.5 19.4853 4.51472 21.5 7 21.5H17C19.4853 21.5 21.5 19.4853 21.5 17V7C21.5 4.51472 19.4853 2.5 17 2.5ZM7 1C3.68629 1 1 3.68629 1 7V17C1 20.3137 3.68629 23 7 23H17C20.3137 23 23 20.3137 23 17V7C23 3.68629 20.3137 1 17 1H7Z"
            fill="#D8DBDF"
          />
          <path
            d="M7 11.75L10.1464 14.8964C10.3417 15.0917 10.6583 15.0917 10.8536 14.8964L17 8.75"
            stroke="#D8DBDF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  }

  return (
    <label
      onClick={handleLabelClick}
      className={cn(
        'flex gap-1.5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        label && label.length > 20 ? 'items-start' : 'items-center',
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="hidden"
        value={value}
        {...props}
      />
      {renderIcon()}
      <Typography
        variant="body3"
        className={cn('font-medium break-words', checked && 'text-gray-900', !checked && disabled && 'text-gray-400')}
      >
        {label}
      </Typography>
    </label>
  )
})

const Chip = forwardRef<HTMLInputElement, CheckBoxProps>(function Check(
  { checked = false, disabled = false, onChange, label, ...props },
  ref,
) {
  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  return (
    <label
      onClick={handleLabelClick}
      className={`inline-flex h-10 items-center justify-center gap-2.5 rounded-lg border px-4 py-[9px] ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked
          ? disabled
            ? 'text-primary-400 border-[#ffd7c1] bg-[#ffe7db]'
            : 'border-primary-400 text-primary-800 bg-[#ffe7db]'
          : disabled
            ? 'border-[#e8eaec] bg-[#f4f6f8] text-[#c6cad1]'
            : 'border-[#e8eaec] bg-white text-[#4c5057]'
      }`}
    >
      <input ref={ref} type="checkbox" checked={checked} disabled={disabled} className="hidden" {...props} />
      <div className="shrink grow basis-0 text-center font-['Pretendard'] text-[15px] leading-snug font-medium">
        {label}
      </div>
    </label>
  )
})

const Group = <T,>({ children, selectedValues = [], onChange, className }: CheckGroupProps<T>) => {
  const handleCheckChange = (value: T, isChecked: boolean) => {
    const updatedSelected = isChecked ? [...selectedValues, value] : selectedValues.filter((item) => item !== value)

    onChange?.(updatedSelected)
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as ReactElement<{ value: T; onChange?: (isChecked: boolean) => void; checked?: boolean }>,
              {
                checked: selectedValues.includes((child as ReactElement<{ value: T }>).props.value),
                onChange: (isChecked: boolean) =>
                  handleCheckChange((child as ReactElement<{ value: T }>).props.value, isChecked),
              },
            )
          : child,
      )}
    </div>
  )
}

export const Check = {
  Basic,
  Box,
  BoxNB,
  Chip,
  Group,
}
