import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { useRRSGetByIBIdFindAll } from '@/legacy/container/ib-rrs-findAll'
import { FeedbackReferenceTable, ResponseIBDto } from '@/legacy/generated/model'
import { LocationState } from '@/legacy/types/ib'

import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import FeedbackViewer from '../../FeedbackViewer'
import { IBPagination } from '../../ProjectList'

interface RRSListProps {
  id: number
  data: ResponseIBDto
  studentData: LocationState['student']
}

export default function RRSList({ id, data: ibData, studentData }: RRSListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const { data } = useRRSGetByIBIdFindAll(id, { page: currentPage })
  const { push } = useHistory()

  const rrsIds = data?.total ? data.items.map((rrs) => rrs.id).join(',') : null
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})

  const { data: feedbacks } = useGetFeedbackBatchExist(
    rrsIds ? { referenceIds: rrsIds, referenceTable: 'RRS' } : { referenceIds: '', referenceTable: 'RRS' },
    { enabled: !!rrsIds },
  )

  useEffect(() => {
    const initialCounts: Record<string, number> = {}
    if (feedbacks?.items) {
      feedbacks.items.forEach((item) => {
        initialCounts[`RRS-${item.referenceId}`] = item.unreadCount || 0
      })
    }
    setLocalUnreadCounts(initialCounts)
  }, [feedbacks])

  const markAsRead = (referenceId: number) => {
    const key = `RRS-${referenceId}`
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
    <section className="flex h-[664px] flex-col">
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1" className="text-gray-900">
          RRS
        </Typography>
      </header>
      <main className="flex flex-1 flex-col items-center justify-between">
        {data?.total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              {ibData?.status === 'WAIT_COMPLETE' || ibData?.status === 'COMPLETE' ? (
                <Typography variant="body2" className="font-medium text-gray-900">
                  작성된 RRS가 없습니다.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" className="font-medium text-gray-900">
                    학생이 RRS를 작성해야
                  </Typography>
                  <Typography variant="body2" className="font-medium text-gray-900">
                    확인할 수 있습니다.
                  </Typography>
                </>
              )}
            </span>
          </div>
        ) : (
          <table className="w-full text-center">
            <thead className="border-y border-y-gray-100 text-[15px] text-gray-500">
              <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px] font-medium">
                <th className="w-[68px]">번호</th>
                <th className="w-[740px]">제목</th>
                <th className="w-[200px]">수정일</th>
                <th className="w-[176px]">학생 댓글</th>
              </tr>
            </thead>
            <tbody className="text-[15px] font-medium text-gray-900">
              {data?.items
                ?.slice()
                .reverse()
                .map((rrs, index) => {
                  const feedback = feedbacks?.items?.find((item) => item.referenceId === rrs.id)
                  const itemNumber = data.total - (currentPage - 1) * 10 - index
                  return (
                    <tr
                      key={rrs.id}
                      className="flex w-full items-center justify-between gap-[16px] border-b border-b-gray-100 px-[24px] py-[9px]"
                    >
                      <td className="w-[68px]">{itemNumber}</td>
                      <td
                        className="line-clamp-1 w-[740px] cursor-pointer"
                        onClick={() =>
                          push(`/teacher/ib/ee/${id}/rrs/${rrs.id}`, {
                            data: ibData,
                            student: studentData,
                          })
                        }
                      >
                        {rrs.title}
                      </td>
                      <td className="w-[200px]">{format(new Date(rrs.createdAt), 'yyyy.MM.dd')}</td>
                      <td className="flex w-[176px] items-center justify-center">
                        {feedback ? (
                          feedback.totalCount === 0 ? (
                            <>-</>
                          ) : localUnreadCounts[`RRS-${rrs.id}`] === 0 ? (
                            <ButtonV2
                              variant="outline"
                              color="gray400"
                              size={32}
                              onClick={() =>
                                push(`/teacher/ib/ee/${id}/rrs/${rrs.id}`, {
                                  data: ibData,
                                  student: studentData,
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
                              onClick={() => handleFeedbackOpen(rrs.id, 'RRS', localUnreadCounts[`RRS-${rrs.id}`])}
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
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={feedbackReference?.referenceId || 0}
          referenceTable={feedbackReference?.referenceTable || 'RRS'}
        />
      )}
    </section>
  )
}
