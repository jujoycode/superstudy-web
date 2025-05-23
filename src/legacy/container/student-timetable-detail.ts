import { useTimetablev3GetTimetableByStudentId } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { UserContainer } from './user'
import { useUserStore } from '@/stores/user'

export function useStudentTimetableDetail() {
  const { me } = UserContainer.useContext()
  const { child } = useUserStore()

  const {
    data: timetableV3Student,
    isLoading: isTimetableLoadingV3Student,
    error: errorTimetableV3Student,
  } = useTimetablev3GetTimetableByStudentId(
    me?.role === Role.USER ? me?.id || 0 : child?.id || 0,
    {
      date: DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD']),
    },
    // {
    //   query: {
    //     queryKey: [studentId],
    //     enabled: !!studentId,
    //   },
    // },
  )

  return {
    timetableV3Student,
    error: errorTimetableV3Student,
    loading: isTimetableLoadingV3Student,
  }
}
