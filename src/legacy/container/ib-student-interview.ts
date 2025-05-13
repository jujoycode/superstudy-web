import {
  useInterviewCreateQnaByStudent,
  useInterviewDeleteQna,
  useInterviewFindInterviewByStudentId,
  useInterviewFindQnaById,
  useInterviewFindQnaByStudentId,
  useInterviewUpdateQna,
} from '@/legacy/generated/endpoint'
import { RequestCreateQnaDto, RequestUpdateQnaDto } from '@/legacy/generated/model'

export const useInterviewGetByStudentId = (id: number, category: string) => {
  const { data, isLoading, refetch } = useInterviewFindInterviewByStudentId(id, { category })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useInterviewQNAGetByStudentId = (studentId: number, category: string) => {
  const { data, isLoading, refetch } = useInterviewFindQnaByStudentId(studentId, { category })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useInterviewQNA = (qndId: number) => {
  const { data, isLoading, refetch } = useInterviewFindQnaById(qndId)
  return {
    data,
    isLoading,
    refetch,
  }
}

interface UseIBInterviewOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface IBInterviewCreateProps {
  id: number
  data: RequestCreateQnaDto
}

interface IBInterviewUpdateProps {
  id: number
  data: RequestUpdateQnaDto
}

export const useIBInterviewCreate = ({ onSuccess, onError, onClose }: UseIBInterviewOptions) => {
  const { mutate, isLoading, isError, error } = useInterviewCreateQnaByStudent({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('인터뷰 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBInterview = ({ id, data }: IBInterviewCreateProps) => {
    mutate({ id, data })
  }

  return {
    createIBInterview,
    isLoading,
    isError,
    error,
  }
}

export const useIBInterviewUpdate = ({ onSuccess, onError, onClose }: UseIBInterviewOptions) => {
  const { mutate, isLoading, isError, error } = useInterviewUpdateQna({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('인터뷰 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBInterview = ({ id, data }: IBInterviewUpdateProps) => {
    mutate({ qnaId: id, data })
  }

  return {
    updateIBInterview,
    isLoading,
    isError,
    error,
  }
}

export const useIBInterviewDelete = ({ onSuccess, onError, onClose }: UseIBInterviewOptions) => {
  const { mutate, isLoading, isError, error } = useInterviewDeleteQna({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('성찰일지 삭제 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const deleteIBInterview = (qnaId: number) => {
    mutate({ qnaId })
  }

  return {
    deleteIBInterview,
    isLoading,
    isError,
    error,
  }
}
