import _ from 'lodash'
import { useMemo } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { ACTIVITY_SESSION_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { useActivitySessionFindSubmitters } from '@/legacy/generated/endpoint'
import { ActivitySession, RequestUpdateActivitySessionOrderDto, StudentGroup } from '@/legacy/generated/model'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'

interface SesstionTableItemProps {
  session: ActivitySession
  groupIds: number[]
  activityId: number
  index: number
  order: RequestUpdateActivitySessionOrderDto
  setSelectedSessionId: (value: number) => void
  setDownloadModalOpen: (value: boolean) => void
}

export const SessionTableItem = ({
  session,
  groupIds,
  activityId,
  order,
  setSelectedSessionId,
  setDownloadModalOpen,
  index,
}: SesstionTableItemProps) => {
  const { data } = useActivitySessionFindSubmitters(
    { id: session.id || 0, groupIds },

    {
      query: {
        enabled: !!session.id && groupIds.length > 0,
        staleTime: 60000,
      },
    },
  )
  const { push } = useHistory()
  const studentGroups: StudentGroup[] = useMemo(() => {
    if (!data) return []
    return _.chain(data).uniqBy('user.id').sortBy('groupId').value()
  }, [data])
  const submittedStudentAmount =
    studentGroups?.filter((sg) => sg.user?.studentActivitySessions?.[0]?.isSubmitted).length || 0
  const unSubmittedStudentAmount = (studentGroups?.length || 0) - submittedStudentAmount

  return (
    <>
      <td className="border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333]">
        <Icon.ArrowOrder className="mx-auto h-6 w-6 cursor-pointer" />
      </td>
      <td className="border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333]">
        <div>{ACTIVITY_SESSION_TYPE_KOR[session.type]}</div>
      </td>
      <td className="border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333]">
        {order ? (order?.viewOrder ? order.viewOrder + '차시' : '') : index + 1 + '차시'}
      </td>
      <td
        className="cursor-pointer border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333] hover:underline hover:underline-offset-4"
        onClick={() => push(`/teacher/activityv3/${activityId}/session/${session.id}`)}
      >
        {session.title}
      </td>
      <td className="border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333]">
        {session.endDate ? `~ ${makeDateToString(session.endDate)} ${makeTimeToString(session.endDate)}` : '-'}
      </td>
      <td className="border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333]">
        <span className="text-sm">{submittedStudentAmount} /</span>
        <span className="text-sm text-orange-500">&nbsp;{unSubmittedStudentAmount}</span>
      </td>
      <td className="hidden border-b border-[#EEEEEE] px-2 py-2 text-sm text-[#333333] md:table-cell">
        <Button
          className="w-full rounded-lg border border-[#333333] bg-white"
          onClick={() => {
            setSelectedSessionId(session.id)
            setDownloadModalOpen(true)
          }}
        >
          제출현황 다운로드
        </Button>
      </td>
    </>
  )
}
