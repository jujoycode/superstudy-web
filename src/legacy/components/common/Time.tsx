import { cn } from '@/utils/commonUtil'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { ko } from 'date-fns/locale'
import { TimeHTMLAttributes } from 'react'

export interface TimeProps extends TimeHTMLAttributes<HTMLTimeElement> {
  date?: string | null
  format?: string
  formatDistanceToNow?: boolean
}

export function Time({
  date,
  format: formatString = 'yyyy.MM.dd HH:mm:ss',
  formatDistanceToNow,
  className,
  ...props
}: TimeProps) {
  return (
    <time className={cn('time', className)} {...props}>
      {date &&
        (formatDistanceToNow
          ? formatDistanceToNowStrict(new Date(date), { locale: ko, addSuffix: true })
          : format(new Date(date), formatString, { locale: ko }))}
    </time>
  )
}
