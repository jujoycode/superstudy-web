import { useLocation } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { Time } from '@/legacy/components/common/Time'
import { Announcement } from '@/legacy/generated/model/announcement'
import { useLanguage } from '@/legacy/hooks/useLanguage'

interface AnnouncementBadgeProps {
  news: Announcement
  type: string
}

export default function AnnouncementBadge({ news, type }: AnnouncementBadgeProps) {
  const { pathname } = useLocation()
  const { push } = useHistory()
  const { t } = useLanguage()

  const recipients = [
    { label: t('administrator'), isActive: news.toAdmin, color: 'bg-users-admin' },
    { label: t('teacher'), isActive: news.toTeacher, color: 'bg-users-teacher' },
    { label: t('student'), isActive: news.toStudent, color: 'bg-users-student' },
    { label: t('parent'), isActive: news.toParent, color: 'bg-users-parent' },
  ]

  return (
    <>
      <div
        className={
          pathname.startsWith(`/${type}/announcement/${news.id}`)
            ? 'cursor-pointer bg-gray-50 px-4 py-4'
            : 'cursor-pointer px-4 py-4'
        }
        onClick={() => {
          push(`/${type}/announcement/${news.id}`)
        }}
      >
        <div className="flex flex-col gap-2">
          {news && (
            <div className="flex items-center space-x-2">
              {recipients
                .filter((recipient) => recipient.isActive)
                .map((recipient, index) => (
                  <span key={index} className={`text-sm text-white ${recipient.color} rounded px-2 py-1`}>
                    {recipient.label}
                  </span>
                ))}
            </div>
          )}
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              {news.isPinned && <h1 className="w-60 truncate text-lg font-bold">{news.title}</h1>}
              {!news.isPinned && <h1 className="text-darkgray w-60 truncate text-lg">{news.title}</h1>}
            </div>
            <Time date={news.createdAt} format={'yyyy.MM.dd'} />
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-gray-100"></div>
    </>
  )
}
