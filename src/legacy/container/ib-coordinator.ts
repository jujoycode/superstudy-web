import { useState } from 'react'

import {
  useFAQCreateFAQ,
  useFAQDeleteFAQ,
  useFAQGetFAQById,
  useFAQGetFAQList,
  useFAQUpdateFAQ,
  useIBBatchSetMentor,
  useIBCoordinatorGetCoordinatorPermission,
  useIBProfileSetMentor,
  useReferenceInfoCreateReferenceInfo,
  useReferenceInfoDeleteReferenceInfo,
  useReferenceInfoGetReferenceInfoById,
  useReferenceInfoGetReferenceInfoList,
  useReferenceInfoUpdateReferenceInfo,
} from '@/legacy/generated/endpoint'
import {
  FAQGetFAQListParams,
  ReferenceInfoGetReferenceInfoListParams,
  RequestCreateFAQDto,
  RequestCreateReferenceInfoDto,
  RequestFAQDto,
  RequestIBSetMentorBatchDto,
  RequestReferenceInfoDto,
  ResponsePaginationFAQDto,
} from '@/legacy/generated/model'

interface UseIBProps {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

interface updateIBMentorProps {
  mentorId: number
  data: RequestIBSetMentorBatchDto
}

interface updateIBReferenceProps {
  id: number
  data: RequestReferenceInfoDto
}

interface updateIBFAQProps {
  id: number
  data: RequestFAQDto
}

export const useCoordinatorCheck = () => {
  const { data } = useIBCoordinatorGetCoordinatorPermission()
  const permission = data?.type
  return {
    permission,
  }
}

export const useReferenceGetById = (id: number) => {
  const { data, isLoading } = useReferenceInfoGetReferenceInfoById(id)

  return {
    data,
    isLoading,
  }
}

export const useCoordinatorGetReference = () => {
  const [param, setParam] = useState<ReferenceInfoGetReferenceInfoListParams>({ category: 'IB_ALL' })

  const { data, isLoading } = useReferenceInfoGetReferenceInfoList(param, {
    query: {
      enabled: !!param?.category,
    },
  })

  const getIBReference = ({ page, limit, category }: ReferenceInfoGetReferenceInfoListParams) => {
    setParam({ page, limit, category })
  }

  return {
    data,
    isLoading,
    getIBReference,
  }
}

export const useIBReferenceUpdate = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useReferenceInfoUpdateReferenceInfo({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('참고자료 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBReference = ({ id, data }: updateIBReferenceProps) => {
    mutate({ id, data })
  }

  return {
    updateIBReference,
    isLoading,
    isError,
    error,
  }
}

export const useIBReferenceDelete = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useReferenceInfoDeleteReferenceInfo({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('참고자료 삭제 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const deleteIBReference = (id: number) => {
    mutate({ id })
  }

  return {
    deleteIBReference,
    isLoading,
    isError,
    error,
  }
}

export const useFAQGetById = (id: number) => {
  const { data, isLoading } = useFAQGetFAQById(id)

  return {
    data,
    isLoading,
  }
}

export const useCoordinatorGetFAQ = () => {
  const [data, setData] = useState<ResponsePaginationFAQDto>()
  const [param, setParam] = useState<FAQGetFAQListParams>({ category: 'IB_ALL' })

  useFAQGetFAQList(param, {
    query: {
      enabled: !!param?.category,
      onSuccess: (response) => {
        setData(response)
      },
      onError: () => {
        setData(undefined)
      },
    },
  })

  const getIBFAQ = ({ page, limit, category }: FAQGetFAQListParams) => {
    setParam({ page, limit, category })
  }

  return {
    data,
    getIBFAQ,
  }
}

export const useIBFAQUpdate = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useFAQUpdateFAQ({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('FAQ 수정 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBFAQ = ({ id, data }: updateIBFAQProps) => {
    mutate({ id, data })
  }

  return {
    updateIBFAQ,
    isLoading,
    isError,
    error,
  }
}

export const useIBFAQDelete = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useFAQDeleteFAQ({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('FAQ 삭제 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const deleteIBFAQ = (id: number) => {
    mutate({ id })
  }

  return {
    deleteIBFAQ,
    isLoading,
    isError,
    error,
  }
}

export const useIBSetMentor = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useIBBatchSetMentor({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('담당교사 지정 및 수정 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateIBMentor = ({ data, mentorId }: updateIBMentorProps) => {
    mutate({ data, mentorId })
  }

  return {
    updateIBMentor,
    isLoading,
    isError,
    error,
  }
}

export const useProfileSetMentor = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useIBProfileSetMentor({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('지도교사 지정 및 수정 요청 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const updateProfileIBMentor = (id: number, mentorId: number) => {
    mutate({ id, mentorId })
  }

  return {
    updateProfileIBMentor,
    isLoading,
    isError,
    error,
  }
}

export const useIBReferenceCreate = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useReferenceInfoCreateReferenceInfo({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('RRS 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBReference = (data: RequestCreateReferenceInfoDto) => {
    mutate({ data })
  }

  return {
    createIBReference,
    isLoading,
    isError,
    error,
  }
}

export const useIBFAQCreate = ({ onSuccess, onError, onClose }: UseIBProps) => {
  const { mutate, isLoading, isError, error } = useFAQCreateFAQ({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
        onClose?.()
      },
      onError: (error) => {
        console.error('RRS 생성 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const createIBFAQ = (data: RequestCreateFAQDto) => {
    mutate({ data })
  }

  return {
    createIBFAQ,
    isLoading,
    isError,
    error,
  }
}
