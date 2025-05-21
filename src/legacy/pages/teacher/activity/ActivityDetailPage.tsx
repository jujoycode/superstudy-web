import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'

import { ErrorBlank, SuperModal } from '@/legacy/components'
import { Badge, Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { useTeacherActivityDetail } from '@/legacy/container/teacher-activity-detail'
import { getFileNameFromUrl } from '@/legacy/util/file'

import { ActivityAddPage } from './ActivityAdd'

interface ActivityDetailPageProps {
  isUpdateState?: boolean
  setUpdateState?: (b: boolean) => void
  refetch?: () => void
}

export function ActivityDetailPage({ isUpdateState = false, setUpdateState, refetch }: ActivityDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const { activity, images, Pdfs, documents, viewerImages, errorMessage, handleActivityDelete } =
    useTeacherActivityDetail(Number(id), refetch)

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  if (errorMessage) return <ErrorBlank />

  if (isUpdateState) {
    return (
      <ActivityAddPage
        activityId={Number(id)}
        refetch={() => {
          if (refetch) refetch()
          if (setUpdateState) setUpdateState(false)
        }}
      />
    )
  }

  return (
    <div className="h-screen-8 md:h-screen-3 m-5 overflow-y-scroll rounded-lg border bg-white p-5">
      <SuperModal modalOpen={isDeleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            정말 해당 과제를 삭제하시겠습니까?
          </div>
          <Button.lg children="삭제하기" onClick={() => handleActivityDelete()} className="filled-primary" />
        </Section>
      </SuperModal>
      <div className="flex justify-between">
        <Badge children={activity?.subject} className="bg-light_orange text-brand-1" />
        <div className="font-base flex cursor-pointer space-x-4 text-gray-500">
          <div
            className="text-gray-700"
            onClick={() => {
              if (setUpdateState) {
                setUpdateState(true)
              }
            }}
          >
            수정
          </div>
          <div className="cursor-pointer text-red-400" onClick={() => setDeleteModalOpen(true)}>
            삭제
          </div>
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="mt-2 text-lg font-semibold">{activity?.title}</div>
        {activity?.endDate && (
          <div className="flex gap-1 text-sm font-normal text-red-400">
            <span className="font-semibold">마감기한</span>
            <Time date={activity.endDate} className="text-inherit" />
            <span>까지</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap">
        {activity?.groupActivities?.map((groupActivity) => (
          <span
            key={groupActivity.id}
            className="mr-2 mb-2 rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-500"
          >
            {groupActivity?.group?.name}
          </span>
        ))}
      </div>

      {activity?.isRecord && (
        <div className="bg-light_orange m-2 rounded-lg px-2 py-1 text-sm text-gray-500">
          <div className="text-sm">공통문구 : {activity.commonText} </div>
          <div className="text-sm">활동요약 : {activity.explainText} </div>
        </div>
      )}

      {activity?.type === 'SURVEY' ? (
        <>
          {/* <SurveyComponent content={activity?.content || '{}'} setContent={(data) => console.log(data)} btnHide /> */}
        </>
      ) : (
        <div>
          <Section className="px-0">
            <div className="grid w-full grid-flow-row grid-cols-3 gap-2">
              {images?.map((image: string, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveIndex(i)
                    setImagesModalOpen(true)
                  }}
                  className="w-full"
                >
                  <div className="aspect-5/3 rounded-sm bg-gray-50">
                    <LazyLoadImage
                      src={`${Constants.imageUrl}${image}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full rounded-sm object-cover"
                    />
                  </div>
                </div>
              ))}
              {Pdfs?.map((pdfFile: string) => {
                return (
                  <>
                    <div key={pdfFile}>
                      <div className="w-full">
                        <div className="relative aspect-5/3 rounded-sm bg-gray-50">
                          <PdfCard
                            fileUrl={`${Constants.imageUrl}${pdfFile}`}
                            visibleButton
                            onClick={() => {
                              setFocusPdfFile(`${Constants.imageUrl}${pdfFile}`)
                              setPdfModalOpen(true)
                            }}
                          ></PdfCard>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })}
            </div>
            <div>
              {documents?.map((fileUrl: string, index) => (
                <div
                  key={index}
                  className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2"
                >
                  <span>{getFileNameFromUrl(fileUrl)}</span>
                  <div className="text-lightpurple-4 min-w-max bg-white px-2">
                    <a
                      href={`${Constants.imageUrl}${fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      download={getFileNameFromUrl(fileUrl)}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="feedback_space mt-8 text-base break-all whitespace-pre-line text-gray-500">
              <Linkify>{activity?.content}</Linkify>
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
            <div className="absolute">
              <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
