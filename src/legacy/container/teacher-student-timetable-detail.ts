import { useTimetablev3GetTimetableByStudentId } from '@/legacy/generated/endpoint'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function useStudentTimetableDetail(studentId?: number) {
  // 학생별 시간표 V3
  const {
    data: timetableV3Student,
    isLoading: isTimetableLoadingV3Student,
    error: errorTimetableV3Student,
  } = useTimetablev3GetTimetableByStudentId(
    studentId || 0,
    {
      date: DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD']),
    },
    {
      query: {
        queryKey: [studentId],
        enabled: !!studentId,
      },
    },
  )

  return {
    timetableV3Student,
    error: errorTimetableV3Student,
    loading: isTimetableLoadingV3Student,
  }
}
