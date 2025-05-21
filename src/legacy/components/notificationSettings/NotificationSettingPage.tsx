import { cn } from '@/utils/commonUtil'
import { format } from 'date-fns'
import { range } from 'lodash'
import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user'
import { Divider, Select } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { notificationSettingsUpdate, useNotificationSettingsGetMine } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { convertTimeToKorean } from '@/legacy/util/time'

const daysOfWeekString = ['일', '월', '화', '수', '목', '금', '토']

export function NotificationSettingPage() {
  const { me } = useUserStore()

  const [disturbTime, setDisturbTime] = useState(false)
  const { data: notificationSetting } = useNotificationSettingsGetMine()

  const [allowDays, setAllowDays] = useState<string | undefined>()

  useEffect(() => {
    if (
      notificationSetting?.daysOfWeek.every((item) => item === false) &&
      notificationSetting?.timeFrom === '00:00:00' &&
      notificationSetting?.timeTo === '00:00:00'
    ) {
      setDisturbTime(false)
    } else {
      setDisturbTime(true)

      const falseDays = notificationSetting?.daysOfWeek.reduce((acc: string[], currentValue, index) => {
        if (!currentValue) {
          acc.push(daysOfWeekString[index])
        }
        return acc
      }, [])

      setAllowDays(falseDays?.join(','))
    }
  }, [notificationSetting])

  if (!notificationSetting) return null
  return (
    <>
      <div className="mb-20">
        <h3 className="text-13 mt-2 mb-2 px-4 font-medium text-gray-400"> 푸시 알림 메시지 수신 여부를 설정합니다.</h3>
        <label className="flex items-center justify-between px-4 py-3 active:bg-gray-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">결재알림</span>
            <span className="text-sm text-gray-500">출결, 확인증, 체험학습</span>
          </div>
          <ToggleSwitch
            checked={notificationSetting.notifyApprovals}
            onChange={(e) => notificationSettingsUpdate(notificationSetting.id, { notifyApprovals: e.target.checked })}
          />
        </label>

        {me?.role === Role.PARENT && (
          <label className="flex items-center justify-between px-4 py-3 active:bg-gray-50">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800">출결상태</span>
              <span className="text-sm text-gray-500">출석, 결석</span>
            </div>
            <ToggleSwitch
              checked={notificationSetting.notifyAttendances}
              onChange={(e) =>
                notificationSettingsUpdate(notificationSetting.id, { notifyAttendances: e.target.checked })
              }
            />
          </label>
        )}
        <label className="flex items-center justify-between px-4 py-3 active:bg-gray-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">신규게시물</span>
            <span className="text-sm text-gray-500">학급, 공지, 가정통신문</span>
          </div>
          <ToggleSwitch
            checked={notificationSetting.notifyPosts}
            onChange={(e) => notificationSettingsUpdate(notificationSetting.id, { notifyPosts: e.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3 active:bg-gray-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">채팅</span>
            <span className="text-sm text-gray-500">메시지</span>
          </div>
          <ToggleSwitch
            checked={notificationSetting.notifyChats}
            onChange={(e) => notificationSettingsUpdate(notificationSetting.id, { notifyChats: e.target.checked })}
          />
        </label>

        <Divider />

        <label className="flex items-center justify-between px-4 py-3 active:bg-gray-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">방해금지 시간대</span>
            <span className="text-sm text-gray-500">알림을 받지 않을 시간 설정</span>
          </div>
          <ToggleSwitch
            checked={disturbTime}
            onChange={() => {
              if (disturbTime) {
                notificationSettingsUpdate(notificationSetting.id, {
                  timeFrom: '00:00:00',
                  timeTo: '00:00:00',
                  daysOfWeek: [false, false, false, false, false, false, false],
                })
              } else {
                notificationSettingsUpdate(notificationSetting.id, {
                  timeFrom: '18:00:00',
                  timeTo: '08:00:00',
                  daysOfWeek: [true, false, false, false, false, false, true],
                })
              }

              setDisturbTime(!disturbTime)
            }}
          />
        </label>
        {disturbTime && (
          <div className="mx-4 rounded-lg bg-gray-100 p-4">
            <div className="mt-2 mb-2 px-4 text-sm text-gray-500">방해금지 요일</div>
            <div className="flex justify-between px-4 py-2">
              {range(0, 7).map((day) => {
                const checked = notificationSetting.daysOfWeek[day]
                return (
                  <label
                    key={day}
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-full border',
                      checked
                        ? 'border-brand-1 bg-brand-1 text-white active:opacity-90'
                        : 'text-brand-1 active:bg-gray-50',
                    )}
                  >
                    <span className="text-14">{daysOfWeekString[day]}</span>
                    <Checkbox
                      className="sr-only"
                      checked={checked}
                      onChange={(e) => {
                        const daysOfWeek = [...notificationSetting.daysOfWeek]
                        daysOfWeek[day] = e.target.checked
                        notificationSettingsUpdate(notificationSetting.id, { daysOfWeek })
                      }}
                    />
                  </label>
                )
              })}
            </div>
            <div className="mt-2 mb-2 px-4 text-sm text-gray-500">방해금지 시간</div>
            <div className="flex items-center gap-4 px-4">
              <Select
                value={notificationSetting.timeFrom}
                onChange={(e) => notificationSettingsUpdate(notificationSetting.id, { timeFrom: e.target.value })}
                className="flex-1"
              >
                {range(0, 30 * 48, 30).map((minutes) => {
                  const date = new Date(0, 0, 0, 0, minutes, 0)
                  return (
                    <option key={minutes} value={format(date, 'HH:mm:ss')}>
                      {format(date, 'HH:mm')}
                    </option>
                  )
                })}
              </Select>
              <span>~</span>
              <Select
                value={notificationSetting.timeTo}
                onChange={(e) => notificationSettingsUpdate(notificationSetting.id, { timeTo: e.target.value })}
                className="flex-1"
              >
                {range(30, 30 * 49, 30).map((minutes) => {
                  const date = new Date(0, 0, 0, 0, minutes, 0)
                  return (
                    //<option key={minutes} value={minutes === 1440 ? '24:00:00' : format(date, 'HH:mm:ss')}>
                    <option key={minutes} value={format(date, 'HH:mm:ss')}>
                      {format(date, 'HH:mm')}
                    </option>
                  )
                })}
              </Select>
            </div>

            {allowDays?.length === 0 ? (
              <div className="mt-2 mb-2 px-4 text-sm text-red-400">알림을 받지 않습니다.</div>
            ) : (
              <div className="mt-2 mb-2 px-4 text-sm text-red-400">
                {'* ' + allowDays + '요일'}
                <br />
                {' ' +
                  convertTimeToKorean(notificationSetting.timeTo) +
                  '부터 ' +
                  convertTimeToKorean(notificationSetting.timeFrom) +
                  '까지 알림을 받습니다.'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
