import { format, toDate } from 'date-fns'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/commonUtil'
import { Box } from '@/atoms/Box'
import { Button } from '@/atoms/Button'
import { Calendar, type DateRange } from '@/atoms/Calendar'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/atoms/Popover'
import { DateUtil } from '@/legacy/util/date'

interface DateRangePickerProps {
  dateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
  align?: 'start' | 'end'
  children?: React.ReactNode
}

/**
 * DateRangePicker
 * @desc DateRangePicker 컴포넌트
 * @link [DateRangePicker - shadcn](https://ui.shadcn.com/docs/components/date-picker)
 * @author jujoycode
 */
export function DateRangePicker({ children, align = 'start', dateRange, setDateRange }: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent align={align} className="flex w-auto flex-col space-y-2 p-2">
        <Box className="rounded-md border">
          <Calendar
            initialFocus
            mode="range"
            selected={dateRange}
            numberOfMonths={2}
            onSelect={(date) => date && setDateRange(date)}
          />
        </Box>
      </PopoverContent>
    </Popover>
  )
}

interface DefaultDateRangePickerProps {
  dateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
}

/**
 * DefaultDatePicker
 * @desc 기본 DateRangePicker Preset
 * @author jujoycode
 */
function DefaultDateRangePicker({ dateRange, setDateRange }: DefaultDateRangePickerProps) {
  const { currentLanguage } = useLanguage()
  const formatDate = (date: Date) => {
    if (currentLanguage === 'ko') {
      return format(date, 'yyyy년 MM월 dd일')
    }
    return format(date, 'yyyy.MM.dd')
  }

  return (
    <Flex direction="row" items="center" width="full" className="rounded-md border-1">
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange}>
        <Button
          variant="ghost"
          className={cn('w-full justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}
        >
          <Flex items="center" justify="start" gap="1.5">
            <Icon name="ssCalendar" size="sm" />
            {dateRange?.from && dateRange?.to ? (
              <>
                {formatDate(dateRange.from)} ~ {formatDate(dateRange.to)}
              </>
            ) : (
              <span>날짜를 선택해주세요.</span>
            )}
          </Flex>
        </Button>
      </DateRangePicker>

      <Box className="pr-3">
        <Flex
          items="center"
          justify="end"
          onClick={() => {
            setDateRange({ from: toDate(DateUtil.getAMonthAgo(new Date())), to: new Date() })
          }}
          className="cursor-pointer rounded-full p-1 hover:bg-gray-50"
        >
          <Icon name="X" customSize={{ width: '12px', height: '12px' }} stroke color="gray-700" />
        </Flex>
      </Box>
    </Flex>
  )
}
DateRangePicker.Default = DefaultDateRangePicker
