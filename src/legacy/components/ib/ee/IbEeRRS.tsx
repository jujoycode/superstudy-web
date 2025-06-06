import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useIBRRSCreate } from '@/legacy/container/ib-rrs-create'
import { RequestRRSDto, ResponseRRSDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'

import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { DocumentCard } from '../DocumentCard'
import { ImageCard } from '../ImageCard'
import { InputField } from '../InputField'

interface IbEeRRSProps {
  modalOpen: boolean
  setModalClose: () => void
  size?: 'medium' | 'large'
  projectId?: number
  RRSData?: ResponseRRSDto
  onSuccess: () => void
  type: 'create' | 'update'
  ablePropragation?: boolean
}

export function IbEeRRS({
  modalOpen,
  setModalClose,
  projectId,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbEeRRSProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const { addFiles, imageObjectMap, documentObjectMap, toggleDocumentDelete, toggleImageDelete } = useImageAndDocument(
    {},
  )
  const { handleUploadFile } = useFileUpload()
  const {
    control,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestRRSDto>()
  const title = watch('title')
  const { createIBRRS } = useIBRRSCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const onSubmit = async (data: RequestRRSDto) => {
    setIsSubmitLoading(true)
    try {
      const imageFiles = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['ib/rrs/images'], imageFiles)
      // file document 처리
      const documentFiles = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/rrs/files'], documentFiles)
      const _data = {
        ...data,
        files: documentFileNames,
        images: imageFileNames,
      }
      if (projectId !== undefined) {
        createIBRRS({ ibId: projectId, data: _data })
      }
    } finally {
      setIsSubmitLoading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black/50 ${
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
        <div className="backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
          <Typography variant="title1">RRS 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <form>
          <div className="scroll-box flex max-h-[608px] flex-col gap-3 overflow-auto pt-4 pb-8">
            <InputField name="title" control={control} placeholder="제목을 입력해주세요" />
            <InputField
              name="content"
              control={control}
              placeholder="내용을 입력해주세요"
              type="textarea"
              className="h-[362px]"
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

          <div className="backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-between border-t border-t-gray-100 bg-white/70 pt-6 pb-8">
            <label htmlFor="file-upload" className="allow-click cursor-pointer">
              <div className="flex h-12 min-w-[80px] items-center rounded-[8px] border border-gray-400 px-4 py-3 text-[16px] font-semibold text-gray-700 active:border-gray-100 active:bg-gray-400 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-200 disabled:text-gray-400">
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
        </form>
      </div>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`제안서가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  )
}
