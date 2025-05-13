import { useState } from 'react'
import { useIBGetIBBycoordinator } from '@/legacy/generated/endpoint'
import { IBGetIBBycoordinatorParams } from '@/legacy/generated/model'

export function useGetIBProject() {
  const [param, setParam] = useState<IBGetIBBycoordinatorParams>()

  const { data, isLoading } = useIBGetIBBycoordinator(param, {
    query: {
      // enabled: !!param?.statuses,
    },
  })

  const getIBProject = ({
    grade,
    klass,
    ibTypes,
    limit,
    mentorId,
    page,
    proposalSubject,
    statuses,
    studentId,
    studentName,
  }: IBGetIBBycoordinatorParams) => {
    setParam({ grade, klass, ibTypes, limit, mentorId, page, proposalSubject, statuses, studentId, studentName })
  }

  return {
    data,
    getIBProject,
    isLoading,
  }
}
