import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { useInterviewGetByStudentId } from '@/legacy/container/ib-student-interview'
import {
  FeedbackReferenceTable,
  ResponseIBPortfolioDto,
  ResponseInterviewListWithQnaDto,
  ResponseUserDto,
} from '@/legacy/generated/model'

import FeedbackViewer from '../FeedbackViewer'

import { IbCASInterview } from './IbCASInterview'
import { IbCASReflection } from './IbCASReflection'

import NODATA from '@/assets/images/no-data.png'

const categoryOrder = ['CAS_PORTFOLIO_1', 'CAS_PORTFOLIO_2', 'CAS_PORTFOLIO_3']

interface CASRefNIntProps {
  data?: ResponseIBPortfolioDto
  user: ResponseUserDto
}

type ModalType = 'projectSelection' | 'IbInterview' | 'IbReflection' | null
type CategoryType = 'INTERVIEW' | 'REFLECTION' | ''

function CASRefNInt({ data, user }: CASRefNIntProps) {
  const [step, setStep] = useState<number>(0)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const handleClose = () => {
    setActiveModal(null)
    setStep(0)
  }
  const [selectedValue, setSelectedValue] = useState<CategoryType>('')
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)
  const { push } = useHistory()
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})

  const { data: interview = [], isLoading } = useInterviewGetByStudentId(
    user?.id,
    'CAS_PORTFOLIO_1,CAS_PORTFOLIO_2,CAS_PORTFOLIO_3',
  )
  const unCreateInterview = interview.some((item) => !item.is_created)

  const sortedInterview = [...interview].sort((a: any, b: any) => {
    const indexA = categoryOrder.indexOf(a.category)
    const indexB = categoryOrder.indexOf(b.category)

    return indexA - indexB
  })

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
  ].sort((a, b) => {
    const dateA = isInterview(a) ? new Date(a.qna.createdAt).getTime() : new Date(a.createdAt).getTime()
    const dateB = isInterview(b) ? new Date(b.qna.createdAt).getTime() : new Date(b.createdAt).getTime()

    return dateB - dateA
  })

  const handleSuccess = (action: 'REFLECTION' | 'INTERVIEW', data?: any) => {
    setAlertMessage({
      text: action === 'REFLECTION' ? `성찰일지가\n저장되었습니다` : '인터뷰일지가\n저장되었습니다',
      action: () => {
        if (action === 'REFLECTION') {
          push(`/ib/student/portfolio/reflection-diary/${data.id}`)
        } else if (action === 'INTERVIEW') {
          push(`/ib/student/portfolio/interview/${data.id}`)
        }
      },
    })
  }

  const handleNext = () => {
    if (step === 0 && selectedValue !== '') {
      setStep(step + 1)
      if (selectedValue === 'REFLECTION') {
        setActiveModal('IbReflection')
      } else {
        setActiveModal('IbInterview')
      }
    } else if (step === 1) {
      setStep(2)
    }
  }

  const handleBackToProjectSelection = () => {
    setStep((prev) => prev - 1)
    if (step === 1) {
      setActiveModal('projectSelection')
    }
  }

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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <IBBlank type="section" />
        </div>
      ) : (
        <>
          <span className="flex flex-row items-center justify-between">
            <Typography variant="title1">인터뷰 · 성찰 일지</Typography>
            {mergedData.length !== 0 && (
              <ButtonV2 variant="solid" color="orange100" size={32} onClick={() => setActiveModal('projectSelection')}>
                작성하기
              </ButtonV2>
            )}
          </span>
          {data === undefined || (data?.reflectionDiary.length === 0 && data.interview.length === 0) ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
              <div className="h-12 w-12 px-[2.50px]">
                <img src={NODATA} className="h-12 w-[43px] object-cover" />
              </div>
              <Typography
                variant="body2"
                className="text-center"
              >{`작성한 인터뷰 · 성찰 일지가 없습니다.\n인터뷰 · 성찰 일지를 작성해주세요.`}</Typography>
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setActiveModal('projectSelection')}>
                작성하기
              </ButtonV2>
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
                  const itemNumber = mergedData.length - index
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
                              ? push(`/ib/student/portfolio/interview/${item.id}/${item.qna?.id}`)
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
                        {item.title}
                      </td>
                      <td className="px-2 py-4 text-center">{data?.profile.user.name}</td>
                      <td className="px-2 py-4 text-center">
                        {format(new Date(isInterview(item) ? item.qna.createdAt : item.updatedAt), 'yyyy.MM.dd')}
                      </td>
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
                                    ? push(`/ib/student/portfolio/interview/${item.id}/${item.qna?.id}`)
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
        </>
      )}

      {activeModal === 'projectSelection' && step === 0 && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'기록 유형 선택해주세요'}
          bottomBorder={false}
          footerClassName="h-24"
          footerButtons={
            <div className="flex gap-2">
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleNext}
                disabled={selectedValue === ''}
              >
                다음
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group
            selectedValue={selectedValue}
            onChange={(value: CategoryType) => setSelectedValue(value)}
            className="flex flex-col gap-3"
          >
            <RadioV2.Box value="REFLECTION" title="성찰일지" />
            <RadioV2.Box value="INTERVIEW" title="인터뷰일지" disabled={!unCreateInterview} />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'IbReflection' && step === 1 && (
        <IbCASReflection
          modalOpen={true}
          setModalClose={handleClose}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
        />
      )}
      {activeModal === 'IbInterview' && step === 1 && (
        <IbCASInterview
          modalOpen={true}
          data={sortedInterview}
          setModalClose={handleClose}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          studentId={user.id}
        />
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

export default CASRefNInt
