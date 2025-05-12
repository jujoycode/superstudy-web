import { useRPPFCreateOrUpdate } from '@/legacy/generated/endpoint'
import { RequestCreateRPPFDto } from '@/legacy/generated/model'

interface UseIBRPPFCreateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface createIBRPPFProps {
  ibId: number
  data: RequestCreateRPPFDto
}

export const useIBRPPFCreate = ({ onSuccess, onError, onClose }: UseIBRPPFCreateOptions) => {
  const { mutate, isLoading, isError, error } = useRPPFCreateOrUpdate({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('RPPF 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBRPPF = ({ ibId, data }: createIBRPPFProps) => {
    mutate({ ibId, data })
  }

  return {
    createIBRPPF,
    isLoading,
    isError,
    error,
  }
}
