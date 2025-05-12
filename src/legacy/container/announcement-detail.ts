import { useState } from 'react'
import { useAnnouncementGetAnnouncementById } from '@/legacy/generated/endpoint'

export function useAnnouncementDetail(announcementId: number) {
  const [errorMessage, setErrorMessage] = useState('')

  const { data: announcement, isLoading } = useAnnouncementGetAnnouncementById(announcementId, {
    query: {
      enabled: !!announcementId,
      onError: () => {
        setErrorMessage('공지사항을 불러오는데 실패했습니다.')
      },
    },
  })

  return {
    announcement,
    isLoading,
    errorMessage,
  }
}
