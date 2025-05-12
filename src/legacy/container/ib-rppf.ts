import { useRPPFUpdateRPPFInfo, useRPPFUpdateRPPFStatusWaitComplete } from '@/legacy/generated/endpoint'
import type { RequestRPPFInfoUpdateDto } from '@/legacy/generated/model'

interface UseIBRPPFCompleteOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface requestIBRPPFCompleteProps {
  ibId: number
  rppfId: number
}

interface updateIBRPPFInfoProps {
  ibId: number
  rppfId: number
  data: RequestRPPFInfoUpdateDto
}

export const useIBRPPFRequestComplete = ({ onSuccess, onError, onClose }: UseIBRPPFCompleteOptions) => {
  const { mutate, isLoading, isError, error } = useRPPFUpdateRPPFStatusWaitComplete({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('RPPF 완료 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const requestIBRPPFComplete = ({ ibId, rppfId }: requestIBRPPFCompleteProps) => {
    mutate({ ibId, rppfId })
  }

  return {
    requestIBRPPFComplete,
    isLoading,
    isError,
    error,
  }
}

export const useIBRPPFUpdateInfo = ({ onSuccess, onError, onClose }: UseIBRPPFCompleteOptions) => {
  const { mutate, isLoading, isError, error } = useRPPFUpdateRPPFInfo({
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

  const updateIBRPPFInfo = ({ ibId, rppfId, data }: updateIBRPPFInfoProps) => {
    mutate({ ibId, rppfId, data })
  }

  return {
    updateIBRPPFInfo,
    isLoading,
    isError,
    error,
  }
}
