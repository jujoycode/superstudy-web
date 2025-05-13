import { useQuery } from 'react-query'

import {
  getStudentExamScoreGetStudentExamScoresChartQueryKey,
  studentExamScoreGetStudentExamScoresChart,
} from '@/legacy/generated/endpoint'

export function useStudentSubjectsScore(userId: number) {
  const queryKey = getStudentExamScoreGetStudentExamScoresChartQueryKey(userId)

  const { data, isLoading } = useQuery(
    queryKey,
    ({ signal }) => studentExamScoreGetStudentExamScoresChart(userId, {}, signal),
    { enabled: !!userId },
  )
  const scores = data?.exam_scores_chart

  return {
    scores,
    isLoading,
  }
}
