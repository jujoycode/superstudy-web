import { useState } from 'react'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'
import { Routes } from '@/legacy/routes'

import { Constants } from '@/legacy/constants'
import { useActivityDelete, useActivityFindOne } from '@/legacy/generated/endpoint'
import { isPdfFile } from '@/legacy/util/file'
import { DayAfter } from '@/legacy/util/time'
import type { ImageDecorator } from 'react-viewer/lib/ViewerProps'

export function useTeacherActivityDetail(activityId?: number, refetchList?: () => void) {
  const { push } = useHistory()

  const [errorMessage, setErrorMessage] = useState('')
  const [endDate, setEndDate] = useState(new Date(DayAfter(new Date())).toISOString())
  const [endDateOff, setEndDateOff] = useState(false)

  const { data: activity, isLoading: isActivityLoading } = useActivityFindOne(activityId as number, {
    query: {
      enabled: !!activityId,
      onError: () => {
        setErrorMessage('활동을 불러오는데 실패했습니다.')
      },
    },
  })

  const { mutate: deleteActivity } = useActivityDelete({
    mutation: {
      onSuccess: () => {
        refetchList?.()
        push(Routes.teacher.activity.index)
      },
      onError: () => {
        setErrorMessage('활동 삭제에 실패했습니다.')
      },
    },
  })

  const images = activity?.images?.filter((image) => !isPdfFile(image)) || []
  const Pdfs = activity?.images?.filter((image) => isPdfFile(image)) || []
  const documents = activity?.files || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const handleActivityDelete = () => {
    deleteActivity({ id: activityId as number })
  }

  return {
    activity,
    isActivityLoading,
    images,
    Pdfs,
    endDate,
    endDateOff,
    documents,
    viewerImages,
    errorMessage,
    handleActivityDelete,
    setEndDate,
    setEndDateOff,
  }
}
