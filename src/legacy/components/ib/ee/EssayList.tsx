import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import NODATA from '@/legacy/assets/images/no-data.png'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { ResponseEssayDto, ResponseIBDto } from '@/legacy/generated/model'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import FeedbackViewer from '../FeedbackViewer'
import { IbEeEssay } from './IbEeEssay'

interface EssayListProps {
  data: ResponseIBDto
  essay?: ResponseEssayDto
  refetch: () => void
  userId: number
}

export default function EssayList({ data, essay, refetch, userId }: EssayListProps) {
  const approvedProposal = data.proposals?.find((proposal) => proposal.status === 'ACCEPT') || null

  const [modalType, setModalType] = useState<'create' | 'view'>('create')
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const handleSuccess = () => {
    setModalOpen(!modalOpen)
    refetch()
    setAlertMessage(`에세이가\n저장되었습니다`)
  }

  const essayId = essay?.id || null
  const { data: feedbacks, isLoading } = useGetFeedbackBatchExist(
    essayId
      ? { referenceIds: String(essayId), referenceTable: 'ESSAY' }
      : { referenceIds: '', referenceTable: 'ESSAY' },
    { enabled: !!essayId },
  )

  useEffect(() => {
    const initialCounts: Record<string, number> = {}
    if (feedbacks?.items) {
      feedbacks.items.forEach((item) => {
        initialCounts[`ESSAY-${item.referenceId}`] = item.unreadCount || 0
      })
    }
    setLocalUnreadCounts(initialCounts)
  }, [feedbacks])

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true)
    if (localUnreadCounts[`ESSAY-${essayId}`] > 0) {
      setLocalUnreadCounts((prev) => ({
        ...prev,
        [`ESSAY-${essayId}`]: 0,
      }))
    }
  }

  const { push } = useHistory()

  return (
    <section className="h-[664px]">
      {isLoading && <IBBlank type="opacity" />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">에세이</Typography>
        {/* {data.status === 'IN_PROGRESS' && !Essay && (
          <ButtonV2
            variant="solid"
            color="orange800"
            size={40}
            className="flex flex-row items-center gap-1"
            onClick={() => {
              setModalType('create');
              setModalOpen(true);
            }}
          >
            <SVGIcon.Plus size={16} color="white" weight="bold" />
            에세이 업로드
          </ButtonV2>
        )} */}
      </header>
      <main>
        {!approvedProposal ? (
          <section className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">제안서가 승인되어야</Typography>
              <Typography variant="body2">에세이를 업로드할 수 있습니다.</Typography>
            </span>
          </section>
        ) : essay ? (
          <>
            <table className="w-full text-center">
              <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px] font-medium">
                <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px]">
                  <td className="w-[176px]">과목</td>
                  <td className="w-[524px]">연구주제</td>
                  <td className="w-[156px]">수정일</td>
                  <td className="w-[156px]">피드백</td>
                  <td className="w-[156px]">체크리스트</td>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b-primary-gray-100 flex w-full items-center justify-between gap-[16px] border-b px-[24px] py-[9px]">
                  <td className="line-clamp-1 w-[176px]" title={approvedProposal?.subject}>
                    {approvedProposal?.subject}
                  </td>
                  <td
                    title={approvedProposal?.researchTopic}
                    className="line-clamp-1 w-[524px] cursor-pointer"
                    onClick={() =>
                      push(`/ib/student/ee/${data.id}/essay/${essay.id}`, {
                        project: data,
                      })
                    }
                  >
                    {approvedProposal?.researchTopic}
                  </td>
                  <td className="w-[156px]">{format(new Date(essay.updatedAt), 'yyyy.MM.dd')}</td>
                  <td className="flex w-[156px] items-center justify-center">
                    {essay.status === 'PENDING' ? (
                      <>-</>
                    ) : localUnreadCounts[`ESSAY-${essayId}`] > 0 ? (
                      <ButtonV2
                        className={`flex flex-row items-center gap-1`}
                        variant="outline"
                        color="gray400"
                        size={32}
                        onClick={handleFeedbackOpen}
                      >
                        <>
                          <ColorSVGIcon.New color="orange800" />
                          보기
                        </>
                      </ButtonV2>
                    ) : (
                      <ButtonV2
                        variant="outline"
                        color="gray400"
                        size={32}
                        onClick={() =>
                          push(`/ib/student/ee/${data.id}/essay/${essay.id}`, {
                            type: 'feedback',
                            project: data,
                          })
                        }
                      >
                        보기
                      </ButtonV2>
                    )}
                  </td>
                  <td className="w-[156px]">
                    <ButtonV2
                      variant="outline"
                      color="gray400"
                      size={32}
                      onClick={() => {
                        setModalType('view')
                        setModalOpen(true)
                      }}
                    >
                      확인하기
                    </ButtonV2>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">업로드한 에세이가 없습니다.</Typography>
              <Typography variant="body2">에세이를 업로드해주세요.</Typography>
            </span>
            <ButtonV2
              variant="solid"
              color="orange100"
              size={40}
              onClick={() => {
                setModalType('create')
                setModalOpen(true)
              }}
            >
              에세이 업로드
            </ButtonV2>
          </div>
        )}
      </main>

      {modalOpen && (
        <IbEeEssay
          modalOpen={true}
          setModalClose={() => setModalOpen(!modalOpen)}
          projectId={data.id}
          type={modalType}
          onSuccess={handleSuccess}
          studentId={userId || 0}
          essayData={essay}
        />
      )}
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={essay?.id || 0}
          referenceTable="ESSAY"
        />
      )}
      {alertMessage && (
        <AlertV2
          confirmText="확인"
          message={alertMessage}
          onConfirm={() => {
            setAlertMessage(null)
          }}
        />
      )}
    </section>
  )
}
