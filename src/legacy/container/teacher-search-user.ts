import { chain } from 'lodash'
import { useMemo, useState } from 'react'

import { useCommonUserSearchByName, useStudentGroupsFindWithKlassByGroupId } from '@/legacy/generated/endpoint'

interface UserData {
  id: number
  name: string
  nickName: string
  grade: number
  klass: string
  studentNumber: number
}

export function useTeacherSearchUser(groupId: number) {
  const [searchName, setSearchName] = useState<string>()

  const { data: studentGroups, isLoading: isLoadingStudentGroups } = useStudentGroupsFindWithKlassByGroupId(groupId, {
    query: {
      enabled: !!groupId,
    },
  })

  const { data: user, isLoading: isLoadingUser } = useCommonUserSearchByName(
    { name: searchName || '' },
    {
      query: {
        enabled: !!searchName,
      },
    },
  )

  const isLoading = isLoadingStudentGroups || isLoadingUser

  const userDatas: UserData[] = useMemo(() => {
    if (groupId) {
      if (searchName) {
        return chain(studentGroups)
          .map((sg) => ({
            id: sg.userId,
            name: sg.userName,
            nickName: sg.userNickName || '',
            grade: 0,
            klass: sg.klass || '',
            studentNumber: sg.studentNumber,
          }))
          .filter((sg) => sg.name.includes(searchName) || (sg.nickName || '').includes(searchName))
          .uniqBy('id')
          .orderBy(
            [
              (o) => parseInt(o.klass?.match(/^(\d+)학년/)?.[1] || '0'), // 학년 숫자 추출
              (o) => parseInt(o.klass?.match(/(\d+)반/)?.[1] || '0'), // 반 숫자 추출
              (o) => Number(o.studentNumber), // 학생 번호 기준 정렬
            ],
            ['asc', 'asc', 'asc'],
          )
          .value()
      } else {
        return chain(studentGroups)
          .map((sg) => ({
            id: sg.userId,
            name: sg.userName,
            nickName: sg.userNickName || '',
            grade: 0,
            klass: sg.klass || '',
            studentNumber: sg.studentNumber,
          }))
          .uniqBy('id')
          .orderBy(
            [
              (o) => parseInt(o.klass?.match(/^(\d+)학년/)?.[1] || '0'), // 학년 숫자 추출
              (o) => parseInt(o.klass?.match(/(\d+)반/)?.[1] || '0'), // 반 숫자 추출
              (o) => Number(o.studentNumber), // 학생 번호 기준 정렬
            ],
            ['asc', 'asc', 'asc'],
          )
          .value()
      }
    } else {
      return chain(user)
        .map((u) => ({
          id: u.id,
          name: u.name,
          nickName: u.nickName || '',
          grade: u.studentGroups?.[0].group?.grade || 0,
          klass: u.studentGroups?.[0].group?.klass.toString() || '',
          studentNumber: u.studentGroups?.[0].studentNumber || 0,
        }))
        .uniqBy('id')
        .orderBy(['klass', 'studentNumber'])
        .value()
    }
  }, [searchName, groupId, studentGroups, user])

  return {
    studentGroups,
    user,
    userDatas,
    isLoading,
    searchName,
    setSearchName,
  }
}
