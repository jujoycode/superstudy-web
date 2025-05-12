import { useRPPFFindRPPFById } from '@/legacy/generated/endpoint'
import { ResponseRPPFDto } from '@/legacy/generated/model'

export const useRPPFGetById = (ibId: number, id: number, rppfData?: ResponseRPPFDto) => {
  const { data, isLoading, refetch } = useRPPFFindRPPFById(ibId, id, {
    query: {
      enabled: !rppfData && !!(ibId && id), // rppfData가 없는 경우에만 호출
    },
  })

  return {
    data: rppfData || data, // rppfData가 있으면 API 데이터를 무시하고 그대로 반환
    isLoading,
    refetch,
  }
}
