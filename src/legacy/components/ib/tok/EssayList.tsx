import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import NODATA from '@/legacy/assets/images/no-data.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { ResponseEssayDto, ResponseIBDto } from '@/legacy/generated/model'
import { ButtonV2 } from '../@/legacy/components/common/ButtonV2'
import { Typography } from '../@/legacy/components/common/Typography'
import FeedbackViewer from '../FeedbackViewer'
import { IbEssay } from './IbEssay'

interface EssayListProps {
  data?: ResponseEssayDto
  ibData: ResponseIBDto
  refetch: () => void
}

export default function EssayList({ data, ibData, refetch }: EssayListProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const handleSuccess = () => {
    setModalOpen(!modalOpen)
    refetch()
    setAlertMessage(`에세이가\n저장되었습니다`)
  }

  const { push } = useHistory()
  const { data: Feedback } = useGetFeedbackBatchExist({
    referenceIds: String(data?.id),
    referenceTable: 'ESSAY',
  })

  const { data: unReadFeedbackCount } = useGetUnreadFeedbackCount({
    referenceTable: 'ESSAY',
    referenceId: data?.id || 0,
  })

  useEffect(() => {
    if (unReadFeedbackCount !== undefined) {
      setUnreadCount(unReadFeedbackCount)
    }
  }, [unReadFeedbackCount])

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true)
    if (unreadCount && unreadCount > 0) {
      setUnreadCount(0)
    }
  }

  return (
    <section className="h-[664px]">
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">에세이</Typography>
      </header>
      <main>
        {ibData?.status === 'PENDING' ||
        ibData?.status === 'WAIT_MENTOR' ||
        ibData?.status === 'REJECT_PLAN' ||
        ibData?.status === 'WAIT_PLAN_APPROVE' ? (
          <section className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">아웃라인이 승인되어야</Typography>
              <Typography variant="body2">에세이를 업로드할 수 있습니다.</Typography>
            </span>
          </section>
        ) : data === undefined ? (
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
                setModalOpen(true)
              }}
            >
              에세이 업로드
            </ButtonV2>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px] font-medium">
              <tr>
                <td className="w-[964px] py-[9px] pr-2 pl-6 text-center">주제</td>
                <td className="w-[150px] px-2 py-[9px] text-center">수정일</td>
                <td className="w-[166px] py-[9px] pr-6 pl-2 text-center">피드백</td>
              </tr>
            </thead>
            <tbody className="text-15 text-primary-gray-900 font-medium">
              <tr className="border-b-primary-gray-100 border-b">
                <td
                  className="text-15 text-primary-gray-900 cursor-pointer py-3 pr-2 pl-6 text-center font-medium"
                  onClick={() =>
                    push(`/ib/student/tok/essay/detail/${data.id}`, {
                      project: ibData,
                    })
                  }
                >
                  {ibData?.tokOutline?.themeQuestion}
                </td>
                <td className="px-2 py-3 text-center">{format(new Date(data?.updatedAt), 'yyyy.MM.dd')}</td>
                <td className="flex items-center justify-center py-3 pr-6 pl-2">
                  {Feedback?.items[0].totalCount && Feedback?.items[0].totalCount > 0 ? (
                    <ButtonV2
                      variant="outline"
                      color="gray400"
                      size={32}
                      className={`${unreadCount && unreadCount > 0 && 'mx-auto flex flex-row items-center gap-1'}`}
                      onClick={() => {
                        if (unreadCount) {
                          handleFeedbackOpen()
                        } else {
                          push(`/ib/student/tok/essay/detail/${data.id}`, {
                            project: ibData,
                            type: 'checklist',
                          })
                        }
                      }}
                    >
                      {unreadCount && unreadCount > 0 ? (
                        <>
                          <ColorSVGIcon.New color="orange800" />
                          보기
                        </>
                      ) : (
                        '보기'
                      )}
                    </ButtonV2>
                  ) : (
                    <>-</>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </main>
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={data?.id || 0}
          referenceTable="ESSAY"
        />
      )}
      {modalOpen && (
        <IbEssay
          modalOpen={true}
          setModalClose={() => setModalOpen(!modalOpen)}
          projectId={ibData?.id}
          type="create"
          onSuccess={handleSuccess}
          essayData={data}
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
