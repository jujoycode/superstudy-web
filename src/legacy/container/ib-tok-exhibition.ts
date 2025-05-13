import {
  useExhibitionCreateExhibition,
  useExhibitionGetExhibition,
  useExhibitionUpdateExhibition,
  useExhibitionUpdateExhibitionStatusReject,
  useExhibitionUpdateExhibitionStatusWaitComplete,
  useIBRejectTokExhibition,
  useIBSubmitTokExhibitionPlan,
  useIBUpdateIBTokExhibitionStatusInProgress,
  useIBUpdateTokExhibitionPlan,
} from '@/legacy/generated/endpoint'
import { RequestExhibitionDto, RequestIBCommentDto, RequestIBTokExhibitionPlanDto } from '@/legacy/generated/model'

interface UseUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateExhibitionPlanProps {
  id: number
  exhibitionPlanId: number
  data: RequestIBTokExhibitionPlanDto
}

interface updateExhibitionProps {
  id: number
  ibId: number
  data: RequestExhibitionDto
}

interface submitExhibitionPlanProps {
  id: number
  exhibitionPlanId: number
}

interface submitExhibitionProps {
  id: number
  ibId: number
}

interface createExhibitionProps {
  id: number
  data: RequestExhibitionDto
}

export const useexhibitionGetByIBId = (ibId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useExhibitionGetExhibition(ibId, { query: { enabled: options?.enabled } })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useExhibitionPlanUpdate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateTokExhibitionPlan({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('전시회 기획안 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateExhibitionPlan = ({ id, exhibitionPlanId, data }: updateExhibitionPlanProps) => {
    mutate({ id, exhibitionPlanId, data })
  }

  return {
    updateExhibitionPlan,
    isLoading,
    isError,
    error,
  }
}

export const useExhibitionUpdate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useExhibitionUpdateExhibition({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('전시회 기획안 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateExhibition = ({ id, ibId, data }: updateExhibitionProps) => {
    mutate({ id, ibId, data })
  }

  return {
    updateExhibition,
    isLoading,
    isError,
    error,
  }
}

export const useExhibitionPlanSubmit = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBSubmitTokExhibitionPlan({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('전시회 기획안 제출 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const submitExhibitionPlan = ({ id, exhibitionPlanId }: submitExhibitionPlanProps) => {
    mutate({ id, exhibitionPlanId })
  }

  return {
    submitExhibitionPlan,
    isLoading,
    isError,
    error,
  }
}

export const useExhibitionSubmit = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useExhibitionUpdateExhibitionStatusWaitComplete({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('전시회 완료 승인 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const submitExhibition = ({ id, ibId }: submitExhibitionProps) => {
    mutate({ id, ibId })
  }

  return {
    submitExhibition,
    isLoading,
    isError,
    error,
  }
}

export const useExhibitionCreate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useExhibitionCreateExhibition({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('전시회 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createExhibition = ({ id, data }: createExhibitionProps) => {
    mutate({ ibId: id, data })
  }

  return {
    createExhibition,
    isLoading,
    isError,
    error,
  }
}

// 기획안 반려 api 호출 (보완요청)
export const useIBExhibitionPlanStatusReject = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const { mutate, isLoading, isError, error } = useIBRejectTokExhibition({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
      },
      onError: (error) => {
        console.error('기획안 반려 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const rejectExhibitionPlan = (id: number, exhibitionPlanId: number, data: RequestIBCommentDto) => {
    mutate({ id, exhibitionPlanId, data })
  }

  return {
    rejectExhibitionPlan,
    isLoading,
    isError,
    error,
  }
}

// 기획안 승인 api 호출
export const useIBExhibitionPlanStatusApprove = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBTokExhibitionStatusInProgress({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
      },
      onError: (error) => {
        console.error('기획안 반려 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const approveExhibitionPlan = (id: number, exhibitionPlanId: number) => {
    mutate({ id, exhibitionPlanId })
  }

  return {
    approveExhibitionPlan,
    isLoading,
    isError,
    error,
  }
}

// 전시회 반려보완요청 (선생님)
export const useExhibitionStatusReject = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const { mutate, isLoading, isError, error } = useExhibitionUpdateExhibitionStatusReject({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
      },
      onError: (error) => {
        console.error('전시회 반려 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const rejectExhibition = (ibId: number, id: number, data: RequestIBCommentDto) => {
    mutate({ ibId, id, data })
  }

  return {
    rejectExhibition,
    isLoading,
    isError,
    error,
  }
}
