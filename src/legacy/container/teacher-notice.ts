import { useEffect, useState } from 'react'
import { QueryKey } from '@/legacy/constants/query-key'
import { useNoticesFindAll } from '@/legacy/generated/endpoint'
import { createContainer } from './createContainer'

export function useTeacherNoticeHook() {
  const [category, setCategory] = useState<string>('전체')
  const [year, setYear] = useState(new Date().getFullYear())
  const [pageIngo] = useState({ page: 1, limit: 500 })

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
