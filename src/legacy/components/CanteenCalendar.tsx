import Calendar, { CalendarProps } from 'react-calendar'

import { useLanguage } from '@/legacy/hooks/useLanguage'

import { Icon } from './common/icons'

export interface CanteenCalendarProps extends CalendarProps {}

export function CanteenCalendar({ ...props }: CanteenCalendarProps) {
  const { t } = useLanguage()

  return (
    <Calendar
      calendarType="gregory"
      locale={`${t('language')}`}
      prevLabel={<Icon.ChevronLeft />}
      nextLabel={<Icon.ChevronRight />}
      prev2Label={null}
      next2Label={null}
      formatDay={(_, date) => date.getDate().toString()}
      {...props}
    />
  )
}
