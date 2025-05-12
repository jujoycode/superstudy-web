import {
  useEEEvaluationGetEEEvaluationByStudent,
  useTokEvaluationCreateOrUpdate,
  useTokEvaluationGetCriteriaById,
  useTokEvaluationGetCriteriaItems,
  useTokEvaluationGetEvaluationInitialData,
} from '@/legacy/generated/endpoint'
import {
  EEEvaluationGetEEEvaluationByStudentParams,
  RequestTokEvaluationDto,
  TokEvaluationGetCriteriaItemsType,
  TokEvaluationGetEvaluationInitialDataType,
} from '@/legacy/generated/model'

interface EvaluationInitialDataParams {
  ibId: number
  type: TokEvaluationGetEvaluationInitialDataType
}

interface UseTokEvaluationCreateOrUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface createTokEvaluationProps {
  ibId: number
  criteriaId: number
  data: RequestTokEvaluationDto
}

// EE 평가 조회
export const useEvaluationGetByStudent = (
  studentId: number,
  { location }: EEEvaluationGetEEEvaluationByStudentParams,
  options?: { enabled?: boolean },
) => {
  // 학생의 평가 조회 (선생님)
  const { data, isLoading: isFetching } = useEEEvaluationGetEEEvaluationByStudent(
    studentId,
    {
      location,
    },
    {
      query: {
        enabled: options?.enabled,
      },
    },
  )

  return { data, isFetching }
}

// TOK 평가 기준 목록 조회
export const useGetTokEvaluationCriteriaItems = (type: TokEvaluationGetCriteriaItemsType) => {
  const { data, isLoading: isFetching } = useTokEvaluationGetCriteriaItems({ type })

  return { data, isFetching }
}

// TOK 평가 기준 단건 조회
export const useGetTokEvaluationCriteriaById = (id: number) => {
  const { data, isLoading: isFetching } = useTokEvaluationGetCriteriaById(id)

  return { data, isFetching }
}

// TOK 제출물 평가를 위한 초기 데이터 조회 (평가자 목록, 평가 기준 버전)
export const useGetTokEvaluationInitialData = (
  { ibId, type }: EvaluationInitialDataParams,
  options?: { enabled?: boolean },
) => {
  const { data, isLoading: isFetching } = useTokEvaluationGetEvaluationInitialData(
    ibId,
    { type },
    {
      query: {
        enabled: options?.enabled,
      },
    },
  )

  return { data, isFetching }
}

// TOK 제출물 평가 저장
export const useTokEvaluationCreate = ({ onSuccess, onError, onClose }: UseTokEvaluationCreateOrUpdateOptions) => {
  const { mutate, isLoading, reset } = useTokEvaluationCreateOrUpdate({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        reset()
        onClose?.()
      },
      onError: (error) => {
        console.error('TOK 평가 저장 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createTokEvaluation = ({ ibId, criteriaId, data }: createTokEvaluationProps) => {
    mutate({ ibId, criteriaId, data })
  }

  return { createTokEvaluation, isLoading }
}
