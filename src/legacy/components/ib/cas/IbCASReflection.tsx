import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Blank } from '@/legacy/components/common'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useReflectionDiaryCreate } from '@/legacy/container/ib-cas'
import { RequestIBBasicContentDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'

import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { DocumentCard } from '../DocumentCard'
import { ImageCard } from '../ImageCard'
import { InputField } from '../InputField'

interface IbCASReflectionProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: (action: 'REFLECTION', data?: any) => void
  handleBack?: () => void
  ablePropragation?: boolean
}

export function IbCASReflection({
  modalOpen,
  setModalClose,
  onSuccess,
  handleBack,
  ablePropragation = false,
}: PropsWithChildren<IbCASReflectionProps>) {
  const { addFiles, imageObjectMap, documentObjectMap, toggleDocumentDelete, toggleImageDelete } = useImageAndDocument(
    {},
  )
  const { handleUploadFile } = useFileUpload()
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const {
    control,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestIBBasicContentDto>()
  const title = watch('title')
  const { createReflectionDiary, isLoading } = useReflectionDiaryCreate({
    onSuccess: (data) => {
      setModalClose()
      onSuccess('REFLECTION', data)
    },
    onError: (error) => {
      console.error('성찰일지 생성 중 오류 발생:', error)
    },
  })

  const onSubmit = async (data: RequestIBBasicContentDto) => {
    if (isLoading) return
    setIsSubmitLoading(true)

    try {
      const imageFiles = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['ib/activity/images'], imageFiles)
      // file document 처리
      const documentFiles = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/activity/files'], documentFiles)

      const _data = {
        ...data,
        files: documentFileNames,
        images: imageFileNames,
      }
      createReflectionDiary(_data)
    } finally {
      setIsSubmitLoading(false)
    }
  }
  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          const target = e.target as HTMLElement
          if (!target.closest('.allow-click')) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
      }}
    >
      {isSubmitLoading && <Blank />}
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">성찰일지 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div>
          <div className="scroll-box flex max-h-[608px] flex-col gap-3 overflow-auto pt-4 pb-8">
            <InputField name="title" control={control} placeholder="제목을 입력해주세요" />
            <InputField
              name="content"
              control={control}
              placeholder="현재 활동 상태를 스스로 점검하며 성찰해주세요."
              type="textarea"
              className="h-[308px]"
            />
            {/* <ImageNFileUpload multiple addFiles={addFiles} availableType={[fileType.ANY]} /> */}
            {[...imageObjectMap].length > 0 && (
              <div className="flex min-h-max w-full gap-3 overflow-x-auto">
                {[...imageObjectMap].map(([key, value]) => (
                  <ImageCard key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
                ))}
              </div>
            )}
            {[...documentObjectMap].length > 0 && (
              <div className="flex flex-wrap gap-2">
                {[...documentObjectMap].map(([key, value]) => (
                  <DocumentCard key={key} id={key} documentObjet={value} onDeleteClick={toggleDocumentDelete} />
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex h-[104px] justify-between border-t border-t-gray-100 bg-white/70 pt-6 pb-8 backdrop-blur-[20px]">
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
              이전
            </ButtonV2>
            <div className="flex flex-row items-center gap-3">
              <label htmlFor="file-upload" className="allow-click cursor-pointer">
                <div className="flex h-10 min-w-[64px] items-center rounded-[6px] border border-gray-400 px-3 text-[14px] font-medium text-gray-900 active:border-gray-100 active:bg-gray-400 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-200 disabled:text-gray-400">
                  파일 첨부하기
                </div>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  name="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    e.preventDefault()
                    const files = e.target.files
                    if (!files) return
                    addFiles(files, [fileType.ANY])
                  }}
                />
              </label>
              <ButtonV2
                type="submit"
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleSubmit(onSubmit)}
                disabled={!title}
              >
                저장하기
              </ButtonV2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
