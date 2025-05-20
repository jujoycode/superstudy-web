import { cn } from '@/utils/commonUtil'
import { forwardRef, ReactElement, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import SVGIcon from '@/legacy/components/icon/SVGIcon'

export interface SelectBarOptionProps {
  id: number
  value: any
  text?: string | ReactElement
}

interface SelectBarProps {
  options: SelectBarOptionProps[]
  value: any
  onChange: (value: any) => void
  onConfirm: (mentorId: number) => void
  placeholder?: string
  size?: 32 | 40 | 48
  readonly?: boolean
  disabled?: boolean
  className?: string
  containerWidth?: string // 외부에서 div의 너비를 설정할 수 있는 prop
  dropdownWidth?: string // ul의 너비를 설정할 수 있는 prop
  priorityFontClass?: string // label의 최종 스타일을 설정할 수 있는 prop
}

const ConfirmSelectBar = forwardRef<HTMLDivElement, SelectBarProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = '선택',
      size = 32,
      readonly = false,
      onConfirm,
      disabled = false,
      containerWidth = 'min-w-max',
      dropdownWidth,
      className,
      priorityFontClass,
    },
    ref,
  ) => {
    const [isShowOptions, setShowOptions] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [tempValue, setTempValue] = useState(value)
    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const scrollableRef = useRef<HTMLUListElement>(null)

    const sizeClass =
      size === 32
        ? 'px-2.5 py-1.5 rounded-md h-8'
        : size === 40
          ? 'px-4 py-[9px] rounded-lg h-10'
          : size === 48
            ? 'px-4 py-3 rounded-lg h-12'
            : ''

    const iconClass = size === 32 ? 12 : 16
    const fontClass = size === 32 ? 'text-[14px] font-medium' : 'text-[15px] font-medium'
    const computedDropdownWidth = dropdownWidth || containerWidth

    const handleOptionClick = (selectedValue: string) => {
      setTempValue(selectedValue)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return
      if (scrollableRef.current && scrollableRef.current.contains(e.target as Node)) {
        return
      }
      if (!dropdownRef.current.contains(e.target as Node)) {
        setShowOptions(false)
      }
    }

    const handleCancel = () => {
      setTempValue(value)
      setShowOptions(false)
    }

    const handleConfirm = () => {
      onChange(tempValue)
      onConfirm(tempValue)
      setShowOptions(false)
    }

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const text = options.find((o) => o.value === value)?.text
    return (
      <div
        ref={ref}
        className={cn(
          'relative border border-gray-200 select-none',
          containerWidth,
          {
            'border-gray-700': isFocused,
            'cursor-not-allowed bg-gray-100': (readonly || disabled) && !(size === 48 && readonly),
            'bg-white': size === 48 && readonly, // size가 48이면서 readonly일 때 배경색을 white로 설정
          },
          sizeClass,
          className,
        )}
      >
        <div
          ref={dropdownRef}
          tabIndex={readonly || disabled ? -1 : 0}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!readonly && !disabled) {
              setShowOptions((prev) => !prev) // 드롭다운 상태 토글
            }
          }}
          onFocus={!readonly && !disabled ? handleFocus : undefined}
          onBlur={!readonly && !disabled ? handleBlur : undefined}
          className={`flex w-full items-center justify-between gap-2 ${
            readonly || disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <label
            className={twMerge(
              cn(
                fontClass, // 공통 폰트 클래스
                {
                  'text-gray-400': disabled || (!readonly && !value), // 비활성 상태이거나 선택된 값이 없는 경우
                  'text-gray-700': readonly && size === 48, // readonly이면서 size가 48일 때
                  'text-gray-900': (readonly && size !== 48) || (!readonly && value), // readonly에서 size가 48이 아니거나 값이 있는 경우
                },
                { 'cursor-not-allowed': readonly || disabled },
                readonly || disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              ),
              priorityFontClass,
            )}
          >
            {text || value || placeholder}
          </label>
          {isShowOptions ? (
            <SVGIcon.Arrow
              color="gray700"
              rotate={90}
              size={iconClass}
              className={cn({
                'cursor-not-allowed': readonly || disabled,
              })}
            />
          ) : (
            <SVGIcon.Arrow color="gray700" rotate={270} size={iconClass} />
          )}
        </div>
        {isShowOptions && (
          <div
            className={cn(
              'absolute top-full left-0 z-10 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md',
              computedDropdownWidth,
            )}
          >
            <ul
              ref={scrollableRef}
              className={cn('max-h-[264px] overflow-y-auto p-1.5', {
                'max-h-[236px]': size === 32,
                'max-h-[250px]': size === 40,
                'max-h-[264px]': size === 48,
              })}
            >
              {options.map((option) => (
                <li
                  key={option.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleOptionClick(option.value)
                  }}
                  className={cn(
                    {
                      'text-primary-800 flex items-center justify-between': option.value === tempValue,
                    },
                    'cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-gray-900 hover:bg-gray-100',
                    fontClass,
                  )}
                  aria-selected={option.value === tempValue}
                >
                  {option.value === tempValue ? (
                    <>
                      {option.text || option.value}
                      <SVGIcon.Check color="orange800" weight="bold" size={16} />
                    </>
                  ) : (
                    option.text || option.value
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-center gap-2 py-2">
              <ButtonV2 onClick={handleCancel} variant="solid" color="gray100" onMouseDown={(e) => e.stopPropagation()}>
                취소
              </ButtonV2>
              <ButtonV2
                variant="solid"
                color="orange800"
                onClick={handleConfirm}
                onMouseDown={(e) => e.stopPropagation()}
              >
                변경
              </ButtonV2>
            </div>
          </div>
        )}
      </div>
    )
  },
)

ConfirmSelectBar.displayName = 'ConfirmSelectBar'

export default ConfirmSelectBar
