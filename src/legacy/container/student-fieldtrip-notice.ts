import { useRecoilValue } from 'recoil'
import { useFieldtripsFindOne } from '@/legacy/generated/endpoint'
import { childState } from '@/stores'
import { UserContainer } from './user'

export function useStudentFieldtripNotice(id: number) {
  const { me } = UserContainer.useContext()
  const child = useRecoilValue(childState)

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
