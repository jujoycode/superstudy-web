import { ChangeEvent, TextareaHTMLAttributes, forwardRef, useEffect, useState } from 'react'
import { cn } from '@/utils/commonUtil'

import { Typography } from './Typography'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showWordCount?: boolean
  showLength?: boolean
  maxLength?: number
  displayMaxLength?: number
  onWordCountChange?: (count: number) => void
  readonly?: boolean
  disabled?: boolean
  readonlyBackground?: 'bg-white' | 'bg-gray-100'
  wrapperClassName?: string
  textareaClassName?: string
}

export const TextareaV2 = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    value,
    showWordCount,
    showLength,
    maxLength,
    displayMaxLength,
    onChange,
    onWordCountChange,
    disabled = false,
    readonly = false,
    readonlyBackground = 'bg-white',
    wrapperClassName,
    textareaClassName,

    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState(value || '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (inputValue !== value) setInputValue(value || '') // 외부 value와 동기화
  }, [value])

  const [isFocused, setIsFocused] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value

    // 글자수 제한 처리
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength)
      // 이벤트 객체 업데이트
      e.target.value = newValue
    }

    // 단어 수 계산 및 콜백 실행
    if (showWordCount && onWordCountChange) {
      const text = newValue.trim()
      const words = text ? text.split(/\s+/).filter((word) => word.length > 0) : []
      onWordCountChange(words.length)
    }

    setInputValue(newValue)
    if (onChange) {
      onChange(e)
    }
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  useEffect(() => {
    if (typeof inputValue === 'string' && displayMaxLength && inputValue.length > displayMaxLength) {
      setIsError(true)
      setErrorMessage('입력 가능한 글자 수를 초과하였습니다.')
    } else {
      setIsError(false)
      setErrorMessage('')
    }
  }, [inputValue])

  return (
    <div>
      <div
        className={cn(
          cn(
            className,
            'relative flex flex-col justify-between gap-4 rounded-lg border border-gray-200 p-4 focus:ring-0 focus:outline-none',
            {
              'bg-gray-100': (readonly && readonlyBackground === 'bg-gray-100') || disabled,
              'cursor-not-allowed': readonly || disabled,
              'cursor-pointer': !readonly && !disabled,
              'border-gray-700': isFocused,
              [readonlyBackground]: readonly && readonlyBackground,
              'border--': isError,
            },
          ),
          wrapperClassName,
        )}
        onFocus={!readonly && !disabled ? handleFocus : undefined}
        onBlur={!readonly && !disabled ? handleBlur : undefined}
      >
        <textarea
          ref={ref}
          className={cn(
            cn(
              `text-15 caret-ib-blue-800 h-full min-h-max w-full resize-none border-none p-0 font-medium text-gray-900 placeholder-gray-400 read-only:pointer-events-none focus:text-gray-700 focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400`,
              {
                'bg-gray-100': (readonly && readonlyBackground === 'bg-gray-100') || disabled,
                'cursor-not-allowed': readonly || disabled,
                'cursor-pointer': !readonly && !disabled,
                [readonlyBackground]: readonly && readonlyBackground,
              },
            ),
            textareaClassName,
          )}
          readOnly={readonly}
          onChange={handleInputChange}
          disabled={disabled}
          value={inputValue}
          {...props}
        />
        {showWordCount && (
          <div className="text-12 flex flex-row items-center">
            <p className="text-gray-500">단어 수</p>&nbsp;
            <p className="text-primary-800 font-medium">
              <p className="text-primary-800 font-medium">
                {typeof inputValue === 'string' && inputValue.trim()
                  ? inputValue
                      .trim()
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  : 0}
              </p>
            </p>
          </div>
        )}
        {showLength && (
          <div className="text-12 flex flex-row items-center">
            <Typography variant="caption" className={cn('text-gray-400', { 'text--': isError })}>
              {typeof inputValue === 'string' && new Intl.NumberFormat().format(inputValue.length)}
              {typeof maxLength === 'number' && <> / {new Intl.NumberFormat().format(maxLength)}</>}
              {typeof displayMaxLength === 'number' && <> / {new Intl.NumberFormat().format(displayMaxLength)}</>}
            </Typography>
          </div>
        )}
      </div>
      {errorMessage && <p className="text-- text-sm">{errorMessage}</p>}
    </div>
  )
})
