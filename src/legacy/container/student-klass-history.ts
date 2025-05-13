import { useRecoilValue } from 'recoil'

import { useStudentGroupsFindKlassHistoryByStudent } from '@/legacy/generated/endpoint'
import { meState } from '@/stores'

export function useStudentKlassHistory() {
  const meRecoil = useRecoilValue(meState)

  const { data: klassHistoryList } = useStudentGroupsFindKlassHistoryByStudent({
    query: {
      enabled: !!meRecoil,
    },
  })

  return { klassHistoryList }
}
