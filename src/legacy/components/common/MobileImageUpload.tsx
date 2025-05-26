import { InputHTMLAttributes } from 'react'

import { ReactComponent as FileUploadImg } from '@/assets/svg/upload-image.svg'
import { cn } from '@/utils/commonUtil'

export interface MobileImageUploadProps extends InputHTMLAttributes<HTMLInputElement> {}

export function MobileImageUpload({ children, className, ...props }: MobileImageUploadProps) {
  return (
    <label className={cn('image-upload', className)}>
      {children || (
        <>
          <FileUploadImg />
          <p className="text-primary-800 text-sm">이미지를 선택해주세요. </p>
        </>
      )}
      <input type="file" accept=".png, .jpeg, .jpg" className="hidden" {...props} />
    </label>
  )
}
