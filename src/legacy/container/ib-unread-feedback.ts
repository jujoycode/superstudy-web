import { useFeedbackFindUnreadFeedbacksExist } from '@/legacy/generated/endpoint'
import type { FeedbackGetNotReadFeedbackParams } from '@/legacy/generated/model/feedbackGetNotReadFeedbackParams'

export const unReadFeedback = ({ referenceId, referenceTable }: FeedbackGetNotReadFeedbackParams) => {
  // 읽지 않은 피드백 카운트 조회
  const { data } = useFeedbackFindUnreadFeedbacksExist({ referenceId, referenceTable })

  return {
    data,
  }
}
