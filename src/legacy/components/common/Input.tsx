import clsx from 'clsx'
import { InputHTMLAttributes, forwardRef, useEffect, useState } from 'react'

import { cn } from '@/legacy/lib/tailwind-merge'

import ColorSVGIcon from '../icon/ColorSVGIcon'
import SVGIcon from '../icon/SVGIcon'

import { Typography } from './Typography'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string
  size?: 32 | 40 | 48
  readonly?: boolean
  disabled?: boolean
  errorMessage?: string
  isSearch?: boolean
  label?: string
  type?: string
  onCancel?: () => void
  onSearch?: () => void
  inputClassName?: string
  onlyInput?: boolean
  selectId?: string | number
}

export const InputBasic = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className,
    value,
    size = 32,
    onChange,
    placeholder,
    disabled = false,
    readonly = false,
    errorMessage,
    onSearch,
    isSearch = false,
    inputClassName,
    type,
    onlyInput = false,
    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState(value || '')
  useEffect(() => {
    if (inputValue !== value) setInputValue(value || '') // 외부 value와 동기화
  }, [value])

  const [isFocused, setIsFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const sizeClass =
    size === 32
      ? 'px-2.5 py-1.5 rounded-md h-8'
      : size === 40
        ? 'px-4 py-[9px] rounded-lg h-10'
        : size === 48
          ? 'px-4 py-3 rounded-lg h-12'
          : ''

  const fontClass = size === 32 ? 'text-14' : 'text-15'
  const iconClass = size === 32 ? 16 : size === 40 ? 20 : 24
  const handleClear = () => {
    setInputValue('')
    if (onChange) {
      onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    if (type === 'number') {
      const numericValue = value.replace(/[^0-9.]/g, '')
      setInputValue(numericValue)

      if (onChange) {
        onChange({
          ...e,
          target: { ...e.target, value: numericValue },
        })
      }
    } else {
      setInputValue(value)
      if (onChange) {
        onChange(e)
      }
    }
    // setInputValue(e.target.value);
    // if (onChange) {
    //   onChange(e);
    // }
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className={clsx('flex flex-col justify-start gap-1', className)}>
      <div
        className={clsx(
          'border-primary-gray-200 relative flex items-center justify-between gap-2 border focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-primary-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border-system-error-800': errorMessage,
            'border-primary-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        {isSearch && (
          <div className="flex-shrink-0">
            <SVGIcon.Search color="gray700" weight="bold" size={20} onClick={onSearch} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            clsx(
              isSearch ? 'w-full flex-1' : 'w-full',
              `border-none p-0 ${
                readonly && size === 48 ? 'text-primary-gray-700 bg-white' : 'text-primary-gray-900'
              } ${
                (disabled || readonly) && 'bg-primary-gray-100'
              } placeholder-primary-gray-400 caret-primary-blue-800 focus:text-primary-gray-700 read-only:pointer-events-none focus:ring-0 focus:outline-none disabled:text-gray-400`,
              fontClass,
            ),
            inputClassName,
          )}
          value={inputValue}
          disabled={disabled}
          type={type}
          readOnly={readonly}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          placeholder={placeholder}
          {...props}
        />
        {onlyInput || (
          <button
            type="button"
            tabIndex={-1}
            className={clsx(
              'flex-shrink-0 transition-opacity duration-150',
              { 'invisible opacity-0': !isFocused || !inputValue },
              { 'visible opacity-100': isFocused && inputValue },
            )}
            onMouseDown={(e) => {
              e.preventDefault()
              handleClear()
            }}
          >
            <ColorSVGIcon.Close color="gray400" size={iconClass} />
          </button>
        )}
      </div>
      {errorMessage && <p className="text-system-error-800 text-sm">{errorMessage}</p>}
    </div>
  )
})
export const InputSelect = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className,
    value,
    size = 32,
    onChange,
    placeholder,
    disabled = false,
    readonly = false,
    errorMessage,
    onSearch,
    isSearch = false,
    inputClassName,
    type,
    selectId,
    onCancel,
    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState(value || '')
  useEffect(() => {
    if (inputValue !== value) setInputValue(value || '') // 외부 value와 동기화
  }, [value])

  const [isFocused, setIsFocused] = useState(false)
  const sizeClass =
    size === 32
      ? 'px-2.5 py-1.5 rounded-md h-8'
      : size === 40
        ? 'px-4 py-[9px] rounded-lg h-10'
        : size === 48
          ? 'px-4 py-3 rounded-lg h-12'
          : ''

  const fontClass = size === 32 ? 'text-14' : 'text-15'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    if (type === 'number') {
      const numericValue = value.replace(/[^0-9.]/g, '')
      setInputValue(numericValue)

      if (onChange) {
        onChange({
          ...e,
          target: { ...e.target, value: numericValue },
        })
      }
    } else {
      setInputValue(value)
      if (onChange) {
        onChange(e)
      }
    }
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className={clsx('flex flex-col justify-start gap-1', className)}>
      <div
        className={clsx(
          'border-primary-gray-200 relative flex items-center justify-between gap-2 border focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-primary-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled && !selectId,
            'border-system-error-800': errorMessage,
            'border-primary-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled && !selectId ? handleFocus : undefined}
        onBlur={!readonly && !disabled && !selectId ? handleBlur : undefined}
      >
        {selectId ? (
          <div className="bg-primary-gray-400 hover:bg-primary-gray-600 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1">
            <Typography variant="body3">{value}</Typography>
            <SVGIcon.Close color="white" size={10} weight="bold" onClick={onCancel} />
          </div>
        ) : (
          <input
            ref={ref}
            className={cn(
              clsx(
                isSearch ? 'w-full flex-1' : 'w-full',
                `border-none p-0 ${
                  readonly && size === 48 ? 'text-primary-gray-700 bg-white' : 'text-primary-gray-900'
                } ${
                  (disabled || readonly) && 'bg-primary-gray-100'
                } placeholder-primary-gray-400 caret-primary-blue-800 focus:text-primary-gray-700 read-only:pointer-events-none focus:ring-0 focus:outline-none disabled:text-gray-400`,
                fontClass,
              ),
              inputClassName,
            )}
            value={inputValue}
            disabled={disabled}
            type={type}
            readOnly={readonly}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            placeholder={placeholder}
            onFocus={isFocused ? handleFocus : undefined}
            {...props}
          />
        )}

        {isSearch && (
          <>
            {isFocused && !selectId ? (
              <SVGIcon.Arrow
                color="gray700"
                rotate={90}
                size={16}
                className={clsx({
                  'cursor-not-allowed': readonly || disabled,
                })}
              />
            ) : (
              <SVGIcon.Arrow color="gray700" rotate={270} size={16} />
            )}
          </>
        )}
      </div>
      {errorMessage && <p className="text-system-error-800 text-sm">{errorMessage}</p>}
    </div>
  )
})

export const InputLabel = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className,
    value,
    size = 32,
    onChange,
    placeholder,
    disabled = false,
    readonly = false,
    errorMessage,
    label,
    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState(value || '')
  useEffect(() => {
    if (inputValue !== value) setInputValue(value || '') // 외부 value와 동기화
  }, [value])

  const [isFocused, setIsFocused] = useState(false)
  const sizeClass =
    size === 32
      ? 'px-2.5 py-1.5 rounded-md h-8'
      : size === 40
        ? 'px-4 py-[9px] rounded-lg h-10'
        : size === 48
          ? 'px-4 py-3 rounded-lg h-12'
          : ''

  const fontClass = size === 32 ? 'text-14' : 'text-15'
  const labelClass = size === 32 ? 'w-16' : 'w-[92px]'
  const iconClass = size === 32 ? 16 : size === 40 ? 20 : 24
  const handleClear = () => {
    setInputValue('')
    if (onChange) {
      onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (onChange) {
      onChange(e)
    }
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className={clsx('flex flex-col justify-start gap-1', className)}>
      <div
        className={clsx(
          'border-primary-gray-200 relative flex items-center justify-between gap-2 border focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-primary-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border-system-error-800': errorMessage,
            'border-primary-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <Typography variant="body3" className={clsx('text-primary-gray-500 min-w-max', labelClass)}>
          {label}
        </Typography>
        <input
          ref={ref}
          className={cn(
            clsx(
              `w-full border-none p-0 ${
                readonly && size === 48 ? 'text-primary-gray-700 bg-white' : 'text-primary-gray-900'
              } ${
                (disabled || readonly) && 'bg-primary-gray-100'
              } placeholder-primary-gray-400 caret-primary-blue-800 focus:text-primary-gray-700 read-only:pointer-events-none focus:ring-0 focus:outline-none disabled:text-gray-400`,
              fontClass,
            ),
          )}
          value={inputValue}
          disabled={disabled}
          readOnly={readonly}
          onChange={handleChange}
          placeholder={placeholder}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className={clsx(
            'flex-shrink-0 transition-opacity duration-150',
            { 'invisible opacity-0': !isFocused || !inputValue },
            { 'visible opacity-100': isFocused && inputValue },
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            handleClear()
          }}
        >
          <ColorSVGIcon.Close color="gray400" size={iconClass} />
        </button>
      </div>
      {errorMessage && <p className="text-system-error-800 text-sm">{errorMessage}</p>}
    </div>
  )
})

export const InputScale = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className,
    value,
    size = 32,
    onChange,
    placeholder,
    disabled = false,
    readonly = false,
    errorMessage,
    label,
    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState(value || '')
  useEffect(() => {
    if (inputValue !== value) setInputValue(value || '') // 외부 value와 동기화
  }, [value])

  const [isFocused, setIsFocused] = useState(false)
  const sizeClass =
    size === 32
      ? 'px-2.5 py-1.5 rounded-md h-8'
      : size === 40
        ? 'px-4 py-[9px] rounded-lg h-10'
        : size === 48
          ? 'px-4 py-3 rounded-lg h-12'
          : ''

  const fontClass = size === 32 ? 'text-14' : 'text-15'
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (onChange) {
      onChange(e)
    }
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className={clsx('flex flex-col justify-start gap-1', className)}>
      <div
        className={clsx(
          'border-primary-gray-200 relative flex items-center justify-end gap-2 border focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-primary-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border-system-error-800': errorMessage,
            'border-primary-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <input
          ref={ref}
          className={cn(
            clsx(
              `w-full border-none p-0 text-right ${
                readonly && size === 48 ? 'text-primary-gray-700 bg-white' : 'text-primary-gray-900'
              } ${
                (disabled || readonly) && 'bg-primary-gray-100'
              } placeholder-primary-gray-400 caret-primary-blue-800 focus:text-primary-gray-700 read-only:pointer-events-none focus:ring-0 focus:outline-none disabled:text-gray-400`,
              fontClass,
            ),
          )}
          value={inputValue}
          disabled={disabled}
          readOnly={readonly}
          onChange={handleChange}
          placeholder={placeholder}
          {...props}
        />
        <Typography variant="body3" className="text-primary-gray-500 min-w-max">
          {label}
        </Typography>
      </div>
      {errorMessage && <p className="text-system-error-800 text-sm">{errorMessage}</p>}
    </div>
  )
})

export const Input = {
  Basic: InputBasic,
  Label: InputLabel,
  Scale: InputScale,
  Select: InputSelect,
}
