import { useCounselingUpdateStudent } from '@/legacy/generated/endpoint'

export function useTeacherStudentUpdateParent() {
  const { mutate: updateParentMutate, isLoading } = useCounselingUpdateStudent()

  const updateStudentParent = (studentId: number, nokName: string, nokPhone: string) => {
    if (studentId) {
      updateParentMutate({
        id: studentId,
        data: {
          nokName,
          nokPhone,
        },
      })
    }
  }

  return {
    isLoading,
    updateStudentParent,
  }
}
