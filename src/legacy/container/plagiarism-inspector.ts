import {
  usePlagiarismCopykillerUpload,
  usePlagiarismGetCopykillerList,
  usePlagiarismGetCopykillerStatus,
  usePlagiarismGetCopykillerStatusById,
  usePlagiarismGetCopyRatioDetailById,
} from '@/legacy/generated/endpoint'
import type { RequestCopykillerUploadDto, CopykillerTargetTable } from '@/legacy/generated/model'

interface UsePlagiarismUploadOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface uploadPlagiarismProps {
  data: RequestCopykillerUploadDto
}

// 업로드
export const usePlagiarismUpload = ({ onSuccess, onError, onClose }: UsePlagiarismUploadOptions) => {
  const { mutate, isLoading, isError, error } = usePlagiarismCopykillerUpload({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('표절 검사 업로드 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const uploadPlagiarism = ({ data }: uploadPlagiarismProps) => {
    mutate({ data })
  }

  return {
    uploadPlagiarism,
    isLoading,
    isError,
    error,
  }
}

// 리스트 조회
export const useGetPlagiarismInspectList = () => {
  const { data, isLoading, isError, error } = usePlagiarismGetCopykillerList({ page: 1, limit: 10 })

  return {
    data,
    isLoading,
    isError,
    error,
  }
}

// 업로드 후 바로 표절률 검사 결과 조회
export const useGetPlagiarismInspectResult = (id: number, options?: { query?: any }) => {
  const { data, isLoading, isError, error, refetch } = usePlagiarismGetCopykillerStatusById(id, {
    query: {
      enabled: !!id,
      ...options?.query,
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

// 저장된 IB 데이터 표절률 조회
export const useGetIBPlagiarismInspectRatio = (
  targetTable: CopykillerTargetTable,
  targetId: number,
  options?: { query?: any },
) => {
  const { data, isLoading, isError, error, refetch } = usePlagiarismGetCopykillerStatus(
    {
      targetTable: targetTable,
      targetId: targetId,
    },
    {
      query: {
        enabled: !!targetId,
        ...options?.query,
      },
    },
  )

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

// 표절 검사 상세 결과 페이지 조회(HTML 형식)
export const useGetPlagiarismInspectDetail = (id: number, options?: { query?: any }) => {
  const { data, isLoading, isError, error, refetch } = usePlagiarismGetCopyRatioDetailById(id, {
    query: {
      enabled: !!id,
      ...options?.query,
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}
