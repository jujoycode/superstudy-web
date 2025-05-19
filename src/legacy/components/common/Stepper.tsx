import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { Typography } from './Typography'
import SVGIcon from '../icon/SVGIcon'

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
        className={clsx(
          'border-primary-gray-200 flex w-max flex-row items-center gap-1 overflow-hidden rounded-md border',
          {
            'bg-white': !disabled,
            'border-primary-gray-700': isFocused,
            'bg-primary-gray-100': disabled || readonly,
            'cursor-not-allowed': readonly || disabled,
            'cursor-pointer': !readonly && !disabled,
            'border-primary-red-800': isError,
          },
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <div
          className={clsx('border-r-primary-gray-200 flex h-8 w-8 items-center justify-center border-r', {
            'bg-primary-gray-100': number <= min,
            'cursor-not-allowed': number <= min,
          })}
        >
          <button
            onClick={handleMinusClick}
            disabled={disabled || readonly || number <= (range?.min || 0)}
            className={clsx({ 'cursor-not-allowed': readonly || disabled || number <= min })}
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
            className="text-primary-gray-700 caret-ib-blue-800 disabled:text-primary-gray-400 h-full w-full border-none bg-transparent p-0 text-center text-sm font-medium focus:ring-0 focus:outline-none"
          />
        </div>
        <div
          className={clsx('border-l-primary-gray-200 flex h-8 w-8 items-center justify-center border-l', {
            'bg-primary-gray-100': number >= max,
            'cursor-not-allowed': number >= max,
          })}
        >
          <button
            onClick={handlePlusClick}
            disabled={disabled || readonly}
            className={clsx({
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
        <Typography variant="body3" className="text-primary-red-800">
          {errorMessage}
        </Typography>
      )}
    </div>
  )
}

export default Stepper
