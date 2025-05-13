import { format } from 'date-fns'
import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { Constants } from '@/legacy/constants'
import { useReferenceGetById } from '@/legacy/container/ib-coordinator'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export const IBStudentReferenceDetailPage = () => {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useReferenceGetById(Number(id))
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

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

  if (data === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      <div className="h-screen w-full">
        <IBLayout
          topContent={
            <div className="">
              <div className="h-[164px] w-full pt-16">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BadgeV2 color="gray" size={24} type="solid_strong">
                      자료실
                    </BadgeV2>
                    <BadgeV2 color="dark_green" size={24} type="solid_strong" className="px-[12.5px]">
                      EE
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      자료실: '/ib/student/reference',
                      '자료 상세': '',
                    }}
                  />
                </div>
                <div className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2">
                  <Typography variant="heading">EE 참고자료</Typography>
                </div>
              </div>
            </div>
          }
          hasContour={false}
          bottomContent={
            <div className="flex flex-grow flex-col py-6">
              <div className="flex min-h-[720px] flex-col justify-between rounded-xl bg-white p-6">
                <div className="flex flex-col">
                  <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                    <Typography variant="title1">{data.title}</Typography>
                    <Typography variant="body3" className="text-primary-gray-500">
                      {format(new Date(data.createdAt), 'yyyy.MM.dd')} · {data.writer.name}
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
                <footer className={`flex flex-row items-center justify-start`}>
                  <>
                    <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => push(`/ib/student/reference`)}>
                      목록 돌아가기
                    </ButtonV2>
                  </>
                </footer>
              </div>
            </div>
          }
          bottomBgColor="bg-gray-50"
        />
      </div>
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
