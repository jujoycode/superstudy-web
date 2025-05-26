import { forwardRef, InputHTMLAttributes, useEffect, useState } from 'react'
import { cn } from '@/utils/commonUtil'

import { Icon } from './icons'

interface PasswordInputToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  htmlId?: string
}

export const PasswordInputToggle = forwardRef<HTMLInputElement, PasswordInputToggleProps>(function PasswordInputToggle(
  { className, value, onChange, label, placeholder, htmlId, ...props },
  ref,
) {
  const [inputValue, setInputValue] = useState(value || '')
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    if (!inputValue) {
      setIsFocused(false)
    }
  }

  useEffect(() => {
    if (inputValue) {
      setIsFocused(true)
    }
  }, [inputValue])

  return (
    <div className="relative w-full">
      <label
        htmlFor={htmlId}
        className={cn(
          'absolute left-3 cursor-pointer text-gray-400 transition-all duration-75 md:left-4',
          isFocused || inputValue ? 'top-3 text-xs' : 'top-1/2 -translate-y-1/2 transform text-base',
        )}
      >
        {label}
      </label>
      <input
        id={htmlId}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'focus:border-primary-800 block w-full rounded-lg border border-gray-200 px-3 pt-7 pb-1 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 md:px-4 md:pt-7 md:pb-2',
          className,
        )}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={(isFocused && placeholder) || ''}
        {...props}
      />
      {inputValue && (
        <>
          <button
            type="button"
            className="absolute top-1/2 right-10 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <Icon.Show /> : <Icon.Hide />}
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
            onClick={handleClear}
          >
            <Icon.CloseFillGray className="cursor-pointer rounded-full" />
          </button>
        </>
      )}
    </div>
  )
})
