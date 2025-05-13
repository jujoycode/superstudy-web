import { useState } from 'react'
import {
  useGroupsFindOne,
  useNewsLettersFindOne,
  useStudentNewsletterFindUnreadUsersByNewsletterId,
} from '@/legacy/generated/endpoint'
import { ResponseChatAttendeeDto, ResponseGroupDto, StudentGroup } from '@/legacy/generated/model'
import { useTeacherKlassGroup } from './teacher-klass-groups'

type NewData = ResponseGroupDto & {
  isSelected: boolean
  checkCount: number
  studentGroups: StudentGroup[]
}

export function useTeacherNewsletterCheck(newsletterId: number) {
  const [result, setResult] = useState<NewData[]>([])

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
              checkCount: 0,
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

  const { data: studentNewsletters } = useStudentNewsletterFindUnreadUsersByNewsletterId(newsletterId, {
    query: {
      enabled: !!newsletter && !!newsletterId,
      onSuccess: (res) => {
        const newResult = result?.map((group) => {
          const submitCount = res?.filter((newsletter) => newsletter?.klass === group.name).length
          return { ...group, submitCount }
        }) as NewData[]

        setResult(newResult)
      },
    },
  })

  useGroupsFindOne(selectedKlassGroupId as number, {
    query: {
      queryKey: ['klassGroup', selectedKlassGroupId],
      enabled: !!selectedKlassGroupId && !!studentNewsletters,
      onSuccess: (res) => {
        const newResult = result?.map((group) => {
          if (group.id === selectedKlassGroupId) {
            return {
              ...group,
              isSelected: !group.isSelected,
              studentGroups: res.studentGroups,
            }
          }
          return { ...group, studentGroups: group.studentGroups }
        }) as NewData[]

        setResult(newResult)
      },
    },
  })

  const { studentsCount } = result?.reduce(
    (acc, cur) => {
      return {
        studentsCount: acc.studentsCount + (+cur.studentCount || 0),
        parentCount: acc.parentCount + (+cur.parentCount || 0),
      }
    },
    { studentsCount: 0, parentCount: 0 },
  ) || { studentsCount: 0, parentCount: 0 }

  const unCheckPerson: ResponseChatAttendeeDto[] = []
  const totalPerson: ResponseChatAttendeeDto[] = []
  const chkID = new Set<number>()
  // 미확인 보호자의 학생 리스트 추출
  if (studentNewsletters) {
    studentNewsletters.forEach((sn: ResponseChatAttendeeDto) => {
      if (sn.role !== 'PARENT' && sn.klass !== null) {
        chkID.add(sn.id)
        return unCheckPerson.push({
          id: sn.id,
          name: sn.name || '',
          nickName: sn.nickName || '',
          klass: sn.klass,
          studentNumber: sn.studentNumber,
          sn: sn.sn,
          role: 'USER',
          headNumber: 0,
          profile: '',
          customProfile: '',
          position: null,
          department: null,
          children: null,
        })
      }

      // if (sn.role === 'PARENT') {
      //   if (sn && sn.children) {
      //     const filteredChildren = sn.children.filter((child) => child.klass !== null);

      //     filteredChildren.forEach((child) => {
      //       if (!chkID.has(child.id)) {
      //         return unCheckPerson.push({
      //           id: child.id,
      //           name: child.name || '',
      //           klass: child.klass,
      //           studentNumber: child.studentNumber && child.klass ? `${child.studentNumber}`.slice(-2) : null,
      //           sn: child.studentNumber,
      //           role: 'USER',
      //           headNumber: 0,
      //           profile: '',
      //           customProfile: '',
      //           position: null,
      //           department: null,
      //           children: null,
      //         });
      //       }
      //     });
      //   }
      // }
    })
  }

  if (newsletter?.toPerson) {
    newsletter?.userInfo.forEach((ui: ResponseChatAttendeeDto) => {
      if (ui.role !== 'PARENT' && ui.klass !== null) {
        chkID.add(ui.id)
        return totalPerson.push({
          id: ui.id,
          name: ui.name || '',
          nickName: ui.nickName || '',
          klass: ui.klass,
          studentNumber: ui.studentNumber,
          sn: ui.sn,
          role: ui.role,
          headNumber: 0,
          profile: '',
          customProfile: '',
          position: null,
          department: null,
          children: null,
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
                nickName: '',
                klass: child.klass,
                studentNumber: child.studentNumber && child.klass ? `${child.studentNumber}`.slice(-2) : null,
                sn: child.studentNumber,
                role: 'USER',
                headNumber: 0,
                profile: '',
                customProfile: '',
                position: null,
                department: null,
                children: null,
              })
            }
          })
        }
      }
    })
  }

  const unCheckCount = unCheckPerson.length || 0
  // const checkCount = studentsCount + parentCount - unCheckCount < 0 ? 0 : studentsCount + parentCount - unCheckCount;

  const selectKlassGroup = (groupId: number) => {
    setSelectedKlassGroupId(groupId)
  }

  return {
    result,
    newsletter,
    studentsCount,
    unCheckCount,
    unCheckPerson,
    totalPerson,
    selectKlassGroup,
  }
}
