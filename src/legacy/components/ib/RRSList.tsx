import { format } from 'date-fns'
import { memo, useCallback, useEffect, useState } from 'react'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { useGetFeedbackBatchExist } from '@/legacy/container/ib-feedback'
import { useRRSGetByIBIdFindAll } from '@/legacy/container/ib-rrs-findAll'
import { FeedbackReferenceTable, ResponseIBDtoStatus } from '@/legacy/generated/model'

import ColorSVGIcon from '../icon/ColorSVGIcon'

import { IbEeRRS } from './ee/IbEeRRS'
import FeedbackViewer from './FeedbackViewer'
import { IBPagination } from './ProjectList'

interface RRSListProps {
  id: number
  title: string
  status: ResponseIBDtoStatus
}

const RRSList = memo(({ id, title, status }: RRSListProps) => {
  const { push } = useHistory()
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading } = useRRSGetByIBIdFindAll(id, { page: currentPage })
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [feedbackReference, setFeedbackReference] = useState<{
    referenceId: number
    referenceTable: FeedbackReferenceTable
  }>()
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({})
  const handleSuccess = useCallback(() => {
    setIsOpen(!isOpen)
    setAlertOpen(!alertOpen)
  }, [isOpen, alertOpen])

  const rrsIds = data?.total ? data.items.map((rrs) => rrs.id).join(',') : null

  const { data: feedbacks } = useGetFeedbackBatchExist(
    rrsIds ? { referenceIds: rrsIds, referenceTable: 'RRS' } : { referenceIds: '', referenceTable: 'RRS' }, // 기본값 전달
    { enabled: !!rrsIds }, // 쿼리 활성화 조건
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

  const markAsRead = useCallback((referenceId: number) => {
    const key = `RRS-${referenceId}`
    setLocalUnreadCounts((prevCounts) => ({
      ...prevCounts,
      [key]: 0,
    }))
  }, [])

  const handleFeedbackOpen = useCallback(
    (referenceId: number, referenceTable: FeedbackReferenceTable, unreadCount: number) => {
      setFeedbackReference({ referenceId, referenceTable })
      setFeedbackOpen(true)

      if (unreadCount > 0) {
        markAsRead(referenceId)
      }
    },
    [markAsRead],
  )

  return (
    <section className="flex h-[664px] flex-col">
      {isLoading && <IBBlank />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">RRS</Typography>
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
          <table className="w-full text-center">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px] font-medium">
              <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px]">
                <td className="w-[68px]">번호</td>
                <td className="w-[740px]">제목</td>
                <td className="w-[200px]">수정일</td>
                <td className="w-[176px]">피드백</td>
              </tr>
            </thead>
            <tbody>
              {data?.items?.slice().map((rrs, index) => {
                const feedback = feedbacks?.items?.find((item) => item.referenceId === rrs.id)
                const itemNumber = (currentPage - 1) * 10 + index + 1
                return (
                  <tr
                    key={rrs.id}
                    className="border-b-primary-gray-100 flex w-full items-center justify-between gap-[16px] border-b px-[24px] py-[9px]"
                  >
                    <td className="w-[68px]">{itemNumber}</td>
                    <td
                      className="line-clamp-1 w-[740px] cursor-pointer"
                      onClick={() => push(`/ib/student/ee/${id}/rrs/${rrs.id}`, { title: title })}
                    >
                      {rrs.title}
                    </td>
                    <td className="w-[200px]">{format(new Date(rrs.updatedAt), 'yyyy.MM.dd')}</td>
                    <td className="flex w-[176px] items-center justify-center">
                      {feedback ? (
                        feedback.totalCount === 0 ? (
                          <>-</>
                        ) : localUnreadCounts[`RRS-${rrs.id}`] === 0 ? (
                          <ButtonV2
                            variant="outline"
                            color="gray400"
                            size={32}
                            onClick={() => push(`/ib/student/ee/${id}/rrs/${rrs.id}`, { title: title })}
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
})

export default RRSList
