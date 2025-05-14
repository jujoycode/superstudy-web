import { useRecoilValue } from 'recoil'
import { useStudentGroupsFindKlassHistoryByStudent } from '@/legacy/generated/endpoint'
import { useUserStore } from '@/stores2/user'

export function useStudentKlassHistory() {
  const { me: meRecoil } = useUserStore()

  const { data: klassHistoryList } = useStudentGroupsFindKlassHistoryByStudent({
    query: {
      enabled: !!meRecoil,
    },
  })

  return { klassHistoryList }
}
