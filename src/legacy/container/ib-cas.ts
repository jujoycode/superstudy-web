import {
  useIBActivityLogCreateItem,
  useIBActivityLogGetItem,
  useIBActivityLogGetItems,
  useIBActivityLogUpdateItem,
  useIBCasPortfolioGetItem,
  useIBProfileCreateItem,
  useIBProfileGetItemByStudent,
  useIBProfileGetTemplateItemByStudent,
  useIBProfileUpdateItem,
  useIBReflectionDiaryCreateItem,
  useIBReflectionDiaryDeleteItem,
  useIBReflectionDiaryGetItem,
  useIBReflectionDiaryUpdateItem,
} from '@/legacy/generated/endpoint'
import type {
  IBActivityLogGetItemsParams,
  RequestIBActivityLogDto,
  RequestIBActivityLogUpdateDto,
  RequestIBBasicContentDto,
  RequestIBBasicContentUpdateDto,
  RequestIBProfileDto,
} from '@/legacy/generated/model'

interface UseUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface createActivityLogProps {
  ibId: number
  data: RequestIBActivityLogDto
}
interface updateActivityLogProps {
  ibId: number
  activityLogId: number
  data: RequestIBActivityLogUpdateDto
}

interface updateReflectionDiaryProps {
  id: number
  studentId: number
  data: RequestIBBasicContentUpdateDto
}
interface deleteReflectionDiaryProps {
  id: number
  studentId: number
}

interface updateIBProfileProps {
  id: number
  data: RequestIBProfileDto
}

export const useActivityLogGetAll = (
  ibId: number,
  params?: IBActivityLogGetItemsParams,
  options?: { enabled?: boolean },
) => {
  const defaultParams = { page: 1, limit: 10 }
  const mergedParams = { ...defaultParams, ...params }

  const { data, isLoading, refetch } = useIBActivityLogGetItems(ibId, mergedParams, {
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useReflectionDiaryGetById = (id: number, studentId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBReflectionDiaryGetItem(id, studentId, {
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useActivityLogGetById = (ibId: number, activityLogId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBActivityLogGetItem(ibId, activityLogId, {
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useIBPortfolioGetById = (id: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBCasPortfolioGetItem(id, {
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useIBProfileGetById = (id: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBProfileGetItemByStudent(id, {
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useIBProfileTemplateGet = (options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBProfileGetTemplateItemByStudent({
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useIBProfileCreate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBProfileCreateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로필 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBProfile = (data: RequestIBProfileDto) => {
    mutate({ data })
  }

  return {
    createIBProfile,
    isLoading,
    isError,
    error,
  }
}

export const useIBProfileUpdate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBProfileUpdateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 프로필 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBProfile = ({ id, data }: updateIBProfileProps) => {
    mutate({ id, data })
  }

  return {
    updateIBProfile,
    isLoading,
    isError,
    error,
  }
}
export const useActivityLogCreate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBActivityLogCreateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('활동일지 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createActivityLog = ({ ibId, data }: createActivityLogProps) => {
    mutate({ ibId, data })
  }

  return {
    createActivityLog,
    isLoading,
    isError,
    error,
  }
}

export const useReflectionDiaryCreate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBReflectionDiaryCreateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('활동일지 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createReflectionDiary = (data: RequestIBBasicContentDto) => {
    mutate({ data })
  }

  return {
    createReflectionDiary,
    isLoading,
    isError,
    error,
  }
}

export const useReflectionDiaryDelete = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBReflectionDiaryDeleteItem({
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

  const deleteReflectionDiary = ({ id, studentId }: deleteReflectionDiaryProps) => {
    mutate({ id, studentId })
  }

  return {
    deleteReflectionDiary,
    isLoading,
    isError,
    error,
  }
}
export const useReflectionDiaryUpdate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBReflectionDiaryUpdateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('성찰일지 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateReflectionDiary = ({ id, studentId, data }: updateReflectionDiaryProps) => {
    mutate({ id, studentId, data })
  }

  return {
    updateReflectionDiary,
    isLoading,
    isError,
    error,
  }
}
export const useActivityLogUpdate = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBActivityLogUpdateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('활동일지 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateActivityLog = ({ ibId, activityLogId, data }: updateActivityLogProps) => {
    mutate({ ibId, activityLogId, data })
  }

  return {
    updateActivityLog,
    isLoading,
    isError,
    error,
  }
}
