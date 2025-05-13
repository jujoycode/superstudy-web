import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useFieldtripsFindAllByStudent, useFieldtripsReCalculateFieldtripDays } from '@/legacy/generated/endpoint'
import { Fieldtrip } from '@/legacy/generated/model'
import { childState } from '@/stores'
import { UserContainer } from './user'

export function useStudentFieldtrip() {
  const child = useRecoilValue(childState)
  const [fieldtrips, setFieldtrips] = useState<Fieldtrip[]>()
  const [recalculateDays, setRecalculateDays] = useState(false)
  const { me } = UserContainer.useContext()
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

  const {
    isLoading,
    error,
    refetch: fieldtripRefetch,
  } = useFieldtripsFindAllByStudent({
    query: {
      onSuccess: (res) => {
        const sorted = res
          ?.slice()
          ?.sort(
            (a: Fieldtrip, b: Fieldtrip) =>
              (a.fieldtripStatus === 'DELETE_APPEAL' ? -1 : 0) - (b.fieldtripStatus === 'DELETE_APPEAL' ? -1 : 0),
          )
          ?.sort(
            (a: Fieldtrip, b: Fieldtrip) =>
              (a.fieldtripStatus === 'RETURNED' ? -1 : 0) - (b.fieldtripStatus === 'RETURNED' ? -1 : 0),
          )
        setFieldtrips(sorted)
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const { isLoading: recalculateLoading } = useFieldtripsReCalculateFieldtripDays({
    query: {
      enabled: recalculateDays,
      onSuccess: () => {
        setRecalculateDays(false)
        alert('체험학습 잔여일을 다시 확인했습니다.')
        fieldtripRefetch()
        //window?.location?.reload();
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  return { fieldtrips, isPrimaryGuardian, isLoading: isLoading || recalculateLoading, error, setRecalculateDays }
}
