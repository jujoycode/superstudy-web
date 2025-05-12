import { useIBDeleteProposal } from '@/legacy/generated/endpoint'

interface UseIBProposalDeleteOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface deleteIBProposalProps {
  id: number
  proposalId: number
}

export const useIBProposalDelete = ({ onSuccess, onError, onClose }: UseIBProposalDeleteOptions) => {
  const { mutate, isLoading, isError, error } = useIBDeleteProposal({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('제안서 삭제 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const deleteIBProposal = ({ id, proposalId }: deleteIBProposalProps) => {
    mutate({ id, proposalId })
  }

  return {
    deleteIBProposal,
    isLoading,
    isError,
    error,
  }
}
