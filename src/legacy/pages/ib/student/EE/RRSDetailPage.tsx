import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useLocation, useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
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
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useRRSGetById } from '@/legacy/container/ib-rrs-findId'
import { useIBRRSUpdate } from '@/legacy/container/ib-rrs-update'
import { RequestRRSDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

interface LocationState {
  title: string
}

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export default function RRSDetailPage() {
  const history = useHistory()
  const location = useLocation()
  const projectTitle = location.state?.title as LocationState['title']

  const { id: idParam, rrsId: rrsIdParam } = useParams<{ id: string; rrsId: string }>()
  const id = Number(idParam)
  const rrsId = Number(rrsIdParam)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const { me } = useUserStore()
  const { data, isLoading } = useRRSGetById(id, rrsId)
  const { data: ibData } = useIBGetById(Number(id))
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
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

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
  const { updateIBRRS, isLoading: isUpdateLoading } = useIBRRSUpdate({
    onSuccess: () => {
      setAlertMessage(`RRS가\n저장되었습니다`)
    },
    onError: (error) => {
      console.error('RRS 업데이트 중 오류 발생:', error)
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: {},
  } = useForm<RequestRRSDto>({
    defaultValues: data,
  })

  const title = watch('title')

  const resetData = () => {
    reset(data) // react-hook-form 데이터 초기화
    setImageObjectMap(new Map(data?.images?.map((image, i) => [i, { image, isDelete: false }]) || []))
    setDocumentObjectMap(new Map(data?.files?.map((file, i) => [i, { document: file, isDelete: false }]) || []))
  }

  useEffect(() => {
    if (data) {
      resetData()
    }
  }, [data, reset])

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    resetData()
  }

  const onSubmit = async (data: RequestRRSDto) => {
    setIsSubmitLoading(true)

    try {
      const imageFiles = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['ib/rrs/images'], imageFiles)
      // url image 처리
      const imageUrlNames = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]
      const allImageNames = [...imageUrlNames, ...imageFileNames]
      // file document 처리
      const documentFiles = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/rrs/files'], documentFiles)
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
        updateIBRRS({ id: rrsId, ibId: id, data: _data })
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
      {(isLoading || isUpdateLoading) && <IBBlank />}
      {isSubmitLoading && <Blank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="dark_green" size={24} type="solid_strong" className="self-start px-[12.5px]">
                      EE
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular" className="self-start">
                      RRS
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      EE: `/ib/student/ee/${id}`,
                      'RRS 상세': `/ib/student/ee/${id}/rrs/${rrsId}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {projectTitle}
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
                    <div className="flex flex-col items-start gap-1 border-b border-b-gray-100 pb-6">
                      <Typography variant="title1">{data.title}</Typography>
                      <Typography variant="body3" className="text-gray-500">
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
                                className="flex h-12 w-max items-center gap-3 rounded-lg border border-gray-200 bg-white px-4"
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
                        {ibData?.status !== 'COMPLETE' && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={ibData?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/ee/${id}`, { type: 'RRS' })}
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
                  <Feedback
                    referenceId={rrsId}
                    referenceTable="RRS"
                    user={me}
                    useTextarea={ibData?.status !== 'COMPLETE'}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-gray-50"
      />
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
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
