import { useHistory } from 'react-router'
import { useRecoilValue } from 'recoil'

import { useOutingsFindAllByStudent } from '@/legacy/generated/endpoint'
import { childState } from '@/stores'

export function useStudentOuting() {
  const child = useRecoilValue(childState)
  const { push } = useHistory()
  const { data, error, isLoading } = useOutingsFindAllByStudent({
    query: {
      onError: ({ message }) => {
        if (message === 'Unauthorized') {
          push('/login')
        }
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const outings = data
    ?.slice()
    .sort((a, b) => (a.outingStatus === 'DELETE_APPEAL' ? -1 : 0) - (b.outingStatus === 'DELETE_APPEAL' ? -1 : 0))
    .sort((a, b) => (a.outingStatus === 'RETURNED' ? -1 : 0) - (b.outingStatus === 'RETURNED' ? -1 : 0))

  return {
    outings,
    error,
    isLoading,
  }
}
