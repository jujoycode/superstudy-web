import {
  useStudentExamScoreCheckStudentDataFile,
  useStudentExamScoreGetAnalysedScores,
  useStudentExamScoreGetAnalysedTargetScores,
  useStudentExamScoreGetStudentExamScoresByParent,
  useStudentExamScoreGetStudentMockExamScoresByParent,
  useStudentExamScorePatchStudentExamScores,
} from '@/legacy/generated/endpoint'
import type { StudentExamScoreGetStudentMockExamScoresByParentParams } from '@/legacy/generated/model'

import type { SchoolExamParams } from '@/legacy/pages/student/score/SchoolExamPage'

export interface MockScore {
  year: number
  grade: number
  month: number
}

export interface SchoolScore {
  year: number
  grade: number
  semester: number
  step: string
}

type Score = MockScore | SchoolScore

interface StudentScoreData {
  scores: Score[]
}

function isMockScore(score: Score): score is MockScore {
  return 'month' in score
}

function isSchoolScore(score: Score): score is SchoolScore {
  return 'semester' in score && 'step' in score
}

export function useStudentAnalysisScore(studentId: number): { data: any; isLoading: boolean; error: any } {
  const { data, isLoading, error } = useStudentExamScoreGetAnalysedScores(studentId)
  return { data, isLoading, error }
}

export function useStudentAnalysisTargetScore(
  studentId: number,
  grade: number,
  semester: number,
): { data: any; isLoading: boolean } {
  //@ts-ignore
  const { data, isLoading } = useStudentExamScoreGetAnalysedTargetScores(studentId, { grade, semester })
  return { data, isLoading }
}

export function useTargetScoreAnalysis() {
  const { mutateAsync: patchTargetScoreAnalysisMutate, isLoading } = useStudentExamScorePatchStudentExamScores({})
  return {
    patchTargetScoreAnalysisMutate,
    isLoading,
  }
}

export function useSchoolExamScoreByParent<T extends 'MOCK' | 'SCHOOL'>(
  studentId: number,
  type: T,
): {
  data: T extends 'MOCK' ? MockScore[] : SchoolScore[] | undefined
  isLoading: boolean
  error: unknown
} {
  const { data: score, isLoading, error } = useStudentExamScoreCheckStudentDataFile<StudentScoreData>(studentId)
  const data = score?.scores.filter((score: Score) => {
    if (type === 'MOCK') {
      return isMockScore(score)
    }
    return isSchoolScore(score)
  }) as T extends 'MOCK' ? MockScore[] : SchoolScore[]

  return { data, isLoading, error }
}

export function useSchoolExamScoreByStudent(
  { studentId, year, grade, semester, step }: SchoolExamParams,
  options?: { enabled?: boolean },
) {
  const { data, isLoading, error } = useStudentExamScoreGetStudentExamScoresByParent(
    studentId,
    {
      year,
      grade,
      semester,
      step: step === 'final' ? 'final' : 'midterm',
    },
    {
      query: {
        enabled: options?.enabled,
      },
    },
  )
  return { data, isLoading, error }
}

export function useMockExamScoreByStudent(
  { studentId, year, grade, month }: StudentExamScoreGetStudentMockExamScoresByParentParams & { studentId: number },
  options?: { enabled?: boolean },
) {
  const { data, isLoading, error } = useStudentExamScoreGetStudentMockExamScoresByParent(
    studentId,
    {
      year,
      grade,
      month,
    },
    {
      query: {
        enabled: options?.enabled,
      },
    },
  )
  return { data, isLoading, error }
}
