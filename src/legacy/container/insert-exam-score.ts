import { useState } from 'react'
import {
  useStudentExamScoreCheckMockScoreFile,
  useStudentExamScoreCheckScoreFile,
  useStudentExamScoreCheckTestScoreFile,
  useStudentExamScoreDeleteMockScore,
  useStudentExamScoreDeleteStudentExamScore,
  useStudentExamScoreDeleteTestScore,
  useStudentExamScoreInsertMockScores,
  useStudentExamScoreInsertTestScores,
  useStudentExamScoreInsetClassScoresBulk,
} from '@/legacy/generated/endpoint'
import {
  StudentExamScoreDeleteMockScoreParams,
  StudentExamScoreInsertMockScoresBody,
  StudentExamScoreInsertMockScoresParams,
  StudentExamScoreInsertTestScoresBody,
  StudentExamScoreInsertTestScoresParams,
} from '@/legacy/generated/model'
import { queryClient } from '@/legacy/lib/query'
import { examsScoreFiles } from '@/legacy/util/exam-score'

interface Score {
  grade: number
  class: number
  semester: number
}

interface TestScore {
  grade: number
  res: TestItemList[]
}

interface MockScore {
  class: number
  month: number
  isSubmitted: boolean
}

interface TestItemList {
  semester: number
  scores: MockItem[]
}

interface MockItem {
  class: number
  first_test: boolean
  second_test: boolean
}

interface SCORE_DATA {
  scores: Score[]
}

interface MOCK_DATA {
  grade: number
  scores: MockScore[]
}

export function useInsertScoreBatch() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const { mutateAsync, isLoading, isError } = useStudentExamScoreInsetClassScoresBulk({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['score'])
      },
      onError: (error) => {
        setErrorMessage(error?.message)
      },
    },
  })

  const insertScoreBatch = async ({ file, grade, class_num, cur_year }: examsScoreFiles): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutateAsync({ data: { file }, params: { grade, classNum: class_num, insertionYear: cur_year } })
        .then(() => resolve())
        .catch((error) => {
          console.error(error.message)
          reject(error)
        })
    })
  }

  return {
    insertScoreBatch,
    isLoading,
    errorMessage,
    isError,
  }
}

export function useStudentScoreFileCheck(grade: number, insertionYear: number) {
  const [errorMessage, setErrorMessage] = useState<String | undefined>()
  const { data, isLoading, error } = useStudentExamScoreCheckScoreFile<SCORE_DATA>(
    { grade, insertionYear },
    {
      query: {
        enabled: !!grade,
        onError: () => {
          setErrorMessage(error?.message)
        },
      },
    },
  )
  return {
    data,
    isLoading,
    errorMessage,
  }
}

export function useStudentScoreFileCheckMock(grade: number, insertionYear: number) {
  const [errorMessage, setErrorMessage] = useState<String | undefined>()
  const { data, isLoading, error } = useStudentExamScoreCheckMockScoreFile<MOCK_DATA>(
    { grade, insertionYear },
    {
      query: {
        enabled: !!grade,
        onError: () => {
          setErrorMessage(error?.message)
        },
      },
    },
  )

  return {
    data,
    isLoading,
    errorMessage,
  }
}

export function useStudentScoreFileCheckTest(grade: number, insertionYear: number) {
  const [errorMessage, setErrorMessage] = useState<String | undefined>()
  const { data, isLoading, error } = useStudentExamScoreCheckTestScoreFile<TestScore>(
    { grade, insertionYear },
    {
      query: {
        enabled: !!grade,
        onError: () => {
          setErrorMessage(error?.message)
        },
      },
    },
  )

  return {
    data,
    isLoading,
    errorMessage,
  }
}

export function useStudentInsertTestScores() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const { mutateAsync, isLoading, isError } = useStudentExamScoreInsertTestScores({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['testScore'])
      },
      onError: (error) => {
        setErrorMessage(error?.message)
      },
    },
  })

  const insertTestScore = ({
    file,
    grade,
    classNum,
    insertionYear,
    semester,
    step,
  }: StudentExamScoreInsertTestScoresBody & StudentExamScoreInsertTestScoresParams): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutateAsync({ data: { file }, params: { grade, classNum, insertionYear, semester, step } })
        .then(() => resolve())
        .catch((error) => {
          console.error(error.message)
          reject(error)
        })
    })
  }
  return {
    insertTestScore,
    isLoading,
    errorMessage,
    isError,
  }
}

export function useStudentInsertMockScores() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const { mutateAsync, isLoading, isError } = useStudentExamScoreInsertMockScores({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['mockScore'])
      },
      onError: (error) => {
        setErrorMessage(error?.message)
      },
    },
  })

  const insertMockScore = ({
    file,
    grade,
    month,
    insertionYear,
    excelDataType,
  }: StudentExamScoreInsertMockScoresBody & StudentExamScoreInsertMockScoresParams): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutateAsync({ data: { file }, params: { grade, month, insertionYear, excelDataType } })
        .then(() => resolve())
        .catch((error) => {
          console.error(error.message)
          reject(error)
        })
    })
  }

  return {
    insertMockScore,
    isLoading,
    errorMessage,
    isError,
  }
}

export function useStudentExamScoreDelete() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const { mutateAsync: deleteExamScoreMutate } = useStudentExamScoreDeleteStudentExamScore({
    mutation: {
      onSuccess: (response: any) => {
        if ('error' in response) {
          setErrorMessage(response.error)
        } else {
          setErrorMessage(undefined)
          queryClient.invalidateQueries(['score'])
        }
      },
      onError: (error) => {
        setErrorMessage(error?.message)
      },
    },
  })

  // const deleteExamScore = ({
  //   grade,
  //   classNum,
  //   semester,
  //   insertionYear,
  // }: StudentExamScoreDeleteStudentExamScoreParams) => {
  //   deleteExamScoreMutate({
  //     params: {
  //       grade,
  //       classNum,
  //       semester,
  //       insertionYear,
  //     },
  //   });
  // };
  return {
    deleteExamScoreMutate,
    errorMessage,
  }
}

// 모의고사 점수 삭제
export function useStudentMockExamScoreDelete() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const { mutateAsync: deleteMockExamScoreMutate } = useStudentExamScoreDeleteMockScore({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['mockScore'])
      },
      onError: (error) => {
        setErrorMessage(error?.message)
      },
    },
  })

  const deleteMockExamScore = async ({
    grade,
    classNum,
    month,
    insertionYear,
  }: StudentExamScoreDeleteMockScoreParams) => {
    await deleteMockExamScoreMutate({
      params: {
        grade,
        classNum,
        month,
        insertionYear,
      },
    })
  }

  return {
    deleteMockExamScore,
    errorMessage,
  }
}

// 내신 점수 삭제
export function useStudentTestExamScoreDelete() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const { mutate: deleteTestExamScoreMutate } = useStudentExamScoreDeleteTestScore({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['testScore'])
      },
      onError: (error) => {
        setErrorMessage(error?.message)
      },
    },
  })

  return {
    deleteTestExamScoreMutate,
    errorMessage,
  }
}
