import { format } from 'date-fns'
import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useLocation, useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { Constants } from '@/legacy/constants'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useRRSGetById } from '@/legacy/container/ib-rrs-findId'
import { downloadFile } from '@/legacy/util/download-image'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export default function RRSDetailPage() {
  const history = useHistory()
  const location = useLocation()

  const { ibId: idParam, rrsId: rrsIdParam } = useParams<{ ibId: string; rrsId: string }>()
  const id = Number(idParam)
  const rrsId = Number(rrsIdParam)

  const { me } = useUserStore()
  const { data: rrs } = useRRSGetById(id, rrsId)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const { student: locationStudentData } = location.state || {}

  const { data: ibData, klassNum: ibKlassNum } = useIBGetById(Number(id), {
    enabled: !locationStudentData,
  })
  const data = location.state?.data || ibData

  const viewerImages: ImageDecorator[] = []
  if (rrs?.images) {
    for (const image of rrs.images) {
      if (isPdfFile(image) === false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  const title = ibData?.tokOutline?.themeQuestion
  const klassNum = ibKlassNum

  if (me == null || ibData === undefined || rrs === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }
  return (
    <div className="col-span-6">
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="brown" size={24} type="solid_strong">
                      TOK
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      RRS
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/teacher/project',
                      'TOK 에세이': `/teacher/ib/tok/essay/${ibData.id}`,
                      'RRS 상세': `/teacher/ib/tok/rrs/${ibData.id}/detail/${rrsId}`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <Typography
                    variant="heading"
                    className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-900"
                  >
                    {title}
                  </Typography>
                  <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                    {klassNum} · {data?.leader?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
                <div className="flex flex-col">
                  <div className="flex flex-col items-start gap-1 border-b border-b-gray-100 pb-6">
                    <Typography variant="title1" className="text-gray-900">
                      {rrs.title}
                    </Typography>
                    <Typography variant="body3" className="text-gray-500">
                      {format(new Date(rrs.createdAt), 'yyyy.MM.dd')}
                    </Typography>
                  </div>
                  <div className="pt-6">
                    <Typography variant="body1">
                      <Linkify componentDecorator={urlDecorator}>{rrs.content}</Linkify>
                    </Typography>
                  </div>
                  {!!rrs.images?.length || !!rrs.files?.length ? (
                    <div className="flex flex-col gap-4 py-10">
                      {/* 이미지 컨테이너 */}
                      {!!rrs.images?.length && (
                        <div className="grid w-full flex-grow grid-flow-row grid-cols-6 gap-3">
                          {rrs.images.map((image: string, i: number) => (
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
                      {!!rrs.files?.length && (
                        <div className="flex flex-col gap-3">
                          {rrs.files.map((fileUrl: string, index) => (
                            <div
                              key={index}
                              className="flex h-12 w-max items-center gap-2 rounded-lg border border-gray-200 bg-white px-4"
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
                <footer className={`flex flex-row items-center justify-end`}>
                  <ButtonV2
                    size={40}
                    variant="solid"
                    color="gray100"
                    onClick={() => history.push(`/teacher/ib/tok/essay/${id}`, { type: 'RRS' })}
                  >
                    목록 돌아가기
                  </ButtonV2>
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1" className="text-gray-900">
                  진행기록
                </Typography>
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
