import {
  useIBCreateIB,
  useIBDeleteIB,
  useIBRejectComplete,
  useIBRejectPlan,
  useIBSetHopeMentor,
  useIBUpdateIB,
  useIBUpdateIBStatusInProgress,
  useIBUpdateIBStatusWaitComplete,
  useIBUpdateIBStatusWaitMentor,
  useIBUpdateIBStstusComplete,
} from '@/legacy/generated/endpoint'
import type { RequestIBCommentDto, RequestIBDto, RequestIBUpdateDto } from '@/legacy/generated/model'

interface UseIBCreateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface useIBUpdateProps {
  id: number
  data: RequestIBUpdateDto
}

interface useIBSetHopeMentorProps {
  id: number
  mentorId: number
}

interface useIBRejectPlanProps {
  id: number
  data: RequestIBCommentDto
}

export const useIBCreate = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBCreateIB({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBProject = (data: RequestIBDto) => {
    mutate({ data })
  }

  return {
    createIBProject,
    isLoading,
    isError,
    error,
  }
}

export const useIBDelete = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBDeleteIB({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 삭제 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const deleteIBProject = (id: number) => {
    mutate({ id })
  }

  return {
    deleteIBProject,
    isLoading,
    isError,
    error,
  }
}

export const useIBUpdate = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIB({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBProject = ({ id, data }: useIBUpdateProps) => {
    mutate({ id, data })
  }

  return {
    updateIBProject,
    isLoading,
    isError,
    error,
  }
}

export const useIBHopeMentor = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBSetHopeMentor({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 제출 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const requestIBSetHopeMentor = ({ id, mentorId }: useIBSetHopeMentorProps) => {
    mutate({ id, mentorId })
  }

  return {
    requestIBSetHopeMentor,
    isLoading,
    isError,
    error,
  }
}

export const useIBWaitMentor = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBStatusWaitMentor({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 제출 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const requestIBWaitMentor = (id: number) => {
    mutate({ id })
  }

  return {
    requestIBWaitMentor,
    isLoading,
    isError,
    error,
  }
}

export const useIBRequestComplete = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBStatusWaitComplete({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 완료 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const requestIBProjectComplete = (id: number) => {
    mutate({ id })
  }

  return {
    requestIBProjectComplete,
    isLoading,
    isError,
    error,
  }
}

export const useIBRejectPlanStatus = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBRejectPlan({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 계획서 보완요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const rejectIBPlan = ({ id, data }: useIBRejectPlanProps) => {
    mutate({ id, data })
  }

  return {
    rejectIBPlan,
    isLoading,
    isError,
    error,
  }
}

export const useIBApprovePlan = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBStatusInProgress({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 계획서 승인 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const approveIBPlan = (id: number) => {
    mutate({ id })
  }

  return {
    approveIBPlan,
    isLoading,
    isError,
    error,
  }
}

export const useIBApproveComplete = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBStstusComplete({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 완료 승인 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const approveIBProjectComplete = (id: number) => {
    mutate({ id })
  }

  return {
    approveIBProjectComplete,
    isLoading,
    isError,
    error,
  }
}

// 완료 승인 반려 api 호출
export const useIBStatusRejectComplete = ({ onSuccess, onError, onClose }: UseIBCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBRejectComplete({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로젝트 완료 반려 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const rejectIBProjectComplete = (id: number, data: RequestIBCommentDto) => {
    mutate({ id, data })
  }

  return {
    rejectIBProjectComplete,
    isLoading,
    isError,
    error,
  }
}
