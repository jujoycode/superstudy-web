import { ChangeEvent, InputHTMLAttributes } from 'react'

import ADDFILE from '@/assets/images/addfile.png'
import { fileType } from '@/legacy/hooks/useImageAndDocument'

import { Typography } from './Typography'

export interface ImageNFileUploadProps extends InputHTMLAttributes<HTMLInputElement> {
  addFiles?: (files: FileList, availableType?: fileType[]) => void
  availableType?: fileType[]
}

export function ImageNFileUpload({ addFiles, availableType, onChange, ...props }: ImageNFileUploadProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    if (addFiles) {
      addFiles(files, availableType)
    }

    if (onChange) {
      onChange(event)
    }
  }

  return (
    <label
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-8"
    >
      <div className="h-12 w-12 px-[2.50px]">
        <img src={ADDFILE} className="h-12 w-[43px] object-cover" />
      </div>
      <Typography variant="body2">파일을 첨부해주세요</Typography>
      <input type="file" className="hidden" onChange={handleChange} {...props} /> {/* 커스텀 핸들러 사용 */}
    </label>
  )
}
