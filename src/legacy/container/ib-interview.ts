import { concat } from 'lodash'

import { useInterviewFindAllInterview } from '@/legacy/generated/endpoint'

export const useIBInterview = () => {
  const {
    data: interview1,
    isLoading: interview1Loading,
    refetch: interview1Refetch,
  } = useInterviewFindAllInterview({ category: 'CAS_PORTFOLIO_1' })
  const {
    data: interview2,
    isLoading: interview2Loading,
    refetch: interview2Refetch,
  } = useInterviewFindAllInterview({ category: 'CAS_PORTFOLIO_2' })
  const {
    data: interview3,
    isLoading: interview3Loading,
    refetch: interview3Refetch,
  } = useInterviewFindAllInterview({ category: 'CAS_PORTFOLIO_3' })
  const {
    data: riskAssessment,
    isLoading: riskAssessmentLoading,
    refetch: riskAssessmentRefetch,
  } = useInterviewFindAllInterview({ category: 'CAS_RISK_ASSESSMENT' })

  const data = concat(
    [],
    interview1?.items || [],
    interview2?.items || [],
    interview3?.items || [],
    riskAssessment?.items || [],
  )

  const isLoading = interview1Loading || interview2Loading || interview3Loading || riskAssessmentLoading

  const refetch = () => {
    interview1Refetch()
    interview2Refetch()
    interview3Refetch()
    riskAssessmentRefetch()
  }

  return { data, isLoading, refetch }
}
