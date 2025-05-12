import { useEffect, useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { useRecoilValue } from 'recoil'
import { ActivityFilterEnum } from '@/legacy/constants/activity-filter.enum'
import { useActivityFindByStudent } from '@/legacy/generated/endpoint'
import { childState, meState } from '@/stores'

export function useStudentActivity() {
  const { replace } = useHistory()
  const me = useRecoilValue(meState)
  const child = useRecoilValue(childState)
  const { data, isLoading, isError } = useActivityFindByStudent({
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  useEffect(() => {
    if (me?.role === 'PARENT') replace('/student')
  }, [me])

  const [subject, setSubject] = useState<string>()
  const [blankOpen, setBlankOpen] = useState(false)
  const [filter, setFilter] = useState(ActivityFilterEnum.All)

  const uniqueSubjects = data?.reduce((acc, cur) => {
    if (acc.indexOf(cur.subject) === -1) {
      acc.push(cur.subject)
    }
    return acc
  }, [] as string[])

  const activities = data
    ?.filter((a) => {
      if (filter === ActivityFilterEnum.All || filter === ActivityFilterEnum.Before) {
        return true
      } else {
        return a.type === filter
      }
    })
    ?.filter((a) => {
      if (subject === 'all') {
        return true
      }
      if (subject) {
        return a.subject === subject
      } else {
        return true
      }
    })
    ?.sort((a, b) =>
      filter === ActivityFilterEnum.Before ? new Date(a.endDate).getTime() - new Date(b.endDate).getTime() : 0,
    )

  return {
    activities,
    isError,
    isLoading,
    blankOpen,
    setBlankOpen,
    subject,
    setSubject,
    filter,
    setFilter,
    uniqueSubjects,
  }
}
