import { useTranslation } from 'react-i18next'

import { Label } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Time } from '@/legacy/components/common/Time'
import { SuperModal } from '@/legacy/components/SuperModal'
import {
  teacherPointLogDelete,
  useTeacherPointLogGetOne,
  useTeacherUserGetOne,
  useUserMe,
} from '@/legacy/generated/endpoint'
import { numberWithSign } from '@/legacy/util/string'

import { useModals } from './ModalStack'

export interface PointLogModalProps {
  pointLogId: number
}

export function PointLogModal({ pointLogId }: PointLogModalProps) {
  const { popModal } = useModals()
  const { t } = useTranslation()
  const { t: tm } = useTranslation('modal', { keyPrefix: 'point_log_modal' })
  const { data: me } = useUserMe()

  const { data: pointLog } = useTeacherPointLogGetOne(pointLogId)
  const { data: teacher } = useTeacherUserGetOne(
    pointLog?.teacherId ?? 0,
    {},
    { query: { enabled: !!pointLog?.teacherId } },
  )
  const { data: student } = useTeacherUserGetOne(
    pointLog?.studentId ?? 0,
    {},
    { query: { enabled: !!pointLog?.studentId } },
  )

  async function deletePointLog() {
    if (!confirm(`기록을 삭제할까요?`)) return
    await teacherPointLogDelete(pointLogId)
    popModal()
  }

  return (
    <SuperModal
      modalOpen
      setModalClose={popModal}
      className="max-md:h-screen-3.5 md:max-h-screen-48 flex w-96 flex-col gap-4 px-4 py-20 max-md:w-full max-md:self-start max-md:rounded-none"
    >
      <h2 className="text-18">{tm('point_log')}</h2>
      <div>
        {me?.id === pointLog?.teacherId && (
          <Button children={t('delete')} onClick={deletePointLog} className="outlined-gray" />
        )}
      </div>
      <Label.col>
        <Label.Text children={tm('point_log_created_at')} />
        <p>
          <Time date={pointLog?.createdAt} className="text-16" />
        </p>
      </Label.col>
      <Label.col>
        <Label.Text children={tm('point_log_assigner')} />
        <p>{teacher?.name}</p>
      </Label.col>
      <Label.col>
        <Label.Text children={tm('point_log_assignee')} />
        <p>{student?.name}</p>
      </Label.col>
      <Label.col>
        <Label.Text children={tm('point_log_title')} />
        <p>{pointLog?.title}</p>
      </Label.col>
      <Label.col>
        <Label.Text children={tm('point_log_value')} />
        <p>{numberWithSign(pointLog?.value)}</p>
      </Label.col>
    </SuperModal>
  )
}
