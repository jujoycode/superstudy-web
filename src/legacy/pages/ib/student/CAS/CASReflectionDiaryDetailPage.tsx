import { format } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { DocumentCard } from '@/legacy/components/ib/DocumentCard'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { ImageCard } from '@/legacy/components/ib/ImageCard'
import { InputField } from '@/legacy/components/ib/InputField'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { Constants } from '@/legacy/constants'
import {
  useReflectionDiaryDelete,
  useReflectionDiaryGetById,
  useReflectionDiaryUpdate,
} from '@/legacy/container/ib-cas'
import { RequestIBBasicContentUpdateDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { meState } from '@/stores'

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export const CASReflectionDiaryDetailPage = () => {
  const history = useHistory()
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const me = useRecoilValue(meState)
  const { data, isLoading } = useReflectionDiaryGetById(id, me?.id || 0)
  const {
    addFiles,
    imageObjectMap,
    documentObjectMap,
    toggleDocumentDelete,
    toggleImageDelete,
    setDocumentObjectMap,
    setImageObjectMap,
  } = useImageAndDocument({
    images: data?.images,
    documents: data?.files,
  })
  const { handleUploadFile } = useFileUpload()
  const { updateReflectionDiary } = useReflectionDiaryUpdate({
    onSuccess: () => {
      setAlertMessage(`성찰일지가\n저장되었습니다`)
    },
    onError: (error) => {
      console.error('성찰일지 수정 중 오류 발생:', error)
    },
  })

  const { deleteReflectionDiary } = useReflectionDiaryDelete({
    onSuccess: () => {
      setConfirmOpen(!confirmOpen)
      history.push('/ib/student/portfolio', {
        alertMessage: `성찰일지가\n삭제되었습니다`,
      })
    },
    onError: (error) => {
      console.error('성찰일지 삭제 중 오류 발생:', error)
    },
  })

  const viewerImages: ImageDecorator[] = []
  if (data?.images) {
    for (const image of data.images) {
      if (isPdfFile(image) === false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  const [editMode, setEditMode] = useState<boolean>(false)
  const { control, handleSubmit, watch, reset } = useForm<RequestIBBasicContentUpdateDto>({
    defaultValues: data,
  })

  const title = watch('title')

  const resetData = useCallback(() => {
    reset(data)
    setImageObjectMap(new Map(data?.images?.map((image, i) => [i, { image, isDelete: false }]) || []))
    setDocumentObjectMap(new Map(data?.files?.map((file, i) => [i, { document: file, isDelete: false }]) || []))
  }, [reset, data, setImageObjectMap, setDocumentObjectMap])

  useEffect(() => {
    if (data) {
      resetData()
    }
  }, [data, resetData])

  const onSubmit = async (data: RequestIBBasicContentUpdateDto) => {
    setIsSubmitLoading(true)

    try {
      const imageFiles = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['ib/reflectiondiary/images'], imageFiles)
      // url image 처리
      const imageUrlNames = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]
      const allImageNames = [...imageUrlNames, ...imageFileNames]
      // file document 처리
      const documentFiles = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/reflectiondiary/files'], documentFiles)
      const documentUrlNames = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]
      const allDocumentNames = [...documentUrlNames, ...documentFileNames]
      const _data = {
        ...data,
        files: allDocumentNames,
        images: allImageNames,
      }
      if (id !== undefined) {
        updateReflectionDiary({ id: id, studentId: me?.id || 0, data: _data })
        setEditMode(!editMode)
      }
    } finally {
      setIsSubmitLoading(false)
    }
  }

  if (me == null || data === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      {isSubmitLoading && <Blank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="navy" size={24} type="solid_strong">
                      CAS
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      'CAS Portfolio': '/ib/student/portfolio',
                      '인터뷰 · 성찰 일지': `/ib/student/portfolio`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  인터뷰 · 성찰 일지
                </Typography>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
                {editMode ? (
                  <form>
                    <div className="scroll-box flex max-h-[608px] flex-col gap-3 overflow-auto pt-4 pb-8">
                      <InputField name="title" control={control} placeholder="제목을 입력해주세요" />
                      <InputField
                        name="content"
                        control={control}
                        placeholder="내용을 입력해주세요"
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
                            <DocumentCard
                              key={key}
                              id={key}
                              documentObjet={value}
                              onDeleteClick={toggleDocumentDelete}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col">
                    <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                      <Typography variant="title1">{data.title}</Typography>
                      <Typography variant="body3" className="text-primary-gray-500">
                        {format(new Date(data.createdAt), 'yyyy.MM.dd')}
                      </Typography>
                    </div>
                    <div className="pt-6">
                      <Typography variant="body1">
                        <Linkify componentDecorator={urlDecorator}>{data.content}</Linkify>
                      </Typography>
                    </div>
                    {!!data.images?.length || !!data.files?.length ? (
                      <div className="flex flex-col gap-4 py-10">
                        {/* 이미지 컨테이너 */}
                        {!!data.images?.length && (
                          <div className="grid w-full flex-grow grid-flow-row grid-cols-6 gap-3">
                            {data.images.map((image: string, i: number) => (
                              <div
                                key={i}
                                className="h-30 w-30"
                                onClick={() => {
                                  setActiveIndex(i)
                                  setImagesModalOpen(true)
                                }}
                              >
                                <div className="aspect-square cursor-pointer rounded-lg">
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${image}`}
                                    alt=""
                                    loading="lazy"
                                    className="object-fit h-full w-full rounded-lg"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 파일 컨테이너 */}
                        {!!data.files?.length && (
                          <div className="flex flex-col gap-3">
                            {data.files.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="border-primary-gray-200 flex h-12 w-max items-center gap-3 rounded-lg border bg-white px-4"
                              >
                                <SVGIcon.Link size={16} weight="bold" color="gray700" />
                                <button
                                  className="text-[15px] text-[#121316]"
                                  onClick={() =>
                                    downloadFile(`${Constants.imageUrl}${fileUrl}`, getFileNameFromUrl(fileUrl))
                                  }
                                >
                                  {getFileNameFromUrl(fileUrl)}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                <footer className={`flex flex-row items-center justify-between`}>
                  {editMode ? (
                    <>
                      <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                        취소
                      </ButtonV2>
                      <div className="flex flex-row items-center gap-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="border-primary-gray-400 text-primary-gray-900 active:border-primary-gray-100 active:bg-primary-gray-400 disabled:border-primary-gray-100 disabled:bg-primary-gray-200 disabled:text-primary-gray-400 flex h-10 min-w-[64px] items-center rounded-[6px] border px-3 text-[14px] font-medium disabled:cursor-not-allowed">
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
                          size={40}
                          variant="solid"
                          color="orange100"
                          onClick={handleSubmit(onSubmit)}
                          disabled={!title}
                        >
                          저장하기
                        </ButtonV2>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center gap-2">
                        <ButtonV2
                          size={40}
                          variant="outline"
                          color="gray400"
                          onClick={() => {
                            setEditMode(!editMode)
                            resetData()
                          }}
                        >
                          수정
                        </ButtonV2>
                        <ButtonV2
                          size={40}
                          variant="outline"
                          color="gray400"
                          onClick={() => setConfirmOpen(!confirmOpen)}
                        >
                          삭제
                        </ButtonV2>
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/portfolio`)}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1">진행기록</Typography>
                <div className="h-full w-full">
                  <Feedback referenceId={data.id} referenceTable="REFLECTION_DIARY" user={me} />
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
      />
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
      {confirmOpen && (
        <AlertV2
          message={`성찰일지를 삭제하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          description={`삭제 후 다시 되돌릴 수 없습니다.`}
          onCancel={() => setConfirmOpen(!confirmOpen)}
          onConfirm={() => deleteReflectionDiary({ id: data.id, studentId: me.id || 0 })}
        />
      )}
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(_, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  )
}
