import { useRRSCreate } from '@/legacy/generated/endpoint'
import { RequestRRSDto } from '@/legacy/generated/model'

interface UseIBRRSCreateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface createIBRRSProps {
  ibId: number
  data: RequestRRSDto
}

export const useIBRRSCreate = ({ onSuccess, onError, onClose }: UseIBRRSCreateOptions) => {
  const { mutate, isLoading, isError, error } = useRRSCreate({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('RRS 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBRRS = ({ ibId, data }: createIBRRSProps) => {
    mutate({ ibId, data })
  }

  return {
    createIBRRS,
    isLoading,
    isError,
    error,
  }
}
