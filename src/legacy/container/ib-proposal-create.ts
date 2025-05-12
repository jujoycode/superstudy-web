import { useIBCreateNextProposal } from '@/legacy/generated/endpoint'
import type { RequestIBProposalDto } from '@/legacy/generated/model'

interface UseIBProposalCreateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface createIBProposalProps {
  id: number
  data: RequestIBProposalDto
}

export const useIBProposalCreate = ({ onSuccess, onError, onClose }: UseIBProposalCreateOptions) => {
  const { mutate, isLoading, isError, error } = useIBCreateNextProposal({
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

  const createIBProposal = ({ id, data }: createIBProposalProps) => {
    mutate({ id, data })
  }

  return {
    createIBProposal,
    isLoading,
    isError,
    error,
  }
}
