import { useIBChangeProposalRank, useIBUpdateProposal } from '@/legacy/generated/endpoint'
import type { RequestIBProposalRankItemDto, RequestIBProposalUpdateDto } from '@/legacy/generated/model'

interface UseIBProposalUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateIBProposalProps {
  id: number
  proposalId: number
  data: RequestIBProposalUpdateDto
}

interface changeIBProposalRankProps {
  id: number
  data: RequestIBProposalRankItemDto
}

export const useIBProposalUpdate = ({ onSuccess, onError, onClose }: UseIBProposalUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateProposal({
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

  const updateIBProposal = ({ id, proposalId, data }: updateIBProposalProps) => {
    mutate({ id, proposalId, data })
  }

  return {
    updateIBProposal,
    isLoading,
    isError,
    error,
  }
}

export const useIBProposalRankChange = ({ onSuccess, onError, onClose }: UseIBProposalUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBChangeProposalRank({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('제안서 순위 변경 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const changeIBProposalRank = ({ id, data }: changeIBProposalRankProps) => {
    mutate({ id, data })
  }

  return {
    changeIBProposalRank,
    isLoading,
    isError,
    error,
  }
}
