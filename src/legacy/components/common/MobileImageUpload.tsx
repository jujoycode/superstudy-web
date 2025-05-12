import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';
import { ReactComponent as FileUploadImg } from 'src/assets/svg/upload-image.svg';

export interface MobileImageUploadProps extends InputHTMLAttributes<HTMLInputElement> {}

export function MobileImageUpload({ children, className, ...props }: MobileImageUploadProps) {
  return (
    <label className={clsx('image-upload', className)}>
      {children || (
        <>
          <FileUploadImg />
          <p className="text-sm text-brand-1">이미지를 선택해주세요. </p>
        </>
      )}
      <input type="file" accept=".png, .jpeg, .jpg" className="hidden" {...props} />
    </label>
  );
}
