
import { useStudentGroupsFindKlassHistoryByStudent } from '@/legacy/generated/endpoint'
import { useUserStore } from '@/stores/user'

export function useStudentKlassHistory() {
  const { me: meRecoil } = useUserStore()

  const { data: klassHistoryList } = useStudentGroupsFindKlassHistoryByStudent({
    query: {
      enabled: !!meRecoil,
    },
  })

  return { klassHistoryList }
}
