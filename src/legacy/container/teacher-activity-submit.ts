import { useState } from 'react'
import { useActivityFindActivitySubmitUsers } from '@/legacy/generated/endpoint'

enum FilterType {
  All = 0,
  Submitted = 1,
  NotSubmitted = 2,
}

export function useTeacherActivitySubmit(activityId: number, groupId?: number) {
  const selectedFilterIndex = Number(localStorage.getItem('selectedFilter'))
  const [filterIndex, setFilterIndex] = useState(selectedFilterIndex || 0)

  const { data, isError, isLoading } = useActivityFindActivitySubmitUsers(
    activityId,
    { groupId: groupId },
    {
      query: {
        enabled: !!activityId,
        keepPreviousData: true,
      },
    },
  )

  const filteredUser = data?.filter((user) =>
    filterIndex === FilterType.Submitted
      ? user.studentActivitySubmitted
      : filterIndex === FilterType.NotSubmitted
        ? !user.studentActivitySubmitted
        : true,
  )

  return {
    filterIndex,
    setFilterIndex,
    filteredUser,
    isLoading,
    isError,
  }
}
