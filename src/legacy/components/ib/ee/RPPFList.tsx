import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import NODATA from '@/legacy/assets/images/no-data.png'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { useInterviewGetByStudentId, useInterviewQNAGetByStudentId } from '@/legacy/container/ib-student-interview'
import { FeedbackReferenceTable, ResponseIBDto, ResponseRPPFDto } from '@/legacy/generated/model'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import FeedbackViewer from '../FeedbackViewer'
import { IbEeInterview } from './IbEeInterview'
import { IbEeRPPF } from './IbEeRPPF'

interface RPPFListProps {
  data: ResponseIBDto
  title: string
  userId: number
  rppfs?: ResponseRPPFDto[]
}

export default function RPPFList({ data, title, userId, rppfs = [] }: RPPFListProps) {
  const { push } = useHistory()

  const approvedProposal = data.proposals?.find((proposal) => proposal.status === 'ACCEPT') || null
  // 작성 가능한 인터뷰가 있는지 확인
  const { data: ableInterviews = [] } = useInterviewGetByStudentId(userId || 0, 'EE_RPPF')
  const unCreateInterview = ableInterviews.find((item) => !item.is_created)

  const { data: interviews = [], isLoading: isInterviewLoading } = useInterviewQNAGetByStudentId(userId || 0, 'EE_RPPF')
  const [modalState, setModalState] = useState<null | 'createRPPF' | 'interview'>(null)
  const [alertType, setAlertType] = useState<null | 'RPPF' | 'interview'>(null)
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})

  const mergedData = [
    ...rppfs.map((rppf) => ({ ...rppf, type: 'RPPF' })),
    ...interviews.map((interview) => ({ ...interview, type: 'interview' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleSuccess = (type: 'RPPF' | 'interview') => {
    setModalState(null)
    // refetch();
    setAlertType(type)
  }

  const rppfIdsString = rppfs.length > 0 ? rppfs.map((rppf) => rppf.id).join(',') : null
  const interviewIdsString = interviews.length > 0 ? interviews.map((interview) => interview.qna.id).join(',') : null

  const { data: interviewFeedbacks } = useGetFeedbackBatchExist(
    interviewIdsString
      ? { referenceIds: interviewIdsString, referenceTable: 'INTERVIEW' }
      : { referenceIds: '', referenceTable: 'INTERVIEW' },
    { enabled: !!interviewIdsString },
  )

  const { data: rppfFeedbacks } = useGetFeedbackBatchExist(
    rppfIdsString
      ? { referenceIds: rppfIdsString, referenceTable: 'RPPF' }
      : { referenceIds: '', referenceTable: 'RPPF' },
    { enabled: !!rppfIdsString },
  )

  // unreadCount를 0으로 업데이트하는 함수
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

    if (rppfFeedbacks?.items) {
      rppfFeedbacks.items.forEach((item) => {
        initialCounts[`RPPF-${item.referenceId}`] = item.unreadCount || 0
      })
    }

    if (interviewFeedbacks?.items) {
      interviewFeedbacks.items.forEach((item) => {
        initialCounts[`INTERVIEW-${item.referenceId}`] = item.unreadCount || 0
      })
    }

    setLocalUnreadCounts(initialCounts)
  }, [rppfFeedbacks, interviewFeedbacks])

  return (
    <section className="h-[664px]">
      {isInterviewLoading && <Blank />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">RPPF</Typography>
        {mergedData?.length !== 0 && data?.status !== 'COMPLETE' && (
          <div className="flex flex-row items-center gap-2">
            {unCreateInterview && (
              <ButtonV2
                variant="solid"
                color="gray100"
                size={40}
                onClick={() => setModalState('interview')}
                disabled={data?.status === 'WAIT_COMPLETE'}
              >
                인터뷰 준비
              </ButtonV2>
            )}
            <ButtonV2
              variant="solid"
              color="orange800"
              size={40}
              onClick={() => setModalState('createRPPF')}
              disabled={data?.status === 'WAIT_COMPLETE'}
            >
              작성하기
            </ButtonV2>
          </div>
        )}
      </header>
      <main className="flex items-center justify-center">
        {!approvedProposal ? (
          <section className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">제안서가 승인되어야</Typography>
              <Typography variant="body2">RPPF를 업로드할 수 있습니다.</Typography>
            </span>
          </section>
        ) : mergedData?.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">인터뷰 준비를 통해 짜임새 있는</Typography>
              <Typography variant="body2">RPPF를 작성해보세요.</Typography>
            </span>
            <span className="flex flex-row items-center gap-2">
              {unCreateInterview && (
                <ButtonV2 variant="solid" color="gray100" size={40} onClick={() => setModalState('interview')}>
                  인터뷰 준비
                </ButtonV2>
              )}
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setModalState('createRPPF')}>
                작성하기
              </ButtonV2>
            </span>
          </div>
        ) : (
          <table className="w-full text-center">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px] font-medium">
              <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px]">
                <td className="w-[176px]">종류</td>
                <td className="w-[632px]">제목</td>
                <td className="w-[188px]">수정일</td>
                <td className="w-[188px]">피드백</td>
              </tr>
            </thead>
            <tbody>
              {rppfs.map((rppf) => {
                const feedback = rppfFeedbacks?.items?.find((item) => item.referenceId === rppf.id)
                return (
                  <tr
                    key={rppf.id}
                    className="border-b-primary-gray-100 flex w-full items-center justify-between gap-[16px] border-b px-[24px] py-[9px]"
                  >
                    <td className="flex w-[176px] items-center justify-center">
                      <BadgeV2 type="solid_regular" color={'blue'} size={24}>
                        공식 RPPF
                      </BadgeV2>
                    </td>
                    <td
                      className="line-clamp-1 w-[632px] cursor-pointer"
                      onClick={() => push(`/ib/student/ee/${data.id}/rppf/${rppf.id}`, { title, data })}
                    >
                      공식 RPPF
                    </td>
                    <td className="w-[188px]">{format(new Date(rppf.updatedAt), 'yyyy.MM.dd')}</td>
                    <td className="flex w-[188px] items-center justify-center">
                      {feedback ? (
                        feedback.totalCount === 0 ? (
                          <>-</>
                        ) : localUnreadCounts[`RPPF-${rppf.id}`] === 0 ? (
                          <ButtonV2
                            variant="outline"
                            color="gray400"
                            size={32}
                            onClick={() => push(`/ib/student/ee/${data.id}/rppf/${rppf.id}`, { title, data })}
                          >
                            보기
                          </ButtonV2>
                        ) : (
                          <ButtonV2
                            className={`flex flex-row items-center gap-1`}
                            variant="outline"
                            color="gray400"
                            size={32}
                            onClick={() => handleFeedbackOpen(rppf.id, 'RPPF', localUnreadCounts[`RPPF-${rppf.id}`])}
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
              {interviews
                ?.slice()
                .sort((a, b) => new Date(b.qna.updatedAt).getTime() - new Date(a.qna.updatedAt).getTime())
                .map((interview) => {
                  const feedback = interviewFeedbacks?.items?.find((item) => item.referenceId === interview.qna.id)
                  return (
                    <tr
                      key={interview.id}
                      className="border-b-primary-gray-100 flex w-full items-center justify-between gap-[16px] border-b px-[24px] py-[9px]"
                    >
                      <td className="flex w-[176px] items-center justify-center">
                        <BadgeV2 type="solid_regular" color={'gray'} size={24}>
                          인터뷰
                        </BadgeV2>
                      </td>
                      <td
                        className="line-clamp-1 w-[632px] cursor-pointer"
                        onClick={() =>
                          push(`/ib/student/ee/${data.id}/interview/${interview.qna.id}`, { title: title })
                        }
                      >
                        {interview.title}
                      </td>
                      <td className="w-[188px]">{format(new Date(interview.qna.updatedAt), 'yyyy.MM.dd')}</td>
                      <td className="flex w-[188px] items-center justify-center">
                        {feedback ? (
                          feedback.totalCount === 0 ? (
                            <>-</>
                          ) : localUnreadCounts[`INTERVIEW-${interview.qna.id}`] === 0 ? (
                            <ButtonV2
                              variant="outline"
                              color="gray400"
                              size={32}
                              onClick={() =>
                                push(`/ib/student/ee/${data.id}/interview/${interview.qna.id}`, { title: title })
                              }
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
                                  interview.qna.id,
                                  'INTERVIEW',
                                  localUnreadCounts[`INTERVIEW-${interview.qna.id}`],
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
      </main>
      {modalState === 'createRPPF' && (
        <IbEeRPPF
          modalOpen={true}
          setModalClose={() => setModalState(null)}
          projectId={data.id}
          RPPFData={rppfs[0]}
          onSuccess={() => handleSuccess('RPPF')}
        />
      )}
      {modalState === 'interview' && (
        <IbEeInterview
          modalOpen={true}
          setModalClose={() => setModalState(null)}
          onSuccess={() => handleSuccess('interview')}
        />
      )}
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={feedbackReference?.referenceId || 0}
          referenceTable={feedbackReference?.referenceTable || 'RPPF'}
        />
      )}
      {alertType && (
        <AlertV2
          confirmText="확인"
          message={alertType === 'RPPF' ? `RPPF가\n저장되었습니다` : `인터뷰가\n저장되었습니다`}
          onConfirm={() => setAlertType(null)}
        />
      )}
    </section>
  )
}
