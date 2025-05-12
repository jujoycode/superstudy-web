import { useHistory, useLocation } from 'react-router'
import { Badge } from '@/legacy/components/common'
import { Notice } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { Routes } from '@/legacy/constants/routes'
import { getNickName } from '@/legacy/util/status'
import { Time } from '@/legacy/components/common/Time'

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
            ? 'cursor-pointer bg-gray-50 px-6 py-4'
            : 'cursor-pointer px-6 py-4'
        }
        onClick={() => {
          onClick()
          push(`${Routes.teacher.notice}/${notice.id}`)
        }}
      >
        <div className="flex justify-between">
          <div className="space-x-2">
            <Badge
              children={t(`${notice.category}`) || t('announcement')}
              className="rounded-md bg-red-50 text-red-500"
            />
            {(notice.toStudent || notice.toParent) && (
              <Badge className="rounded-md bg-purple-100 text-purple-700">
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
