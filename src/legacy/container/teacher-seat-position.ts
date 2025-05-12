import { useGroupsFindOne, useGroupsUpdateSeatPosition } from '@/legacy/generated/endpoint'

export function useTeacherSeatPosition({ groupId }: { groupId?: number }) {
  const {
    data: timetable,
    isLoading: isSeatPositionLoading,
    error: errorSeatPosition,
  } = useGroupsFindOne(groupId || 0, { query: { enabled: !!groupId } })

  const seatPositionJson = timetable?.seatPosition || ''
  const seatPosition: { studentid: number; seat: string }[] = seatPositionJson ? JSON.parse(seatPositionJson) : []

  const { mutateAsync: updateSeatPositionMutateAsync } = useGroupsUpdateSeatPosition()

  const updateSeatPosition = ({ id, seatPosition }: { id: number; seatPosition: string }) => {
    return updateSeatPositionMutateAsync({ id, data: { seatPosition } })
  }

  return {
    seatPositionId: timetable?.id,
    seatPosition,
    updateSeatPosition,
    isSeatPositionLoading,
    errorSeatPosition,
  }
}
