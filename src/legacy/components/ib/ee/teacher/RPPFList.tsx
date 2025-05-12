import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import NODATA from 'src/assets/images/no-data.png'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import RppfIbSubmitInformPopup from 'src/components/ib/ee/RppfIbSubmitInformPopup'
import FeedbackViewer from 'src/components/ib/FeedbackViewer'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { PopupModal } from 'src/components/PopupModal'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { useIBApproveComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useRPPFGetByIBIdFindAll } from '@/legacy/container/ib-rppf-findAll'
import { useInterviewQNAGetByStudentId } from '@/legacy/container/ib-student-interview'
import { useRPPFUpdateRPPFStatusReject } from '@/legacy/generated/endpoint'
import { FeedbackReferenceTable, ResponseIBDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { meState } from '@/stores'
import { LocationState } from '@/legacy/types/ib'

interface RppfListProps {
  id: number
  data: ResponseIBDto
  studentData: LocationState['student']
  refetch: () => void
}

export const RPPFList = ({ id, data: proposalData, studentData, refetch }: RppfListProps) => {
  const { push } = useHistory()
  const me = useRecoilValue(meState)

  const permission = usePermission(proposalData?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_EE'

  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})
  const [rejectModalOpen, setRejectModalOpen] = useState(false) // 제안서 보완 요청 Modal
  const [rejectReason, setRejectReason] = useState('') // 제안서 보완 요청 피드백
  const [ibModalType, setIbModalType] = useState<'CREATE' | 'VIEW' | null>(null) // IB Modal 타입 관리
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { data: rppfData = [] } = useRPPFGetByIBIdFindAll(id)
  const { data: interviewData = [] } = useInterviewQNAGetByStudentId(proposalData.leader.id, 'EE_RPPF')
  const { data: ibData } = useIBGetById(id)
  const interviewIdsString = interviewData.map((interview) => interview.qna.id).join(',')

  const mergedData = [
    ...rppfData.map((rppf) => ({ ...rppf, type: 'RPPF' })),
    ...interviewData
      .map((interview) => ({
        ...interview,
        type: 'interview',
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  ]

  const { data: interviewFeedbacks } = useGetFeedbackBatchExist(
    {
      referenceIds: interviewIdsString,
      referenceTable: 'INTERVIEW',
    },
    { enabled: !!interviewIdsString },
  )

  const { data: rppfFeedbacks } = useGetFeedbackBatchExist(
    {
      referenceIds: String(rppfData[0]?.id),
      referenceTable: 'RPPF',
    },
    { enabled: !!rppfData[0]?.id },
  )

  const { mutate: rejectPlan, isLoading: rejectPlanLoading } = useRPPFUpdateRPPFStatusReject({
    mutation: {
      onSuccess: () => {
        setAlertMessage(`RPPF 보완을\n요청하였습니다`)
        setRejectModalOpen(!rejectModalOpen)
      },
    },
  })

  const { approveIBProjectComplete } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage(`완료를\n승인하였습니다`)
    },
    onError: (error) => {
      console.error('완료 승인 중 오류 발생:', error)
    },
  })

  // unreadCount를 0으로 업데이트하는 함수
  const markAsRead = (referenceId: number, referenceTable: FeedbackReferenceTable) => {
    const key = `${referenceTable}-${referenceId}` // 문자열 키 생성
    setLocalUnreadCounts((prevCounts) => {
      const newCounts = { ...prevCounts }
      newCounts[key] = 0
      return newCounts
    })
  }

  const handleIbModalOpen = (type: 'CREATE' | 'VIEW') => {
    setIbModalType(type) // 모달 타입 설정
  }

  const handleIbModalClose = () => {
    setIbModalType(null) // 모달 타입 초기화
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

  if (!proposalData) {
    return <Blank />
  }

  return (
    <section className="flex h-[664px] flex-col">
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1" className="text-primary-gray-900">
          RPPF
        </Typography>
        {ibData?.status === 'COMPLETE' && (
          <ButtonV2
            variant="solid"
            color="gray700"
            size={40}
            className="w-[145px]"
            onClick={() => handleIbModalOpen('VIEW')}
          >
            RPPF 정보 확인
          </ButtonV2>
        )}

        {/* 권한이 없는 선생님의 경우 */}
        {ibData?.status === 'WAIT_COMPLETE' &&
          !hasPermission &&
          (rppfData[0]?.academicIntegrityConsent ? (
            <ButtonV2
              variant="solid"
              color="gray700"
              size={40}
              className="w-[145px]"
              onClick={() => handleIbModalOpen('VIEW')}
            >
              RPPF 정보 확인
            </ButtonV2>
          ) : (
            <ButtonV2 variant="solid" color="gray700" size={40} onClick={() => handleIbModalOpen('CREATE')} disabled>
              RPPF 정보 기입
            </ButtonV2>
          ))}

        {/* 권한이 있는 선생님의 경우 */}
        {ibData?.status === 'WAIT_COMPLETE' &&
          hasPermission &&
          (rppfData[0]?.academicIntegrityConsent ? (
            <ButtonV2 variant="solid" color="gray700" size={40} onClick={() => handleIbModalOpen('CREATE')}>
              RPPF 정보 확인 및 수정
            </ButtonV2>
          ) : (
            <ButtonV2
              variant="solid"
              color="orange800"
              size={40}
              className="w-[145px]"
              onClick={() => handleIbModalOpen('CREATE')}
            >
              RPPF 정보 기입
            </ButtonV2>
          ))}
      </header>
      <main>
        {mergedData.length ? (
          <table className="w-full text-center">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px]">
              <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px] font-medium">
                <th className="w-[176px]">종류</th>
                <th className="w-[632px]">제목</th>
                <th className="w-[188px]">수정일</th>
                <th className="w-[188px]">학생 댓글</th>
              </tr>
            </thead>
            <tbody className="text-primary-gray-900 text-[15px] font-medium">
              {rppfData.map((rppf) => {
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
                      className="w-[632px] cursor-pointer"
                      onClick={() =>
                        push(`/teacher/ib/ee/${id}/rppf/${rppf.id}`, {
                          data: proposalData,
                          student: studentData,
                        })
                      }
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
                            onClick={() =>
                              push(`/teacher/ib/ee/${id}/rppf/${rppf.id}`, {
                                data: proposalData,
                                student: studentData,
                              })
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
              {interviewData
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
                        className="w-[632px] cursor-pointer"
                        onClick={() =>
                          push(`/teacher/ib/ee/${id}/interview/${interview.qna.id}`, {
                            student: studentData,
                            data: proposalData,
                          })
                        }
                      >
                        {interview.title}
                      </td>
                      <td className="w-[188px]">{format(new Date(interview.createdAt), 'yyyy.MM.dd')}</td>
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
                                push(`/teacher/ib/ee/${id}/interview/${interview.qna.id}`, {
                                  student: studentData,
                                  data: proposalData,
                                })
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
        ) : (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <Typography variant="body2" className="text-center">
              제안서 승인 후, 학생이 RPPF를 작성해야
              <br />
              확인할 수 있습니다.
            </Typography>
          </div>
        )}
      </main>

      <PopupModal
        modalOpen={rejectModalOpen}
        setModalClose={() => {
          setRejectModalOpen(false)
          setRejectReason('')
        }}
        title="RPPF 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectReason.length).valueOf()}
            onClick={() =>
              rejectPlan({ ibId: Number(id), rppfId: Number(rppfData[0].id), data: { content: rejectReason } })
            }
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-6">
          <Typography variant="body1">학생에게 RPPF에 대한 피드백을 남겨주세요.</Typography>
          <TextareaV2
            placeholder="내용을 입력하세요."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </PopupModal>
      {ibModalType && rppfData[0] && (
        <RppfIbSubmitInformPopup
          IBData={proposalData}
          ibId={Number(id)}
          rppfId={rppfData[0].id}
          rppfData={rppfData[0]}
          modalOpen={Boolean(ibModalType)}
          setModalClose={handleIbModalClose}
          type={ibModalType}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}

      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={feedbackReference?.referenceId || 0}
          referenceTable={feedbackReference?.referenceTable || 'RPPF'}
        />
      )}
    </section>
  )
}
