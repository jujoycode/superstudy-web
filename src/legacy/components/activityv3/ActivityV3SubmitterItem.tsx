import { differenceInSeconds, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

import { useHistory } from '@/hooks/useHistory'
import { StudentGroup } from '@/legacy/generated/model'
import { useModals } from '@/legacy/modals/ModalStack'
import { StudentModal } from '@/legacy/modals/StudentModal'
import { getNickName, padLeftstr } from '@/legacy/util/status'

interface Activityv3SubmitterItemProps {
  id: number
  studentGroup: StudentGroup
  submitted?: boolean
  submittedAt?: string
  sessionId?: number
  endDate?: string
}

export const Activityv3SubmitterItem: React.FC<Activityv3SubmitterItemProps> = ({
  studentGroup,
  submitted = false,
  id,
  sessionId,
  submittedAt,
  endDate,
}) => {
  const { push } = useHistory()
  const { pushModal } = useModals()

  const studentKlassGroup = studentGroup.user?.studentGroups?.[0]
  const userGrade = studentKlassGroup?.group?.grade || 0
  const userKlass = studentKlassGroup?.group?.klass || 0
  const userStudentNumber = studentKlassGroup?.studentNumber || 0

  const isLateSubmission =
    endDate && submittedAt ? differenceInSeconds(parseISO(submittedAt), parseISO(endDate)) > 0 : false

  return (
    <div
      className={twMerge('flex items-center justify-between rounded-lg border border-[#DDD] bg-white px-3 py-2')}
      style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}
    >
      <button onClick={() => pushModal(<StudentModal id={studentGroup.user.id} />)}>
        {userGrade + padLeftstr(userKlass) + padLeftstr(userStudentNumber)} {studentGroup.user?.name}{' '}
        {getNickName(studentGroup.user?.nickName)}
      </button>
      <div
        className="flex cursor-pointer items-center"
        onClick={() => {
          if (sessionId) {
            push(`/teacher/activityv3/${id}/session/${sessionId}/${studentGroup.user.id}`)
          } else {
            push(`/teacher/activityv3/${id}/${studentGroup.user.id}`)
          }
        }}
      >
        {submitted ? (
          <>
            {isLateSubmission && <span className="mr-2 text-orange-500">추후제출</span>}
            <div className="bg-brand-1 w-16 rounded-md px-2 py-2 text-center text-white">제출</div>
          </>
        ) : (
          <div className="w-16 rounded-md bg-[#CCC] px-2 py-2 text-center text-white">미제출</div>
        )}
      </div>
    </div>
  )
}
