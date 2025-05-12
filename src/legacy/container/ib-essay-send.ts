import { useEssayUpdateEssayStatusSent } from '@/legacy/generated/endpoint'

interface UseIBEssaySentOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

export const useIBEssaySent = ({ onSuccess, onError, onClose }: UseIBEssaySentOptions) => {
  const { mutate, isLoading, isError, error } = useEssayUpdateEssayStatusSent({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('에세이 제출 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const sentIBEssay = (essayId: number) => {
    mutate({ id: essayId })
  }

  return {
    sentIBEssay,
    isLoading,
    isError,
    error,
  }
}
