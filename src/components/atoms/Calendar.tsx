import { format } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/commonUtil'
import { buttonVariant } from '@/atoms/Button'

export type { DateRange }

/**
 * Calendar
 * @desc Picker용 Calendar 컴포넌트
 * @link [Calendar - shadcn](https://ui.shadcn.com/docs/components/calendar)
 * @author jujoycode
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const { currentLanguage } = useLanguage()

  // * 추후 언어가 추가될 경우, 대안 필요
  const formatCaption = (date: Date) => {
    if (currentLanguage === 'ko') {
      return format(date, 'yyyy년 MM월', { locale: ko })
    }
    return format(date, 'yyyy. MM', { locale: enUS })
  }

  return (
    <DayPicker
      locale={currentLanguage === 'ko' ? ko : enUS}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      formatters={{ formatCaption }}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-12',
        month: 'flex flex-col gap-4',
        caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        nav_button: cn(buttonVariant.outline, 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-x-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(buttonVariant.link, 'size-8 p-0 font-normal aria-selected:opacity-100  rounded-md'),
        day_range_start: 'day-range-start aria-selected:bg-primary-700 aria-selected:text-white',
        day_range_end: 'day-range-end aria-selected:bg-primary-700 aria-selected:text-white',
        day_selected: 'bg-primary-50 text-gray-900 focus:bg-primary-700 focus:text-white',
        day_today: 'bg-primary-100 text-primary-700 rounded-md',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-primary-50 aria-selected:text-gray-900 focus:outline-none focus-visible:outline-none',
        day_range_middle: 'aria-selected:bg-primary-50 aria-selected:text-gray-900',
        day_disabled: 'text-muted-foreground opacity-50',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => <ChevronLeft className={cn('size-4', className)} {...props} />,
        IconRight: ({ className, ...props }) => <ChevronRight className={cn('size-4', className)} {...props} />,
      }}
      {...props}
    />
  )
}
