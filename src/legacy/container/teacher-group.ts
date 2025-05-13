import { useState } from 'react'
import { useStudentGroupsFindByGroupId } from '@/legacy/generated/endpoint'
import { StudentGroup } from '@/legacy/generated/model'

export function useTeacherGroup(groupId?: number) {
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])

  useStudentGroupsFindByGroupId<StudentGroup[]>(groupId || 0, {
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
  return {
    studentGroups,
  }
}
