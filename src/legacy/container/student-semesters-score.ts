import { useQuery } from 'react-query'

import {
  getStudentExamScoreGetMockExamScoresQueryKey,
  getStudentExamScoreGetStudentExamScoresQueryKey,
  getStudentExamScoreGetStudentTestExamScoresQueryKey,
  studentExamScoreGetMockExamScores,
  studentExamScoreGetStudentExamScores,
  studentExamScoreGetStudentTestExamScores,
} from '@/legacy/generated/endpoint'

export function useStudentSemetsersScore(userId: number) {
  const queryKey = getStudentExamScoreGetStudentExamScoresQueryKey(userId)

  const { data, isLoading } = useQuery(
    queryKey,
    ({ signal }) => studentExamScoreGetStudentExamScores(userId, {}, signal),
    { enabled: !!userId },
  )
  const scores = data?.exams_scores

  return {
    scores,
    isLoading,
  }
}

export function useStudentTestScore(userId: number) {
  const queryKey = getStudentExamScoreGetStudentTestExamScoresQueryKey(userId)

  const { data, isLoading } = useQuery<any>(
    queryKey,
    ({ signal }) => studentExamScoreGetStudentTestExamScores(userId, {}, signal),
    { enabled: !!userId },
  )

  const scores = data?.scores

  return {
    scores,
    isLoading,
  }
}

export function useStudentMockScore(studentId: number) {
  const queryKey = getStudentExamScoreGetMockExamScoresQueryKey({ studentId })

  const { data, isLoading } = useQuery<any>(
    queryKey,
    ({ signal }) => studentExamScoreGetMockExamScores({ studentId }, {}, signal),
    { enabled: !!studentId },
  )

  const scores = data?.mock_exams_scores

  return {
    scores,
    isLoading,
  }
}
