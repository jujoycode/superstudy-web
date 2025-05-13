import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import {
  FeedbackReferenceTable,
  ResponseIBPortfolioDto,
  ResponseInterviewListWithQnaDto,
  ResponseUserDto,
} from '@/legacy/generated/model'

import FeedbackViewer from '../FeedbackViewer'

import NODATA from '@/assets/images/no-data.png'

const itemsPerPage = 10

interface TeacherCASRefNIntProps {
  data?: ResponseIBPortfolioDto
  user: ResponseUserDto
}

function TeacherCASRefNInt({ data, user }: TeacherCASRefNIntProps) {
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)
  const location = useLocation()
  const page = location.state?.page
  const { push } = useHistory()
  const [currentPage] = useState(page || 1)
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})

  const refIdsString =
    data?.reflectionDiary && data?.reflectionDiary.length > 0
      ? data.reflectionDiary.map((ref) => ref.id).join(',')
      : null
  const interviewIdsString =
    data?.interview && data?.interview.length > 0 ? data.interview.map((interview) => interview.qna.id).join(',') : null

  const { data: interviewFeedbacks } = useGetFeedbackBatchExist(
    interviewIdsString
      ? { referenceIds: interviewIdsString, referenceTable: 'INTERVIEW' }
      : { referenceIds: '', referenceTable: 'INTERVIEW' },
    { enabled: !!interviewIdsString },
  )

  const { data: refFeedbacks } = useGetFeedbackBatchExist(
    refIdsString
      ? { referenceIds: refIdsString, referenceTable: 'REFLECTION_DIARY' }
      : { referenceIds: '', referenceTable: 'REFLECTION_DIARY' },
    { enabled: !!refIdsString },
  )

  function isInterview(
    item: (typeof mergedData)[number],
  ): item is ResponseInterviewListWithQnaDto & { type: 'interview' } {
    return item.type === 'interview'
  }

  const mergedData = [
    ...(data?.interview?.map((interview) => ({ ...interview, type: 'interview' })) || []),
    ...(data?.reflectionDiary?.map((ref) => ({ ...ref, type: 'reflectionDiary' })) || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const markAsRead = (referenceId: number, referenceTable: FeedbackReferenceTable) => {
    const key = `${referenceTable}-${referenceId}` // 문자열 키 생성
    setLocalUnreadCounts((prevCounts) => {
      const newCounts = { ...prevCounts }
      newCounts[key] = 0
      return newCounts
    })
  }

  const handleFeedbackOpen = (referenceId: number, referenceTable: FeedbackReferenceTable, unreadCount: number) => {
    setFeedbackReference({ referenceId, referenceTable })
    setFeedbackOpen(true)

    if (unreadCount > 0) {
      markAsRead(referenceId, referenceTable) // referenceTable 추가
    }
  }

  useEffect(() => {
    const initialCounts: Record<string, number> = {}

    if (refFeedbacks?.items) {
      refFeedbacks.items.forEach((item) => {
        initialCounts[`REFLECTION_DIARY-${item.referenceId}`] = item.unreadCount || 0
      })
    }

    if (interviewFeedbacks?.items) {
      interviewFeedbacks.items.forEach((item) => {
        initialCounts[`INTERVIEW-${item.referenceId}`] = item.unreadCount || 0
      })
    }

    setLocalUnreadCounts(initialCounts)
  }, [refFeedbacks, interviewFeedbacks])

  return (
    <>
      <span className="flex flex-row items-center justify-between">
        <Typography variant="title1">인터뷰 · 성찰 일지</Typography>
      </span>
      {data === undefined || (data?.reflectionDiary.length === 0 && data.interview.length === 0) ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="h-12 w-12 px-[2.50px]">
            <img src={NODATA} className="h-12 w-[43px] object-cover" />
          </div>
          <Typography variant="body2" className="text-center">{`작성한 인터뷰 · 성찰 일지가 없습니다`}</Typography>
        </div>
      ) : (
        <table className="w-full">
          <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px] font-medium">
            <tr>
              <td className="w-[88px] py-[9px] pr-2 pl-6 text-center">번호</td>
              <td className="w-[108px] px-2 py-[9px] text-center">유형</td>
              <td className="w-[216px] px-2 py-[9px] text-center">제목</td>
              <td className="w-[108px] px-2 py-[9px] text-center">작성자</td>
              <td className="w-[150px] px-2 py-[9px] text-center">수정일</td>
              <td className="w-[150px] py-[9px] pr-6 pl-2 text-center">피드백</td>
            </tr>
          </thead>
          <tbody className="text-15 text-primary-gray-900 font-medium">
            {mergedData?.map((item, index) => {
              const itemNumber = mergedData.length - (currentPage - 1) * itemsPerPage - index
              const feedback = isInterview(item)
                ? interviewFeedbacks?.items?.find((feedback) => feedback.referenceId === item.qna.id)
                : refFeedbacks?.items?.find((feedback) => feedback.referenceId === item.id)
              return (
                <tr key={index} className="border-b-primary-gray-100 border-b">
                  <td className="py-4 pr-2 pl-6 text-center">{itemNumber}</td>
                  <td className="relative h-full px-2 py-4">
                    <BadgeV2
                      type="solid_regular"
                      color={'gray'}
                      size={24}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
                    >
                      {item.type === 'interview' ? '인터뷰일지' : '성찰일지'}
                    </BadgeV2>
                  </td>
                  <td
                    className="cursor-pointer px-2 py-4 text-start"
                    onClick={() => {
                      if (isInterview(item)) {
                        user.role === 'USER'
                          ? push(`/ib/student/portfolio/interview/${item.qna?.id}`)
                          : push(`/teacher/ib/portfolio/${data.profile.user.id}/interview/${item.id}/${item.qna?.id}`)
                      } else {
                        user.role === 'USER'
                          ? push(`/ib/student/portfolio/reflection-diary/${item.id}`)
                          : push(`/teacher/ib/portfolio/${data.profile.user.id}/reflection-diary/${item.id}`)
                      }
                    }}
                  >
                    {item.title}
                  </td>
                  <td className="px-2 py-4 text-center">{data?.profile.user.name}</td>
                  <td className="px-2 py-4 text-center">{format(new Date(item.updatedAt), 'yyyy.MM.dd')}</td>
                  <td className="flex justify-center py-4 pr-6 pl-2">
                    {feedback ? (
                      feedback.totalCount === 0 ? (
                        <>-</>
                      ) : localUnreadCounts[
                          `${isInterview(item) ? `INTERVIEW-${item.qna.id}` : `REFLECTION_DIARY-${item.id}`}`
                        ] === 0 ? (
                        <ButtonV2
                          variant="outline"
                          color="gray400"
                          size={32}
                          onClick={() => {
                            if (isInterview(item)) {
                              user.role === 'USER'
                                ? push(`/ib/student/portfolio/interview/${item.qna?.id}`)
                                : push(
                                    `/teacher/ib/portfolio/${data.profile.user.id}/interview/${item.id}/${item.qna?.id}`,
                                  )
                            } else {
                              user.role === 'USER'
                                ? push(`/ib/student/portfolio/reflection-diary/${item.id}`)
                                : push(`/teacher/ib/portfolio/${data.profile.user.id}/reflection-diary/${item.id}`)
                            }
                          }}
                        >
                          보기
                        </ButtonV2>
                      ) : (
                        <ButtonV2
                          className={`flex flex-row items-center gap-1`}
                          variant="outline"
                          color="gray400"
                          size={32}
                          onClick={() =>
                            handleFeedbackOpen(
                              feedback.referenceId,
                              isInterview(item) ? 'INTERVIEW' : 'REFLECTION_DIARY',
                              localUnreadCounts[
                                `${
                                  isInterview(item)
                                    ? `INTERVIEW-${feedback.referenceId}`
                                    : `REFLECTION_DIARY-${feedback.referenceId}`
                                }`
                              ],
                            )
                          }
                        >
                          <>
                            <ColorSVGIcon.New color="orange800" />
                            보기
                          </>
                        </ButtonV2>
                      )
                    ) : (
                      <>-</>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {alertMessage && (
        <AlertV2
          message={alertMessage.text}
          confirmText="확인"
          onConfirm={() => {
            if (alertMessage.action) alertMessage.action()
            setAlertMessage(null)
          }}
        />
      )}
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={feedbackReference?.referenceId || 0}
          referenceTable={feedbackReference?.referenceTable || 'REFLECTION_DIARY'}
        />
      )}
    </>
  )
}

export default TeacherCASRefNInt
