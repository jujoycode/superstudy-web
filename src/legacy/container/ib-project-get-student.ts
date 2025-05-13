import { useIBGetIB, useIBGetIBBycoordinator } from '@/legacy/generated/endpoint'
import type { ResponseIBDto } from '@/legacy/generated/model'
import { makeStudNum5 } from '@/legacy/util/status'

export const useIBGetByStudent = (id: number) => {
  const { data, isLoading, refetch } = useIBGetIBBycoordinator({
    studentId: id,
  })

  return {
    data,
    isLoading,
    refetch,
  }
}

export const useIBGetById = (id: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBGetIB(id, { query: { enabled: options?.enabled } })

  // 학번 조합
  const getKlassNum = (data: ResponseIBDto | undefined): string | undefined => {
    if (!data?.leader?.studentGroup?.group) return undefined
    const { grade, klass: classNum } = data.leader.studentGroup.group
    const studentNum = data.leader.studentGroup.studentNumber
    return makeStudNum5({ grade, classNum, studentNum })
  }

  const klassNum = getKlassNum(data)

  return {
    data,
    isLoading,
    refetch,
    klassNum,
  }
}
