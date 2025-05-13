import {
  useIBCoordinatorCreateCoordinator,
  useIBCoordinatorGetItems,
  useIBSchoolManagementCreateItem,
  useIBSchoolManagementGetItem,
  useIBSchoolManagementUpdateItem,
} from '@/legacy/generated/endpoint'
import { DependentCategory, RequestCoordinatorDto, RequestIBSchoolManagementDto } from '@/legacy/generated/model'

interface UseUpdateOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

export const useGetIBSchoolInfo = (options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBSchoolManagementGetItem({
    query: { enabled: options?.enabled },
  })
  return {
    data,
    isLoading,
    refetch,
  }
}

export const useCreateIBSchool = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBSchoolManagementCreateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 학교정보 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBSchool = (data: RequestIBSchoolManagementDto) => {
    mutate({ data })
  }

  return {
    createIBSchool,
    isLoading,
    isError,
    error,
  }
}

export const useUpateIBSchool = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBSchoolManagementUpdateItem({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 학교정보 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBSchool = (data: RequestIBSchoolManagementDto) => {
    mutate({ data })
  }

  return {
    updateIBSchool,
    isLoading,
    isError,
    error,
  }
}

export const useUpateIBCoordinator = ({ onSuccess, onError, onClose }: UseUpdateOptions) => {
  const { mutate, isLoading, isError, error } = useIBCoordinatorCreateCoordinator({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('IB 코디네이터 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBCoordinator = (data: RequestCoordinatorDto) => {
    mutate({ data })
  }

  return {
    updateIBCoordinator,
    isLoading,
    isError,
    error,
  }
}

export const useGetIBCoordinators = (type?: DependentCategory, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useIBCoordinatorGetItems(
    { type },
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
