import { useState } from 'react'
import { useFieldtripResultUpdateResultByTeacher } from '@/legacy/generated/endpoint'
import { UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import type { ImageObject } from '@/legacy/types/image-object'
import type { errorType } from '@/legacy/types'

type UseTeacherFieldtripResultUpdateProps = {
  fieldtripId?: number
  reportedAt: string
  destination: string
  overseas: boolean
  resultText: string
  resultTitle: string
  updateReason: string
  setReadState: () => void
  resultFiles: string[]
}

export function useTeacherFieldtripResultUpdate({
  fieldtripId,
  reportedAt,
  destination,
  overseas,
  resultText,
  resultTitle,
  updateReason,
  setReadState,
  resultFiles,
}: UseTeacherFieldtripResultUpdateProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const { handleUploadFile } = useFileUpload()

  const [resultReportedAt, setResultReportedAt] = useState(reportedAt)

  const { imageObjectMap, handleImageAdd, toggleImageDelete } = useImageAndDocument({ images: resultFiles })

  const { mutate: updateFieldtripResultByTeacher } = useFieldtripResultUpdateResultByTeacher({
    mutation: {
      onSuccess: async () => {
        await setReadState()
      },
    },
  })

  async function uploadFiles({ imageObjectMap: _imageObjectMap }: { imageObjectMap: Map<number, ImageObject> }) {
    // file image 처리
    const imageFiles = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['fieldtrips/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    const allImageNames = [...imageUrlNames, ...imageFileNames]

    if (!fieldtripId) return
    updateFieldtripResultByTeacher({
      id: fieldtripId,
      data: {
        destination,
        overseas,
        resultReportedAt,
        resultText,
        resultTitle,
        updateReason,
        resultFiles: allImageNames,
      },
    })
  }

  const { isLoading } = useFieldtripResultUpdateResultByTeacher({
    mutation: {
      onSuccess: () => {
        alert('체험학습 결과보고서를 수정하였습니다.')
        setReadState()
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  return {
    errorMessage,
    updateFieldtripResultByTeacher,
    resultReportedAt,
    setResultReportedAt,
    isLoading,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    uploadFiles,
  }
}
