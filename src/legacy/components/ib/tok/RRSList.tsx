import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { useRRSGetByIBIdFindAll } from '@/legacy/container/ib-rrs-findAll'
import { FeedbackReferenceTable, ResponseIBDtoStatus } from '@/legacy/generated/model'

import { IbEeRRS } from '../ee/IbEeRRS'
import FeedbackViewer from '../FeedbackViewer'
import { IBPagination } from '../ProjectList'

interface RRSListProps {
  id: number
  status: ResponseIBDtoStatus
}

export default function RRSList({ id, status }: RRSListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const { data, refetch, isLoading } = useRRSGetByIBIdFindAll(id, { page: currentPage })
  const { push } = useHistory()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const rrsIds = data?.total ? data?.items.map((rrs) => rrs.id).join(',') : null
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

  const handleSuccess = () => {
    setIsOpen(!isOpen)
    refetch()
    setAlertOpen(!alertOpen)
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
      {isLoading && <IBBlank />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1" className="text-primary-gray-900">
          RRS
        </Typography>
        {data?.total !== 0 && status !== 'COMPLETE' && (
          <ButtonV2
            variant="solid"
            color="orange800"
            size={40}
            onClick={() => setIsOpen(!isOpen)}
            disabled={status === 'WAIT_COMPLETE'}
          >
            작성하기
          </ButtonV2>
        )}
      </header>
      <main className="flex flex-1 flex-col items-center justify-between">
        {data?.total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <Typography variant="body2">
              {status === 'WAIT_COMPLETE' || status === 'COMPLETE' ? '작성된 RRS가 없습니다.' : 'RRS를 추가해주세요.'}
            </Typography>
            {status !== 'WAIT_COMPLETE' && status !== 'COMPLETE' && (
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={() => setIsOpen(!isOpen)}>
                작성하기
              </ButtonV2>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px]">
              <tr>
                <th className="w-[100px] py-[9px] pr-2 pl-6 text-center font-medium">번호</th>
                <th className="w-[756px] px-2 py-[9px] text-center font-medium">제목</th>
                <th className="w-[216px] px-2 py-[9px] text-center font-medium">수정일</th>
                <th className="w-[208px] py-[9px] pr-6 pl-2 text-center font-medium">피드백</th>
              </tr>
            </thead>
            <tbody className="text-primary-gray-900 text-[15px] font-medium">
              {data?.items
                ?.slice()
                .reverse()
                .map((rrs, index) => {
                  const feedback = feedbacks?.items?.find((item) => item.referenceId === rrs.id)
                  const itemNumber = data.total - (currentPage - 1) * 10 - index
                  return (
                    <tr key={rrs.id} className="border-b-primary-gray-100 border-b">
                      <td className="py-[11px] pr-2 pl-6 text-center">{itemNumber}</td>
                      <td
                        className="cursor-pointer px-2 py-[11px] text-start"
                        onClick={() => push(`/ib/student/tok/essay/${id}/rrs/${rrs.id}`)}
                      >
                        {rrs.title}
                      </td>
                      <td className="px-2 py-[11px] text-center">{format(new Date(rrs.createdAt), 'yyyy.MM.dd')}</td>
                      <td className="flex justify-center py-[11px] pr-6 pl-2">
                        {feedback ? (
                          feedback.totalCount === 0 ? (
                            <>-</>
                          ) : localUnreadCounts[`RRS-${rrs.id}`] === 0 ? (
                            <ButtonV2
                              variant="outline"
                              color="gray400"
                              size={32}
                              onClick={() => push(`/ib/student/tok/essay/${id}/rrs/${rrs.id}`)}
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
      {isOpen && (
        <IbEeRRS
          modalOpen={isOpen}
          setModalClose={() => setIsOpen(!isOpen)}
          type="create"
          projectId={Number(id)}
          onSuccess={handleSuccess}
        />
      )}
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={feedbackReference?.referenceId || 0}
          referenceTable={feedbackReference?.referenceTable || 'RRS'}
        />
      )}
      {alertOpen && (
        <AlertV2 message={`RRS가\n저장되었습니다`} confirmText="확인" onConfirm={() => setAlertOpen(!alertOpen)} />
      )}
    </section>
  )
}
