import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { useGetFeedbackExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { useEssayGetEssay } from '@/legacy/generated/endpoint'
import { ResponseIBDto } from '@/legacy/generated/model'
import { LocationState } from '@/legacy/types/ib'

import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import { PopupModal } from '../../../PopupModal'
import { CheckList } from '../../CheckList'
import FeedbackViewer from '../../FeedbackViewer'
import { ButtonV2 } from '../@/legacy/components/common/ButtonV2'
import { Typography } from '../@/legacy/components/common/Typography'

import NODATA from '@/legacy/assets/images/no-data.png'

interface EssayListProps {
  data: ResponseIBDto
  studentData: LocationState['student']
  refetch: () => void
}

export default function EssayList({ data, studentData, refetch }: EssayListProps) {
  const { push } = useHistory()
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false)
  const [checkListOpen, setCheckListOpen] = useState<boolean>(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)

  const approvedProposal = data.proposals?.find((proposal) => proposal.status === 'ACCEPT')
  const { data: essayData } = useEssayGetEssay(data.id)

  const { data: feedback } = useGetFeedbackExist(
    {
      referenceId: essayData?.id || 0,
      referenceTable: 'ESSAY',
    },
    { enabled: essayData?.status === 'SUBMIT' },
  )

  const { data: count } = useGetUnreadFeedbackCount(
    { referenceId: essayData?.id || 0, referenceTable: 'ESSAY' },
    { enabled: essayData?.status === 'SUBMIT' },
  )

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count)
    }
  }, [count])

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true)
    if (unreadCount && unreadCount > 0) {
      setUnreadCount(0)
    }
  }

  return (
    <>
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1">에세이</Typography>
      </header>
      <main>
        {!essayData || essayData.status === 'PENDING' ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">제안서 승인 후, 학생이 에세이를 업로드해야</Typography>
              <Typography variant="body2">확인할 수 있습니다.</Typography>
            </span>
          </div>
        ) : (
          <table className="w-full text-center">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px]">
              <tr className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[9px] font-medium">
                <th className="w-[176px]">과목</th>
                <th className="w-[524px]">연구주제</th>
                <th className="w-[156px]">수정일</th>
                <th className="w-[156px]">학생 댓글</th>
                <th className="w-[156px]">체크리스트</th>
              </tr>
            </thead>
            <tbody className="text-primary-gray-900 text-[15px] font-medium">
              <tr className="border-b-primary-gray-100 flex w-full items-center justify-between gap-[16px] border-b px-[24px] py-[9px]">
                <td className="line-clamp-1 w-[176px]">{approvedProposal?.subject}</td>
                <td
                  className="line-clamp-1 w-[524px] cursor-pointer"
                  onClick={() =>
                    push(`/teacher/ib/ee/${data.id}/essay/${essayData?.id}`, {
                      title: approvedProposal?.researchTopic,
                      student: studentData,
                      data,
                    })
                  }
                >
                  {approvedProposal?.researchTopic}
                </td>
                <td className="w-[156px]">{essayData ? format(new Date(essayData.createdAt), 'yyyy.MM.dd') : '-'}</td>
                <td className="flex w-[156px] items-center justify-center">
                  {feedback ? (
                    unreadCount && unreadCount > 0 ? (
                      <ButtonV2
                        className="flex flex-row items-center gap-1"
                        variant="outline"
                        color="gray400"
                        size={32}
                        onClick={handleFeedbackOpen}
                      >
                        <>
                          <ColorSVGIcon.New color="orange800" />
                          보기
                        </>
                      </ButtonV2>
                    ) : (
                      <ButtonV2
                        variant="outline"
                        color="gray400"
                        size={32}
                        onClick={() =>
                          push(`/teacher/ib/ee/${data.id}/essay/${essayData?.id}`, {
                            type: 'feedback',
                            title: approvedProposal?.researchTopic,
                            student: studentData,
                            data,
                          })
                        }
                      >
                        보기
                      </ButtonV2>
                    )
                  ) : (
                    <>-</>
                  )}
                </td>
                <td className="w-[156px]">
                  <ButtonV2 variant="outline" color="gray400" size={32} onClick={() => setCheckListOpen(true)}>
                    확인하기
                  </ButtonV2>
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
          referenceId={essayData?.id || 0}
          referenceTable="ESSAY"
        />
      )}
      <PopupModal modalOpen={checkListOpen} setModalClose={() => setCheckListOpen(false)} title="체크리스트">
        <CheckList.Teacher student={data.leader} charCount={essayData?.charCount || 0} />
      </PopupModal>
    </>
  )
}
