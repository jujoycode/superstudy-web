import { useRRSFindById } from '@/legacy/generated/endpoint'

export const useRRSGetById = (ibId: number, id: number) => {
  const { data, isLoading } = useRRSFindById(ibId, id)

  return {
    data,
    isLoading,
  }
}
