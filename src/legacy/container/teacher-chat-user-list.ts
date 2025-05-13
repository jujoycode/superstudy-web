import _ from 'lodash'
import { useState } from 'react'

import { GroupContainer } from '@/legacy/container/group'
import { useTeacherAllGroup, type TeacharAllGroup } from '@/legacy/container/teacher-group-all'
import { useCommonUserSearch } from '@/legacy/generated/endpoint'
import {
  Role,
  type StudentGroup,
  type ResponseGroupDto,
  type ResponseSearchUserDto,
  type ResponseTeachersDto,
  type ResponseGetParentsByStudentGroupDto,
} from '@/legacy/generated/model'
import { MenuType } from '@/legacy/types'
import { getNickName } from '@/legacy/util/status'

export interface MergedGroupType {
  id: number
  name: string
  type: string
}

export function useTeacherChatUserList(selectedMenu: MenuType) {
  const [selectedGroup, setSelectedGroup] = useState<MergedGroupType | null>(null)
  const [keyword, setKeyword] = useState<string>('')
  const [klassName, setKlassName] = useState<string>('')
  const [klubName, setKlubName] = useState<string>('')
  const [enabled, setEnabled] = useState<boolean>(false)

  const [selectedUserType, setSelectedUserType] = useState(0) // 0 학생, 1 보호자, 2 선생님
  const [selectedUserDatas, setSelectedUserDatas] = useState<any[]>([]) // 0 학생, 1 보호자, 2 선생님

  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])
  const [teacherList] = useState<ResponseTeachersDto[]>([])
  const [parentGroups] = useState<ResponseGetParentsByStudentGroupDto[]>([])

  const { allKlassGroups } = GroupContainer.useContext()

  const { allGroups: teacherAllGroups } = useTeacherAllGroup()

  function mergeGroups(allKlassGroups: ResponseGroupDto[], teacherAllGroups: TeacharAllGroup[]): MergedGroupType[] {
    const mergedGroups: MergedGroupType[] = []

    const gradeRegex = /(\d{1,2})학년/
    let preGrade = ''
    for (const klassGroup of allKlassGroups) {
      const match = klassGroup.name?.match(gradeRegex)

      if (match) {
        const grade = match[1]

        if (preGrade !== grade) {
          mergedGroups.push({
            id: Number('-' + grade + '00'),
            name: grade.toString() + '학년 전체',
            type: 'KLASS',
          })

          preGrade = grade
        }
      }

      mergedGroups.push({
        id: klassGroup.id,
        name: klassGroup.name || '',
        type: klassGroup.type,
      })
    }

    for (const teacherGroup of teacherAllGroups) {
      const existingGroupIndex = mergedGroups.findIndex((group) => group.id === teacherGroup.id)
      if (existingGroupIndex === -1) {
        mergedGroups.push({
          id: teacherGroup.id,
          name: teacherGroup.name,
          type: teacherGroup.type === 'FIX' ? 'KLASS' : 'KLUB',
        })
      }
    }

    return mergedGroups
  }

  const allGroups = mergeGroups(allKlassGroups, teacherAllGroups)

  const { refetch: refetchUser } = useCommonUserSearch<ResponseSearchUserDto[]>(
    { keyword, klass: klassName, klub: klubName },
    {
      query: {
        enabled: enabled,
        onSuccess: (res: ResponseSearchUserDto[]) => {
          if (!res?.length) {
            setSelectedUserDatas([])
            return
          }

          const uniqueRes = _.uniqBy(res, 'id')

          const userList = uniqueRes
            ?.slice()
            ?.filter((el) => {
              if (selectedMenu === MenuType.Chat && el.firstVisit) {
                return false
              } else if (selectedUserType === 0) {
                return el.role === Role.USER
              } else if (selectedUserType === 1) {
                return el.role === Role.PARENT
              } else if (selectedUserType === 2) {
                return el.role !== Role.USER && el.role !== Role.PARENT
              } else {
                return true
              }
            })
            ?.sort((a, b) => {
              if (selectedUserType === 0) {
                return a.sn && b.sn && a.sn < b.sn ? -1 : 1
              } else {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
              }
            })
            ?.map((us: ResponseSearchUserDto) => {
              if (us.role === Role.PARENT) {
                const childrenInfo =
                  us.children?.find((item) => item.klass === klassName) || (us.children && us.children[0]) || undefined

                return {
                  id: us.id,
                  name: us.name,
                  role: us.role,
                  title: (childrenInfo && childrenInfo.name) + getNickName(childrenInfo?.nickName) + '보호자' || '',
                  studNum: parseInt(us.studentNumber || '0', 10),
                  klass: childrenInfo
                    ? `${childrenInfo.klass} ${childrenInfo.studentNumber}번 ${
                        childrenInfo.name + getNickName(childrenInfo?.nickName)
                      }`
                    : '',
                  useNokInfo: false,
                  phone: us.phone,
                }
              } else {
                return {
                  id: us.id,
                  name: us.name + getNickName(us.nickName),
                  role: us.role,
                  title:
                    us.role === Role.USER
                      ? us.sn || ''
                      : us.role === Role.HEAD_PRINCIPAL
                        ? '교장선생님'
                        : us.role === Role.VICE_PRINCIPAL
                          ? '교감선생님'
                          : us.role === Role.PRINCIPAL
                            ? '교무부장'
                            : us.role === Role.PRE_PRINCIPAL
                              ? '교무계'
                              : us.role === Role.HEAD
                                ? (us?.headNumber ? us?.headNumber.toString() : '') + '학년부장'
                                : us.role === Role.PRE_HEAD
                                  ? (us?.headNumber ? us?.headNumber.toString() : '') + '학년계'
                                  : us.role === Role.TEACHER
                                    ? '선생님'
                                    : us.role === Role.ADMIN
                                      ? '관리자'
                                      : us.role === Role.STAFF
                                        ? '교직원'
                                        : us.role === Role.SECURITY
                                          ? '보안관'
                                          : '',
                  studNum: parseInt(us.studentNumber || '0', 10),
                  klass: us.klass || '',
                  useNokInfo: false,
                  phone: us.phone,
                }
              }
            })

          // 보호자 또는 전체 인 경우, 학생에 딸린 nok 정보도 활용한다.
          if (selectedMenu === MenuType.SMS && (selectedUserType === 1 || selectedUserType === -1)) {
            //const parentsUser: UserDatas[] = [];
            uniqueRes
              ?.slice()
              ?.filter((el) => {
                return el.role === Role.USER
              })
              ?.map((us: ResponseSearchUserDto) => {
                const studentNo = parseInt(us.studentNumber || '0', 10)

                if (!us.parents?.length) {
                  if (us.nokName) {
                    userList.push({
                      id: us.id,
                      name: us.nokName,
                      role: Role.PARENT,
                      title: us.name + getNickName(us.nickName) + '보호자' || '',
                      studNum: studentNo,
                      klass: `(미가입) ${us.klass} ${us.studentNumber}번 ${us.name}`,
                      useNokInfo: true,
                      phone: us.nokPhone,
                    })
                  }
                }
              })
          }

          setSelectedUserDatas(userList)
        },
      },
    },
  )

  const reSearch = (userType: number, searchKeyword: string, searchKlass?: number) => {
    const selGroup = allGroups.find((item: MergedGroupType) => item?.id === searchKlass)
    if (userType === 2 || searchKeyword !== '' || selGroup) {
      setKeyword(searchKeyword)

      if (selGroup?.type === 'KLASS') {
        setKlassName(selGroup?.name || '')
        setKlubName('')
      } else if (selGroup?.type === 'KLUB') {
        setKlubName(selGroup?.name || '')
        setKlassName('')
      } else {
        setKlubName('')
        setKlassName('')
      }

      setEnabled(true)
      refetchUser()
    } else {
      setSelectedUserDatas([])
    }
  }

  return {
    allGroups: allGroups?.reduce((acc: any[], current: any) => {
      if (!acc.find((item) => item.id === current.id)) {
        acc.push(current)
      }
      return acc
    }, []),
    selectedGroup,
    setStudentGroups,
    setSelectedGroup,
    selectedUserType,
    setSelectedUserType,
    studentGroups,
    teacherList,
    parentGroups,
    selectedUserDatas,
    //setKeyword,
    reSearch,
    refetchUser,
  }
}
