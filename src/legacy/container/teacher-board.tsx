import { useState } from 'react'
import { QueryKey } from '@/legacy/constants/query-key'
import { useBoardFindAll } from '@/legacy/generated/endpoint'
import { Board, BoardCategoryEnum } from '@/legacy/generated/model'

export function useTeacherBoard(groupId?: number) {
  const [pageInfo] = useState({ page: 1, limit: 500 })
  const [selectedCategory, setSelectedCategory] = useState<BoardCategoryEnum>()

  const { data: boardList, isLoading } = useBoardFindAll(
    { ...pageInfo, groupId: groupId as number },
    {
      query: {
        enabled: !!groupId,
        queryKey: [...QueryKey.teacher.boardList, groupId],
      },
    },
  )

  const boards = selectedCategory
    ? boardList?.items.filter((el: Board) => el.category === selectedCategory)
    : boardList?.items

  const unReadBoardList = boardList?.unreadIdList

  return {
    boards,
    selectedCategory,
    isLoading,
    unReadBoardList,
    setSelectedCategory,
  }
}
