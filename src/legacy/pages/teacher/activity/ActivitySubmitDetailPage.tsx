import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useUserStore } from '@/stores2/user'
import { ReactComponent as Arrow } from '@/assets/svg/arrow-up-circle.svg'
import { ErrorBlank } from '@/legacy/components'
import { CommentItem } from '@/legacy/components/CommentItem'
import { Badge, Blank, List, Section } from '@/legacy/components/common'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { useTeacherActivitySubmitDetail } from '@/legacy/container/teacher-activity-submit-detail'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

interface ActivitySubmitDetailPageProps {
  activityId: number
}

export function ActivitySubmitDetailPage({ activityId }: ActivitySubmitDetailPageProps) {
  const { me } = useUserStore()
  const { said } = useParams<{ said: string }>()

  const {
    text,
    setText,
    isLoading,
    activity,
    errorMessage,
    studentActivity,
    comments,
    handleCommentCreate,
    handleCommentDelete,
    handleCommentUpdate,
  } = useTeacherActivitySubmitDetail(activityId, Number(said))

  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

  // TODO merge 후 타입 보완
  const files: any[] = []
  if (studentActivity?.files) {
    try {
      studentActivity?.files.map((f: any) => files.push(f))
    } catch (err) {
      console.error(err)
    }
  }

  const images = studentActivity?.images.filter((image) => !isPdfFile(image)) || []
  const Pdfs = studentActivity?.images.filter((image) => isPdfFile(image)) || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const handleCommentCreateSubmit = () => {
    if (text === '') {
      alert('내용을 입력해주세요.')
      return
    }

    handleCommentCreate({ content: text, studentActivityId: Number(said) })
  }

  if (errorMessage) {
    return <ErrorBlank />
  }

  return (
    <>
      {isLoading && <Blank reversed />}
      <div className="h-screen-12 md:h-screen-4.5 relative overflow-x-hidden overflow-y-scroll border border-gray-100">
        <div className="bg-gray-50 p-4">
          <div className="flex justify-between">
            <Badge children={activity?.subject} className="bg-light_orange text-brand-1" />
            <div className="font-base space-x-5 text-gray-500"></div>
          </div>
          <div className="space-y-0.5">
            <div className="mt-2 text-lg font-semibold">{activity?.title}</div>
            <Time date={activity?.createdAt} />
            {activity?.endDate && (
              <div className="flex gap-1 text-sm font-normal text-red-400">
                <span className="font-semibold">마감기한</span>
                <Time date={activity.endDate} className="text-inherit" />
                <span>까지</span>
              </div>
            )}
          </div>
          {/* 스테이징에서는 설문조서명경우 내용을 보여주고 있지 않음 */}
          {activity?.type !== 'SURVEY' && <div className="mt-4 text-sm text-gray-500">{activity?.content}</div>}
        </div>
        <Section>
          {activity?.type === 'SURVEY' ? (
            studentActivity?.content && activity?.content ? (
              <>
                {/* <SurveyComponent
                content={activity?.content || '{}'}
                setContent={(c: string) => {}}
                display
                value={studentActivity.content}
              /> */}
              </>
            ) : (
              <></>
            )
          ) : (
            <>
              {images?.map((image: string, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveIndex(i)
                    setImagesModalOpen(true)
                  }}
                  className="w-full"
                >
                  <div className="aspect-5/3 rounded bg-gray-50">
                    <LazyLoadImage
                      src={`${Constants.imageUrl}${image}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full rounded object-cover"
                    />
                  </div>
                </div>
              ))}
              {Pdfs?.map((pdfFile: string) => {
                return (
                  <>
                    <div key={pdfFile}>
                      <div className="w-full">
                        <div className="relative aspect-5/3 rounded bg-gray-50">
                          <PdfCard
                            fileUrl={`${Constants.imageUrl}${pdfFile}`}
                            visibleButton
                            onClick={() => {
                              setFocusPdfFile(`${Constants.imageUrl}${pdfFile}`)
                              setPdfModalOpen(true)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )
              })}
              <div>
                {files?.map((fileUrl: string, index) => (
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

              <p className="mt-6">{studentActivity?.content}</p>
            </>
          )}
          {activity?.updatedAt &&
            studentActivity?.updatedAt &&
            studentActivity?.isSubmitted &&
            studentActivity.updatedAt !== activity?.updatedAt && (
              <div className="text-brandblue-1 mt-3">
                제출 완료 일시 :<Time date={studentActivity.updatedAt} className="text-16 text-inherit" /> (
                <Time date={studentActivity.updatedAt} formatDistanceToNow className="text-16 text-inherit" />)
              </div>
            )}
        </Section>
        <div>
          <div className="h-0.5 bg-gray-100"></div>
          <List>
            {comments?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                userId={me?.id || 0}
                updateComment={handleCommentUpdate}
                deleteComment={handleCommentDelete}
              />
            ))}
          </List>
        </div>
      </div>

      <div className="bottom-0 border-l border-gray-100 bg-white">
        <div className="top-0 h-0.5 bg-gray-100"></div>
        <div className="flex space-x-2 p-4">
          <SearchInput
            placeholder="내용을 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSearch={handleCommentCreateSubmit}
            className="w-full bg-gray-50 text-sm"
          />
          <Arrow className="h-10 w-10 cursor-pointer" onClick={handleCommentCreateSubmit} />
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
      <div className="absolute">
        <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
      </div>
    </>
  )
}
