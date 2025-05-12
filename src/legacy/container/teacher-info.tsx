import { useRecoilValue } from 'recoil'
import { useGroupsFindAll } from '@/legacy/generated/endpoint'
import { GroupType } from '@/legacy/generated/model'
import { tokenState } from '@/stores'
import { sortTeacherGroups } from '@/legacy/util/teacher-groups'

export function useTeacherInfoHook() {
  const token = useRecoilValue(tokenState)

  const { data: userGroupsData, isLoading: isUserGroupDataLoading } = useGroupsFindAll(
    { type: GroupType.KLASS },
    { query: { enabled: !!token } },
  )

  const groups = sortTeacherGroups(userGroupsData || [])

  return {
    userGroupsData: groups,
    isUserGroupDataLoading,
  }
}
