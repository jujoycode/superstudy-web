import { useLocation } from 'react-router'

import { StudentGroup, StudentNewsletter } from '@/legacy/generated/model'
import { cn } from '@/legacy/lib/tailwind-merge'
import { useModals } from '@/legacy/modals/ModalStack'
import { StudentModal } from '@/legacy/modals/StudentModal'
import { getNickName } from '@/legacy/util/status'

interface NewsletterSubmitterItemProps {
  filter: number
  studentGroup: StudentGroup
  studentNewsletter?: StudentNewsletter
  onClick: () => void
  id: string
}

export function NewsletterSubmitterItem({
  filter,
  studentGroup,
  studentNewsletter,
  onClick,
  id,
}: NewsletterSubmitterItemProps) {
  const { pathname } = useLocation()
  const { pushModal } = useModals()

  if (filter === 1 && (!studentNewsletter || !studentNewsletter?.isSubmitted)) {
    return <></>
  }
  if (filter === 2 && studentNewsletter && studentNewsletter.isSubmitted) {
    return <></>
  }

  return (
    <div className="min-w-1/2-2 inline-block p-1 text-center">
      <div
        className={
          studentNewsletter?.id
            ? pathname.includes(`/teacher/activity/submit/${id}/${studentNewsletter?.id}`)
              ? 'border-primary-800 bg-light_orange flex items-center justify-between space-x-2 rounded-md border p-2'
              : 'flex items-center justify-between space-x-2 rounded-md border p-2'
            : 'flex items-center justify-between space-x-2 rounded-md border p-2'
        }
      >
        {studentNewsletter?.isSubmitted ? (
          <div className="flex items-center">
            <span onClick={onClick} className="bg-primary-800 cursor-pointer rounded-md px-2 py-1 text-sm text-white">
              제출
            </span>
            <div className="ml-2 flex space-x-2">
              <span className="font-semibold">{studentNewsletter?.studentNumber}</span>
              <button onClick={() => pushModal(<StudentModal id={studentNewsletter.student.id} />)}>
                {studentNewsletter?.student?.name}
                {getNickName(studentNewsletter?.student?.nickName)}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <span
              onClick={onClick}
              className={cn(
                'cursor-pointer rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-500',
                pathname.startsWith(`/teacher/activity/submit/${id}/${studentGroup.id}`) && 'border border-gray-200',
              )}
            >
              미제출
            </span>
            <div className="ml-2 flex space-x-2">
              <span className="font-semibold">{studentGroup.studentNumber}</span>
              <button onClick={() => pushModal(<StudentModal id={studentGroup.user.id} />)}>
                {studentGroup.user?.name}
                {getNickName(studentGroup.user.nickName)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
