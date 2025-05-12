import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import { BadgeV2, BadgeV2Color } from '@/legacy/components/common/BadgeV2'
import { useGetFeedbackExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { ResponseIBDto } from '@/legacy/generated/model'
import { ButtonV2 } from '../../@/legacy/components/common/ButtonV2'
import { Typography } from '../../@/legacy/components/common/Typography'
import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import FeedbackViewer from '../../FeedbackViewer'

interface ProposalListProps {
  data: ResponseIBDto
  refetch: () => void
}

const statusBadge: Record<string, { color: BadgeV2Color; label: string }> = {
  SENT: { color: 'gray', label: '제안' },
  REJECT: { color: 'red', label: '반려' },
  ACCEPT: { color: 'blue', label: '채택' },
}

export default function ProposalList({ data, refetch }: ProposalListProps) {
  const { push } = useHistory()
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)

  const { data: unReadFeedbackCount } = useGetUnreadFeedbackCount({
    referenceTable: 'IB',
    referenceId: data.id || 0,
  })

  const { data: feedback } = useGetFeedbackExist({
    referenceId: data?.id || 0,
    referenceTable: 'IB',
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
    <div>
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">제안서</Typography>
      </header>
      <table className="w-full text-center">
        <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px]">
          <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px] font-medium">
            <th className="w-[68px]">순위</th>
            <th className="w-[200px]">과목</th>
            <th className="w-[416px]">연구주제</th>
            <th className="w-[156px]">수정일</th>
            <th className="w-[156px]">학생 댓글</th>
            <th className="w-[156px]">상태</th>
          </tr>
        </thead>
        <tbody className="text-primary-gray-900 text-[15px] font-medium">
          {data?.proposals
            ?.filter((proposal) => proposal.status !== 'PENDING')
            ?.sort((a, b) => a.rank - b.rank)
            .map((proposal) => (
              <tr
                key={proposal.id}
                className="border-b-primary-gray-100 flex w-full items-center justify-between gap-[16px] border-b px-[24px] py-[9px]"
              >
                <td className="w-[68px]">{proposal.rank}</td>
                <td className="line-clamp-1 w-[200px]">{proposal.subject}</td>
                <td
                  className="line-clamp-1 w-[416px] cursor-pointer"
                  onClick={() => push(`/teacher/ib/ee/${data.id}/proposal/${proposal.id}`)}
                >
                  {proposal.researchTopic}
                </td>
                <td className="w-[156px]">{format(new Date(proposal.createdAt), 'yyyy.MM.dd')}</td>
                <td className="flex w-[156px] items-center justify-center">
                  {(proposal.status === 'ACCEPT' && feedback) ||
                  (proposal.status === 'SUBMIT' && data.status === 'REJECT_PLAN') ? (
                    <ButtonV2
                      variant="outline"
                      color="gray400"
                      size={32}
                      className={`${unreadCount && unreadCount > 0 && 'mx-auto flex flex-row items-center gap-1'}`}
                      onClick={() => {
                        if (unreadCount) {
                          handleFeedbackOpen()
                        } else {
                          push(`/teacher/ib/ee/${data.id}/proposal/${proposal.id}`)
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
                <td className="flex w-[156px] items-center justify-center">
                  {proposal.status === 'ACCEPT' && data.status === 'REJECT_PLAN' ? (
                    <BadgeV2 color="gray" type="line" size={24}>
                      보완필요
                    </BadgeV2>
                  ) : proposal.status === 'PENDING' ? (
                    <>-</>
                  ) : proposal.status === 'ACCEPT' && data.status === 'WAIT_PLAN_APPROVE' ? (
                    <BadgeV2 color={'gray'} type="line" size={24}>
                      제안
                    </BadgeV2>
                  ) : (
                    <BadgeV2 color={statusBadge[proposal.status]?.color || 'gray'} type="line" size={24}>
                      {statusBadge[proposal.status]?.label || '제안'}
                    </BadgeV2>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={data.id}
          referenceTable="IB"
        />
      )}
    </div>
  )
}
