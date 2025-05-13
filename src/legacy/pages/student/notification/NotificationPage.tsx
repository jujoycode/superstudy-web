import _ from 'lodash'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { TopNavbar, BackButton, Blank, Section } from '@/legacy/components/common'
import { useNotificationLogFindAll, useNotificationLogRead } from '@/legacy/generated/endpoint'
import { makeDateToString } from '@/legacy/util/time'
import { meState } from '@/stores'

export const NotificationPage = () => {
  const me = useRecoilValue(meState)
  const { data, refetch, isLoading } = useNotificationLogFindAll()

  const [loading, setLoading] = useState(false)

  const { mutate: readNotification } = useNotificationLogRead({
    mutation: {
      onSuccess: () => {
        refetch()
        setLoading(false)
      },
      onError: () => setLoading(false),
    },
  })
  const notifications = _.chain(data).orderBy('createdAt', 'desc').value()

  return (
    <>
      <TopNavbar
        title="알림"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {(loading || isLoading) && <Blank />}
      <div className="scroll-box h-screen-7 overflow-y-auto bg-[#FFF8F2]">
        <Section className="space-y-2">
          {notifications?.map((log) =>
            log.url === '/' || !log.url ? (
              <div
                className="flex cursor-pointer items-center justify-between space-x-2 rounded-xl border border-gray-300 bg-white px-4 py-2"
                key={log.id}
                onClick={() => {
                  setLoading(true)
                  readNotification({ id: log.id })
                }}
              >
                <div className="w-full overflow-hidden">
                  <div className="flex w-full items-center space-x-1">
                    <div className="max-w-full truncate text-sm font-semibold">{log.title}</div>
                    {me?.email && !log.readTargetIds.includes(me.email) && (
                      <small className="inline-block h-4 w-4 rounded-full bg-red-500 text-center text-xs font-light text-white">
                        N
                      </small>
                    )}
                  </div>
                  <div className="text-12 truncate text-gray-500"> {log.body}</div>
                </div>
                <div className="text-12 min-w-max text-gray-500"> {makeDateToString(log.createdAt)}</div>
              </div>
            ) : (
              <Link
                className="flex cursor-pointer items-center justify-between space-x-2 rounded-xl border border-gray-300 bg-white px-4 py-2"
                key={log.id}
                to={log.url}
              >
                <div className="w-full overflow-hidden">
                  <div className="flex w-full items-center space-x-1">
                    <div className="max-w-full truncate font-semibold">{log.title}</div>
                    {me?.email && !log.readTargetIds.includes(me.email) && (
                      <small className="inline-block h-4 w-4 rounded-full bg-red-500 text-center text-xs font-light text-white">
                        N
                      </small>
                    )}
                  </div>
                  <div className="truncate text-sm text-gray-500"> {log.body}</div>
                </div>
                <div className="text-12 min-w-max text-gray-500"> {makeDateToString(log.createdAt)}</div>
              </Link>
            ),
          )}
        </Section>
      </div>
    </>
  )
}
