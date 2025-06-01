import { useEffect, useRef, useState } from 'react'
// @ts-ignore
import { useLanguage } from '@/hooks/useLanguage'
import { useUserStore } from '@/stores/user'
import { Box } from '@/atoms/Box'
import { Flex } from '@/atoms/Flex'
import { Text } from '@/atoms/Text'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { ErrorBlank } from '@/legacy/components'
import AnnouncementPopup from '@/legacy/components/announcement/Announcement'
import { CanteenMobile } from '@/legacy/components/canteen/CanteenMobile'
import { CanteenCalendar } from '@/legacy/components/CanteenCalendar'
import { Blank } from '@/legacy/components/common'
import { Typography } from '@/legacy/components/common/Typography'
import { useTeacherCanteen } from '@/legacy/container/teacher-canteen'
import { useNotificationLogFindRecent } from '@/legacy/generated/endpoint'
import { CalendarIdEnum } from '@/legacy/generated/model'
import { CanteenDetailPage } from '@/legacy/pages/teacher/canteen/CanteenDetailPage'
import { CanteenSubmitPage } from '@/legacy/pages/teacher/canteen/CanteenSubmitPage'
import { checkNewVersion } from '@/legacy/util/status'
import { makeDateToString, makeMonthDayToStringEN, makeMonthDayWithDayOfWeekToString } from '@/legacy/util/time'

export function CanteenPage() {
  const { me } = useUserStore()
  const { t } = useLanguage()

  checkNewVersion()

  const {
    schedulesOrderByDay,
    errorMessage,
    selectedDate,
    setSelectedDate,
    selectedCanteen,
    selectedSchedules,
    isLoading,
  } = useTeacherCanteen()
  const { data: notificationLog } = useNotificationLogFindRecent()

  const [readState, setReadState] = useState(false)

  const conteenRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    if (selectedCanteen) {
      conteenRef.current?.scrollIntoView()
    }
  }, [selectedCanteen])

  if (!me?.id || isLoading) {
    return <Blank />
  }

  const hasConfirmedAll = !notificationLog

  return (
    <Flex direction="col" className="h-screen w-full bg-gray-50" gap="6">
      <AnnouncementPopup type="teacher" />
      <ResponsiveRenderer mobile={<CanteenMobile hasConfirmedAll={hasConfirmedAll} />} />
      {errorMessage && <ErrorBlank />}
      <header className="w-full bg-white pt-14 pb-6">
        <Box className="mx-auto" width="[1280px]">
          <Text variant="default" className="text-[32px] font-bold">
            급식표
          </Text>
        </Box>
      </header>
      <Flex direction="row" className="mx-auto w-full max-w-[1280px]" gap="4">
        <div className="scroll-box flex min-h-[680px] w-[848px] flex-col gap-6 rounded-xl bg-white p-6">
          <CanteenCalendar
            value={selectedDate}
            onChange={(value: any) => setSelectedDate(new Date(value))}
            onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setSelectedDate(activeStartDate)}
            tileContent={({ date }) => {
              const dateStr = makeDateToString(date)
              const schedules = schedulesOrderByDay[dateStr]
              return (
                <div className="flex justify-center space-x-0.5">
                  {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_0) && (
                    <div className="h-1 w-1 rounded-full bg-[#955FFF]" />
                  )}
                  {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_1) && (
                    <div className="h-1 w-1 rounded-full bg-[#00A9FF]" />
                  )}
                  {schedules?.some((s) => s.calendarId === CalendarIdEnum.NUMBER_2) && (
                    <div className="h-1 w-1 rounded-full bg-[#8CD23C]" />
                  )}
                </div>
              )
            }}
          />

          <Flex direction="col" gap="1" className="rounded-lg bg-gray-50 p-4">
            <Text size="sm" weight="sm" variant="sub">
              {t('language') === 'ko'
                ? makeMonthDayWithDayOfWeekToString(selectedDate)
                : makeMonthDayToStringEN(selectedDate)}
            </Text>
            {selectedSchedules && selectedSchedules?.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {selectedSchedules?.map((schedule) => (
                  <div key={schedule.id} className="flex w-full items-center gap-1.5">
                    <div
                      className={`border-dim-8 h-3 w-3 rounded-[4px] border ${
                        schedule.calendarId === CalendarIdEnum.NUMBER_1
                          ? 'bg-[#00A9FF]'
                          : schedule.calendarId === CalendarIdEnum.NUMBER_2
                            ? 'bg-[#8CD23C]'
                            : 'bg-[#955FFF]'
                      }`}
                    />
                    <Typography variant="body3" className="font-medium">
                      {schedule.title}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <Text variant="default" size="sm" weight="md">
                일정 없음
              </Text>
            )}
          </Flex>
        </div>
        <CanteenDetailPage
          selectedDate={selectedDate}
          canteen={selectedCanteen}
          setSubmitState={() => setReadState(true)}
        />
        {readState && (
          <CanteenSubmitPage
            selectedDate={selectedDate}
            canteenData={selectedCanteen}
            refetch={() => {
              setReadState(false)
            }}
          />
        )}
      </Flex>
    </Flex>
  )
}
