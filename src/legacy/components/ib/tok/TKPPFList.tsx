import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { ResponseIBDto, ResponseTKPPFDto } from '@/legacy/generated/model'

import FeedbackViewer from '../FeedbackViewer'

import { IbTKPPF } from './IbTKPPF'

interface TKPPFListProps {
  data?: ResponseTKPPFDto | undefined
  ibData: ResponseIBDto
  refetch: () => void
}

export default function TKPPFList({ data, ibData, refetch }: TKPPFListProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const handleSuccess = () => {
    setModalOpen(!modalOpen)
    refetch()
    setAlertMessage(`TKPPF가\n저장되었습니다`)
  }

  const { push } = useHistory()
  const { data: Feedback } = useGetFeedbackBatchExist(
    {
      referenceIds: String(data?.id),
      referenceTable: 'TKPPF',
    },
    { enabled: !!data },
  )

  const { data: count } = useGetUnreadFeedbackCount(
    { referenceId: data?.id || 0, referenceTable: 'TKPPF' },
    {
      enabled: !!data,
    },
  )

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true)
    if (unreadCount && unreadCount > 0) {
      setUnreadCount(0)
    }
  }

  const isTKPPFComplete = (tkppf: ResponseTKPPFDto | undefined): boolean => {
    if (!tkppf) return false

    // 모든 필드가 작성되었는지 확인
    return !!tkppf?.sequence1?.text && !!tkppf?.sequence2?.text && !!tkppf?.sequence3?.text
  }

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count)
    }
  }, [count])

  return (
    <section className="h-[664px]">
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">TKPPF</Typography>
        {data !== undefined && !isTKPPFComplete(data) && (
          <ButtonV2 variant="solid" color="orange800" size={40} onClick={() => setModalOpen(true)}>
            작성하기
          </ButtonV2>
        )}
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
              <Typography variant="body2">TKPPF를 업로드할 수 있습니다.</Typography>
            </span>
          </section>
        ) : data === undefined ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">작성한 TKPPF가 없습니다.</Typography>
              <Typography variant="body2">TKPPF를 작성해주세요.</Typography>
            </span>
            <ButtonV2
              variant="solid"
              color="orange100"
              size={40}
              onClick={() => {
                setModalOpen(true)
              }}
            >
              작성하기
            </ButtonV2>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-y border-y-gray-100 text-[15px] font-medium text-gray-500">
              <tr>
                <td className="w-[964px] py-[9px] pr-2 pl-6 text-center">주제</td>
                <td className="w-[150px] px-2 py-[9px] text-center">수정일</td>
                <td className="w-[166px] py-[9px] pr-6 pl-2 text-center">피드백</td>
              </tr>
            </thead>
            <tbody className="text-15 font-medium text-gray-900">
              <tr className="border-b border-b-gray-100">
                <td
                  className="text-15 cursor-pointer py-3 pr-2 pl-6 text-center font-medium text-gray-900"
                  onClick={() =>
                    push(`/ib/student/tok/essay/${ibData.id}/tkppf/${data.id}`, {
                      data: ibData,
                      title: ibData.title,
                    })
                  }
                >
                  공식 TKPPF
                </td>
                <td className="px-2 py-3 text-center">{format(new Date(data?.updatedAt), 'yyyy.MM.dd')}</td>
                <td className="flex items-center justify-center py-3 pr-6 pl-2">
                  {Feedback?.items[0].totalCount && Feedback?.items[0].totalCount > 0 ? (
                    <ButtonV2
                      variant="outline"
                      color="gray400"
                      size={32}
                      className={`${unreadCount && unreadCount > 0 && 'flex flex-row items-center gap-1'}`}
                      onClick={() => {
                        if (unreadCount) {
                          handleFeedbackOpen()
                        } else {
                          push(`/ib/student/tok/essay/${ibData.id}/tkppf/${data.id}`, {
                            data: ibData,
                            title: ibData.title,
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
          referenceTable="TKPPF"
        />
      )}
      {modalOpen && (
        <IbTKPPF
          modalOpen={true}
          setModalClose={() => setModalOpen(false)}
          projectId={ibData.id}
          onSuccess={handleSuccess}
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
