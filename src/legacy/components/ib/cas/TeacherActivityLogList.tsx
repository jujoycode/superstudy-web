import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useLocation, useOutletContext } from 'react-router'
import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useActivityLogGetAll } from '@/legacy/container/ib-cas'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { FeedbackReferenceTable, ResponseIBDto } from '@/legacy/generated/model'

import FeedbackViewer from '../FeedbackViewer'
import { IBPagination } from '../ProjectList'

const itemsPerPage = 10

interface TeahcerActivityLogListProps {
  data: ResponseIBDto
}

export default function TeahcerActivityLogList() {
  const { data: IBData } = useOutletContext<TeahcerActivityLogListProps>()
  const { push } = useHistory()
  const location = useLocation()
  const page = location.state?.page
  const [currentPage, setCurrentPage] = useState(page || 1)
  const { data, isLoading } = useActivityLogGetAll(IBData.id, { page: currentPage, limit: 10 })
  const logIds = data?.items.map((log) => log.id).join(',')
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})

  const { data: feedbacks, isLoading: isFeedbackFetching } = useGetFeedbackBatchExist(
    logIds
      ? {
          referenceIds: logIds,
          referenceTable: 'ACTIVITY_LOG',
        }
      : { referenceIds: '', referenceTable: 'ACTIVITY_LOG' },
    { enabled: !!logIds },
  )

  useEffect(() => {
    const initialCounts: Record<string, number> = {}
    if (feedbacks?.items) {
      feedbacks.items.forEach((item) => {
        initialCounts[`ACTIVITY_LOG-${item.referenceId}`] = item.unreadCount || 0
      })
    }
    setLocalUnreadCounts(initialCounts)
  }, [feedbacks])

  const markAsRead = (referenceId: number) => {
    const key = `ACTIVITY_LOG-${referenceId}`
    setLocalUnreadCounts((prevCounts) => ({
      ...prevCounts,
      [key]: 0,
    }))
  }

  const handleFeedbackOpen = (referenceId: number, referenceTable: FeedbackReferenceTable, unreadCount: number) => {
    setFeedbackReference({ referenceId, referenceTable })
    setFeedbackOpen(true)

    if (unreadCount > 0) {
      markAsRead(referenceId)
    }
  }

  return (
    <section className="relative flex min-h-[664px] flex-col rounded-xl bg-white">
      {isLoading || isFeedbackFetching ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <IBBlank type="section" />
        </div>
      ) : (
        <>
          <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
            <Typography variant="title1">활동일지</Typography>
          </header>
          <main className="flex flex-1 flex-col items-center justify-between pb-6">
            {IBData?.status === 'PENDING' ? (
              <div className="flex flex-col items-center justify-center gap-6 py-20">
                <div className="h-12 w-12 px-[2.50px]">
                  <img src={NODATA} className="h-12 w-[43px] object-cover" />
                </div>
                <Typography
                  variant="body2"
                  className="text-center"
                >{`계획서 승인 후, 학생이 활동일지를 작성해야\n확인할 수 있습니다.`}</Typography>
              </div>
            ) : data?.total === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 py-20">
                <div className="h-12 w-12 px-[2.50px]">
                  <img src={NODATA} className="h-12 w-[43px] object-cover" />
                </div>
                <Typography
                  variant="body2"
                  className="text-center"
                >{`작성된 활동일지가 없습니다.\n활동일지를 작성하도록 지도해 주세요.`}</Typography>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-y border-y-gray-100 text-[15px] font-medium text-gray-500">
                  <tr>
                    <td className="w-[100px] py-[9px] pr-2 pl-6 text-center">번호</td>
                    <td className="w-[540px] px-2 py-[9px] text-center">제목</td>
                    <td className="w-[216px] px-2 py-[9px] text-center">작성자</td>
                    <td className="w-[216px] px-2 py-[9px] text-center">수정일</td>
                    <td className="w-[208px] py-[9px] pr-6 pl-2 text-center">피드백</td>
                  </tr>
                </thead>
                <tbody>
                  {data?.items
                    ?.slice()
                    .reverse()
                    .map((activityLog, index) => {
                      const feedback = feedbacks?.items?.find((item) => item.referenceId === activityLog.id)
                      const itemNumber = data.total - (currentPage - 1) * itemsPerPage - index
                      return (
                        <tr key={activityLog.id} className="border-b border-b-gray-100">
                          <td className="py-4 pr-2 pl-6 text-center">{itemNumber}</td>
                          <td
                            className="cursor-pointer px-2 py-4 text-start"
                            onClick={() =>
                              push(`/teacher/ib/cas/${IBData.id}/activitylog/${activityLog.id}`, { page: currentPage })
                            }
                          >
                            {activityLog.title}
                          </td>
                          <td className="px-2 py-4 text-center">{activityLog.writer.name}</td>
                          <td className="px-2 py-4 text-center">
                            {format(new Date(activityLog.updatedAt), 'yyyy.MM.dd')}
                          </td>
                          <td className="flex justify-center py-4 pr-6 pl-2">
                            {feedback ? (
                              feedback.totalCount === 0 ? (
                                <>-</>
                              ) : localUnreadCounts[`ACTIVITY_LOG-${activityLog.id}`] === 0 ? (
                                <ButtonV2
                                  variant="outline"
                                  color="gray400"
                                  size={32}
                                  onClick={() =>
                                    push(`/teacher/ib/cas/${IBData.id}/activitylog/${activityLog.id}`, {
                                      page: currentPage,
                                    })
                                  }
                                >
                                  보기
                                </ButtonV2>
                              ) : (
                                <ButtonV2
                                  className="flex flex-row items-center gap-1"
                                  variant="outline"
                                  color="gray400"
                                  size={32}
                                  onClick={() =>
                                    handleFeedbackOpen(
                                      activityLog.id,
                                      'ACTIVITY_LOG',
                                      localUnreadCounts[`ACTIVITY_LOG-${activityLog.id}`],
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
            {data?.totalPages && data?.totalPages > 1 ? (
              <div className="mt-auto">
                <IBPagination
                  totalItems={data?.total || 0}
                  itemsPerPage={10}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : null}
          </main>
        </>
      )}

      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={feedbackReference?.referenceId || 0}
          referenceTable={feedbackReference?.referenceTable || 'ACTIVITY_LOG'}
        />
      )}
    </section>
  )
}
