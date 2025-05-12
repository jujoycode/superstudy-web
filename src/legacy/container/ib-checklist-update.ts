import {
  useChecklistCreateChecklistResponse,
  useChecklistCreateChecklistResponseFromTeacher,
} from '@/legacy/generated/endpoint'
import { ChecklistLocation, RequestChecklistResponseBulkDto } from '@/legacy/generated/model'

interface UseIBCheckListUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateIBCheckListProps {
  location: ChecklistLocation
  checkedIds: number[]
  uncheckedIds: number[]
}

interface updateIBCheckListByTeacherProps {
  data: RequestChecklistResponseBulkDto
  studentId: number
}

export const useIBCheckListUpdate = ({ onSuccess, onError, onClose }: UseIBCheckListUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useChecklistCreateChecklistResponse({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('체크리스트 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBCheckList = (data: updateIBCheckListProps) => {
    mutate({ data })
  }

  return {
    updateIBCheckList,
    isLoading,
    isError,
    error,
  }
}

export const useIBCheckListUpdateByTeacher = ({ onSuccess, onError, onClose }: UseIBCheckListUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useChecklistCreateChecklistResponseFromTeacher({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('체크리스트 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBCheckListByTeacher = ({ studentId, data }: updateIBCheckListByTeacherProps) => {
    mutate({ studentId, data })
  }

  return {
    updateIBCheckListByTeacher,
    isLoading,
    isError,
    error,
  }
}
