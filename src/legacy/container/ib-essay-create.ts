import { useEssayCreateEssay } from '@/legacy/generated/endpoint'
import { RequestEssayDto } from '@/legacy/generated/model'

interface UseIBEssayCreateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface createIBEssayProps {
  ibId: number
  data: RequestEssayDto
}

export const useIBEssayCreate = ({ onSuccess, onError, onClose }: UseIBEssayCreateOptions) => {
  const { mutate, isLoading, isError, error } = useEssayCreateEssay({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('에세이 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBEssay = ({ ibId, data }: createIBEssayProps) => {
    mutate({ ibId, data })
  }

  return {
    createIBEssay,
    isLoading,
    isError,
    error,
  }
}
