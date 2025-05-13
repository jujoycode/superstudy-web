import { useState } from 'react'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'
import {
  useGroupsCreate,
  useGroupsUpdate,
  useStudentGroupsFindByGroupId,
  useTeacherGroupsFindTeachersWithKlassByGroupId,
  useUserGetAllTeachers,
} from '@/legacy/generated/endpoint'
import type {
  User,
  StudentGroup,
  TeacherGroup,
  ResponseGroupDto,
  ResponseTeachersDto,
  RequestCreateGroupDto,
} from '@/legacy/generated/model'
import { Routes } from '@/routers'

import { GroupContainer } from './group'

export function useTeacherGroupAdd({ groupId, onSubmit }: { groupId?: number; onSubmit?: () => void }) {
  const { push } = useHistory()
  const { allKlassGroups } = GroupContainer.useContext()
  const [selectedGroup, setSelectedGroup] = useState<ResponseGroupDto | null>(allKlassGroups[0] || null)
  const [errorMessage, setErrorMessage] = useState('')
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])
  const [teacherGroups, setTeacherGroups] = useState<TeacherGroup[]>([])
  const [groupStudentsData, setGroupStudentsData] = useState<User[]>([])
  const { data: teachers } = useUserGetAllTeachers<ResponseTeachersDto[]>()

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

  useStudentGroupsFindByGroupId<StudentGroup[]>(groupId || 0, {
    query: {
      enabled: !!groupId,
      onSuccess: (res) => {
        if (!res?.length) {
          setGroupStudentsData([])
          return
        }

        setGroupStudentsData(res.sort((a, b) => a.studentNumber - b.studentNumber).map((el) => el.user))
      },
    },
  })

  useStudentGroupsFindByGroupId<StudentGroup[]>(selectedGroup?.id as number, {
    query: {
      enabled: !!selectedGroup?.id,
      onSuccess: (res) => {
        if (!res?.length) {
          setStudentGroups([])
          return
        }

        setStudentGroups(res.sort((a, b) => a.studentNumber - b.studentNumber))
      },
    },
  })

  const { mutate: createGroupMutate, isLoading: isCreateGroupMutate } = useGroupsCreate({
    mutation: {
      onSuccess: (result) => {
        onSubmit?.()
        push(`${Routes.teacher.groups}/${result.id}`)
      },
      onError: () => {
        setErrorMessage('그룹 등록에 실패했습니다.')
      },
    },
  })

  const { mutate: updateGroupMutate, isLoading: isUpdateGroupMutate } = useGroupsUpdate({
    mutation: {
      onSuccess: () => {
        onSubmit?.()
        push(`${Routes.teacher.groups}/${groupId}`)
      },
      onError: () => {
        setErrorMessage('그룹 수정에 실패했습니다.')
      },
    },
  })

  const handleSubmit = async (groupPayload: RequestCreateGroupDto) => {
    try {
      if (!groupPayload || !!errorMessage) {
        return
      }

      if (!groupPayload.subject) {
        alert('과목명을 입력해주세요.')
        return
      }

      if (groupId) {
        updateGroupMutate({
          id: groupId,
          data: groupPayload,
        })
      } else {
        createGroupMutate({
          data: groupPayload,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return {
    teachers: teachers?.sort((a, b) => {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    }),
    teacherGroups,
    errorMessage,
    isCreateOrUpdateLoading: isCreateGroupMutate || isUpdateGroupMutate,
    groupStudentsData,
    selectedGroup,
    setSelectedGroup,
    studentGroups,
    handleSubmit,
  }
}
