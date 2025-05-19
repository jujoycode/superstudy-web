import { FC, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Button } from '@/legacy/components/common/Button'
import ScheduleAndTimePicker from '@/legacy/components/common/ScheduleAndTimePicker'
import { Typography } from '@/legacy/components/common/Typography'
import { RequestIBDeadlineDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import ColorSVGIcon from '../icon/ColorSVGIcon'
import SVGIcon from '../icon/SVGIcon'

import { DEADLINE_TYPE_KOR } from './coordinator/Coordinator_Schedule'

interface CreateDeadlineFieldProps {
  deadline: RequestIBDeadlineDto
  index: number
  handleDeleteDeadline: (index: number) => void
  handleUpdateDeadline: (dto: Partial<RequestIBDeadlineDto>, index: number) => void
}

export const CreateDeadlineField: FC<CreateDeadlineFieldProps> = ({
  deadline,
  index,
  handleDeleteDeadline,
  handleUpdateDeadline,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  return (
    <div className="rounded-lg bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <Typography variant="title2">{DEADLINE_TYPE_KOR[deadline.type]}</Typography>
        <ColorSVGIcon.Close
          className="cursor-pointer"
          color="gray700"
          size={32}
          onClick={() => handleDeleteDeadline(index)}
        />
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="flex w-[235px] flex-col gap-3">
          <Typography variant="title3" className="font-semibold">
            마감기한
          </Typography>
          <div className="relative">
            <div
              className={`flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-[9px] focus:ring-0 focus:outline-none ${
                isFocused && 'border-gray-700'
              }`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={() => setCalendarOpen(!calendarOpen)}
            >
              <SVGIcon.Calendar size={20} color="gray700" />
              <input
                className="text-15 caret-ib-blue-800 w-full flex-1 border-none bg-white p-0 font-medium text-gray-900 placeholder-gray-400 focus:border-gray-700 focus:text-gray-700 focus:ring-0 focus:outline-none"
                placeholder="마감기한 선택"
                value={
                  deadline.deadlineTime
                    ? DateUtil.formatDate(new Date(deadline.deadlineTime), DateFormat['YYYY.MM.DD a hh:mm']) + '까지'
                    : ''
                }
              />
            </div>
            {calendarOpen && (
              <div className="fixed top-1/2 left-1/2 z-50 mt-2 -translate-x-1/2 -translate-y-1/2 transform">
                <ScheduleAndTimePicker
                  key={index}
                  initialDeadline={deadline.deadlineTime ? new Date(deadline.deadlineTime) : undefined}
                  onSave={(finalDate) => {
                    const finalDateString = finalDate?.toISOString() || ''
                    handleUpdateDeadline({ deadlineTime: finalDateString }, index)
                    setCalendarOpen(false)
                  }}
                  onCancel={() => setCalendarOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Typography variant="title3" className="font-semibold">
            알림주기
          </Typography>
          <div className="flex items-center space-x-2">
            {[7, 3, 1, 0].map((day) => (
              <Button.lg
                key={day}
                className={twMerge(
                  'h-[40px] border border-gray-300 bg-white text-gray-700 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400',
                  deadline.remindDays?.includes(day) && 'border-primary-400 bg-primary-100 text-primary-800',
                )}
                disabled={!deadline.deadlineTime}
                onClick={() =>
                  handleUpdateDeadline(
                    {
                      remindDays: deadline.remindDays?.includes(day)
                        ? (deadline.remindDays || []).filter((el) => el !== day)
                        : (deadline.remindDays || []).concat(day),
                    },
                    index,
                  )
                }
              >
                {day === 0 ? '당일' : `${day}일전`}
              </Button.lg>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
