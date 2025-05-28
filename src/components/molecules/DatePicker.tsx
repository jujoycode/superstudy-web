import { format } from 'date-fns'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/commonUtil'
import { Box } from '@/atoms/Box'
import { Button } from '@/atoms/Button'
import { Calendar } from '@/atoms/Calendar'
import { Flex } from '@/atoms/Flex'
import { Icon } from '@/atoms/Icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/atoms/Popover'

interface DatePickerProps {
  date: Date
  setDate: (date: Date) => void
  align?: 'start' | 'end'
  children?: React.ReactNode
}

/**
 * DatePicker
 * @desc DatePicker 컴포넌트
 * @link [DatePicker - shadcn](https://ui.shadcn.com/docs/components/date-picker)
 * @author jujoycode
 */
export function DatePicker({ children, align = 'start', date, setDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent align={align} className="flex w-auto flex-col space-y-2 p-2">
        <Box className="rounded-md border">
          <Calendar initialFocus mode="single" selected={date} onSelect={(date) => date && setDate(date)} />
        </Box>
      </PopoverContent>
    </Popover>
  )
}

interface DefaultDatePickerProps {
  date: Date
  setDate: (date: Date) => void
}

/**
 * DefaultDatePicker
 * @desc 기본 DatePicker Preset
 * @author jujoycode
 */
function DefaultDatePicker({ date, setDate }: DefaultDatePickerProps) {
  const { currentLanguage } = useLanguage()

  const formatDate = (date: Date) => {
    if (currentLanguage === 'ko') {
      return format(date, 'yyyy년 MM월 dd일')
    }
    return format(date, 'yyyy.MM.dd')
  }

  return (
    <DatePicker date={date} setDate={setDate}>
      <Button
        variant="ghost"
        className={cn(
          'w-[240px] justify-start text-left font-normal',
          !date && 'text-muted-foreground',
          'rounded-md border-1',
          'w-full',
        )}
      >
        <Flex items="center" justify="start" gap="1.5">
          <Icon name="ssCalendar" size="sm" />
          {date ? formatDate(date) : <span>날짜를 선택해주세요.</span>}
        </Flex>
      </Button>
    </DatePicker>
  )
}
DatePicker.Default = DefaultDatePicker
