import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useEssayGetByIBId } from '@/legacy/container/ib-essay-find'
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { ResponseIBDto } from '@/legacy/generated/model'

import FeedbackViewer from '../../FeedbackViewer'

interface ExhibitionListProps {
  data: ResponseIBDto
  refetch: () => void
}

export default function EssayList({ data }: ExhibitionListProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { data: Essay, isLoading } = useEssayGetByIBId(data.id)

  const { push } = useHistory()
  const { data: Feedback } = useGetFeedbackBatchExist(
    {
      referenceIds: String(Essay?.id) || '',
      referenceTable: 'ESSAY',
    },
    { enabled: !!data },
  )

  const { data: count } = useGetUnreadFeedbackCount(
    { referenceId: Essay?.id || 0, referenceTable: 'ESSAY' },
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

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count)
    }
  }, [count])

  if (data === undefined) return null

  return (
    <section className="h-[664px]">
      {isLoading && <Blank />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1" className="text-primary-gray-900">
          에세이
        </Typography>
      </header>
      <main>
        {Essay === undefined || Essay.status === 'PENDING' ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="text-center">
              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                아웃라인 승인 후, 학생이 에세이를 업로드해야
                <br />
                확인할 수 있습니다.
              </Typography>
            </span>
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
            <tbody className="text-primary-gray-900 text-[15px] font-medium">
              <tr className="border-b-primary-gray-100 border-b">
                <td
                  className="cursor-pointer py-4 pr-2 pl-6 text-center"
                  onClick={() =>
                    push(`/teacher/ib/tok/essay/${data.id}/detail/${Essay.id}`, {
                      project: data,
                    })
                  }
                >
                  {data?.tokOutline?.themeQuestion}
                </td>
                <td className="px-2 py-4 text-center">{format(new Date(data?.updatedAt), 'yyyy.MM.dd')}</td>
                <td className="flex justify-center py-4 pr-6 pl-2">
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
                          push(`/teacher/ib/tok/essay/${data.id}/detail/${Essay.id}`, {
                            type: 'feedback',
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
          referenceId={Essay?.id || 0}
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
