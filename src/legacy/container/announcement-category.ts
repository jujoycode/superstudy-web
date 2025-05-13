import { useEffect, useState } from 'react'

import { useAnnouncementGetAllAnnouncements } from '@/legacy/generated/endpoint'
import { Announcement, AnnouncementGetAllAnnouncementsType } from '@/legacy/generated/model'

export function useAnnouncementByCategory(initialType?: AnnouncementGetAllAnnouncementsType) {
  const [category, setCategory] = useState(initialType || undefined)
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 999, type: initialType })

  useEffect(() => {
    setPageInfo((prevPageInfo) => ({
      ...prevPageInfo,
      type: category,
    }))
  }, [category])

  const { data, isLoading } = useAnnouncementGetAllAnnouncements(pageInfo, {
    query: {
      queryKey: [pageInfo],
    },
  })

  const announcements = data?.items?.sort((a: Announcement, b: Announcement) => {
    if (a.isPinned && !b.isPinned) {
      return -1
    } else if (!a.isPinned && b.isPinned) {
      return 1
    } else {
      return b.id - a.id
    }
  })

  return {
    announcements,
    category,
    setCategory,
    isLoading,
  }
}
