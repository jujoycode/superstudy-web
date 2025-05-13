import { useState } from 'react'

import { useCounselingFindCounselingDetailStudentByStudentId } from '@/legacy/generated/endpoint'
import type { ResponseCounselingDetailStudentDto } from '@/legacy/generated/model'

export function useTeacherStudentCard(studentId?: number) {
  const [isForbidden, setIsForbidden] = useState(false)

  const { data: studentInfo, isLoading } =
    useCounselingFindCounselingDetailStudentByStudentId<ResponseCounselingDetailStudentDto>(studentId || 0, {
      query: {
        enabled: !!studentId && !isForbidden,
        onSuccess: () => {
          setIsForbidden(false)
        },
        onError: () => {
          setIsForbidden(true)
        },
      },
    })

  return { studentInfo, isForbidden, isLoading }
}
