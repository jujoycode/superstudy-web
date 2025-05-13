import {
  useIBRejectTokEssay,
  useIBSubmitTokOutline,
  useIBUpdateIBTokOutlineStatusInProgress,
  useIBUpdateTokOutline,
  useTKPPFCreateOrUpdate,
  useTKPPFFindTKPPF,
  useTKPPFUpdateRPPFStatusReject,
  useTKPPFUpdateRPPFStatusWaitComplete,
  useTKPPFUpdateTKPPFInfo,
} from '@/legacy/generated/endpoint'
import {
  RequestCreateTKPPFDto,
  RequestIBCommentDto,
  RequestIBTokOutlineDto,
  RequestTKPPFInfoUpdateDto,
} from '@/legacy/generated/model'

interface UseUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateOutlineProps {
  id: number
  outlineId: number
  data: RequestIBTokOutlineDto
}

interface submitOutlineProps {
  id: number
  outlineId: number
}

interface createIBTKPPFProps {
  ibId: number
  data: RequestCreateTKPPFDto
}

interface updateIBTKPPFInfoProps {
  ibId: number
  data: RequestTKPPFInfoUpdateDto
}

export const useTKPPFGetByIBId = (ibId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useTKPPFFindTKPPF(ibId, { query: { enabled: options?.enabled } })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useOutlineUpdate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateTokOutline({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('아웃라인 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateOutline = ({ id, outlineId, data }: updateOutlineProps) => {
    mutate({ id, outlineId, data })
  }

  return {
    updateOutline,
    isLoading,
    isError,
    error,
  }
}

export const useOutlineSubmit = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBSubmitTokOutline({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('아웃라인 제출 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const submitOutline = ({ id, outlineId }: submitOutlineProps) => {
    mutate({ id, outlineId })
  }

  return {
    submitOutline,
    isLoading,
    isError,
    error,
  }
}

export const useIBTKPPFCreate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useTKPPFCreateOrUpdate({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('TKPPF 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBTKPPF = ({ ibId, data }: createIBTKPPFProps) => {
    mutate({ ibId, data })
  }

  return {
    createIBTKPPF,
    isLoading,
    isError,
    error,
  }
}

// 아웃라인 반려 api 호출
export const useIBOutlineStatusReject = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const { mutate, isLoading, isError, error } = useIBRejectTokEssay({
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

  const rejectOutline = (id: number, outlineId: number, data: RequestIBCommentDto) => {
    mutate({ id, outlineId, data })
  }

  return {
    rejectOutline,
    isLoading,
    isError,
    error,
  }
}

// 아웃라인 승인 api 호출
export const useIBOutlineStatusApprove = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBTokOutlineStatusInProgress({
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

  const approveOutline = (id: number, outlineId: number) => {
    mutate({ id, outlineId })
  }

  return {
    approveOutline,
    isLoading,
    isError,
    error,
  }
}

// TKPPF 완료 승인요청 api 호출 (학생)
export const useIBTKPPFRequestComplete = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useTKPPFUpdateRPPFStatusWaitComplete({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('TKPPF 완료 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const requestIBTKPPFComplete = (ibId: number) => {
    mutate({ ibId })
  }

  return {
    requestIBTKPPFComplete,
    isLoading,
    isError,
    error,
  }
}

// TKPPF 반려 보완요청 api 호출 (선생님)
export const useIBTKPPFRequestReject = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useTKPPFUpdateRPPFStatusReject({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('TKPPF 보완 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const requestIBTKPPFReject = (ibId: number, data: RequestIBCommentDto) => {
    mutate({ ibId, data })
  }

  return {
    requestIBTKPPFReject,
    isLoading,
    isError,
    error,
  }
}

// TKPPF IB 제출 정보 기입 api 호출
export const useIBTKPPFUpdateInfo = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useTKPPFUpdateTKPPFInfo({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB제출정보 기입 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBTKPPFInfo = ({ ibId, data }: updateIBTKPPFInfoProps) => {
    mutate({ ibId, data })
  }

  return {
    updateIBTKPPFInfo,
    isLoading,
    isError,
    error,
  }
}
