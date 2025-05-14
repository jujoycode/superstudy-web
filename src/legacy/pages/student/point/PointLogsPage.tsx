import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Time } from '@/legacy/components/common/Time'
import { Typography } from '@/legacy/components/common/Typography'
import { usePointLogGet } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { numberWithSign } from '@/legacy/util/string'
import { useUserStore } from '@/stores2/user'

const encouragements = [
  { min: 10, message: '🌟 훌륭해요! 좋은 행동이 쌓이고 있어요.\n계속해서 좋은 모습을 기대할게요!' },
  { min: 5, message: '👍 아주 좋아요! 멋진 습관이 만들어지고 있어요.\n지금처럼만 하면 칭찬이 계속 쏟아질 거예요.' },
  { min: 2, message: '😊 좋은 출발이에요. 작지만 값진 행동들이네요.\n조금만 더 힘내볼까요?' },
  { min: 1, message: '😐 조금 더 노력해봐요.\n좋은 행동 하나가 큰 변화를 만들 수 있어요!' },
  { min: 0, message: '🤔 이번 주는 아쉽게도 변화가 없어요.\n작은 실천으로 멋진 한 주를 만들어보면 어때요?' },
  { min: -1, message: '😐 조금 더 노력해봐요.\n좋은 행동 하나가 큰 변화를 만들 수 있어요!' },
  { min: -4, message: '⚠️ 조심조심! 주의가 필요해요.\n조금만 더 신경 쓰면 충분히 좋아질 수 있어요.' },
  { min: -9, message: '❗ 이럴 땐 반성이 필요해요.\n무엇이 문제였는지 돌아보고 함께 개선해봐요.' },
  {
    min: Number.NEGATIVE_INFINITY,
    message: '🚨 긴급! 행동 점검이 필요해요.\n보호자와 함께 대화해보는 건 어떨까요? 지금이 바꿀 기회예요.',
  },
]

export function PointLogsPage() {
  const { t: ts } = useTranslation('student', { keyPrefix: 'pointlogs_page' })
  const { me } = useUserStore()

  const studentId = me?.role === Role.USER ? me.id : +(localStorage.getItem('child-user-id') || '0')
  const { data: pointLogs } = usePointLogGet({ size: 10000, studentId, join: ['teacher'] })

  const [merits, demerits, total] = useMemo(
    () =>
      (pointLogs?.items ?? []).reduce(
        ([m, dm, t], { value: v }) => (v > 0 ? [m + v, dm, t + v] : [m, dm + v, t + v]),
        [0, 0, 0],
      ),
    [pointLogs],
  )
  const encouragement = useMemo(() => encouragements.find((e) => total >= e.min), [total])

  return (
    <>
      <TopNavbar
        title="상벌점기록"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      <div className="flex flex-col gap-4 px-5 pt-10 pb-10">
        <div className="rounded-xl border text-center">
          <div className="grid grid-cols-3 divide-x py-4">
            <div className="flex flex-col px-4">
              <Typography variant="caption" className="text-primary-gray-700">
                {ts('merits')}
              </Typography>
              <Typography variant="title2" className="text-primary-green-800">
                {numberWithSign(merits)}
              </Typography>
            </div>
            <div className="flex flex-col px-4">
              <Typography variant="caption" className="text-primary-gray-700">
                {ts('demerits')}
              </Typography>
              <Typography variant="title2" className="text-primary-red-800">
                {numberWithSign(demerits)}
              </Typography>
            </div>
            <div className="flex flex-col px-4">
              <Typography variant="caption" className="text-primary-gray-700">
                {ts('total')}
              </Typography>
              <Typography variant="title2" className="text-primary-gray-900">
                {numberWithSign(merits + demerits)}
              </Typography>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-100 p-4">
          <Typography variant="title3" className="text-center">
            {encouragement?.message}
          </Typography>
        </div>
      </div>

      <div className="bg-primary-gray-100 h-2.5"></div>

      <div className="px-5 pt-10 pb-12">
        <Admin.Table className="w-full border-b text-center">
          <Admin.TableHead>
            <Admin.TableRow className="divide-x bg-gray-50">
              <Admin.TableHCell className="text-center">
                <Typography variant="body2">{ts('point_log_created_at')}</Typography>
              </Admin.TableHCell>
              <Admin.TableHCell className="text-center">
                <Typography variant="body2">{ts('point_log_title')}</Typography>
              </Admin.TableHCell>
              <Admin.TableHCell className="text-center">
                <Typography variant="body2">{ts('point_log_value')}</Typography>
              </Admin.TableHCell>
              <Admin.TableHCell className="text-center">
                <Typography variant="body2">{ts('point_log_assigner')}</Typography>
              </Admin.TableHCell>
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {pointLogs?.items.map((pointLog) => (
              <Admin.TableRow key={pointLog.id} className="divide-x">
                <Admin.TableCell className="py-3">
                  <Time date={pointLog.createdAt} format="MM.dd" className="font-500 text-15 text-current" />
                </Admin.TableCell>
                <Admin.TableCell className="py-3">
                  <Typography variant="body2">{pointLog.title}</Typography>
                </Admin.TableCell>
                <Admin.TableCell className="py-3">
                  <Typography variant="body2">{numberWithSign(pointLog.value)}</Typography>
                </Admin.TableCell>
                <Admin.TableCell className="py-3">
                  <Typography variant="body2">{pointLog.teacher.name}</Typography>
                </Admin.TableCell>
              </Admin.TableRow>
            ))}
            {pointLogs?.total === 0 && (
              <Admin.TableRow>
                <Admin.TableCell colSpan={4} children={ts('no_items_found')} className="text-15 py-8 text-center" />
              </Admin.TableRow>
            )}
          </Admin.TableBody>
        </Admin.Table>
      </div>
    </>
  )
}
