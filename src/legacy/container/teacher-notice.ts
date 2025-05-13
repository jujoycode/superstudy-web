import { useEffect, useState } from 'react'

import { QueryKey } from '@/legacy/constants/query-key'
import { createContainer } from '@/legacy/container/createContainer'
import { useNoticesFindAll } from '@/legacy/generated/endpoint'

export function useTeacherNoticeHook() {
  const [pageIngo, _] = useState({ page: 1, limit: 500 })
  const [category, setCategory] = useState<string>('전체')
  const [year, setYear] = useState(new Date().getFullYear())

  const {
    data: noticeList,
    isLoading: isNoticeListLoading,
    isError: isNoticeListError,
    refetch,
  } = useNoticesFindAll(
    { ...pageIngo, year },
    {
      query: {
        queryKey: [...QueryKey.teacher.noticeList, pageIngo],
      },
    },
  )

  const filteredNoticeList =
    category === '전체' ? noticeList?.items : noticeList?.items.filter((el) => el.category === category)

  const unReadNoticeList = noticeList?.unreadIdList

  useEffect(() => {
    if (!isNoticeListLoading) {
      refetch()
    }
  }, [year])

  return {
    filteredNoticeList,
    category,
    isNoticeListLoading,
    isNoticeListError,
    unReadNoticeList,
    setCategory,
    year,
    setYear,
  }
}

export const TeacherNoticeContainer = createContainer(useTeacherNoticeHook)
