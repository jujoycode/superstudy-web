import clsx from 'clsx'
import { forwardRef, ReactElement, useEffect, useRef, useState } from 'react'

import SVGIcon from '../icon/SVGIcon'
import { Input } from './Input'

export interface SearchSelectOptionProps {
  id: number
  value: any
  text?: string | ReactElement
}

interface SearchSelectProps {
  options: SearchSelectOptionProps[]
  value: any
  onChange: (value: any) => void
  placeholder?: string
  readonly?: boolean
  disabled?: boolean
  className?: string
}

const SearchSelect = forwardRef<HTMLDivElement, SearchSelectProps>(
  ({ options, value, onChange, placeholder = '선택', readonly = false, disabled = false, className }, ref) => {
    const [isShowOptions, setShowOptions] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleOptionClick = (selectedValue: string) => {
      onChange(selectedValue)
      setShowOptions(false)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowOptions(false)
      }
    }

    const handleCancel = () => {
      onChange(null)
      setSearchTerm('')
    }

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const text = options.find((o) => o.value === value)?.text as string

    const filteredOptions = options.filter((option) =>
      option.text?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
      <div
        ref={ref}
        className={clsx(
          'relative select-none',
          {
            'cursor-not-allowed bg-gray-100': readonly || disabled,
          },
          className,
        )}
      >
        <div
          ref={dropdownRef}
          tabIndex={readonly || disabled ? -1 : 0}
          onClick={!readonly && !disabled && !value ? () => setShowOptions(!isShowOptions) : undefined}
          className={`flex w-full items-center justify-between gap-2 focus:outline-none ${
            readonly || disabled || value ? '' : 'cursor-pointer'
          }`}
        >
          <Input.Select
            value={text || searchTerm}
            selectId={value}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full"
            size={40}
            isSearch={true}
            onCancel={handleCancel}
          />
        </div>
        {isShowOptions && (
          <ul
            className={clsx(
              'absolute top-full left-0 z-60 mt-2 max-h-[236px] w-full overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white p-1.5 shadow-md',
            )}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-2.5 py-1.5 text-gray-900">일치하는 선생님이 존재하지 않습니다.</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleOptionClick(option.value)
                  }}
                  className={clsx(
                    {
                      'text-primary-800 flex items-center justify-between': option.value === value,
                    },
                    `cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-gray-900 hover:bg-gray-100`,
                  )}
                  aria-selected={option.value === value}
                >
                  {option.value === value ? (
                    <>
                      {option.text || option.value}
                      <SVGIcon.Check color="orange800" weight="bold" size={16} />
                    </>
                  ) : (
                    option.text || option.value
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    )
  },
)

SearchSelect.displayName = 'SearchSelect'

export default SearchSelect
