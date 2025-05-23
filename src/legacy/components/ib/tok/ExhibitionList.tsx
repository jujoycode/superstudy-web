import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { ResponseExhibitionDto } from '@/legacy/generated/model'

import FeedbackViewer from '../FeedbackViewer'

import { IbExhibition } from './IbExhibition'

interface ExhibitionListProps {
  data?: ResponseExhibitionDto
  ibId: number
  canCreate: boolean
  refetch: () => void
}

export default function ExhibitionList({ ibId, data, canCreate, refetch }: ExhibitionListProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)

  const handleSuccess = () => {
    refetch()
    setAlertMessage(`전시회가\n저장되었습니다`)
  }

  const { push } = useHistory()

  const { data: Feedback } = useGetFeedbackBatchExist(
    {
      referenceIds: String(data?.id),
      referenceTable: 'EXHIBITION',
    },
    { enabled: !!data },
  )

  const { data: unReadFeedbackCount } = useGetUnreadFeedbackCount(
    {
      referenceTable: 'EXHIBITION',
      referenceId: data?.id || 0,
    },
    { enabled: !!data },
  )

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
        <Typography variant="title1">전시회</Typography>
      </header>
      <main>
        {!canCreate ? (
          <section className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">기획안이 승인되어야</Typography>
              <Typography variant="body2">전시회를 작성할 수 있습니다.</Typography>
            </span>
          </section>
        ) : data === undefined ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">작성한 전시회가 없습니다.</Typography>
              <Typography variant="body2">전시회를 작성해주세요.</Typography>
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
                <td className="w-[964px] py-[9px] pr-2 pl-6 text-center">질문</td>
                <td className="w-[150px] px-2 py-[9px] text-center">수정일</td>
                <td className="w-[166px] py-[9px] pr-6 pl-2 text-center">피드백</td>
              </tr>
            </thead>
            <tbody className="text-15 font-medium text-gray-900">
              <tr className="border-b border-b-gray-100">
                <td
                  className="box-border h-[54px] cursor-pointer overflow-hidden py-4 pr-2 pl-6 text-center text-ellipsis whitespace-nowrap"
                  onClick={() =>
                    push(`/ib/student/tok/exhibition/${ibId}/detail/${data.id}`, {
                      project: data,
                    })
                  }
                >
                  {data?.themeQuestion}
                </td>
                <td className="h-[54px] px-2 py-4 text-center">{format(new Date(data?.updatedAt), 'yyyy.MM.dd')}</td>
                <td className="flex h-[54px] items-center justify-center py-4 pr-6 pl-2">
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
                          push(`/ib/student/tok/exhibition/${ibId}/detail/${data?.id}`)
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
          referenceTable="EXHIBITION"
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
      {modalOpen && (
        <IbExhibition
          modalOpen={modalOpen}
          setModalClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
          ibId={ibId}
        />
      )}
    </section>
  )
}
