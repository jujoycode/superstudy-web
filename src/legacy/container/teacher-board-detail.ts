import { useState } from 'react'
import { useQueryClient } from 'react-query'

// ! 개선 필요

import { Routes } from '@/routers'

import { isPdfFile } from '@/legacy/util/file'
import { Constants } from '@/legacy/constants'
import { QueryKey } from '@/legacy/constants/query-key'
import { useBoardDelete, useBoardFindOne } from '@/legacy/generated/endpoint'
import type { ImageDecorator } from 'react-viewer/lib/ViewerProps'

export function useTeacherBoardDetail(boardId?: number) {
  const { push } = useHistory()
  const queryClient = useQueryClient()

  const [errorMessage, setErrorMessage] = useState('')

  const { data: board, isLoading: isBoardLoading } = useBoardFindOne(boardId as number, {
    query: {
      enabled: !!boardId,
      queryKey: [...QueryKey.teacher.board, boardId],
      onError: () => {
        setErrorMessage('공지사항을 불러오는데 실패했습니다.')
      },
    },
  })

  const { mutate: deleteBoard } = useBoardDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.boardList)
        push(Routes.teacher.board)
      },
      onError: () => {
        setErrorMessage('공지사항 삭제에 실패했습니다.')
      },
    },
  })

  const images = board?.images.filter((image) => !isPdfFile(image)) || []
  const Pdfs = board?.images.filter((image) => isPdfFile(image)) || []
  const documents = board?.files || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const handleBoardDelete = () => {
    deleteBoard({ id: boardId as number })
  }

  return {
    board,
    isBoardLoading,
    images,
    Pdfs,
    documents,
    viewerImages,
    errorMessage,
    handleBoardDelete,
  }
}
