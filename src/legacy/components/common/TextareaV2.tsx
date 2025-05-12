import clsx from 'clsx';
import { ChangeEvent, TextareaHTMLAttributes, forwardRef, useEffect, useState } from 'react';
import { cn } from 'src/lib/tailwind-merge';
import { Typography } from './Typography';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showWordCount?: boolean;
  showLength?: boolean;
  maxLength?: number;
  displayMaxLength?: number;
  onWordCountChange?: (count: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  readonlyBackground?: 'bg-white' | 'bg-primary-gray-100';
  wrapperClassName?: string;
  textareaClassName?: string;
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
  const [inputValue, setInputValue] = useState(value || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (inputValue !== value) setInputValue(value || ''); // 외부 value와 동기화
  }, [value]);

  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // 글자수 제한 처리
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
      // 이벤트 객체 업데이트
      e.target.value = newValue;
    }

    // 단어 수 계산 및 콜백 실행
    if (showWordCount && onWordCountChange) {
      const text = newValue.trim();
      const words = text ? text.split(/\s+/).filter((word) => word.length > 0) : [];
      onWordCountChange(words.length);
    }

    setInputValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    if (typeof inputValue === 'string' && displayMaxLength && inputValue.length > displayMaxLength) {
      setIsError(true);
      setErrorMessage('입력 가능한 글자 수를 초과하였습니다.');
    } else {
      setIsError(false);
      setErrorMessage('');
    }
  }, [inputValue]);

  return (
    <div>
      <div
        className={cn(
          clsx(
            className,
            'relative flex flex-col justify-between gap-4 rounded-lg border border-primary-gray-200 p-4 focus:outline-none focus:ring-0',
            {
              'bg-primary-gray-100': (readonly && readonlyBackground === 'bg-primary-gray-100') || disabled,
              'cursor-not-allowed': readonly || disabled,
              'cursor-pointer': !readonly && !disabled,
              'border-primary-gray-700': isFocused,
              [readonlyBackground]: readonly && readonlyBackground,
              'border-system-error-800': isError,
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
            clsx(
              `h-full min-h-max w-full resize-none border-none p-0 text-15 font-medium text-primary-gray-900 placeholder-primary-gray-400 caret-primary-blue-800 read-only:pointer-events-none focus:text-primary-gray-700 focus:outline-none focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400`,
              {
                'bg-primary-gray-100': (readonly && readonlyBackground === 'bg-primary-gray-100') || disabled,
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
          <div className="flex flex-row items-center text-12">
            <p className="text-primary-gray-500">단어 수</p>&nbsp;
            <p className="font-medium text-primary-orange-800">
              <p className="font-medium text-primary-orange-800">
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
          <div className="flex flex-row items-center text-12">
            <Typography
              variant="caption"
              className={clsx('text-primary-gray-400', { 'text-system-error-800': isError })}
            >
              {typeof inputValue === 'string' && new Intl.NumberFormat().format(inputValue.length)}
              {typeof maxLength === 'number' && <> / {new Intl.NumberFormat().format(maxLength)}</>}
              {typeof displayMaxLength === 'number' && <> / {new Intl.NumberFormat().format(displayMaxLength)}</>}
            </Typography>
          </div>
        )}
      </div>
      {errorMessage && <p className="text-sm text-system-error-800">{errorMessage}</p>}
    </div>
  );
});
