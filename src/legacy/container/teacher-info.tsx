// import { useRecoilValue } from 'recoil'
// import { useGroupsFindAll } from '@/legacy/generated/endpoint'
// import { GroupType } from 'src/generated/model'
// import { sortTeacherGroups } from '@/legacy/util/teacher-groups'
// import { tokenState } from '@/stores'

// export function useTeacherInfoHook() {
//   const token = useRecoilValue(tokenState)

//   const { data: userGroupsData, isLoading: isUserGroupDataLoading } = useGroupsFindAll(
//     { type: GroupType.KLASS },
//     { query: { enabled: !!token } },
//   )

//   const groups = sortTeacherGroups(userGroupsData || [])

//   return {
//     userGroupsData: groups,
//     isUserGroupDataLoading,
//   }
// }
