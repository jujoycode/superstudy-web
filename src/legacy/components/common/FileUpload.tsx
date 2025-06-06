import { ChangeEvent, InputHTMLAttributes, useState } from 'react'
import { cn } from '@/utils/commonUtil'

import { useLanguage } from '@/legacy/hooks/useLanguage'

export interface FileUploadProps extends InputHTMLAttributes<HTMLInputElement> {}

export function FileUpload({ children, className, ...props }: FileUploadProps) {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer?.files
    if (files && props.onChange) {
      props.onChange({ target: { files } } as ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div
      className={cn('file-upload', className, { dragging: isDragging })}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      <label className="text-primary-800 flex h-12 cursor-pointer items-center justify-center space-x-1">
        <span className="mb-1 text-2xl text-gray-500">+</span>
        <span className="text-sm">{t('select_file')}</span>
        <input type="file" multiple className="sr-only" {...props} />
      </label>
    </div>
  )
}
