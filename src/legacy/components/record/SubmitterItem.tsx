import { useLocation } from 'react-router'

import { ResponseActivitySubmitUserDto } from '@/legacy/generated/model'

interface SubmitterItemProps {
  user?: ResponseActivitySubmitUserDto
  onClick: () => void
  id: string
}

export function SubmitterItem({ user, onClick, id }: SubmitterItemProps) {
  const { pathname } = useLocation()

  return (
    <div className="min-w-1/2-2 inline-block cursor-pointer p-1 text-center" onClick={onClick}>
      <div
        className={
          user?.studentActivityId
            ? pathname.includes(
                `/teacher/activity/submit/${id}/${user.studentActivityId}`, // id도 response에 있어서 필요없음
              )
              ? 'border-primary-800 bg-light_orange flex items-center justify-between space-x-2 rounded-md border p-2'
              : 'flex items-center justify-between space-x-2 rounded-md border p-2'
            : 'flex items-center justify-between space-x-2 rounded-md border p-2'
        }
      >
        {user?.studentActivitySubmitted ? (
          <>
            <div className="flex items-center">
              <span className="bg-primary-800 rounded-md px-2 py-1 text-sm text-white">제출</span>
              <div className="ml-2 flex space-x-2">
                <span className="font-semibold">{user.studentGradeKlassNumber}</span>
                <span>{user.studentName}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex cursor-pointer items-center">
            <span
              className={
                pathname.startsWith(`/teacher/activity/submit/${id}/${user?.studentActivityId}`)
                  ? 'rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-sm text-gray-500'
                  : 'rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-500'
              }
            >
              미제출
            </span>
            <div className="ml-2 flex space-x-2">
              <span className="font-semibold">{user?.studentGradeKlassNumber}</span>
              <span>{user?.studentName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
