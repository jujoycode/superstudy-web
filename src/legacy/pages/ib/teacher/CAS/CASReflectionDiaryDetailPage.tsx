import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { Constants } from '@/legacy/constants'
import { useReflectionDiaryGetById, useReflectionDiaryUpdate } from '@/legacy/container/ib-cas'
import { RequestIBBasicContentUpdateDto } from '@/legacy/generated/model'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export const CASReflectionDiaryDetailPage = () => {
  const history = useHistory()
  const { id: idParam, studentId: studentIdParam } = useParams<{ id: string; studentId: string }>()
  const id = Number(idParam)
  const studentId = Number(studentIdParam)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { me } = useUserStore()
  const { data, isLoading } = useReflectionDiaryGetById(id, studentId || 0)
  const { setDocumentObjectMap, setImageObjectMap } = useImageAndDocument({
    images: data?.images,
    documents: data?.files,
  })
  const { isLoading: isUpdateLoading } = useReflectionDiaryUpdate({
    onSuccess: () => {
      setAlertMessage(`성찰일지가\n저장되었습니다`)
    },
    onError: (error) => {
      console.error('성찰일지 수정 중 오류 발생:', error)
    },
  })

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

  const { reset } = useForm<RequestIBBasicContentUpdateDto>({
    defaultValues: data,
  })

  useEffect(() => {
    if (data) {
      reset(data)
      setImageObjectMap(new Map(data.images?.map((image, i) => [i, { image, isDelete: false }]) || []))
      setDocumentObjectMap(new Map(data.files?.map((file, i) => [i, { document: file, isDelete: false }]) || []))
    }
  }, [data, reset, setImageObjectMap, setDocumentObjectMap])

  if (me == null || data === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || isUpdateLoading) && <IBBlank />}
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
          <div className="flex grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
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
                        <div className="grid w-full grow grid-flow-row grid-cols-6 gap-3">
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

                <footer className={`flex flex-row items-center justify-start`}>
                  <ButtonV2
                    size={40}
                    variant="solid"
                    color="gray100"
                    onClick={() => history.push(`/teacher/ib/cas/portfolio/${studentId}`)}
                  >
                    목록 돌아가기
                  </ButtonV2>
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
