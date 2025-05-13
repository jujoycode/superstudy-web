import { useState } from 'react'
import { useQueryClient } from 'react-query'

// ! 개선 필요
import type { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { Constants } from '@/legacy/constants'
import { QueryKey } from '@/legacy/constants/query-key'
import { useNoticesDelete, useNoticesFindOne } from '@/legacy/generated/endpoint'
import { isPdfFile } from '@/legacy/util/file'

import { Routes } from '@/legacy/routes'

export function useTeacherNoticeDetail(noticeId?: number) {
  const { push } = useHistory()
  const queryClient = useQueryClient()

  const [errorMessage, setErrorMessage] = useState('')

  const { data: notice, isLoading: isNoticeLoading } = useNoticesFindOne(noticeId || 0, {
    query: {
      enabled: !!noticeId,
      queryKey: [...QueryKey.teacher.notice, noticeId],
      onError: () => {
        setErrorMessage('이미 삭제되었거나 더 이상 유효하지 않습니다.')
      },
    },
  })

  const { mutate: deleteNotice } = useNoticesDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.noticeList)
        push(Routes.teacher.notice)
      },
      onError: () => {
        setErrorMessage('공지사항 삭제에 실패했습니다.')
      },
    },
  })

  const images = notice?.images.filter((image) => !isPdfFile(image)) || []
  const Pdfs = notice?.images.filter((image) => isPdfFile(image)) || []
  const files = notice?.files || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const handleNoticeDelete = () => {
    if (noticeId) {
      deleteNotice({ id: noticeId })
    }
  }

  return {
    notice,
    isNoticeLoading,
    images,
    Pdfs,
    files,
    viewerImages,
    errorMessage,
    handleNoticeDelete,
  }
}
