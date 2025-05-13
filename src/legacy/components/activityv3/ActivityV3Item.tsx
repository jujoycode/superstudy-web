import { format } from 'date-fns'
import { FC } from 'react'
import { Link, useLocation } from 'react-router'
import { twMerge } from 'tailwind-merge'

import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { ActivitySession, ActivityV3 } from '@/legacy/generated/model'

import { Activityv3SessionItem } from './activityv3SessionItem'

interface Activityv3ItemProps {
  activityv3: ActivityV3
  setOpenedActivityIds: (value: number[]) => void
  openedActivityIds?: number[]
  activitySessions: ActivitySession[]
}

export const Activityv3Item: FC<Activityv3ItemProps> = ({
  activityv3,
  setOpenedActivityIds,
  openedActivityIds,
  activitySessions,
}) => {
  const { pathname } = useLocation()
  const sessionOpen = openedActivityIds ? openedActivityIds.includes(activityv3.id) : true
  const setSessionToggle = () => {
    if (sessionOpen) {
      setOpenedActivityIds(openedActivityIds?.filter((id) => id !== activityv3.id) || [])
    } else {
      setOpenedActivityIds((openedActivityIds || []).concat(activityv3.id))
    }
  }
  return (
    <div key={activityv3.id} className={twMerge('rounded-md bg-gray-200')}>
      <div className="flex flex-col space-y-2 px-4 py-2">
        <h1 className="text-16 w-full font-semibold break-words">{activityv3.title}</h1>
        <div className="flex w-full items-center justify-between">
          <div className="text-12">
            {activityv3.subject} | {ACTIVITYV3_TYPE_KOR[activityv3.type]}
          </div>
          {activityv3.startDate && activityv3.endDate && (
            <div className="text-12">
              {format(new Date(activityv3.startDate), 'yyyy.MM.dd')} ~{' '}
              {format(new Date(activityv3.endDate), 'yyyy.MM.dd')}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/teacher/activityv3/${activityv3.id}/submit`}
            className={twMerge(
              'bg-opacity-10 rounded-full bg-black px-4 py-2 text-sm',
              pathname === `/teacher/activityv3/${activityv3.id}/submit` && 'bg-opacity-100 bg-gray-600 text-white',
            )}
          >
            전달 대상
          </Link>
          <Link
            to={`/teacher/activityv3/${activityv3.id}`}
            onClick={() => !sessionOpen && setOpenedActivityIds(openedActivityIds?.concat(activityv3.id) || [])}
            className={twMerge(
              'bg-opacity-10 rounded-full bg-black px-4 py-2 text-sm',
              pathname === `/teacher/activityv3/${activityv3.id}` && 'bg-opacity-100 bg-gray-600 text-white',
            )}
          >
            상세보기
          </Link>
        </div>
      </div>
      {sessionOpen ? (
        <div>
          {activitySessions
            ?.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1))
            ?.map((session: ActivitySession, index: number) => (
              <Activityv3SessionItem key={session.id} session={session} index={index} />
            ))}
        </div>
      ) : (
        <div>
          {activitySessions?.[0] && (
            <Activityv3SessionItem key={activitySessions[0].id} session={activitySessions[0]} index={0} />
          )}
        </div>
      )}
      <div className="flex w-full border-t border-gray-300">
        {activitySessions?.length > 0 && (
          <div
            className="w-full cursor-pointer border-r border-gray-300 p-2 text-center"
            onClick={(e) => {
              e.preventDefault()
              setSessionToggle()
            }}
          >
            {sessionOpen ? '차시 접기' : '차시 전체보기'}
          </div>
        )}
        <Link
          className="w-full cursor-pointer p-2 text-center"
          to={`/teacher/activityv3/session/add?activityv3Id=${activityv3.id}`}
        >
          + 차시 추가하기
        </Link>
      </div>
    </div>
  )
}
