import clsx from 'clsx'
import { ChangeEvent, useState, useRef } from 'react'

import ADDFILE from '@/assets/images/addfile.png'
import WRITE from '@/assets/images/write.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useImageAndDocument, fileType } from '@/legacy/hooks/useImageAndDocument'

interface InspectorButtonContainerProps {
  type: 'horizontal' | 'vertical'
  onTypeSelect: (type: 'upload' | 'input') => void
  onFileUpload: (files: File[]) => void
}

export default function InspectorButtonContainer({ type, onTypeSelect, onFileUpload }: InspectorButtonContainerProps) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertDescription, setAlertDescription] = useState<string | undefined>(undefined)
  const MAX_FILE_SIZE = 100 * 1024 * 1024
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { addFiles } = useImageAndDocument({})

  const buttonObject = {
    upload: {
      image: ADDFILE,
      title: '파일 업로드',
      description:
        '특수기호(%, &, ?, ~, +)가 포함된 파일명은 검사할 수 없으며,\nhwp, doc, docx, xls, xlsx, ppt, pptx, pdf 형식만\n업로드 가능합니다. (최대 100MB)',
    },
    input: {
      image: WRITE,
      title: '직접 입력',
      description: '최대 30,000자까지 직접 입력하여\n검사를 진행할 수 있습니다.',
    },
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 파일 형식 체크
    const validExtensions = ['hwp', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']
    const file = files[0]
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!extension || !validExtensions.includes(extension)) {
      setAlertMessage('지원하지 않는 파일 형식입니다')
      setAlertDescription('hwp, doc, docx, xls, xlsx, ppt, pptx, pdf 형식만 업로드 가능합니다.')
      return
    }

    // 파일 크기 체크
    if (file.size > MAX_FILE_SIZE) {
      setAlertMessage('파일 크기 초과')
      setAlertDescription('100MB 이하의 파일만 업로드 가능합니다.')
      return
    }

    // 특수문자 체크
    const hasSpecialChars = /[%&?~+]/.test(file.name)
    if (hasSpecialChars) {
      setAlertMessage('파일명 오류')
      setAlertDescription('특수기호(%, &, ?, ~, +)가 포함된 파일명은 검사할 수 없습니다.')
      return
    }

    // 파일 추가
    addFiles(files, [fileType.ANY])

    // File 객체 배열을 전달하여 상위 컴포넌트에서 활용할 수 있게 함
    onFileUpload(Array.from(files))
    onTypeSelect('upload')
  }

  const baseUI = (type: 'upload' | 'input', variant: 'horizontal' | 'vertical', onClick?: () => void) => {
    if (type === 'upload') {
      return (
        <div
          className={clsx(
            'flex h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-6 py-11 shadow-[0px_4px_8px_0px_#F4F6F8]',
            variant === 'horizontal' ? 'w-[416px]' : 'w-[368px]',
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-full w-full flex-col items-center justify-center">
            <img src={buttonObject[type].image} alt="add-file" className="h-[48px] w-[48px]" />
            <Typography variant="title3" className="mt-4 mb-2 text-gray-900">
              {buttonObject[type].title}
            </Typography>
            <Typography variant="caption" className="text-center text-gray-600">
              {buttonObject[type].description}
            </Typography>
            <input
              ref={(el) => {
                fileInputRef.current = el
              }}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".hwp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
            />
          </div>
        </div>
      )
    } else {
      return (
        <div
          className={clsx(
            'flex h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-6 py-11 shadow-[0px_4px_8px_0px_#F4F6F8]',
            variant === 'horizontal' ? 'w-[416px]' : 'w-[368px]',
          )}
          onClick={onClick}
        >
          <img src={buttonObject[type].image} alt="add-file" className="h-[48px] w-[48px]" />
          <Typography variant="title3" className="mt-4 mb-2 text-gray-900">
            {buttonObject[type].title}
          </Typography>
          <Typography variant="caption" className="text-center text-gray-600">
            {buttonObject[type].description}
          </Typography>
        </div>
      )
    }
  }

  return (
    <div
      className={clsx(
        'flex flex-col gap-6 rounded-xl bg-white',
        type === 'vertical' ? 'h-[600px] w-[416px]' : 'w-full',
        type === 'vertical' && 'p-6',
      )}
    >
      <Typography variant="title1" className="text-gray-900">
        {type === 'vertical' ? '검사하기' : '파일 업로드 또는 직접 입력하여 표절률을 검사해보세요'}
      </Typography>
      <div className={clsx('flex gap-4', type === 'vertical' && 'flex-col')}>
        {baseUI('upload', type)}
        {baseUI('input', type, () => onTypeSelect('input'))}
      </div>

      {alertMessage && (
        <AlertV2
          confirmText="확인"
          message={alertMessage}
          description={alertDescription}
          onConfirm={() => {
            setAlertMessage(null)
            setAlertDescription(undefined)
            if (fileInputRef.current) {
              fileInputRef.current.value = '' // 파일 입력 필드 초기화
            }
          }}
        />
      )}
    </div>
  )
}
