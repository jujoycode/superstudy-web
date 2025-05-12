import { useQueryClient } from 'react-query'
import {
  useUserGetUserAttendance,
  useAttendanceAttendanceCheck,
  useAttendanceGetAttendanceCheck,
  useStudentRolesUpsertStudentRole,
  useAttendanceCreateAttendanceAbsent,
} from '@/legacy/generated/endpoint'
import type { RequestCreateAttendanceAbsentDto, RequestUpsertStudentRoleDto } from '@/legacy/generated/model'

export function useTimeTableAttendancePageV3({
  lectureId,
  groupId,
  year,
  day,
}: {
  lectureId: number
  groupId: string
  year: string
  day: string
}) {
  const queryClient = useQueryClient()

  const { data: userAttendance } = useUserGetUserAttendance({
    groupId,
    year,
    day,
  })

  const { mutateAsync: createAttendanceAbsentMutateAsync } = useAttendanceCreateAttendanceAbsent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['timetable', year])
      },
    },
  })

  const { mutateAsync: updateStudentRoleAsync } = useStudentRolesUpsertStudentRole()

  const createAttendanceAbsent = (payload: RequestCreateAttendanceAbsentDto) => {
    return createAttendanceAbsentMutateAsync({ data: payload })
  }

  const updateStudentRole = (payload: RequestUpsertStudentRoleDto[]) => {
    return updateStudentRoleAsync({ data: payload })
  }

  const { data: AttendanceCheckInfo } = useAttendanceGetAttendanceCheck({
    lectureId,
    checkDay: day,
  })

  // const { refetch: refetchReadInfo } = useChatroomGetReadInfo<ChatroomReadInfo[]>(chatroomId, {
  //   query: {
  //     enabled: !!chatroomId,
  //     onSuccess: (res) => {
  //       setChatReadInfo(res);
  //     },
  //   },
  // });

  const { mutateAsync: createAttendanceCheckMutateAsync } = useAttendanceAttendanceCheck()

  const createAttendanceCheck = () => {
    return createAttendanceCheckMutateAsync({
      data: {
        lectureId,
        checkDay: day,
      },
    })
  }

  return {
    userAttendance: userAttendance || [],
    createAttendanceAbsent,
    updateStudentRole,
    AttendanceCheckInfo,
    createAttendanceCheck,
  }
}
