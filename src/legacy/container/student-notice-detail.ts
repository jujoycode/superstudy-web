import { useEffect, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilValue } from 'recoil'
import { Constants } from '@/legacy/constants'
import { QueryKey } from '@/legacy/constants/query-key'
import { useNoticesFindOne } from '@/legacy/generated/endpoint'
import { isPdfFile } from '@/legacy/util/file'
import { childState } from '@/stores'

export function useStudentNoticeDetail(noticeId?: number) {
  const [errorMessage, setErrorMessage] = useState('')
  const child = useRecoilValue(childState)
  const {
    data: notice,
    isLoading: isNoticeLoading,
    refetch: refetchNotice,
  } = useNoticesFindOne(noticeId as number, {
    query: {
      enabled: !!noticeId,
      queryKey: [...QueryKey.teacher.notice, noticeId],
      onError: () => {
        setErrorMessage('이미 삭제되었거나 더 이상 유효하지 않습니다.')
      },
    },
    request: {
      headers: { 'child-user-id': child?.id },
    },
  })

  useEffect(() => {
    if (!!child) {
      refetchNotice()
    }
  }, [child])

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

  return {
    notice,
    isNoticeLoading,
    images,
    Pdfs,
    files,
    viewerImages,
    errorMessage,
  }
}
