import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { QueryKey } from '@/legacy/constants/query-key'
import { useBoardFindAll, useNewsLettersFindAll, useNoticesFindAll } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { TabType } from '@/legacy/types'
import { childState, meState } from '@/stores'

export function useStudentNotice(tabType: TabType) {
  const child = useRecoilValue(childState)
  const me = useRecoilValue(meState)

  const grade =
    me?.role === Role.PARENT ? +(child?.klassGroupName?.charAt(0) || '0') : +(me?.klassGroupName?.charAt(0) || '0')

  const [pageInfo] = useState({ page: 1, limit: 100 })

  const { data: noticeList, isLoading: isNoticeListLoading } = useNoticesFindAll(
    { ...pageInfo },
    {
      query: {
        queryKey: [...QueryKey.teacher.noticeList, pageInfo],
        enabled: tabType === TabType.NOTICE,
      },
      request: {
        headers: { 'child-user-id': child?.id },
      },
    },
  )

  const { data: newsLetterList, isLoading: isNewsLetterListLoading } = useNewsLettersFindAll(
    { ...pageInfo, userKlass: [grade] },
    {
      query: {
        enabled: !!grade && tabType === TabType.NEWSLETTER,
      },
      request: {
        headers: { 'child-user-id': child?.id },
      },
    },
  )

  const { data: boardList, isLoading: isBoardListLoading } = useBoardFindAll(
    { ...pageInfo, groupId: child?.klassGroupId || me?.klassGroupId || 0 },
    {
      query: {
        enabled: (!!child?.klassGroupId || !!me?.klassGroupId) && tabType === TabType.BOARD,
      },
      request: {
        headers: { 'child-user-id': child?.id },
      },
    },
  )

  const isLoading = !me || isNoticeListLoading || isNewsLetterListLoading || isBoardListLoading

  return {
    noticeList, //: noticeList?.items,
    newsLetterList, //: newsLetterList?.items,
    boardList, //: boardList?.items,
    isLoading,
  }
}
