import { useState } from 'react'
import { useSetRecoilState } from 'recoil'

import { useTeacherKlassGroup } from '@/legacy/container/teacher-klass-groups'
import {
  useGroupsFindOne,
  useNewsLettersFindOne,
  useNewsLettersRepublish,
  useStudentNewsletterFindAllByNewsletterId,
} from '@/legacy/generated/endpoint'
import type {
  ResponseChatAttendeeDto,
  ResponseGroupDto,
  StudentGroup,
  StudentNewsletter,
} from '@/legacy/generated/model'
import { makeDateToString } from '@/legacy/util/time'
import { toastState } from '@/stores'

type NewData = ResponseGroupDto & {
  isSelected: boolean
  submitCount: number
  studentGroups: StudentGroup[]
}

export function useTeacherNewsletterSubmit(newsletterId: number) {
  const [result, setResult] = useState<NewData[]>([])
  const setToastMsg = useSetRecoilState(toastState)
  const [isCsvData, setCsvData] = useState(false)
  const [nowDate] = useState(makeDateToString(new Date()))

  const { groups } = useTeacherKlassGroup()

  const [selectedKlassGroupId, setSelectedKlassGroupId] = useState<number>()

  const { data: newsletter } = useNewsLettersFindOne(newsletterId, {
    query: {
      enabled: !!groups && !!newsletterId,
      queryKey: ['newsletter', newsletterId],
      onSuccess: (res) => {
        const newData =
          (groups?.map((group) => {
            return {
              ...group,
              isSelected: false,
              submitCount: 0,
              studentGroups: [] as StudentGroup[],
            }
          }) as NewData[]) || ([] as NewData[])

        const newResult =
          newData?.filter((group) => {
            const id = group?.name?.[0] || ''
            return res?.klasses.includes(id)
          }) || []
        setResult(newResult)
      },
    },
  })

  const { data: studentNewsletters, isLoading: submiterLoding } = useStudentNewsletterFindAllByNewsletterId(
    newsletterId,
    {
      query: {
        enabled: !!newsletter && !!newsletterId,
        onSuccess: (res) => {
          const newResult = result?.map((group) => {
            const submitCount = res?.filter((newsletter) => newsletter?.studentGradeKlass === group.name).length
            return { ...group, submitCount }
          }) as NewData[]

          setResult(newResult)
        },
      },
    },
  )

  const { studentsCount } = result?.reduce(
    (acc, cur) => {
      return {
        studentsCount: acc.studentsCount + (+cur.studentCount || 0),
        parentCount: acc.parentCount + (+cur.parentCount || 0),
      }
    },
    { studentsCount: 0, parentCount: 0 },
  ) || { studentsCount: 0, parentCount: 0 }

  const totalPerson: {
    student?: { id: number; name: string; klass: string }
    id?: number
    name?: string
    klass?: string | null
    studentNumber?: string | null
    sn?: string | null
    role?: string
  }[] = []

  const studentPerson: {
    student?: { id: number; name: string; klass: string }
    id?: number
    name?: string
    klass?: string | null
    studentNumber?: string | null
    sn?: string | null
    role?: string
  }[] = []

  const submitPerson: StudentNewsletter[] = []
  const chkID = new Set<number>()

  // 제출자 학생 리스트 추출
  if (studentNewsletters) {
    studentNewsletters.forEach((sn: StudentNewsletter) => {
      chkID.add(sn.id)
      // return submitPerson.push({
      submitPerson.push(sn)
      // });
    })
  }

  if (newsletter?.toPerson) {
    newsletter?.userInfo.forEach((sne: ResponseChatAttendeeDto) => {
      chkID.add(sne.id)
      if (sne.role === 'USER') {
        studentPerson.push({
          student: {
            id: sne.id,
            name: sne.name,
            klass: sne.klass || '',
          },
        })
      }
      if (sne.role === 'PARENT' && sne.children) {
        return totalPerson.push({
          student: {
            id: sne.children[0].id,
            name: sne.name,
            klass: sne.children[0]?.klass || sne.klass || '',
          },
        })
      } else {
        return totalPerson.push({
          student: {
            id: sne.id,
            name: sne.name,
            klass: sne.klass || '',
          },
        })
      }
    })
  } else {
    newsletter?.userInfo.forEach((ui: ResponseChatAttendeeDto) => {
      if (ui.role !== 'PARENT' && ui.klass !== null) {
        chkID.add(ui.id)
        return totalPerson.push({
          id: ui.id,
          name: ui.name || '',
          klass: ui.klass,
          studentNumber: ui.studentNumber,
          sn: ui.sn,
          role: ui.role,
        })
      }

      if (ui.role === 'PARENT') {
        if (ui && ui.children) {
          const filteredChildren = ui.children.filter((child) => child.klass !== null)

          filteredChildren.forEach((child) => {
            if (!chkID.has(child.id)) {
              return totalPerson.push({
                id: child.id,
                name: child.name || '',
                klass: child.klass,
                studentNumber: child.studentNumber && child.klass ? `${child.studentNumber}`.slice(-2) : null,
                sn: child.studentNumber,
                role: 'USER',
              })
            }
          })
        }
      }
    })
  }

  useGroupsFindOne(selectedKlassGroupId as number, {
    query: {
      queryKey: ['klassGroup', selectedKlassGroupId],
      enabled: !!selectedKlassGroupId && !!studentNewsletters,
      onSuccess: (res) => {
        // totalPerson의 student.id를 Set으로 만들고
        const totalPersonStudentIds = new Set(totalPerson.map((person) => person?.student?.id))

        // res.studentGroups에서 totalPerson의 student.id와 일치하는 그룹만 필터링
        const filteredStudentGroups = res.studentGroups.filter((studentGroup) =>
          totalPersonStudentIds.has(studentGroup.user.id),
        )

        const newResult = result?.map((group) => {
          if (group.id === selectedKlassGroupId) {
            return {
              ...group,
              isSelected: !group.isSelected,
              studentGroups: newsletter?.toPerson ? filteredStudentGroups : res.studentGroups,
            }
          }
          return { ...group, studentGroups: group.studentGroups }
        }) as NewData[]

        setResult(newResult)
      },
    },
  })

  const submitCount = studentNewsletters?.length || 0
  const unSubmitCount = studentsCount - submitCount < 0 ? 0 : studentsCount - submitCount

  const selectKlassGroup = (groupId: number) => {
    setSelectedKlassGroupId(groupId)
  }

  const { mutate: rePushNewsletterMutate } = useNewsLettersRepublish({
    mutation: {
      onSuccess: (_) => {
        setToastMsg('미제출 학생(보호자)에게 다시 알림을 보냈습니다.')
      },
      onError: () => {
        setToastMsg('재알림을 보내지 못했습니다.')
      },
    },
  })

  async function handleRePush(id: number) {
    rePushNewsletterMutate({
      id,
    })
  }

  return {
    result,
    newsletter,
    studentNewsletters,
    studentsCount,
    submitCount,
    unSubmitCount,
    totalPerson,
    studentPerson,
    submitPerson,
    selectKlassGroup,
    handleRePush,
    submiterLoding,
    isCsvData,
    nowDate,
    setCsvData,
  }
}
