import { useRPPFFindAllRPPF } from '@/legacy/generated/endpoint'
import type { RPPFFindAllRPPFParams } from '@/legacy/generated/model'

export const useRPPFGetByIBIdFindAll = (
  ibId: number,
  params?: RPPFFindAllRPPFParams,
  options?: { enabled?: boolean },
) => {
  const defaultParams = { page: 1, limit: 10 }
  const mergedParams = { ...defaultParams, ...params }

  const {
    data: RPPF,
    isLoading,
    refetch,
  } = useRPPFFindAllRPPF(ibId, mergedParams, {
    query: {
      enabled: options?.enabled,
    },
  })
  const data = RPPF?.items
  return {
    data,
    isLoading,
    refetch,
  }
}
