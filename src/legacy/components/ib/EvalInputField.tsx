// ProposalInputField.tsx
import { InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

interface EvalInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  afterLabel?: string
  disabled?: boolean
  className?: string
}

export const EvalInputField = ({ label, afterLabel, className, disabled = false, ...props }: EvalInputFieldProps) => {
  return (
    <div
      className={twMerge(
        'focus:border-primary-800 flex h-12 w-full items-center space-x-2 rounded-md border border-gray-200 bg-white px-4 placeholder-gray-400 focus:ring-0',
        disabled && 'bg-gray-100 text-gray-400',
        className,
      )}
    >
      {label && <div className="whitespace-pre">{label}</div>}
      <input
        className="block w-full border-0 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400"
        disabled={disabled}
        {...props}
      />
      {afterLabel && <div className="whitespace-pre">{afterLabel}</div>}
    </div>
  )
}

interface ScoreEvalInputFieldProps {
  label?: string
  className?: string
  disabled?: boolean
  minScoreProps: InputHTMLAttributes<HTMLInputElement>
  maxScoreProps: InputHTMLAttributes<HTMLInputElement>
}

EvalInputField.Score = ({
  label,
  className,
  disabled = false,
  minScoreProps,
  maxScoreProps,
}: ScoreEvalInputFieldProps) => {
  return (
    <div
      className={twMerge(
        'focus:border-primary-800 flex h-12 w-full items-center justify-between space-x-2 rounded-md border border-gray-200 bg-white px-4 placeholder-gray-400 focus:ring-0',
        className,
      )}
    >
      {label && <div className="whitespace-pre">{label}</div>}
      <div className="flex items-center space-x-1">
        <input
          type="number"
          min={0}
          max={Number(maxScoreProps.value) || 99}
          disabled={disabled}
          className="block w-8 border-0 p-0 text-right focus:ring-0"
          {...minScoreProps}
        />
        <div className="whitespace-pre">점</div>
      </div>
      <div>~</div>
      <div className="flex items-center space-x-1">
        <input
          type="number"
          min={0}
          max={99}
          className="block w-8 border-0 p-0 text-right focus:ring-0"
          disabled={disabled}
          {...maxScoreProps}
        />
        <div className="whitespace-pre">점</div>
      </div>
    </div>
  )
}
