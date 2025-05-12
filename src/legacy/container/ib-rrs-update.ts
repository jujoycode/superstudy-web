import { useRRSUpdate } from '@/legacy/generated/endpoint'
import type { RequestRRSDto } from '@/legacy/generated/model'

interface UseIBRRSUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateIBRRSProps {
  id: number
  ibId: number
  data: RequestRRSDto
}

export const useIBRRSUpdate = ({ onSuccess, onError, onClose }: UseIBRRSUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useRRSUpdate({
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

  const updateIBRRS = ({ id, ibId, data }: updateIBRRSProps) => {
    mutate({ id, ibId, data })
  }

  return {
    updateIBRRS,
    isLoading,
    isError,
    error,
  }
}
