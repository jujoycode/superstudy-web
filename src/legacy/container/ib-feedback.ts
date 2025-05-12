import { useQueryClient } from 'react-query'
import {
  getFeedbackGetFeedbackQueryKey,
  useFeedbackBatchFindUnreadFeedbacksExist,
  useFeedbackCreateFeedback,
  useFeedbackFindUnreadFeedbacksExist,
  useFeedbackGetFeedback,
  useFeedbackGetFeedbackCount,
  useFeedbackGetNotReadFeedback,
} from '@/legacy/generated/endpoint'
import { FeedbackBatchFindUnreadFeedbacksExistParams, FeedbackGetFeedbackParams } from '@/legacy/generated/model'

export const useFeedback = ({ referenceId, referenceTable }: FeedbackGetFeedbackParams) => {
  const queryClient = useQueryClient()

  // Feedback 조회 로직
  const { data, isLoading: isFetching } = useFeedbackGetFeedback({ referenceTable, referenceId })
  const feedback = data?.items

  // Feedback 생성 로직
  const { mutate: createFeedback, isLoading: isCreating } = useFeedbackCreateFeedback({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(getFeedbackGetFeedbackQueryKey({ referenceTable, referenceId }))
      },
      onError: (error) => {
        console.error('피드백 생성 중 오류 발생:', error)
      },
    },
  })

  return {
    feedback,
    isFetching,
    createFeedback,
    isCreating,
  }
}

export const useGetUnreadFeedbackCount = (
  { referenceId, referenceTable }: FeedbackGetFeedbackParams,
  options?: { enabled?: boolean },
) => {
  const { data, isLoading, refetch } = useFeedbackFindUnreadFeedbacksExist(
    { referenceId, referenceTable },
    {
      query: { enabled: options?.enabled },
    },
  )

  return {
    data,
    isLoading,
    refetch,
  }
}

export const useGetUnreadFeedback = (
  { referenceId, referenceTable }: FeedbackGetFeedbackParams,
  options?: { enabled?: boolean },
) => {
  const { data, isLoading, refetch } = useFeedbackGetNotReadFeedback(
    { referenceId, referenceTable },
    {
      query: { enabled: options?.enabled },
    },
  )

  return {
    data,
    isLoading,
    refetch,
  }
}

export const useGetFeedbackExist = (
  { referenceId, referenceTable }: FeedbackGetFeedbackParams,
  options?: { enabled?: boolean },
) => {
  const { data, isLoading, refetch } = useFeedbackGetFeedbackCount(
    { referenceId, referenceTable },
    {
      query: { enabled: options?.enabled },
    },
  )

  return {
    data,
    isLoading,
    refetch,
  }
}

export const useGetFeedbackBatchExist = (
  { referenceIds, referenceTable }: FeedbackBatchFindUnreadFeedbacksExistParams,
  options?: { enabled?: boolean },
) => {
  const { data, isLoading, refetch } = useFeedbackBatchFindUnreadFeedbacksExist(
    { referenceIds, referenceTable },
    {
      query: { enabled: options?.enabled },
    },
  )

  return {
    data,
    isLoading,
    refetch,
  }
}
