import { useIBUpdateIBProposalStatusSentForAll, useIBUpdateIBStatusWaitPlanApprove } from '@/legacy/generated/endpoint'

interface UseIBProposalSentOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

export const useIBProposalSentAll = ({ onSuccess, onError, onClose }: UseIBProposalSentOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBProposalStatusSentForAll({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('제안서 제출 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const sentIBProposalAll = (id: number) => {
    mutate({ id })
  }

  return {
    sentIBProposalAll,
    isLoading,
    isError,
    error,
  }
}

export const useIBProposalUpdateWaitPlan = ({ onSuccess, onError, onClose }: UseIBProposalSentOptions) => {
  const { mutate, isLoading, isError, error } = useIBUpdateIBStatusWaitPlanApprove({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('제안서 제출 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const sentIBProposalUpdateWaitPlan = (id: number) => {
    mutate({ id })
  }

  return {
    sentIBProposalUpdateWaitPlan,
    isLoading,
    isError,
    error,
  }
}
