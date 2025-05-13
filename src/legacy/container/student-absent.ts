import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useAbsentsFindAllByStudent } from '@/legacy/generated/endpoint'
import { childState } from '@/stores'
import { UserContainer } from './user'

export function useStudentAbsent() {
  const child = useRecoilValue(childState)
  const { me } = UserContainer.useContext()
  const { data, isLoading, error } = useAbsentsFindAllByStudent({
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })
  const [isPrimaryGuardian, setIsPrimaryGuardian] = useState(-1)

  useEffect(() => {
    if (me !== undefined) {
      if (me?.parents?.length === 1) {
        if (me?.parents[0].name === me?.nokName) {
          setIsPrimaryGuardian(0)
        }
      }

      if (me?.parents?.length === 2) {
        if (me?.parents[0].name === me?.nokName && me?.parents[0].phone === me?.nokPhone) {
          setIsPrimaryGuardian(0)
        }
        if (me?.parents[1].name === me?.nokName && me?.parents[1].phone === me?.nokPhone) {
          setIsPrimaryGuardian(1)
        }
      }
    }
  }, [me])

  return {
    data,
    isLoading,
    error,
    me,
    isPrimaryGuardian,
  }
}
