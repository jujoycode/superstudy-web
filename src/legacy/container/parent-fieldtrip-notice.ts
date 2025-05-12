import { useFieldtripsFindOneByUUID } from '@/legacy/generated/endpoint'
import { UserContainer } from './user'

export function useParentFieldtripNotice(uuid: string) {
  const { data: fieldtrip, isLoading, error } = useFieldtripsFindOneByUUID(uuid)
  const { me } = UserContainer.useContext()
  return {
    data: fieldtrip,
    isLoading,
    error,
    me,
  }
}
