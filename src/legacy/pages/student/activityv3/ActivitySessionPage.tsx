import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useHistory, useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ReactComponent as FileItemIcon } from '@/legacy/assets/svg/file-item-icon.svg'
import { BackButton, List, ListItem, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Time } from '@/legacy/components/common/Time'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR, ACTIVITY_SESSION_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import {
  useActivitySessionFindByActivityV3Id,
  useActivityV3FindOne,
  useStudentActivityV3FindByStudent,
  useStudentActivityV3SaveStudentText,
} from '@/legacy/generated/endpoint'
import { ActivityType } from '@/legacy/generated/model'
import { meState, toastState } from '@/stores'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

export function ActivitySessionPage() {
  const { id } = useParams<{ id: string }>()
  const meRecoil = useRecoilValue(meState)

  const { push } = useHistory()
  const [toastMsg, setToastMsg] = useRecoilState(toastState)

  const { data: activityv3 } = useActivityV3FindOne(Number(id))
  const { data: studentActivityV3 } = useStudentActivityV3FindByStudent({ activityv3Id: Number(id) })

  const { data: activitySessions } = useActivitySessionFindByActivityV3Id({ activityv3Id: Number(id) })

  const { mutate: updateStudentText } = useStudentActivityV3SaveStudentText({
    mutation: {
      onSuccess: () => setToastMsg('활동 보고서가 저장되었습니다.'),
      onError: () => setToastMsg('오류가 발생했습니다. 잠시 후 다시 시도해주세요.'),
    },
  })

  const [studentText, setStudentText] = useState(studentActivityV3?.studentText || '')
  const [studentTextOpen, setStudentTextOpen] = useState(false)
  const [isUpdateView, setUpdateView] = useState(false)

  useEffect(() => {
    if (!studentText) {
      setStudentText(studentActivityV3?.studentText || '')
    }
    setUpdateView(!studentActivityV3?.studentText)
  }, [studentActivityV3])

  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const viewerImages: ImageDecorator[] = []
  if (activityv3?.images) {
    for (const image of activityv3.images) {
      if (isPdfFile(image) == false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  if (!activityv3)
    return (
      <>
        <TopNavbar title={'차시'} left={<BackButton />} />
        <div className="w-full py-2 text-center">로딩중...</div>{' '}
      </>
    )

  return (
    <>
      <TopNavbar
        title={activityv3?.title || '차시'}
        left={<BackButton />}
        leftFlex="flex-none"
        rightFlex="flex-none"
        right={
          <div
            onClick={() => {
              window?.location?.reload()
            }}
            className="text-brand-1"
          >
            새로고침
          </div>
        }
      />
      <div className="bg-gray-50 pb-2">
        <div className="flex flex-col space-y-2 p-4 text-left">
          <div className="scroll-box flex w-full items-center space-x-2 overflow-x-scroll">
            {activityv3.groupActivityV3s?.map((el) => (
              <div
                key={el.group?.id}
                className="bg-brand-5 rounded-md px-2 py-1 text-sm font-bold whitespace-pre text-gray-800"
              >
                {el.group?.name}
              </div>
            ))}
          </div>
          <div className="max-w-min rounded-md bg-gray-300 px-2 py-1 text-sm font-bold whitespace-pre text-gray-800">
            {ACTIVITYV3_TYPE_KOR[activityv3.type]}
          </div>
          <div className={`text-18 font-bold`}>{activityv3.title}</div>
          <div className="text-13 text-gray-500">
            기간: {activityv3.startDate && format(new Date(activityv3.startDate), 'yyyy.MM.dd')} ~{' '}
            {activityv3.endDate && format(new Date(activityv3.endDate), 'yyyy.MM.dd')}
          </div>
        </div>
        {(!!activityv3.images.length || !!activityv3.files.length) && (
          <div className="text-16 px-4 font-semibold">첨부파일</div>
        )}
        {!!activityv3.images.length && (
          <div className="w-full px-4 pb-2">
            {activityv3.images?.map((image: string, i: number) => (
              <div
                key={image}
                className="aspect-square cursor-pointer rounded border border-neutral-200"
                onClick={() => {
                  setActiveIndex(i)
                  setImagesModalOpen(true)
                }}
              >
                <LazyLoadImage
                  src={`${Constants.imageUrl}${image}`}
                  alt={getFileNameFromUrl(image)}
                  title={getFileNameFromUrl(image)}
                  loading="lazy"
                  className="object-fit h-full w-full rounded"
                />
              </div>
            ))}
          </div>
        )}
        {!!activityv3.files.length && (
          <div className="flex flex-col gap-1 px-4 pb-2">
            {activityv3.files?.map((fileUrl: string, index) => (
              <div key={index} className="flex h-8 items-center space-x-2 rounded bg-stone-50 py-1">
                <FileItemIcon />
                <a
                  className="ml-2 max-w-xs truncate text-xs text-neutral-500"
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
        {activityv3.description && (
          <div className="mb-2 px-4">
            <div className="text-16 font-semibold">활동 설명</div>
            <div className="text-15 w-full break-words whitespace-pre-line">{activityv3.description}</div>
          </div>
        )}
      </div>
      <List>
        {activitySessions?.map((session, index) => {
          const isSubmitted = session.studentActivitySessions.some(
            (studentSession) => studentSession.userId === meRecoil?.id && studentSession.isSubmitted,
          )

          return (
            <ListItem onClick={() => push(`/student/activity/${id}/session/${session.id}`)} key={session.id}>
              <div className="flex flex-col space-y-2">
                <div className="flex w-full items-center space-x-2 overflow-x-hidden">
                  <div className="text-12 min-w-max rounded-md bg-gray-800 px-2 py-1.5 text-white">
                    {ACTIVITY_SESSION_TYPE_KOR[session.type]}
                  </div>
                  <div className="text-18 overflow-hidden text-left font-bold break-words text-ellipsis whitespace-nowrap">
                    {session.title}
                  </div>
                  {session.type !== ActivityType.NOTICE &&
                    (isSubmitted ? (
                      <div className="text-12 rounded-md bg-gray-50 px-2 py-1.5 whitespace-pre text-gray-300">제출</div>
                    ) : (
                      <div className="text-12 rounded-md bg-red-500 px-2 py-1.5 whitespace-pre text-white">미제출</div>
                    ))}
                </div>
                {session?.endDate && (
                  <div className="flex gap-1 text-sm font-normal text-red-400">
                    <span className="font-semibold">마감기한</span>
                    <Time date={session.endDate} className="text-inherit" />
                    <span>까지</span>
                  </div>
                )}
              </div>
            </ListItem>
          )
        })}
        {activitySessions?.length === 0 && (
          <div className="py-2 text-center text-gray-500">발행된 차시가 없습니다.</div>
        )}
      </List>
      {activityv3.hasStudentText && (
        <div className="bg-gray-50 p-4">
          {activityv3.exampleText && (
            <div className="mb-3">
              <div className="text-16 font-semibold">학생 활동 보고서 예시</div>
              <div className="text-15 mt-1 border border-gray-300 p-2 whitespace-pre-line">
                {activityv3.exampleText}
              </div>
            </div>
          )}
          <div
            className="text-16 w-full cursor-pointer pb-1 font-semibold"
            onClick={() => setStudentTextOpen(!studentTextOpen)}
          >
            학생 활동 보고서
          </div>
          <div className="text-14 border-b border-gray-300 pb-2 text-gray-500">
            활동의 <b>차시</b> 참여 후, 생기부 작성을 위해 예시를 참고하여 <b>학생 활동 보고서</b>를 작성해주세요.
          </div>
          {isUpdateView ? (
            <>
              <Textarea
                className="my-2"
                placeholder={activityv3.explainText}
                onChange={(e) => setStudentText(e.target.value)}
                value={studentText}
              />
              <div className="flex items-center justify-end pb-1">
                공백제외&nbsp;<span className="text-brand-1">{studentText.replaceAll(' ', '').length}</span>
                &nbsp;자&nbsp; 공백포함&nbsp;
                <span className="text-brand-1">{studentText.length}</span>&nbsp;자
              </div>
              <Button.lg
                className="bg-brand-1 w-full text-white"
                children="제출하기"
                onClick={() => updateStudentText({ params: { activityv3Id: activityv3.id }, data: { studentText } })}
              />
            </>
          ) : (
            <>
              <div className="my-2 w-full rounded-lg border border-gray-600 p-2">{studentActivityV3?.studentText}</div>
              <Button.lg
                className="bg-brand-1 w-full text-white"
                children="수정하기"
                onClick={() => setUpdateView(true)}
              />
            </>
          )}
        </div>
      )}
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
    </>
  )
}
