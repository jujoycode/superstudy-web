import { useEffect } from 'react'
import { getDay, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface FieldtripDatePickerProps {
  disabled?: boolean
  selectedDate: Date | null
  excludeDates: Date[]
  hasSaturdayClass?: boolean
  minDate?: Date | null
  maxDate?: Date | null
  placeholderText: string
  onChange: (date: Date | null) => void
}

export function FieldtripDatePicker({
  disabled,
  selectedDate,
  excludeDates,
  hasSaturdayClass,
  minDate,
  maxDate,
  placeholderText,
  onChange,
}: FieldtripDatePickerProps) {
  // 두 날짜가 같은 날인지 확인하는 함수
  const isSameDay = (date1: Date | null, date2: Date) => {
    if (date1) {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      )
    } else {
      return false
    }
  }

  useEffect(() => {
    if (selectedDate) {
      const newDate = selectedDate

      while (excludeDates.some((excludeDate) => isSameDay(newDate, excludeDate))) {
        newDate.setDate(newDate.getDate() + 1)
      }
      if (!isSameDay(newDate, selectedDate)) {
        onChange(newDate)
      }
    }
  })

  const CustomInput = (props: any) => {
    return (
      <input
        className="focus:border-primary-800 flex w-full flex-1 rounded-md border border-gray-200 px-4 py-3 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
        disabled={props.disabled}
        placeholder={props.placeholder}
        onClick={props.onClick}
        value={props.value}
        type="text"
        readOnly
      />
    )
  }

  const isWeekday = (date: Date) => {
    const day = getDay(date)
    return day !== 0 && (hasSaturdayClass || day !== 6)
  }

  return (
    <DatePicker
      disabled={!!disabled}
      locale={ko}
      dateFormat="yyyy-MM-dd"
      wrapperClassName="flex flex-1 mr-4"
      minDate={minDate || undefined}
      maxDate={maxDate || undefined}
      filterDate={isWeekday}
      closeOnScroll
      placeholderText={placeholderText}
      selected={selectedDate}
      excludeDates={excludeDates}
      onChange={onChange}
      customInput={<CustomInput />}
      dayClassName={(date) => {
        const day = getDay(date)
        if (isToday(date)) {
          return ''
        }
        if (day === 0) {
          return 'text-red-500 text-opacity-50'
        }
        if (day === 6) {
          if (hasSaturdayClass) {
            if (
              excludeDates.find(
                (item) =>
                  item.getFullYear() === date.getFullYear() &&
                  item.getMonth() === date.getMonth() &&
                  item.getDate() === date.getDate(),
              )
            ) {
              return 'text-blue-500 text-opacity-50'
            } else {
              return 'text-blue-500'
            }
          } else {
            return 'text-blue-500 text-opacity-50'
          }
        }
        return ''
      }}
    />
  )
}
