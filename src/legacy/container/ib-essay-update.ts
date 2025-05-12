import { useEssayUpdateEssay } from '@/legacy/generated/endpoint'
import { RequestEssayDto } from '@/legacy/generated/model'

interface UseIBEssayUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateIBEssayProps {
  id: number
  data: RequestEssayDto
}

export const useIBEssayUpdate = ({ onSuccess, onError, onClose }: UseIBEssayUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useEssayUpdateEssay({
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

  const updateIBEssay = ({ id, data }: updateIBEssayProps) => {
    mutate({ id, data })
  }

  return {
    updateIBEssay,
    isLoading,
    isError,
    error,
  }
}
