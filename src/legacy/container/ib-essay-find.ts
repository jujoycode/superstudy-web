import { useEssayGetEssay } from '@/legacy/generated/endpoint'

export const useEssayGetByIBId = (ibId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useEssayGetEssay(ibId, { query: { enabled: options?.enabled } })
  return {
    data,
    isLoading,
    refetch,
  }
}
