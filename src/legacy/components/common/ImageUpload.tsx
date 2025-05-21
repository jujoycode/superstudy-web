import { cn } from '@/utils/commonUtil'
import { InputHTMLAttributes } from 'react'

import { ReactComponent as FileUploadImg } from '@/assets/svg/upload-image.svg'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export interface ImageUploadProps extends InputHTMLAttributes<HTMLInputElement> {}

export function ImageUpload({ children, className, ...props }: ImageUploadProps) {
  const { t } = useLanguage()
  return (
    <label className={cn('image-upload', className)}>
      {children || (
        <>
          <FileUploadImg />
          <p className="text-primary-800 text-sm">{t('select_image_or_pdf')}</p>
        </>
      )}
      <input type="file" accept=".png, .jpeg, .jpg" className="hidden" {...props} />
    </label>
  )
}
