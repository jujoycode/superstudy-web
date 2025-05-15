import React, { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { Constants } from '@/legacy/constants'
import { useSessionCommentCreate } from '@/legacy/generated/endpoint'
import { ActivitySession, StudentActivitySession } from '@/legacy/generated/model'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'
import { useUserStore } from '@/stores/user'
import { BottomFixed, Divider, Section } from '../common'
import { SessionCommentItem } from './SessionCommentItem'
import { Button } from '../common/Button'
import { Icon } from '../common/icons'
import { PdfCard } from '../common/PdfCard'
import { SearchInput } from '../common/SearchInput'
import { Time } from '../common/Time'
import { SuperSurveyViewComponent } from '../survey/SuperSurveyViewComponent'

interface StudentActivitySessionDetailViewProps {
  activitySession: ActivitySession
  studentActivitySession?: StudentActivitySession
  changeSubmitView?: () => void
  isLoading?: boolean
  refetch?: () => void
}

export const StudentActivitySessionDetailView: React.FC<StudentActivitySessionDetailViewProps> = ({
  activitySession: activity,
  studentActivitySession: studentActivity,
  changeSubmitView,
  isLoading = false,
  refetch = () => {},
}) => {
  const now = new Date()
  const { me } = useUserStore()
  const [text, setText] = useState('')
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [, setPdfModalOpen] = useState(false)
  const [, setFocusPdfFile] = useState('')

  const { mutate: createSessionComment } = useSessionCommentCreate({
    mutation: {
      onSuccess: () => {
        refetch()
        setText('')
      },
    },
  })

  const images = studentActivity?.images || []
  const Pdfs = studentActivity?.images?.filter((image) => isPdfFile(image)) || []
  const files = studentActivity?.files || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const createComment = () => {
    if (!studentActivity) return
    createSessionComment({
      params: { sessionId: studentActivity?.id },
      data: { content: text },
    })
  }

  const isSubmitDate = !activity.startDate || now >= new Date(activity.startDate)
  const calculateIsSubmitHour = () => {
    const { submitStartHour, submitStartMinute, submitEndHour, submitEndMinute } = activity
    if (submitStartHour === -1 || submitStartMinute === -1 || submitEndHour === -1 || submitEndMinute === -1) {
      return true
    }
    if (submitStartHour === 0 && submitStartMinute === 0 && submitEndHour === 0 && submitEndMinute === 0) {
      return true
    }
    if (submitStartHour === null || submitStartMinute === null || submitEndHour === null || submitEndMinute === null) {
      return true
    }
    const start = new Date(now)
    start.setHours(submitStartHour, submitStartMinute, 0, 0)

    const end = new Date(now)
    end.setHours(submitEndHour, submitEndMinute, 0, 0)

    return now >= start && now < end
  }

  let surveyContent = {}
  try {
    surveyContent = JSON.parse(studentActivity?.content || '{}')
  } catch (err) {}

  return (
    <>
      <Section className="bg-gray-50">
        {activity.type === 'SURVEY' && (
          <SuperSurveyViewComponent
            surveyContent={activity?.surveyContent || '[]'}
            setContent={() => {}}
            content={surveyContent}
            readOnly
          />
        )}
        {images?.map((image: string, i: number) => (
          <div key={image}>
            <div
              onClick={() => {
                setActiveIndex(i)
                setImagesModalOpen(true)
              }}
              className="w-full"
            >
              <div className="aspect-square cursor-pointer rounded border border-neutral-200">
                <LazyLoadImage
                  src={`${Constants.imageUrl}${image}`}
                  alt=""
                  loading="lazy"
                  className="object-fit h-full w-full rounded"
                />
              </div>
            </div>
          </div>
        ))}
        {Pdfs?.map((pdfFile: string) => {
          return (
            <>
              <div key={pdfFile}>
                <div className="w-full">
                  <div className="relative">
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
        {files?.map((fileUrl: string, index) => (
          <div key={index} className="flex h-8 items-center space-x-2 rounded bg-stone-50 px-3 py-1">
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
        {activity.type !== 'SURVEY' && <p className="whitespace-pre-line">{studentActivity?.content}</p>}
        <Divider />
        {(!isSubmitDate || !calculateIsSubmitHour()) && (
          <div>
            {activity.startDate && (
              <div className="text-brandblue-1 mt-3">
                활동 시작 시간 : <Time date={activity.startDate} className="text-16 text-inherit" /> (
                <Time date={activity.startDate} formatDistanceToNow className="text-16 text-inherit" />)
              </div>
            )}
            {activity.submitStartHour !== undefined && (
              <div className="text-brandblue-1 mt-3">
                활동 시간대 : {activity.submitStartHour}시{' '}
                {activity.submitStartMinute < 0 ? 0 : activity.submitStartMinute}분부터 {activity.submitEndHour}시{' '}
                {activity.submitEndMinute < 0 ? 0 : activity.submitEndMinute}분까지
              </div>
            )}
          </div>
        )}
        {studentActivity?.isSubmitted && (
          <div>
            <div className="text-brandblue-1 mt-3">
              최초 제출 일시 : <Time date={studentActivity.createdAt} className="text-16 text-inherit" /> (
              <Time date={studentActivity.createdAt} formatDistanceToNow className="text-16 text-inherit" />)
            </div>
            <div className="mt-1 text-gray-500">
              마지막 수정 일시 : <Time date={studentActivity.updatedAt} className="text-16 text-inherit" /> (
              <Time date={studentActivity.updatedAt} formatDistanceToNow className="text-16 text-inherit" />)
            </div>
          </div>
        )}

        {changeSubmitView &&
          (!isSubmitDate ? (
            <Button.lg className="filled-gray-300 mt-4 w-full" children={'활동 시작 시간 전'} />
          ) : calculateIsSubmitHour() ? (
            <Button.lg className="filled-primary mt-4 w-full" children={'수정하기'} onClick={changeSubmitView} />
          ) : (
            <Button.lg className="filled-gray-300 mt-4 w-full" children={'활동 시간대가 아닙니다'} />
          ))}
      </Section>

      {/* 1:1 피드백 영역 */}
      <Section className="pb-16">
        {isLoading && <div className="bg-littleblack absolute inset-0">로딩 중...</div>}
        {studentActivity?.sessionComments
          ?.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1))
          ?.map((sessionComment) => (
            <SessionCommentItem
              key={sessionComment.id}
              me={me}
              sessionComment={sessionComment}
              refetch={() => refetch()}
            />
          ))}
      </Section>
      <BottomFixed className="bottom-16">
        <div className="flex items-center space-x-2 px-5 py-2">
          <SearchInput
            placeholder="댓글은 담당 선생님께만 노출됩니다."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSearch={createComment}
            className="w-full bg-gray-50 text-sm"
          />
          <Icon.Send onClick={createComment} />
        </div>
      </BottomFixed>
    </>
  )
}
