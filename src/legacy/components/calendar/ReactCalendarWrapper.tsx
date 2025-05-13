//@ts-ignore
import TuiCalendar from '@toast-ui/react-calendar'
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import 'tui-calendar/dist/tui-calendar.css'

// Calendar 컴포넌트의 props 타입 정의
interface CalendarProps {
  height?: string
  calendars?: any[]
  disableDblClick?: boolean
  disableClick?: boolean
  isReadOnly?: boolean
  month?: {
    startDayOfWeek?: number
  }
  scheduleView?: boolean
  taskView?: boolean | string[]
  template?: {
    monthDayname?: (model: any) => string
    milestone?: (schedule: any) => string
    milestoneTitle?: () => string
    allday?: (schedule: any) => string
    alldayTitle?: () => string
    [key: string]: any
  }
  theme?: any
  timezones?: Array<{
    timezoneOffset: number
    displayLabel: string
    tooltip: string
    timezoneName: string
  }>
  useDetailPopup?: boolean
  defaultView?: string
  view?: string
  [key: string]: any
}

/**
 * React 19와 호환되는 Toast UI Calendar 래퍼 컴포넌트
 * ReactCurrentDispatcher 오류를 우회하기 위한 래퍼
 */
const ReactCalendarWrapper = forwardRef<any, CalendarProps>((props, ref) => {
  const calendarRef = useRef(null)

  // 부모 컴포넌트에서 ref로 접근할 수 있도록 내부 메서드 노출
  useImperativeHandle(ref, () => ({
    getInstance: () => {
      // @ts-ignore
      return calendarRef.current?.getInstance()
    },
  }))

  useEffect(() => {
    // 컴포넌트가 마운트된 후 필요한 초기화 작업
    const calendar = calendarRef.current
    if (calendar) {
      // 추가 초기화 작업이 필요하면 여기에 구현
    }
  }, [])

  return <TuiCalendar {...props} ref={calendarRef} />
})

export default ReactCalendarWrapper
