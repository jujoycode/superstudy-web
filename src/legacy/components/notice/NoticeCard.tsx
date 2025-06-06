import { useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { Badge } from '@/atoms/Badge'
import { Time } from '@/legacy/components/common/Time'
import { Routes } from '@/legacy/constants/routes'
import { Notice } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'

interface NoticeCardProps {
  notice: Notice
  onClick: () => void
  isNew?: boolean
}

export function NoticeCard({ notice, isNew, onClick }: NoticeCardProps) {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const { t } = useLanguage()

  return (
    <>
      <div
        className={
          pathname.startsWith(`${Routes.teacher.notice}/${notice.id}`)
            ? 'cursor-pointer bg-gray-100 px-6 py-4'
            : 'cursor-pointer px-6 py-4'
        }
        onClick={() => {
          onClick()
          push(`${Routes.teacher.notice}/${notice.id}`)
        }}
      >
        <div className="flex justify-between">
          <div className="space-x-2">
            <Badge variant="active" className="border-0">
              {t(`${notice.category}`) || t('announcement')}
            </Badge>
            {(notice.toStudent || notice.toParent) && (
              <Badge className="border-0">
                {notice.toStudent && t('student')} {notice.toParent && t('parent')}
              </Badge>
            )}
          </div>
          <Time date={notice.createdAt} />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <div className="mt-2 text-lg font-semibold break-all whitespace-pre-line">
            {notice.title}{' '}
            {isNew && (
              <small className="inline-block h-4 w-4 rounded-full bg-red-500 text-center text-xs font-light text-white">
                N
              </small>
            )}
          </div>

          <div className="min-w-max text-sm text-gray-500">
            {notice.user?.name}
            {getNickName(notice.user?.nickName)}
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-gray-100"></div>
    </>
  )
}
