import { useFieldtripsFindOne } from '@/legacy/generated/endpoint'
import { useUserStore } from '@/stores/user'
import { UserContainer } from './user'

export function useStudentFieldtripNotice(id: number) {
  const { me } = UserContainer.useContext()
  const { child } = useUserStore()

  const {
    data: fieldtrip,
    isLoading,
    error,
  } = useFieldtripsFindOne(id, {
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })
  return {
    fieldtrip,
    isLoading,
    error,
    me,
  }
}
