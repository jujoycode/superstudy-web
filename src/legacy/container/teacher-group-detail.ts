import { useEffect, useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { Routes } from '@/legacy/constants/routes'
import {
  useGroupsDelete,
  useStudentGroupsFindWithKlassByGroupId,
  useTeacherGroupsFindTeachersWithKlassByGroupId,
} from '@/legacy/generated/endpoint'
import { ResponseGroupDto, ResponseStudentGroupWithKlassDto, TeacherGroup } from '@/legacy/generated/model'
import { GroupContainer } from './group'

export function useTeacherGroupDetail(groupId?: number) {
  const { push } = useHistory()
  const { teacherKlubGroups } = GroupContainer.useContext()

  const [group, setGroup] = useState<ResponseGroupDto>()
  const [studentGroups, setStudentGroups] = useState<ResponseStudentGroupWithKlassDto[]>([])
  const [teacherGroups, setTeacherGroups] = useState<TeacherGroup[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  // useStudentGroupsFindByGroupId<StudentGroup[]>(groupId as number, {
  //   query: {
  //     enabled: !!groupId,
  //     onSuccess: (res) => {
  //       if (!res?.length) {
  //         setStudentGroups([]);
  //         return;
  //       }

  //       setStudentGroups(res.sort((a, b) => a.studentNumber - b.studentNumber));
  //     },
  //   },
  // });

  useStudentGroupsFindWithKlassByGroupId<ResponseStudentGroupWithKlassDto[]>(groupId || 0, {
    query: {
      enabled: !!groupId,
      onSuccess: (res) => {
        if (!res?.length) {
          setStudentGroups([])
          return
        }

        setStudentGroups(res.sort((a, b) => a.studentNumber - b.studentNumber))
      },
    },
  })

  useTeacherGroupsFindTeachersWithKlassByGroupId<TeacherGroup[]>(groupId || 0, {
    query: {
      enabled: !!groupId,
      onSuccess: (res) => {
        if (!res?.length) {
          setTeacherGroups([])
          return
        }

        setTeacherGroups(res)
      },
    },
  })

  useEffect(() => {
    const group = teacherKlubGroups.find((group) => group.id === Number(groupId))
    setGroup(group)
  }, [teacherKlubGroups, groupId])

  const { mutate: deleteGroup } = useGroupsDelete({
    mutation: {
      onSuccess: () => {
        push(Routes.teacher.groups)
      },
      onError: () => {
        setErrorMessage('그룹 삭제에 실패했습니다.')
      },
    },
  })

  const handleGroupDelete = () => {
    deleteGroup({ id: groupId as number })
  }

  return {
    group,
    studentGroups,
    teacherGroups,
    errorMessage,
    handleGroupDelete,
  }
}
