import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { meState } from '@/stores'

export function useStudentMyPage() {
  const me = useRecoilValue(meState)

  const [isEditMode, setIsEditMode] = useState(false)
  const [isPrimaryGuardian, setIsPrimaryGuardian] = useState(-1)
  const [nokName, setNokName] = useState('')
  const [nokPhone, setNokPhone] = useState('')

  const [cntParent] = useState(me?.parents?.length || 0)

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
    me,
    isEditMode,
    setIsEditMode,
    isPrimaryGuardian,
    setIsPrimaryGuardian,
    cntParent,
    setNokName,
    setNokPhone,
    nokName,
    nokPhone,
  }
}
