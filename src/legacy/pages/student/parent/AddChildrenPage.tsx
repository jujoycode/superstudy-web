import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useHistory } from '@/hooks/useHistory'
import { useUserCreateChildren } from '@/legacy/generated/endpoint'

export function AddChildrenPage() {
  const { replace } = useHistory()
  const { uuid } = useParams<{ uuid: string }>()

  const { mutateAsync: addChild } = useUserCreateChildren()

  useEffect(() => {
    if (uuid) {
      addChild({ uuid })
        .then((res) => {
          if (!res?.token) {
            throw new Error('token is undefined')
          }
          alert('자녀 추가 성공')
          replace('/student')
        })
        .catch(() => {
          alert('자녀 추가 실패')
          localStorage.setItem('childError', 'true')
          replace('/student')
        })
    }
  }, [uuid])

  return <div></div>
}
