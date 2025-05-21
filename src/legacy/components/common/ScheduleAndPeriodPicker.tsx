import React, { useState } from 'react'
import SVGIcon from '../icon/SVGIcon'
import { ButtonV2 } from './ButtonV2'
import { Input } from './Input'
import TimePicker from './TimePicker'
import { Typography } from './Typography'

interface ScheduleAndPeriodPickerProps {
  initialDate?: {
    startDate: Date | undefined
    endDate: Date | undefined
    cycle: string | undefined
  }
  onSave?: (date: { startDate: Date | undefined; endDate: Date | undefined; cycle: string | undefined }) => void
  onCancel?: () => void
}

const ScheduleAndPeriodPicker: React.FC<ScheduleAndPeriodPickerProps> = ({
  initialDate = { startDate: undefined, endDate: undefined, cycle: undefined },
  onSave,
  onCancel,
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate.startDate || new Date())
  const [localDate, setLocalDate] = useState(initialDate)

  const today = new Date()

  const handleDateSelect = (selectedDate: Date) => {
    setLocalDate((prev) => {
      if (!prev.startDate || (prev.startDate && prev.endDate)) {
        return { ...prev, startDate: selectedDate, endDate: undefined }
      }
      if (selectedDate < prev.startDate) {
        return { ...prev, startDate: selectedDate, endDate: prev.startDate }
      }
      return { ...prev, endDate: selectedDate }
    })
  }

  // 이전 달로 이동
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setCurrentDate(prevMonth)
  }

  // 다음 달로 이동
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setCurrentDate(nextMonth)
  }

  const handleCycleChange = (newCount: string | undefined) => {
    setLocalDate((prev) => ({ ...prev, cycle: newCount }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(localDate) // 최종 저장 시 상위로 전달
    }
  }

  // 달력 날짜 배열 생성 (이전 달 마지막 날짜와 다음 달 첫날 포함)
  const generateCalendarDates = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDayOfWeek = startOfMonth.getDay()
    const endDayOfWeek = endOfMonth.getDay()

    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    const nextMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

    const dates: { date: Date; isCurrentMonth: boolean }[] = []

    // 이전 달 날짜 채우기
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      dates.push({
        date: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i),
        isCurrentMonth: false,
      })
    }

    // 현재 달 날짜 채우기
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      dates.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isCurrentMonth: true })
    }

    // 다음 달 날짜 채우기
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
      dates.push({ date: new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), i), isCurrentMonth: false })
    }

    return dates
  }

  const dates = generateCalendarDates()

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

  const isBetween = (date: Date, start: Date, end: Date) => date > start && date < end

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="text-13 flex w-[280px] flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white py-4 shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)]">
      {/* 달력 */}
      <div className="flex w-[248px] flex-col items-center gap-2">
        <div className="flex w-full items-center justify-around gap-1">
          <button onClick={handlePrevMonth} className="p-2">
            <SVGIcon.Arrow weight="bold" color="gray700" size={16} />
          </button>
          <div className="relative flex flex-row items-center gap-1">
            {/* <Typography variant="title3" className="cursor-pointer" onClick={() => setYearFilter(true)}>
              {currentDate.getFullYear()}.
            </Typography> */}
            <div className="flex flex-row items-center">
              <TimePicker
                options={Array.from({ length: 7 }, (_, i) => ({
                  id: i,
                  value: currentDate.getFullYear() - 3 + i,
                  text: String(currentDate.getFullYear() - 3 + i),
                }))}
                value={currentDate.getFullYear()}
                onChange={(value: number) =>
                  setCurrentDate(new Date(value, currentDate.getMonth(), currentDate.getDate()))
                }
                priorityFontClass="text-[#121316] text-base leading-6 font-semibold"
                dropdownWidth="w-24"
              />
              <Typography variant="title3">.</Typography>
            </div>

            <TimePicker
              options={Array.from({ length: 12 }, (_, i) => ({
                id: i,
                value: i + 1,
                text: String(i + 1),
              }))}
              value={String(currentDate.getMonth() + 1).padStart(2, '0')}
              onChange={(value: number) =>
                setCurrentDate(new Date(currentDate.getFullYear(), value - 1, currentDate.getDate()))
              }
              priorityFontClass="text-[#121316] text-base leading-6 font-semibold"
              dropdownWidth="w-20"
            />
            {/* <Typography variant="title3" className="cursor-pointer" onClick={() => setMonthFilter(true)}>
              {String(currentDate.getMonth() + 1).padStart(2, '0')}
            </Typography> */}
          </div>
          <button onClick={handleNextMonth} className="p-2">
            <SVGIcon.Arrow weight="bold" color="gray700" size={16} rotate={180} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid w-full grid-cols-7 gap-2">
          {weekdays.map((day, index) => (
            <Typography
              variant="caption"
              key={day}
              className={`text-center ${
                index === 0 ? 'text-old-primary-red-400' : index === 6 ? 'text-old-primary-blue-400' : 'text-gray-500'
              }`}
            >
              {day}
            </Typography>
          ))}
        </div>

        {/* 날짜 */}
        <div className="relative grid w-[248px] grid-cols-7 gap-y-1">
          {dates.map(({ date: calendarDate, isCurrentMonth }) => (
            <div key={calendarDate.toISOString()} className={`relative flex items-center justify-center`}>
              {localDate.startDate &&
                localDate.endDate &&
                isBetween(calendarDate, localDate.startDate, localDate.endDate) && (
                  <div className="bg-primary-100 absolute inset-0 h-full w-full"></div>
                )}
              {localDate.startDate && isSameDay(calendarDate, localDate.startDate) && (
                <div className="bg-primary-100 absolute inset-y-0 left-1/2 h-full w-1/2"></div>
              )}
              {localDate.endDate && isSameDay(calendarDate, localDate.endDate) && (
                <div className="bg-primary-100 absolute inset-y-0 right-1/2 h-full w-1/2"></div>
              )}
              <Typography
                variant="body3"
                className={`z-10 flex h-8 w-8 cursor-pointer items-center justify-center font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isSameDay(calendarDate, today) ? 'border-primary-400 rounded-full border' : ''} ${
                  localDate.startDate && isSameDay(calendarDate, localDate.startDate)
                    ? 'bg-primary-800 rounded-full text-white'
                    : localDate.endDate && isSameDay(calendarDate, localDate.endDate)
                      ? 'bg-primary-800 rounded-full text-white'
                      : ''
                }`}
                onClick={() => handleDateSelect(calendarDate)}
              >
                {calendarDate.getDate()}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full border-t border-gray-200"></div>
      <div className="flex w-[248px] flex-row items-center justify-between gap-4">
        <Typography variant="body3" className="font-medium text-gray-700">
          활동 주기
        </Typography>
        <Input.Basic
          className="flex-1"
          placeholder="예) 매주 2회, 격주 3회"
          value={localDate.cycle || ''}
          onChange={(e) => handleCycleChange(e.target.value)}
        />
      </div>
      <div className="w-full border-t border-gray-200"></div>
      <footer className="flex w-full flex-row items-center justify-end gap-2 px-4">
        <ButtonV2 color="gray100" variant="solid" size={32} onClick={onCancel}>
          취소
        </ButtonV2>
        <ButtonV2 color="orange800" variant="solid" size={32} onClick={handleSave}>
          적용
        </ButtonV2>
      </footer>
    </div>
  )
}

export default ScheduleAndPeriodPicker
