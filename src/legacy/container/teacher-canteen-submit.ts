import { useCanteenCreateOrUpdate } from '@/legacy/generated/endpoint'
import { RequestUpsertCanteenDto } from '@/legacy/generated/model'

export function useTeacherCanteenSubmit(refetch: () => void) {
  const { mutateAsync: upsertCanteen } = useCanteenCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        refetch()
      },
    },
  })

  const handleCanteenUpsert = (data: RequestUpsertCanteenDto) => {
    return upsertCanteen({ data })
  }

  return {
    handleCanteenUpsert,
  }
}
