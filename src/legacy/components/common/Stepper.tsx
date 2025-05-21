import { cn } from '@/utils/commonUtil'
import { useEffect, useState } from 'react'

import SVGIcon from '../icon/SVGIcon'
import { Typography } from './Typography'

interface StepperProps {
  setNumber: (value: number) => void
  number: number
  readonly?: boolean
  disabled?: boolean
  range?: {
    min: number
    max: number
  }
  errorMessage?: string
}

const Stepper: React.FC<StepperProps> = ({
  number,
  setNumber,
  readonly = false,
  disabled = false,
  range,
  errorMessage = '범위에 맞게 입력해주세요',
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isError, setIsError] = useState(false)
  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const min = range?.min ?? 0
  const max = range?.max ?? Infinity

  const handleMinusClick = () => {
    if (number > min) {
      setNumber(number - 1)
    }
  }

  const handlePlusClick = () => {
    if (number < max) {
      setNumber(number + 1)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value === '') {
      setNumber(0)
    } else {
      const parsedValue = parseInt(value, 10)
      if (!isNaN(parsedValue)) {
        setNumber(parsedValue)
      }
    }
  }

  useEffect(() => {
    if (number < min || number > max) {
      setIsError(true)
    } else {
      setIsError(false)
    }
  }, [number, min, max])

  return (
    <div className="flex flex-col items-end justify-center gap-1">
      <div
        className={cn('flex w-max flex-row items-center gap-1 overflow-hidden rounded-md border border-gray-200', {
          'bg-white': !disabled,
          'border-gray-700': isFocused,
          'bg-gray-100': disabled || readonly,
          'cursor-not-allowed': readonly || disabled,
          'cursor-pointer': !readonly && !disabled,
          'border-old-primary-red-800': isError,
        })}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <div
          className={cn('flex h-8 w-8 items-center justify-center border-r border-r-gray-200', {
            'bg-gray-100': number <= min,
            'cursor-not-allowed': number <= min,
          })}
        >
          <button
            onClick={handleMinusClick}
            disabled={disabled || readonly || number <= (range?.min || 0)}
            className={cn({ 'cursor-not-allowed': readonly || disabled || number <= min })}
          >
            <SVGIcon.Minus
              size={16}
              color={`${disabled || readonly || number <= min ? 'gray400' : 'gray700'}`}
              weight="bold"
            />
          </button>
        </div>
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
          <input
            type="number"
            value={number}
            onChange={handleInputChange}
            readOnly={readonly}
            disabled={disabled}
            className="caret-old-primary-blue-800 h-full w-full border-none bg-transparent p-0 text-center text-sm font-medium text-gray-700 focus:ring-0 focus:outline-hidden disabled:text-gray-400"
          />
        </div>
        <div
          className={cn('flex h-8 w-8 items-center justify-center border-l border-l-gray-200', {
            'bg-gray-100': number >= max,
            'cursor-not-allowed': number >= max,
          })}
        >
          <button
            onClick={handlePlusClick}
            disabled={disabled || readonly}
            className={cn({
              'cursor-not-allowed': disabled || readonly || number >= max,
            })}
          >
            <SVGIcon.Plus
              size={16}
              color={`${disabled || readonly || number >= max ? 'gray400' : 'gray700'}`}
              weight="bold"
            />
          </button>
        </div>
      </div>
      {isError && (
        <Typography variant="body3" className="text-old-primary-red-800">
          {errorMessage}
        </Typography>
      )}
    </div>
  )
}

export default Stepper
