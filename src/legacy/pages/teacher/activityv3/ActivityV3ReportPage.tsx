import { format } from 'date-fns'
import _ from 'lodash'
import { useMemo, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useParams } from 'react-router-dom'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { useHistory } from '@/hooks/useHistory'
import { StudentActivityDetail } from '@/legacy/components/activityv3/StudentActivityDetail'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { useActivityV3FindByGroupIds, useActivityV3FindOne } from '@/legacy/generated/endpoint'
import { StudentGroup } from '@/legacy/generated/model'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

export const ActivityV3ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { replace } = useHistory()
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { data: activityv3 } = useActivityV3FindOne(Number(id), undefined, {
    query: { enabled: !!id },
  })

  const { data } = useActivityV3FindByGroupIds(
    Number(id),
    { ids: activityv3?.groupActivityV3s?.map((el) => el.group.id) || [] },
    { query: { enabled: !!activityv3?.groupActivityV3s?.length, staleTime: 100000 } },
  )

  const sortStudentGroups = (studentGroups: StudentGroup[]) => {
    return studentGroups?.sort((a, b) => {
      const Agroup = a.user?.studentGroups?.[0]?.group
      const Bgroup = b.user?.studentGroups?.[0]?.group

      if (Agroup?.grade === Bgroup?.grade && Agroup?.klass === Bgroup?.klass) {
        return (a.user?.studentGroups?.[0]?.studentNumber || 0) - (b.user?.studentGroups?.[0]?.studentNumber || 0)
      } else if (Agroup?.grade === Bgroup?.grade) {
        return (a.user?.studentGroups?.[0]?.group?.klass || 0) - (b.user?.studentGroups?.[0]?.group?.klass || 0)
      } else {
        return (a.user?.studentGroups?.[0]?.group?.grade || 0) - (b.user?.studentGroups?.[0]?.group?.grade || 0)
      }
    })
  }

  const studentGroups = useMemo(() => {
    if (!data) return []
    return sortStudentGroups(_.chain(data).uniqBy('user.id').sortBy('groupId').value())
  }, [data])

  const viewerImages: ImageDecorator[] = []
  if (activityv3) {
    for (const image of activityv3.images) {
      if (isPdfFile(image) === false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  if (!activityv3) return <></>

  return (
    <div className="col-span-6">
      <div className="md:hidden">
        <TopNavbar title={activityv3.title} left={<BackButton />} />
      </div>
      <div className="h-screen-6 3xl:px-[208px] 3xl:pb-[128px] 3xl:pt-[64px] flex flex-col bg-gray-50 p-2 md:h-screen md:px-10 md:pt-10 md:pb-20">
        <div className="relative h-full">
          {/* 브레드크럼 */}
          <div className="absolute -top-6 left-0 flex h-6 items-center justify-evenly text-sm text-neutral-500">
            <p onClick={() => replace('/teacher/activityv3')} className="cursor-pointer">
              활동 기록
            </p>
            <div className="-rotate-90">
              <Icon.FillArrow />
            </div>
            <p onClick={() => replace(`/teacher/activityv3/${activityv3.id}`)} className="cursor-pointer">
              {activityv3?.title?.length >= 15 ? activityv3.title?.slice(0, 15) + '...' : activityv3.title || '활동명'}
            </p>
            <div className="-rotate-90">
              <Icon.FillArrow />
            </div>
            <p>활동 보고서</p>
          </div>
          <div className="3xl:px-30 3xl:py-20 h-full overflow-y-auto bg-white p-2 md:px-10 md:py-5">
            <div className="flex flex-col rounded-sm border-2 border-zinc-800">
              <div className="border-b border-neutral-200 px-10 pt-8 pb-8">
                <div className="flex items-baseline justify-between pb-4">
                  <h1 className="flex-1 text-2xl font-bold break-words whitespace-pre-line">
                    [{ACTIVITYV3_TYPE_KOR[activityv3.type]}] {activityv3.title}
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">활동 기간</div>
                    <div className="w-full text-sm">
                      {activityv3.startDate && format(new Date(activityv3.startDate), 'yyyy.MM.dd')} ~{' '}
                      {activityv3.endDate && format(new Date(activityv3.endDate), 'yyyy.MM.dd')}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">활동 설명</div>
                    <div className="w-full text-sm break-words whitespace-pre-line">{activityv3?.description}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">공통문구</div>
                    <div className="w-full text-sm break-words whitespace-pre-line">{activityv3?.commonText}</div>
                  </div>
                  {(activityv3.images?.length > 0 || activityv3.files?.length > 0) && (
                    <div className="flex items-start">
                      <div className="text-sm font-semibold whitespace-pre md:w-40">첨부파일</div>
                      <div className="w-full">
                        {!!activityv3.images?.length && (
                          <div className="grid w-full grid-flow-row grid-cols-6 gap-2 pb-2">
                            {activityv3.images?.map((image: string, i: number) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setActiveIndex(i)
                                  setImagesModalOpen(true)
                                }}
                                className="w-full"
                              >
                                <div className="aspect-square rounded-sm border border-neutral-200">
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${image}`}
                                    alt=""
                                    loading="lazy"
                                    className="object-fit h-full w-full rounded"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!!activityv3.files?.length && (
                          <div className="flex gap-1 pb-2">
                            {activityv3.files?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1"
                              >
                                <FileItemIcon />
                                <a
                                  className="ml-2 text-xs text-neutral-500"
                                  href={`${Constants.imageUrl}${fileUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={getFileNameFromUrl(fileUrl)}
                                >
                                  {getFileNameFromUrl(fileUrl)}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center px-10 py-5">
                <div className="text-sm font-semibold whitespace-pre md:w-40">전달 대상</div>
                <div className="flex w-full flex-wrap gap-1">
                  {_.chain(activityv3?.groupActivityV3s || [])
                    .sortBy(['group.grade', 'group.klass'])
                    .map((el) => (
                      <div
                        key={el.group?.id}
                        className="h-8 rounded-lg border border-stone-300 px-2 py-1 text-center whitespace-pre"
                      >
                        {el.group?.name}
                      </div>
                    ))
                    .value()}
                </div>
              </div>
            </div>

            {/* 활동보고서 상세 화면 */}
            {activityv3.hasStudentText && (
              <StudentActivityDetail activityv3={activityv3} studentGroups={studentGroups} />
            )}
          </div>
        </div>
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
