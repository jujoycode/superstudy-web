import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Time } from '@/legacy/components/common/Time'
import { useTeacherPointLogGet } from '@/legacy/generated/endpoint'
import { AssignPointModal } from '@/legacy/modals/AssignPointModal'
import { useModals } from '@/legacy/modals/ModalStack'
import { PointLogModal } from '@/legacy/modals/PointLogModal'
import { numberWithSign } from '@/legacy/util/string'

export function PointLogsPage() {
  const { pushModal } = useModals()
  const { t: tt } = useTranslation('teacher', { keyPrefix: 'pointlogs_page' })
  const { id } = useParams<{ id: string }>()
  const studentId = Number(id)

  const { data: pointLogs } = useTeacherPointLogGet({ size: 10000, studentId, join: ['teacher'] })

  const [merits, demerits] = useMemo(
    () => (pointLogs?.items ?? []).reduce(([m, dm], { value: v }) => (v > 0 ? [m + v, dm] : [m, dm + v]), [0, 0]),
    [pointLogs],
  )

  return (
    <div className="scroll-box h-screen-12 md:h-screen-4 mt-4 flex flex-col gap-4 overflow-y-auto pb-4">
      <div className="flex items-end justify-between">
        <Button
          children={tt('assign_points')}
          onClick={() => pushModal(<AssignPointModal studentId={studentId} />)}
          className="outlined-gray"
        />
        <div className="flex gap-3 font-light">
          <span>
            {tt('merits')}: {numberWithSign(merits)}
          </span>
          <span>
            {tt('demerits')}: {numberWithSign(demerits)}
          </span>
          <span>
            {tt('total')}: {numberWithSign(merits + demerits)}
          </span>
        </div>
      </div>

      <Admin.Table className="w-full">
        <Admin.TableHead>
          <Admin.TableRow>
            <Admin.TableHCell children={tt('point_log_created_at')} />
            <Admin.TableHCell children={tt('point_log_assigner')} />
            <Admin.TableHCell children={tt('point_log_title')} />
            <Admin.TableHCell children={tt('point_log_value')} className="text-end" />
          </Admin.TableRow>
        </Admin.TableHead>
        <Admin.TableBody>
          {pointLogs?.items.map((pointLog) => (
            <Admin.TableRow key={pointLog.id} onClick={() => pushModal(<PointLogModal pointLogId={pointLog.id} />)}>
              <Admin.TableCell>
                <Time date={pointLog.createdAt} format="MM.dd" />
              </Admin.TableCell>
              <Admin.TableCell children={pointLog.teacher.name} />
              <Admin.TableCell children={pointLog.title} />
              <Admin.TableCell children={numberWithSign(pointLog.value)} className="text-end" />
            </Admin.TableRow>
          ))}
          {pointLogs?.total === 0 && (
            <Admin.TableRow>
              <Admin.TableCell colSpan={4} children={tt('no_items_found')} className="text-15 py-8 text-center" />
            </Admin.TableRow>
          )}
        </Admin.TableBody>
      </Admin.Table>
    </div>
  )
}
