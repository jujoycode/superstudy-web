import clsx from 'clsx'
import { forwardRef, PropsWithChildren } from 'react'
import { Controller } from 'react-hook-form'

import { ImageNFileUpload } from '@/legacy/components/common/ImageNFileUpload'
import { Input } from '@/legacy/components/common/Input'
import SelectBar from '@/legacy/components/common/SelectBar'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'

interface InputFieldProps {
  label?: string
  subLabel?: string
  name: string
  control: any
  placeholder?: string
  inputType?: string
  dropdownWidth?: string
  type?: 'input' | 'select' | 'textarea' | 'files' | 'input_label'
  options?: { id: number; value: string }[]
  size?: 40 | 32 | 48
  mode?: 'modal' | 'page'
  className?: string
  fixedHeight?: boolean
  inputLable?: string
  titleVariant?:
    | 'heading'
    | 'title1'
    | 'title2'
    | 'title3'
    | 'body1'
    | 'body2'
    | 'body3'
    | 'caption'
    | 'caption2'
    | 'caption3'
  titleClassName?: string
  readOnly?: boolean
  required?: boolean
}

export const InputField = forwardRef<HTMLDivElement, PropsWithChildren<InputFieldProps>>(
  (
    {
      label,
      inputLable,
      mode = 'modal',
      subLabel,
      name,
      control,
      placeholder,
      type = 'input',
      options,
      dropdownWidth,
      size = 40,
      className,
      fixedHeight = false,
      titleClassName,
      titleVariant = 'title3',
      readOnly = false,
      inputType,
      required = false,
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={clsx(
          'flex flex-col',
          { 'gap-3': (label || subLabel) && mode === 'modal' },
          { 'gap-4': mode === 'page' },
        )}
      >
        {(label || subLabel) && (
          <div className="flex flex-row items-center gap-1">
            {label && (
              <Typography variant={titleVariant} className={clsx('font-semibold', titleClassName)}>
                {label}
              </Typography>
            )}
            {subLabel && (
              <Typography variant={titleVariant} className="text-primary-800 font-semibold">
                {subLabel}
              </Typography>
            )}
            {required && <span className="text-primary-red-800">*</span>}
          </div>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) =>
            type === 'select' ? (
              <SelectBar
                dropdownWidth={dropdownWidth}
                options={options || []}
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder}
                fixedHeight={fixedHeight}
                size={size}
                disabled={readOnly}
              />
            ) : type === 'textarea' ? (
              <TextareaV2 className={className} placeholder={placeholder} {...field} readOnly={readOnly} />
            ) : type === 'files' ? (
              <ImageNFileUpload />
            ) : type === 'input_label' ? (
              <Input.Label
                label={inputLable}
                placeholder={placeholder}
                size={size}
                {...field}
                readOnly={readOnly}
                className={className}
              />
            ) : (
              <Input.Basic
                placeholder={placeholder}
                size={size}
                {...field}
                readOnly={readOnly}
                className={className}
                type={inputType}
              />
            )
          }
        />
      </section>
    )
  },
)
