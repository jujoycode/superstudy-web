import { useEffect, useState } from 'react'
import { useCommonUserSearchtest } from '@/legacy/generated/endpoint'
import { ResponseIBStudentDto } from '@/legacy/generated/model'

export const useUserSearch = () => {
  const { data: fetchedData, isLoading, refetch } = useCommonUserSearchtest({ grade: '1,2,3' })
  const [data, setData] = useState<ResponseIBStudentDto[]>([])
  useEffect(() => {
    if (fetchedData) {
      const transformedData = fetchedData.items.map((student) => ({
        id: student.id,
        email: student.email,
        role: student.role,
        name: student.name,
        studentGroup: {
          studentNumber: student.studentNumber,
          group: {
            name: String(student.groupName),
            type: 'IB',
            year: String(student.year),
            grade: student.grade,
            klass: student.klass,
          },
        },
      }))
      setData(transformedData)
    }
  }, [fetchedData])
  return {
    data,
    isLoading,
    refetch,
  }
}
