import clsx from 'clsx';
import { forwardRef, ReactElement, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import SVGIcon from '../icon/SVGIcon';

export interface TimePickerOptionProps {
  id: number;
  value: any;
  text?: string | ReactElement;
}

interface TimePickerProps {
  options: TimePickerOptionProps[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  size?: 32 | 40 | 48;
  readonly?: boolean;
  disabled?: boolean;
  className?: string;
  fixedHeight?: boolean; // li 태그의 높이를 고정할 수 있는 prop
  containerWidth?: string; // 외부에서 div의 너비를 설정할 수 있는 prop
  dropdownWidth?: string; // ul의 너비를 설정할 수 있는 prop
  priorityFontClass?: string; // label의 최종 스타일을 설정할 수 있는 prop
}

const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = '선택',
      size = 32,
      readonly = false,
      disabled = false,
      containerWidth = 'w-full',
      dropdownWidth,
      fixedHeight = false,
      className,
      priorityFontClass,
    },
    ref,
  ) => {
    const [isShowOptions, setShowOptions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const computedDropdownWidth = dropdownWidth || containerWidth;

    const handleOptionClick = (selectedValue: string) => {
      onChange(selectedValue);
      setShowOptions(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const text = options.find((o) => o.value === value)?.text;

    return (
      <div
        ref={ref}
        className={clsx(
          'relative select-none',
          containerWidth,
          {
            'cursor-not-allowed bg-primary-gray-100': (readonly || disabled) && !(size === 48 && readonly),
          },
          className,
        )}
      >
        <div
          ref={dropdownRef}
          tabIndex={readonly || disabled ? -1 : 0}
          onClick={!readonly && !disabled ? () => setShowOptions(!isShowOptions) : undefined}
          onFocus={!readonly && !disabled ? handleFocus : undefined}
          onBlur={!readonly && !disabled ? handleBlur : undefined}
          className={`flex w-full items-center justify-between gap-2 focus:outline-none ${
            readonly || disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <label
            className={twMerge(
              clsx(
                {
                  'text-primary-gray-400': disabled || (!readonly && !value), // 비활성 상태이거나 선택된 값이 없는 경우
                  'text-primary-gray-700': readonly && size === 48, // readonly이면서 size가 48일 때
                  'text-primary-gray-900': (readonly && size !== 48) || (!readonly && value), // readonly에서 size가 48이 아니거나 값이 있는 경우
                },
                { 'cursor-not-allowed': readonly || disabled },
                readonly || disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              ),
              priorityFontClass,
            )}
          >
            {text || value || placeholder}
          </label>
        </div>
        {isShowOptions && (
          <ul
            className={clsx(
              'absolute left-0 top-full z-60 mt-2 overflow-hidden rounded-lg border border-primary-gray-200 bg-white p-1.5 shadow-md',
              computedDropdownWidth,
              {
                'max-h-[236px] overflow-y-auto': size === 32,
                'max-h-[250px] overflow-y-auto': size === 40,
                'max-h-[264px] overflow-y-auto': size === 48,
              },
            )}
          >
            {options.map((option) => (
              <li
                key={option.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOptionClick(option.value);
                }}
                className={clsx(
                  {
                    'flex items-center justify-between text-primary-orange-800': option.value === value,
                  },
                  `cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-primary-gray-900 hover:bg-primary-gray-100 ${
                    fixedHeight && 'flex h-16 items-center'
                  }`,
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
            ))}
          </ul>
        )}
      </div>
    );
  },
);

TimePicker.displayName = 'TimePicker';

export default TimePicker;
