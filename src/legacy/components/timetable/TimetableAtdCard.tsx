import { cn } from '@/utils/commonUtil'
import { Button } from '@/atoms/Button'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useModals } from '@/legacy/modals/ModalStack'
import { StudentModal } from '@/legacy/modals/StudentModal'

interface TimetableAtdCardProps {
  attendance: boolean
  student: any
  comment?: string
  setModalOpen: () => void
}

export function TimetableAtdCard({ attendance, student, comment, setModalOpen }: TimetableAtdCardProps) {
  const { t } = useLanguage()
  const { pushModal } = useModals()

  return (
    <div>
      <div className="flex w-full items-center justify-between px-0 py-2 md:px-4">
        <div className="flex items-center space-x-2">
          {student.expired ? (
            <div className="rounded-sm bg-red-50 px-2.5 py-1.5 text-sm text-red-600 md:text-base">
              {student.expired_reason}
            </div>
          ) : student.not_attend ? (
            <div className="rounded-sm bg-red-50 px-2.5 py-1.5 text-sm text-red-600 md:text-base">{'출석제외'}</div>
          ) : attendance ? (
            <div className="rounded-sm bg-blue-100 px-2.5 py-1.5 text-sm text-blue-600 md:text-base">
              {t('attendance', '출석')}
            </div>
          ) : (
            <div className="rounded-sm bg-red-100 px-2.5 py-1.5 text-sm text-red-600 md:text-base">
              {t(`Student_Status.${student.type1}`, `${student.type1}`)}
            </div>
          )}
          <div className={`text-sm md:text-lg ${student.expired && 'text-gray-400'}`}>
            {student.klassname} {student.student_number}번
          </div>
          <div className={`text-sm md:text-lg ${student.expired && 'text-gray-400'}`}>
            <button onClick={() => pushModal(<StudentModal id={student.id} />)}>{student.name}</button>
          </div>
          {student.nick_name && (
            <div className={`text-sm md:text-lg ${student.expired && 'text-gray-400'}`}>({student.nick_name})</div>
          )}
        </div>

        <Button
          color="tertiary"
          onClick={() => student.expired === false && student.not_attend === false && setModalOpen()}
          className={(cn(student.expired || student.not_attend ? 'filled-gray' : 'filled-primary'), 'text-gray-600')}
        >
          {t('attendance_management', '출결관리')}
        </Button>
      </div>

      <div className="px-4 text-sm md:text-base">{comment}</div>
    </div>
  )
}
