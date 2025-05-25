import { format } from 'date-fns'
import { FC } from 'react'
import { Link, useLocation } from 'react-router'
import { twMerge } from 'tailwind-merge'

import { ActivitySession } from '@/legacy/generated/model'

interface Activityv3SessionItemProps {
  session: ActivitySession
  index: number
}

export const Activityv3SessionItem: FC<Activityv3SessionItemProps> = ({ session, index }) => {
  const { pathname } = useLocation()
  return (
    <div
      className={twMerge(
        'flex flex-col space-y-2 bg-black/10 px-4 py-2',
        pathname.startsWith(`/teacher/activityv3/session/${session.id}`) && 'bg-black/20',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full items-center space-x-2">
          <div className="text-16 w-6 rounded-md bg-black/30 py-0.5 text-center font-semibold">{index + 1}</div>
          <h1 className="text-16 w-full font-semibold break-words">{session.title}</h1>
        </div>
        <div className="text-12 w-full text-right">
          {session.endDate && '~' + format(new Date(session.endDate), 'yyyy.MM.dd') + '까지'}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2">
        {session.type === 'NOTICE' ? (
          <Link
            to={`/teacher/activityv3/session/${session.id}`}
            className={twMerge(
              'rounded-full bg-black/10 px-4 py-2 text-sm',
              pathname.startsWith(`/teacher/activityv3/session/${session.id}`) && 'bg-gray-600/100 text-white',
            )}
          >
            상세보기
          </Link>
        ) : (
          <>
            <Link
              to={`/teacher/activityv3/session/${session.id}/submit`}
              className={twMerge(
                'rounded-full bg-black/10 px-4 py-2 text-sm',
                pathname.startsWith(`/teacher/activityv3/session/${session.id}/submit`) && 'bg-gray-600/100 text-white',
              )}
            >
              제출자
            </Link>
            <Link
              to={`/teacher/activityv3/session/${session.id}`}
              className={twMerge(
                'rounded-full bg-black/10 px-4 py-2 text-sm',
                pathname === `/teacher/activityv3/session/${session.id}` && 'bg-gray-600/100 text-white',
              )}
            >
              상세보기
            </Link>
            <Link
              to={`/teacher/activityv3/session/${session.id}/download`}
              className={twMerge(
                'rounded-full bg-black/10 px-4 py-2 text-sm',
                pathname.startsWith(`/teacher/activityv3/session/${session.id}/download`) &&
                  'bg-gray-600/100 text-white',
              )}
            >
              다운로드
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
