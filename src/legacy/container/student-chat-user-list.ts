import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { childState } from '@/stores'
import { useUserGetAllTeachers } from '@/legacy/generated/endpoint'
import { Role, type ResponseGroupDto, type ResponseTeachersDto } from '@/legacy/generated/model'
import type { UserDatas } from '@/legacy/types'

export function useStudentChatUserList() {
  const child = useRecoilValue(childState)
  const [selectedGroup, setSelectedGroup] = useState<ResponseGroupDto | null>(null)
  const [selectedUserDatas, setSelectedUserDatas] = useState<UserDatas[]>([]) // 0 학생, 1 보호자, 2 선생님
  const [teacherList, setTeacherList] = useState<ResponseTeachersDto[]>([])

  // 선생님 목록
  useUserGetAllTeachers<ResponseTeachersDto[]>({
    query: {
      onSuccess: (res) => {
        if (!res?.length) {
          setTeacherList([])
          return
        }
        setTeacherList(res)
      },
    },
    request: {
      headers: { 'child-user-id': child?.id },
    },
  })

  useEffect(() => {
    // 선생님
    setSelectedUserDatas(
      teacherList.map((teachar: ResponseTeachersDto) => {
        return {
          id: teachar.id,
          name: teachar.name,
          role: teachar.role,
          title: teachar.groupName
            ? teachar.groupName
            : teachar.role === Role.HEAD_PRINCIPAL
              ? '교장선생님'
              : teachar.role === Role.VICE_PRINCIPAL
                ? '교감선생님'
                : teachar.role === Role.PRINCIPAL
                  ? '교무부장'
                  : teachar.role === Role.PRE_PRINCIPAL
                    ? '교무계'
                    : teachar.role === Role.HEAD
                      ? (teachar?.headNumber ? teachar?.headNumber.toString() : '') + '학년부장'
                      : teachar.role === Role.PRE_HEAD
                        ? (teachar?.headNumber ? teachar?.headNumber.toString() : '') + '학년계'
                        : teachar.role === Role.TEACHER
                          ? '선생님'
                          : teachar.role === Role.ADMIN
                            ? '관리자'
                            : teachar.role === Role.STAFF
                              ? '교직원'
                              : teachar.role === Role.SECURITY
                                ? '보안관'
                                : '',
          studNum: teachar.headNumber,
          klass: selectedGroup?.name || '',
          useNokInfo: false,
        }
      }),
    )
  }, [teacherList])

  return { selectedGroup, setSelectedGroup, teacherList, selectedUserDatas }
}
