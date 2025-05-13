import { useRRSFindAll } from '@/legacy/generated/endpoint'
import { RRSFindAllParams } from '@/legacy/generated/model'

export const useRRSGetByIBIdFindAll = (ibId: number, params?: RRSFindAllParams) => {
  const defaultParams = { page: 1, limit: 10 }
  const mergedParams = { ...defaultParams, ...params }
  const { data, isLoading, refetch } = useRRSFindAll(ibId, mergedParams)
  return {
    data,
    isLoading,
    refetch,
  }
}
