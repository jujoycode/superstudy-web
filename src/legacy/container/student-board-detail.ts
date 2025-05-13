import { useEffect, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useRecoilValue } from 'recoil'
import { Constants } from '@/legacy/constants'
import { QueryKey } from '@/legacy/constants/query-key'
import { useBoardFindOne } from '@/legacy/generated/endpoint'
import { childState, meState } from '@/stores'
import { isPdfFile } from '@/legacy/util/file'

export function useStudentBoardDetail(boardId?: number) {
  const [errorMessage, setErrorMessage] = useState('')

  const meRecoil = useRecoilValue(meState)
  const child = useRecoilValue(childState)

  const {
    data: board,
    isLoading: isBoardLoading,
    refetch: refetchBoard,
  } = useBoardFindOne(boardId as number, {
    query: {
      enabled: !!boardId && !!meRecoil && (meRecoil.role === 'USER' || !!child),
      queryKey: [...QueryKey.teacher.board, boardId],
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
      refetchBoard()
    }
  }, [child])

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

  return {
    board,
    isBoardLoading,
    images,
    Pdfs,
    documents,
    viewerImages,
    errorMessage,
  }
}
