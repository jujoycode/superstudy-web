import { useChecklistGetitems, useChecklistGetitemsByStudent } from '@/legacy/generated/endpoint'
import { ChecklistLocation } from '@/legacy/generated/model'

export const useCheckListGetByTeacher = () => {
  const { data, isLoading } = useChecklistGetitems({ location: 'ESSAY' })
  const CheckList = data?.items
  return {
    CheckList,
    isLoading,
  }
}

export const useCheckListGetByStudent = (studentId: number, location: ChecklistLocation) => {
  const { data, isLoading } = useChecklistGetitemsByStudent(studentId, { location })
  const CheckList = data?.items
  return {
    CheckList,
    isLoading,
  }
}
