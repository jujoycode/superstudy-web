import { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import Viewer from 'react-viewer'
import { type ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { CommentItem } from '@/legacy/components/CommentItem'
import { BottomFixed, Divider, Label, List, Section, Textarea } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { PdfCard } from '@/legacy/components/common/PdfCard'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { useStudentActivityDetailRead } from '@/legacy/container/student-activity-detail-read'
import { Activity, StudentActivity } from '@/legacy/generated/model'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

interface ActivityDetailReadPageProps {
  studentActivity?: StudentActivity
  activity?: Activity
  type?: string
  setSubmitState: () => void
  setLoading: (state: boolean) => void
  userId?: number
}

export function ActivityDetailReadPage({
  studentActivity,
  activity,
  type,
  setLoading,
  userId,
}: ActivityDetailReadPageProps) {
  const { text, setText, comments, handleCommentCreate, handleCommentUpdate, handleCommentDelete } =
    useStudentActivityDetailRead(studentActivity?.id || 0, setLoading)

  const handleCommentCreateSubmit = async () => {
    if (text === '') {
      alert('텍스트 내용을 입력해주세요.')
      return
    }

    handleCommentCreate({ content: text, studentActivityId: studentActivity?.id || 0 })
  }

  const files = studentActivity?.files || []
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

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

  if (!studentActivity) {
    return null
  }

  return (
    <>
      <Section className="bg-gray-50">
        {images?.map((image: string, i: number) => (
          <div key={image}>
            <div
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
          </div>
        ))}
        {Pdfs?.map((pdfFile: string, i: number) => {
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
                    ></PdfCard>
                  </div>
                </div>
              </div>
            </>
          )
        })}
        {files?.map((fileUrl: string, index) => (
          <div key={index} className="relative m-2 flex items-center justify-between overflow-x-hidden bg-white p-2">
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
        <div className="feedback_space break-all whitespace-pre-line">
          <Linkify>{activity?.content}</Linkify>
        </div>
        <div className="absolute">
          <Viewer
            visible={hasImagesModalOpen}
            rotatable
            noImgDetails
            scalable={false}
            images={viewerImages}
            onChange={(activeImage, index) => setActiveIndex(index)}
            onClose={() => setImagesModalOpen(false)}
            activeIndex={activeIndex}
          />
        </div>

        {activity?.isRecord && (
          <>
            <Label children="활동요약" />
            <div className="text-base font-semibold text-gray-600">{activity.explainText}</div>
            <Textarea value={studentActivity.summary} readOnly />
          </>
        )}
        {type === 'SURVEY' ? (
          <>
            {/* <SurveyComponent
              content={activity?.content || '{}'}
              setContent={(c: string) => {}}
              display
              value={studentActivity?.content}
            /> */}
          </>
        ) : (
          <div className="text-grey-3 whitespace-pre-line">{studentActivity?.content}</div>
        )}
        <Divider />
        {studentActivity?.updatedAt && activity?.updatedAt && studentActivity.updatedAt !== activity.updatedAt && (
          <div className="text-brandblue-1 mt-3">
            제출 완료 일시 : <Time date={studentActivity.updatedAt} className="text-16 text-inherit" /> (
            <Time date={studentActivity.updatedAt} formatDistanceToNow className="text-16 text-inherit" />)
          </div>
        )}
      </Section>
      <List>
        {comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userId={userId}
            updateComment={handleCommentUpdate}
            deleteComment={handleCommentDelete}
          />
        ))}
        <br />
        <br />
      </List>
      <BottomFixed>
        <div className="flex items-center space-x-2 px-5 py-2">
          <SearchInput
            placeholder="댓글은 담당 선생님께만 노출됩니다."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSearch={handleCommentCreateSubmit}
            className="w-full bg-gray-50 text-sm"
          />
          <Icon.Send onClick={handleCommentCreateSubmit} />
        </div>
      </BottomFixed>
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(activeImage, index) => setActiveIndex(index)}
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
