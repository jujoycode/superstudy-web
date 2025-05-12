import { useState } from 'react'
import { useIBCasPortfolioGetItems } from '@/legacy/generated/endpoint'
import type { IBCasPortfolioGetItemsParams } from '@/legacy/generated/model'

export function useGetIBPortfolio() {
  const [param, setParam] = useState<IBCasPortfolioGetItemsParams>()

  const { data, isLoading } = useIBCasPortfolioGetItems(param, {
    query: {
      // enabled: !!param?.statuses,
    },
  })

  const getIBPortfolio = ({ grade, klass, mentorId, isOnlyProgress }: IBCasPortfolioGetItemsParams) => {
    setParam({ grade, klass, mentorId, isOnlyProgress })
  }

  return {
    data,
    getIBPortfolio,
    isLoading,
  }
}
