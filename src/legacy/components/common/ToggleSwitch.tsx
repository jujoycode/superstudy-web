import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const ToggleSwitch = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <div className="px-2">
      <label className={`flex ${props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'} items-center`}>
        {/* <!— toggle —> */}
        <div className="relative">
          {/* <!— input —> */}
          <input ref={ref} type="checkbox" className={clsx('checkbox sr-only', className)} {...props} />
          {/* <!— line —> */}
          <div className={`block ${props.checked ? 'bg-brand-1' : 'bg-gray-300'} h-8 w-14 rounded-full`}></div>
          {/* <!— dot —> */}
          <div
            className={`dot absolute ${
              props.checked ? 'right-1' : 'left-1'
            } top-1 h-6 w-6 rounded-full bg-white transition`}
          ></div>
        </div>
      </label>
    </div>
  )
})
