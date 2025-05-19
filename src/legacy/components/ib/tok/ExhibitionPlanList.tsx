import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { ResponseIBDto } from '@/legacy/generated/model'

import FeedbackViewer from '../FeedbackViewer'

interface ExhibitionPlanListProps {
  data: ResponseIBDto
}

export default function ExhibitionPlanList({ data }: ExhibitionPlanListProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)

  const { push } = useHistory()

  const { data: count } = useGetUnreadFeedbackCount({ referenceId: data.id, referenceTable: 'IB' }, { enabled: !!data })

  const { data: Feedback } = useGetFeedbackBatchExist(
    {
      referenceIds: String(data.id),
      referenceTable: 'IB',
    },
    { enabled: !!data },
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

  if (data === undefined) return <IBBlank />

  return (
    <section className="h-[664px]">
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">기획안</Typography>
      </header>
      <main>
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
                className="cursor-pointer overflow-hidden py-4 pr-2 pl-6 text-center text-ellipsis whitespace-nowrap"
                onClick={() =>
                  push(`/ib/student/tok/exhibition/plan/${data.id}`, {
                    project: data,
                  })
                }
              >
                {data?.tokExhibitionPlan?.themeQuestion}
              </td>
              <td className="px-2 py-4 text-center">{format(new Date(data?.updatedAt), 'yyyy.MM.dd')}</td>
              <td className="flex items-center justify-center py-4 pr-6 pl-2">
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
                        push(`/ib/student/tok/exhibition/plan/${data.id}`)
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
      </main>
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={data?.id || 0}
          referenceTable="IB"
        />
      )}
    </section>
  )
}
