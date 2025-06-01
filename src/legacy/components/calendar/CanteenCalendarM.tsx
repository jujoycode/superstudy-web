import { useState } from 'react'
import { addMonths } from 'date-fns'
import Calendar, { CalendarProps } from 'react-calendar'
import { useLanguage } from '@/hooks/useLanguage'
import { Typography } from '@/legacy/components/common/Typography'
import SVGIcon from '@/legacy/components/icon/SVGIcon'

export interface CanteenCalendarProps extends CalendarProps {}

export function CanteenCalendarM({ value, onActiveStartDateChange, ...props }: CanteenCalendarProps) {
  const { t } = useLanguage()
  const [internalStartDate, setInternalStartDate] = useState(value instanceof Date ? value : new Date())

  const handleMonthChange = (months: number) => {
    const newDate = addMonths(internalStartDate, months)
    setInternalStartDate(newDate)
    onActiveStartDateChange?.({ activeStartDate: newDate, view: 'month', action: 'onChange', value: newDate })
  }

  return (
    <Calendar
      calendarType="gregory"
      locale={`${t('language')}`}
      prevLabel={null}
      nextLabel={null}
      prev2Label={null}
      next2Label={null}
      formatDay={(_, date) => date.getDate().toString()}
      navigationLabel={({ label }) => (
        <div className="flex cursor-default items-center justify-between px-2.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMonthChange(-1)
            }}
            className="flex h-8 w-8 items-center justify-center"
          >
            <SVGIcon.Arrow size={16} weight="bold" color="gray700" />
          </button>
          <Typography variant="title2" className="font-semibold">
            {label}
          </Typography>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMonthChange(1)
            }}
            className="flex h-8 w-8 items-center justify-center"
          >
            <SVGIcon.Arrow size={16} weight="bold" color="gray700" rotate={180} />
          </button>
        </div>
      )}
      activeStartDate={internalStartDate}
      {...props}
    />
  )
}
