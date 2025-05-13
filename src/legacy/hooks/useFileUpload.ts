import { useState } from 'react'

import { imagesUploadImage, useImagesUploadImage } from '@/legacy/generated/endpoint'
import { UploadFileTypeEnum } from '@/legacy/generated/model'

export function useFileUpload() {
  const { isLoading: isUploadLoading } = useImagesUploadImage({})
  const [uploadProgress, setUploadProgress] = useState(0)

  async function handleUploadFile(uploadFileType: UploadFileTypeEnum, files: File[]) {
    const progressArray = Array(files.length).fill(0) // 각 파일의 진행률 배열

    try {
      const promises = files.map((file, index) =>
        imagesUploadImage(
          { file },
          { uploadFileType },
          {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                progressArray[index] = percentage

                const lowestProgress = Math.min(...progressArray)
                setUploadProgress(lowestProgress)
              }
            },
          },
        ),
      )
      return Promise.all(promises)
    } catch (error) {
      console.log(error)
      return []
    }
  }

  return { handleUploadFile, isUploadLoading, uploadProgress }
}
