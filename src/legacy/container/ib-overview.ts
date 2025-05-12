import {
  useEssayGetSubmissionStatus,
  useEssayGetSubmissionStatusCount,
  useEssayUnsubmitNotification,
  useExhibitionExhibitionUnsubmitNotification,
  useExhibitionGetSubmissionStatus,
  useExhibitionGetSubmissionStatusCount,
  useIBCasPortfolioGetSubmissionStatusByInterview,
  useIBCasPortfolioGetSubmissionStatusByInterviewCount,
  useIBCasPortfolioGetSubmissionStatusByReflectionDiary,
  useIBCasPortfolioGetSubmissionStatusByReflectionDiaryCount,
  useIBCasPortfolioInterviewUnsubmitNotification,
  useIBCasPortfolioReflectionDiaryUnsubmitNotification,
  useIBGetSubmissionStatus,
  useIBGetSubmissionStatusCount,
  useIBGetTokExhibitionPlanSubmissionStatus,
  useIBGetTokExhibitionPlanSubmissionStatusCount,
  useIBGetTokOutlineSubmissionStatus,
  useIBGetTokOutlineSubmissionStatusCount,
  useIBTokExhibitionPlanUnsubmitNotification,
  useIBTokOutlineUnsubmitNotification,
  useIBUnsubmitNotification,
  useRPPFGetSubmissionStatus,
  useRPPFGetSubmissionStatusCount,
  useRPPFUnsubmitNotification,
  useRRSGetSubmissionStatus,
  useRRSGetSubmissionStatusCount,
  useRRSUnsubmitNotification,
  useTKPPFGetSubmissionStatus,
  useTKPPFGetSubmissionStatusCount,
  useTKPPFTkppfUnsubmitNotification,
} from '@/legacy/generated/endpoint'
import {
  IBUnsubmitNotificationType,
  type EssayGetSubmissionStatusCountParams,
  type EssayGetSubmissionStatusParams,
  type ExhibitionExhibitionUnsubmitNotificationParams,
  type ExhibitionGetSubmissionStatusCountParams,
  type ExhibitionGetSubmissionStatusParams,
  type IBCasPortfolioGetSubmissionStatusByInterviewCountParams,
  type IBCasPortfolioGetSubmissionStatusByInterviewParams,
  type IBCasPortfolioInterviewUnsubmitNotificationParams,
  type IBCasPortfolioGetSubmissionStatusByReflectionDiaryParams,
  type IBCasPortfolioReflectionDiaryUnsubmitNotificationParams,
  type IBGetSubmissionStatusCountParams,
  type IBGetSubmissionStatusParams,
  type IBGetTokExhibitionPlanSubmissionStatusCountParams,
  type IBGetTokExhibitionPlanSubmissionStatusParams,
  type IBGetTokOutlineSubmissionStatusCountParams,
  type IBGetTokOutlineSubmissionStatusParams,
  type IBTokExhibitionPlanUnsubmitNotificationParams,
  type IBTokOutlineUnsubmitNotificationParams,
  type RPPFGetSubmissionStatusCountParams,
  type RPPFGetSubmissionStatusParams,
  type RPPFUnsubmitNotificationParams,
  type RRSGetSubmissionStatusCountParams,
  type RRSGetSubmissionStatusParams,
  type RRSUnsubmitNotificationParams,
  type TKPPFGetSubmissionStatusCountParams,
  type TKPPFGetSubmissionStatusParams,
  type TKPPFTkppfUnsubmitNotificationParams,
  type EssayUnsubmitNotificationParams,
} from '@/legacy/generated/model'

export const useIBProposalStatus = ({ grade, klass }: IBGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useIBGetSubmissionStatusCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

export const useIBProposalSubmissionStatus = ({ grade, klass, status }: IBGetSubmissionStatusParams) => {
  const { data, isLoading } = useIBGetSubmissionStatus({ grade, klass, status })
  const students = data?.items
  return {
    students,
    isLoading,
  }
}

// 계획서 |제안서 미제출자 알림
// IB_PROPOSAL = 제안서 /IB_PROJECT = 계획서
export const useIBProposalNotSubmittedNotification = ({
  type,
  onSuccess,
  onError,
}: {
  type: IBUnsubmitNotificationType
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useIBUnsubmitNotification({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
      },
      onError: (error) => {
        console.error('미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => originalMutate({ params: { type } })

  return {
    mutate,
    isLoading,
    isError,
    error,
  }
}

export const useIBActivityLogStatus = ({ grade, klass }: IBGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useIBCasPortfolioGetSubmissionStatusByReflectionDiaryCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

export const useIBActivityLogSubmissionStatus = ({
  grade,
  klass,
  status,
}: IBCasPortfolioGetSubmissionStatusByReflectionDiaryParams) => {
  const { data, isLoading } = useIBCasPortfolioGetSubmissionStatusByReflectionDiary({ grade, klass, status })
  const students = data?.items
  return {
    students,
    isLoading,
  }
}

// CAS 성찰일지 미제출자 알림
export const useIBActivityLogNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: IBCasPortfolioReflectionDiaryUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useIBCasPortfolioReflectionDiaryUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('CAS 성찰일지 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const mutate = () => originalMutate({ params })

  return { mutate, isLoading, isError, error }
}

export const useIBInterviewStatus = ({ grade, klass }: IBCasPortfolioGetSubmissionStatusByInterviewCountParams) => {
  const { data, isLoading } = useIBCasPortfolioGetSubmissionStatusByInterviewCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

export const useIBInterviewSubmissionStatus = ({
  grade,
  klass,
  status,
}: IBCasPortfolioGetSubmissionStatusByInterviewParams) => {
  const { data, isLoading } = useIBCasPortfolioGetSubmissionStatusByInterview({ grade, klass, status })
  const students = data?.items
  return {
    students,
    isLoading,
  }
}

// CAS 인터뷰 미제출자 알림
export const useIBInterviewNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: IBCasPortfolioInterviewUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useIBCasPortfolioInterviewUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('CAS 인터뷰 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  const mutate = () => originalMutate({ params })

  return { mutate, isLoading, isError, error }
}

export const useIBEssayStatus = ({ grade, klass, ibType }: EssayGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useEssayGetSubmissionStatusCount({ grade, klass, ibType })

  return {
    data,
    isLoading,
  }
}

export const useIBEssaySubmissionStatus = ({ grade, klass, ibType, status }: EssayGetSubmissionStatusParams) => {
  const { data, isLoading } = useEssayGetSubmissionStatus({ grade, klass, status, ibType })
  const students = data?.items
  return {
    students,
    isLoading,
  }
}

// 에세이 미제출자 알림
export const useIBEssayNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: EssayUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useEssayUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('에세이 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => originalMutate({ params: params as EssayUnsubmitNotificationParams })

  return {
    mutate,
    isLoading,
    isError,
    error,
  }
}

export const useIBRPPFStatus = ({ grade, klass }: RPPFGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useRPPFGetSubmissionStatusCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

export const useIBRPPFSubmissionStatus = ({ grade, klass, status }: RPPFGetSubmissionStatusParams) => {
  const { data, isLoading } = useRPPFGetSubmissionStatus({ grade, klass, status })
  const students = data?.items
  return {
    students,
    isLoading,
  }
}

// RPPF 미제출자 알림
export const useIBRppfNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: RPPFUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useRPPFUnsubmitNotification({
    mutation: {
      onSuccess: (data) => {
        onSuccess?.(data)
      },
      onError: (error) => {
        console.error('RPPF 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => {
    originalMutate({ params })
  }

  return { mutate, isLoading, isError, error }
}

export const useIBRRSStatus = ({ grade, klass, ibType }: RRSGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useRRSGetSubmissionStatusCount({ grade, klass, ibType })

  return {
    data,
    isLoading,
  }
}

export const useIBRRSSubmissionStatus = ({ grade, klass, status, ibType }: RRSGetSubmissionStatusParams) => {
  const { data, isLoading } = useRRSGetSubmissionStatus({ grade, klass, status, ibType })
  const students = data?.items
  return {
    students,
    isLoading,
  }
}

// RRS 미제출자 알림
export const useIBRRSNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: RRSUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useRRSUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('RRS 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => {
    originalMutate({ params })
  }

  return { mutate, isLoading, isError, error }
}

// TOK 전시회 기획안 현황관리 상태별 학생수 조회 (선생님 / 코디네이터)
export const useIBTOKStatusCount = ({ grade, klass }: IBGetTokExhibitionPlanSubmissionStatusCountParams) => {
  const { data, isLoading } = useIBGetTokExhibitionPlanSubmissionStatusCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

// TOK 전시회 기획안 현황관리 상태별 학생 상세 정보 조회 (선생님 / 코디네이터)
export const useIBTOKExhibitionPlanSubmissionStatus = ({
  grade,
  klass,
  status,
}: IBGetTokExhibitionPlanSubmissionStatusParams) => {
  const { data, isLoading } = useIBGetTokExhibitionPlanSubmissionStatus({ grade, klass, status })
  const students = data?.items

  return {
    students,
    isLoading,
  }
}

// TOK 전시회 기획안 미제출자 알림
export const useIBTOKExhibitionPlanNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: IBTokExhibitionPlanUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useIBTokExhibitionPlanUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('TOK 전시회 기획안 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => {
    originalMutate({ params })
  }

  return { mutate, isLoading, isError, error }
}

// TOK 전시회 현황관리 상태별 학생수 조회 (선생님 / 코디네이터)
export const useIBTOKExhibitionStatusCount = ({ grade, klass }: ExhibitionGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useExhibitionGetSubmissionStatusCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

// TOK 전시회 현황관리 상태별 학생 상세 정보 조회 (선생님 / 코디네이터)
export const useIBTOKExhibitionSubmissionStatus = ({ grade, klass, status }: ExhibitionGetSubmissionStatusParams) => {
  const { data, isLoading } = useExhibitionGetSubmissionStatus({ grade, klass, status })
  const students = data?.items

  return {
    students,
    isLoading,
  }
}

// TOK 전시회 미제출자 알림
export const useIBTOKExhibitionNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: ExhibitionExhibitionUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useExhibitionExhibitionUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('TOK 전시회 현황관리 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => {
    originalMutate({ params })
  }

  return { mutate, isLoading, isError, error }
}

// TOK 아웃라인 현황관리 상태별 학생수 조회 (선생님 / 코디네이터)
export const useIBTOKOutlineStatusCount = ({ grade, klass }: IBGetTokOutlineSubmissionStatusCountParams) => {
  const { data, isLoading } = useIBGetTokOutlineSubmissionStatusCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

// TOK 아웃라인 현황관리 상태별 학생 상세 정보 조회 (선생님 / 코디네이터)
export const useIBTOKOutlineSubmissionStatus = ({ grade, klass, status }: IBGetTokOutlineSubmissionStatusParams) => {
  const { data, isLoading } = useIBGetTokOutlineSubmissionStatus({ grade, klass, status })
  const students = data?.items

  return {
    students,
    isLoading,
  }
}

// TOK 아웃라인 미제출자 알림
export const useIBTOKOutlineNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: IBTokOutlineUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useIBTokOutlineUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('TOK 아웃라인 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => {
    originalMutate({ params })
  }

  return { mutate, isLoading, isError, error }
}

// TOK TKPPF 현황관리 상태별 학생수 조회 (선생님 / 코디네이터)
export const useIBTOKPPFStatusCount = ({ grade, klass }: TKPPFGetSubmissionStatusCountParams) => {
  const { data, isLoading } = useTKPPFGetSubmissionStatusCount({ grade, klass })

  return {
    data,
    isLoading,
  }
}

// TOK TKPPF 현황관리 상태별 학생 상세 정보 조회 (선생님 / 코디네이터)
export const useIBTOKPPFSubmissionStatus = ({ grade, klass, status }: TKPPFGetSubmissionStatusParams) => {
  const { data, isLoading } = useTKPPFGetSubmissionStatus({ grade, klass, status })
  const students = data?.items

  return {
    students,
    isLoading,
  }
}

// TOK TKPPF 미제출자 알림
export const useIBTOKPPFNotSubmittedNotification = ({
  params,
  onSuccess,
  onError,
}: {
  params?: TKPPFTkppfUnsubmitNotificationParams
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const {
    mutate: originalMutate,
    isLoading,
    isError,
    error,
  } = useTKPPFTkppfUnsubmitNotification({
    mutation: {
      onSuccess,
      onError: (error) => {
        console.error('TOK TKPPF 미제출자 알림 발송 중 오류 발생:', error)
        onError?.(error)
      },
    },
  })

  // 파라미터 없이 호출할 수 있도록 래핑
  const mutate = () => {
    originalMutate({ params })
  }

  return { mutate, isLoading, isError, error }
}
