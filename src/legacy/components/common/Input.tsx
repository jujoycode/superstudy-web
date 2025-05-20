import { InputHTMLAttributes, forwardRef, useEffect, useState } from 'react'
import { cn } from '@/utils/commonUtil'

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
    <div className={cn('flex flex-col justify-start gap-1', className)}>
      <div
        className={cn(
          'relative flex items-center justify-between gap-2 border border-gray-200 focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border--': errorMessage,
            'border-gray-700': isFocused,
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
            cn(
              isSearch ? 'w-full flex-1' : 'w-full',
              `border-none p-0 ${readonly && size === 48 ? 'bg-white text-gray-700' : 'text-gray-900'} ${
                (disabled || readonly) && 'bg-gray-100'
              } caret-ib-blue-800 placeholder-gray-400 read-only:pointer-events-none focus:text-gray-700 focus:ring-0 focus:outline-none disabled:text-gray-400`,
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
            className={cn(
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
      {errorMessage && <p className="text-- text-sm">{errorMessage}</p>}
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
    <div className={cn('flex flex-col justify-start gap-1', className)}>
      <div
        className={cn(
          'relative flex items-center justify-between gap-2 border border-gray-200 focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled && !selectId,
            'border--': errorMessage,
            'border-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled && !selectId ? handleFocus : undefined}
        onBlur={!readonly && !disabled && !selectId ? handleBlur : undefined}
      >
        {selectId ? (
          <div className="flex cursor-pointer items-center gap-1 rounded-lg bg-gray-400 px-2 py-1 hover:bg-gray-600">
            <Typography variant="body3">{value}</Typography>
            <SVGIcon.Close color="white" size={10} weight="bold" onClick={onCancel} />
          </div>
        ) : (
          <input
            ref={ref}
            className={cn(
              cn(
                isSearch ? 'w-full flex-1' : 'w-full',
                `border-none p-0 ${readonly && size === 48 ? 'bg-white text-gray-700' : 'text-gray-900'} ${
                  (disabled || readonly) && 'bg-gray-100'
                } caret-ib-blue-800 placeholder-gray-400 read-only:pointer-events-none focus:text-gray-700 focus:ring-0 focus:outline-none disabled:text-gray-400`,
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
                className={cn({
                  'cursor-not-allowed': readonly || disabled,
                })}
              />
            ) : (
              <SVGIcon.Arrow color="gray700" rotate={270} size={16} />
            )}
          </>
        )}
      </div>
      {errorMessage && <p className="text-- text-sm">{errorMessage}</p>}
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
    <div className={cn('flex flex-col justify-start gap-1', className)}>
      <div
        className={cn(
          'relative flex items-center justify-between gap-2 border border-gray-200 focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border--': errorMessage,
            'border-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <Typography variant="body3" className={cn('min-w-max text-gray-500', labelClass)}>
          {label}
        </Typography>
        <input
          ref={ref}
          className={cn(
            cn(
              `w-full border-none p-0 ${readonly && size === 48 ? 'bg-white text-gray-700' : 'text-gray-900'} ${
                (disabled || readonly) && 'bg-gray-100'
              } caret-ib-blue-800 placeholder-gray-400 read-only:pointer-events-none focus:text-gray-700 focus:ring-0 focus:outline-none disabled:text-gray-400`,
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
          className={cn(
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
      {errorMessage && <p className="text-- text-sm">{errorMessage}</p>}
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
    <div className={cn('flex flex-col justify-start gap-1', className)}>
      <div
        className={cn(
          'relative flex items-center justify-end gap-2 border border-gray-200 focus:ring-0 focus:outline-none',
          {
            'bg-white': (!disabled && !readonly) || (readonly && size === 48),
            'bg-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border--': errorMessage,
            'border-gray-700': isFocused,
          },
          sizeClass,
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <input
          ref={ref}
          className={cn(
            cn(
              `w-full border-none p-0 text-right ${
                readonly && size === 48 ? 'bg-white text-gray-700' : 'text-gray-900'
              } ${
                (disabled || readonly) && 'bg-gray-100'
              } caret-ib-blue-800 placeholder-gray-400 read-only:pointer-events-none focus:text-gray-700 focus:ring-0 focus:outline-none disabled:text-gray-400`,
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
        <Typography variant="body3" className="min-w-max text-gray-500">
          {label}
        </Typography>
      </div>
      {errorMessage && <p className="text-- text-sm">{errorMessage}</p>}
    </div>
  )
})

export const Input = {
  Basic: InputBasic,
  Label: InputLabel,
  Scale: InputScale,
  Select: InputSelect,
}
