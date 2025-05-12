import { useFieldtripsFindOne } from '@/legacy/generated/endpoint'

export function useTeacherFieldtripNoticeDetail(id: string) {
  const { data: fieldtrip, isLoading } = useFieldtripsFindOne(Number(id))

  return {
    isLoading,
    fieldtrip,
  }
}
