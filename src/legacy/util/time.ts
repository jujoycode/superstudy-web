import { addDays, differenceInBusinessDays, differenceInDays, format, getDay } from 'date-fns'
import { some } from 'lodash'
import { TZDate } from 'tui-calendar'

import type { Schedule } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export const makeDateToString = (date: Date | string, connector = '-') => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  const year = date.getFullYear()
  let month: any = date.getMonth() + 1
  if (String(month).length === 1) month = '0' + String(month)
  let day: any = date.getDate()
  if (String(day).length === 1) day = '0' + String(day)
  return `${year}${connector}${month}${connector}${day}`
}

export const makeMonthDayToString = (date: Date) => {
  const month: any = date.getMonth() + 1
  const day: any = date.getDate()
  return `${month}월 ${day}일`
}

export const makeMonthDayWithDayOfWeekToString = (date: Date) => {
  const month: any = date.getMonth() + 1
  const day: any = date.getDate()
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토']
  const dayOfWeekStr = dayOfWeek[date.getDay()]
  return `${month}월 ${day}일 (${dayOfWeekStr})`
}

export const makeMonthDayToStringEN = (date: Date) => {
  return format(date, 'MMM d')
}

export const makeDateToStringByFormat = (date: Date) => {
  const year = date.getFullYear()
  let month: any = date.getMonth() + 1
  if (String(month).length === 1) month = '0' + String(month)
  let day: any = date.getDate()
  if (String(day).length === 1) day = '0' + String(day)

  const week = ['일', '월', '화', '수', '목', '금', '토']
  const dayOfWeek = week[date.getDay()]

  return `${year}. ${month}. ${day} ${dayOfWeek}`
}

export const makeTimeToString = (date: Date | string) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  let hour = date.getHours().toString()
  if (hour.length === 1) hour = '0' + hour
  let min = date.getMinutes().toString()
  if (min.length === 1) min = '0' + min
  return `${hour}:${min}`
}

export const MonthAgo = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setMonth(date.getMonth() - 1)
  return newDate
}

export const twoMonthAgo = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setMonth(date.getMonth() - 2)
  return newDate
}

export const weekAgo = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setDate(date.getDate() - 27)
  return newDate
}

export const weekAfter = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setDate(date.getDate() + 7)
  return newDate
}

export const twoMonthAfter = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setMonth(date.getMonth() + 2)
  return newDate
}

export const DayAfter = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setDate(date.getDate() + 1)
  return newDate
}

export const DayAgo = (date: Date) => {
  const newDate = new Date(date.getTime())
  newDate.setDate(date.getDate() - 1)
  return newDate
}

export const makeStartEndToString = (startAt: string, endAt: string, reportType = '결석', connector = '-') => {
  const startDate = new Date(startAt)
  const endDate = new Date(endAt)

  if (reportType === '확인' && makeDateToString(startDate) !== makeDateToString(endDate)) {
    return `${makeDateToString(startDate, connector)} ${makeTimeToString(startDate)} ~
${makeDateToString(endDate, connector)} ${makeTimeToString(endDate)}`
  }

  if (reportType === '결석' && makeDateToString(startDate) !== makeDateToString(endDate)) {
    return `${makeDateToString(startDate, connector)} ~ ${makeDateToString(endDate, connector)}`
  }
  return `${makeDateToString(startDate, connector)}`
}

export const makeDateToStringType2 = (date: Date) => {
  const month: any = date.getMonth() + 1
  const day: any = date.getDate()
  return `${month}월 ${day}일`
}

export const makeDateToString2 = (date: Date | string) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  const year = date.getFullYear()
  const month: any = date.getMonth() + 1
  const day: any = date.getDate()
  return `${year}년 ${month}월 ${day}일`
}

export const makeStartEndToStringType2 = (startAt: string, endAt: string) => {
  const startDate = new Date(startAt)
  const endDate = new Date(endAt)
  const connector = '-'
  if (makeDateToString(startDate) !== makeDateToString(endDate)) {
    return `${makeDateToString(startDate, connector)} ${makeTimeToString(startDate)} ~ ${makeDateToString(
      endDate,
      connector,
    )} ${makeTimeToString(endDate)}`
  }
  return `${makeDateToString(startDate, connector)} ${makeTimeToString(startDate)} ~
${makeDateToString(endDate, connector)} ${makeTimeToString(endDate)}`
}

export const makeTZDateToString = (_date: TZDate, view = 'month') => {
  const date = _date.toDate()
  const year = date.getFullYear()
  let month: any = date.getMonth() + 1
  if (String(month).length === 1) month = '0' + String(month)
  let day: any = date.getDate()
  if (String(day).length === 1) day = '0' + String(day)

  switch (view) {
    case 'month':
      return `${year}년 ${month}월`
    case 'week':
      return `${year}년 ${month}월`
    case 'day':
      return `${year}년 ${month}월 ${day}일`
  }
}

export const calcBusinessDays = (startDate: Date | string, endDate: Date | string) => {
  if (!(startDate instanceof Date)) {
    startDate = new Date(startDate)
  }
  if (!(endDate instanceof Date)) {
    endDate = new Date(endDate)
  }
  if (startDate >= endDate) {
    return 0
  }
  let count = 0
  const curDate = new Date(startDate.getTime())
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++
    curDate.setDate(curDate.getDate() + 1)
  }
  return count
}

export const calcBusinessDaysWithSchedules = (
  startDate: Date | string,
  endDate: Date | string,
  schedules: Schedule[],
) => {
  if (!(startDate instanceof Date)) {
    startDate = new Date(startDate)
  }
  if (!(endDate instanceof Date)) {
    endDate = new Date(endDate)
  }
  if (startDate >= endDate) {
    return 0
  }
  let count = 0
  const curDate = new Date(startDate.getTime())
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isInSchedule(curDate, schedules)) {
      count++
    }
    curDate.setDate(curDate.getDate() + 1)
  }
  return count
}

export const isInSchedule = (date: Date | string, schedules: Schedule[]) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  let result = false
  schedules?.map((schedule: Schedule) => {
    const start = new Date(schedule.start || '')
    if (schedule.isAllDay) {
      const end = start
      end.setDate(end.getDate() + 1)
      end.setHours(0)
      end.setMinutes(0)
      end.setSeconds(0)
      if (start <= date && date <= end) result = true
    }
    const end = new Date(schedule.end || '')
    if (start <= date && date <= end) result = true
  })
  return result
}

const isContainSchedule = (startDate: Date, schedule: Schedule) => {
  let { start, end } = schedule
  if (!(start instanceof Date)) {
    start = new Date(start)
  }
  start.setHours(0)
  start.setMinutes(0)
  start.setSeconds(0)
  if (!(end instanceof Date)) {
    end = new Date(end)
  }
  end.setHours(23)
  end.setMinutes(59)
  end.setSeconds(59)
  return +start <= +startDate && +startDate < +end
}

export const differenceWithSchedules = (
  startDate: Date | string,
  endDate: Date | string,
  schedules: Schedule[] | undefined,
) => {
  const _startDate: Date = new Date(startDate)
  _startDate.setHours(0)
  _startDate.setMinutes(0)
  _startDate.setSeconds(0)
  const _endDate: Date = new Date(endDate)
  if (_startDate > _endDate) {
    return 0
  }
  if (
    makeDateToString(_startDate) === makeDateToString(_endDate) &&
    !some(schedules, (schedule) => isContainSchedule(_startDate, schedule))
  ) {
    return 1
  }
  if (!schedules || schedules.length === 0) {
    if (isWeekendDay(_endDate)) {
      return differenceInBusinessDays(_endDate, _startDate)
    }
    return differenceInBusinessDays(_endDate, _startDate) + 1
  }
  let result = 0
  const diffDay = differenceInDays(_endDate, _startDate)
  for (let i = 0; i <= diffDay; i++) {
    const tempDate = addDays(_startDate, i)
    const day = getDay(tempDate)
    if (day !== 0 && day !== 6 && !some(schedules, (schedule) => isContainSchedule(tempDate, schedule))) {
      result++
    }
  }
  return result
}

export const differenceWithSchedulesWithHalfDay = (
  startDate: Date | string,
  endDate: Date | string,
  useStartHalf: boolean,
  useEndHalf: boolean,
  schedules: Schedule[] | undefined,
  hasSaturdayClass?: boolean,
) => {
  let totalUsedDayCnt = 0.0 // 전체 사용일수
  let sHalfUsedDayCnt = 0.0 // 시작반일 사용시 0.5 fix
  let wholeUsedDayCnt = 0.0 // 반일 외 사용일수
  let eHalfUsedDayCnt = 0.0 // 종료반일 사용시 0.5 fix
  let sHalfDate = ''
  let wholeStartDate = ''
  let wholeEndDate = ''
  let eHalfDate = ''

  const _startDate: Date = new Date(startDate)
  _startDate.setHours(0)
  _startDate.setMinutes(0)
  _startDate.setSeconds(0)
  const _endDate: Date = new Date(endDate)

  wholeStartDate = DateUtil.formatDate(_startDate, DateFormat['YYYY-MM-DD'])
  sHalfDate = wholeStartDate
  wholeEndDate = DateUtil.formatDate(_endDate, DateFormat['YYYY-MM-DD'])
  eHalfDate = wholeEndDate

  if (_startDate > _endDate) {
    // 시작날짜가 종료날짜보다 크면 error
    totalUsedDayCnt = 0.0
  } else if (
    wholeStartDate === wholeEndDate &&
    !some(schedules, (schedule) => isContainSchedule(_startDate, schedule))
  ) {
    // 시작일과 종료일이 같고, 스케줄에 포함된 날짜도 아닌경우,
    totalUsedDayCnt = 1.0
    wholeUsedDayCnt = 1.0
    if (useStartHalf || useEndHalf) {
      wholeUsedDayCnt = 0.0
      totalUsedDayCnt = 0.5
      sHalfUsedDayCnt = 0.5
      eHalfUsedDayCnt = 0.0
    }
    // } else if (!schedules || schedules.length === 0) {
    //   // 등록된 스케줄이 없을 때,
    //   if (isWeekendDay(_endDate)) {
    //     // 종료일이 주말인경우,
    //     totalUsedDayCnt = differenceInBusinessDays(_endDate, _startDate);
    //   }else {
    //     // 종료일이 주중인경우,
    //     totalUsedDayCnt = differenceInBusinessDays(_endDate, _startDate) + 1;
    //   }
  } else {
    let result = 0
    const diffDay = differenceInDays(_endDate, _startDate)
    for (let i = 0; i <= diffDay; i++) {
      const tempDate = addDays(_startDate, i)
      const day = getDay(tempDate)
      if (
        day !== 0 &&
        (hasSaturdayClass || day !== 6) &&
        (!schedules || schedules.length === 0 || !some(schedules, (schedule) => isContainSchedule(tempDate, schedule)))
      ) {
        result++
        if (useStartHalf && result === 2) {
          wholeStartDate = DateUtil.formatDate(tempDate, DateFormat['YYYY-MM-DD'])
        }
        if (!useEndHalf || i < diffDay) {
          wholeEndDate = DateUtil.formatDate(tempDate, DateFormat['YYYY-MM-DD'])
        }
      }
    }

    sHalfUsedDayCnt = useStartHalf ? 0.5 : 0.0
    eHalfUsedDayCnt = useEndHalf ? 0.5 : 0.0
    wholeUsedDayCnt = result - (useStartHalf ? 1.0 : 0.0) - (useEndHalf ? 1.0 : 0.0)
    totalUsedDayCnt = sHalfUsedDayCnt + wholeUsedDayCnt + eHalfUsedDayCnt
  }

  return {
    totalUsedDayCnt,
    sHalfUsedDayCnt,
    wholeUsedDayCnt,
    eHalfUsedDayCnt,
    sHalfDate,
    wholeStartDate,
    wholeEndDate,
    eHalfDate,
  }
}

export const fieldtripPeriodDayCnt = (
  usedDays: number | undefined,
  startPeriodS: number | undefined,
  endPeriodE: number | undefined,
) => {
  const totalUsedDayCnt = usedDays || 0 // 전체 사용일수
  const sHalfUsedDayCnt = usedDays && startPeriodS ? 0.5 : 0.0 // 시작반일 사용시 0.5 fix
  const eHalfUsedDayCnt =
    usedDays && ((usedDays >= 1 && endPeriodE) || (usedDays < 1 && endPeriodE && !sHalfUsedDayCnt)) ? 0.5 : 0.0 // 종료반일 사용시 0.5 fix
  const wholeUsedDayCnt = totalUsedDayCnt - sHalfUsedDayCnt - eHalfUsedDayCnt // 반일 외 사용일수

  return {
    totalUsedDayCnt,
    sHalfUsedDayCnt,
    wholeUsedDayCnt,
    eHalfUsedDayCnt,
  }
}

export const isWeekendDay = (date: Date, hasSaturdayClass?: boolean) => {
  const day = getDay(date)
  return day === 0 || (!hasSaturdayClass && day === 6)
}

export const isWeekday = (date: Date) => {
  const day = getDay(date)
  return day !== 0 && day !== 6
}

export const isValidDate = (date: Date | string) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return date.getTime() === date.getTime()
}

export const getStartDate = (startDate: string) => {
  const _start = new Date(startDate)
  _start.setHours(0)
  _start.setMinutes(0)
  _start.setSeconds(0)
  return _start.toISOString()
}

export const getEndDate = (endDate: string) => {
  const _end = new Date(endDate)
  _end.setHours(23)
  _end.setMinutes(59)
  _end.setSeconds(59)
  return _end.toISOString()
}

// 로컬시간 형식 yyyy-MM-dd 로 변경
export const toLocaleDateFormatString = (utc: Date) => {
  return utc.toLocaleString('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/// input : day:Date - 선택한 날짜
/// output : 선택한 날짜가 몇째주 인지, 해당 주에 월~토요일의 날짜 리턴
export const weekCount = (
  day: Date,
): [week: number, monday: Date, tuesday: Date, wednesday: Date, thursday: Date, friday: Date, saturday: Date] => {
  const year = day.getFullYear()
  const countDay = new Date(year, 0, 1)
  const weekday = countDay.getDay()
  let week = 0
  if (weekday <= 6) {
    countDay.setDate(countDay.getDate() - weekday)
  } else {
    countDay.setDate(countDay.getDate() - weekday + 7)
  }

  //let week = weekday <= 5 ? 1 : 0;  // 토요일 (6) 부터 시작하는 년은 1월2일(차주 일요일)부터 1주차
  while (day > countDay) {
    countDay.setDate(countDay.getDate() + 7)
    week++
  } //while
  const monday = new Date(day)
  monday.setDate(day.getDate() - day.getDay() + 1)
  const tuesday = new Date(monday)
  tuesday.setDate(tuesday.getDate() + 1)
  const wednesday = new Date(tuesday)
  wednesday.setDate(wednesday.getDate() + 1)
  const thursday = new Date(wednesday)
  thursday.setDate(thursday.getDate() + 1)
  const friday = new Date(thursday)
  friday.setDate(friday.getDate() + 1)
  const saturday = new Date(friday)
  saturday.setDate(saturday.getDate() + 1)

  return [week, monday, tuesday, wednesday, thursday, friday, saturday]
}

export const getThisYear = () => {
  const toDay = new Date()
  const year = toDay.getMonth() + 1 >= 3 ? toDay.getFullYear() : toDay.getFullYear() - 1

  return String(year)
}

// 현재 학년도와 월을 받아서 검색 조건에 사용할 연도를 반환
export const getSearchYearByMonth = (academicYear: number, month: number) => {
  return month >= 3 ? academicYear : academicYear + 1 // 3월 이후는 현재 학년도, 2월 이하는 다음해
}

export const getThisYearStartDay = () => {
  const start = new Date()
  start.setFullYear(Number(getThisYear()))
  start.setMonth(2)
  start.setDate(1)

  return start
}

export const isThisYear = (date: string) => {
  const checkDay = new Date(date)

  return checkDay >= getThisYearStartDay()
}

export const getThisSemester = () => {
  const date = new Date()
  const semester = date.getMonth() + 1 >= 3 && date.getMonth() + 1 <= 7 ? 1 : 2

  return String(semester)
}

export const getDayOfYear = (date: Date) => {
  const year = date.getMonth() + 1 >= 3 ? date.getFullYear() : date.getFullYear() - 1

  return String(year)
}

export const getDayOfSemester = (date: Date) => {
  const semester = date.getMonth() + 1 >= 3 && date.getMonth() + 1 <= 7 ? 1 : 2

  return String(semester)
}

export const getStartDayOfSemester = (date: Date) => {
  const semester = getDayOfSemester(date)

  const start = new Date()
  start.setFullYear(Number(getDayOfYear(date)))
  start.setMonth(semester === '1' ? 2 : 7)
  start.setDate(1)

  return start
}

export const getEndDayOfSemester = (date: Date) => {
  const semester = getDayOfSemester(date)
  const year = Number(getDayOfYear(date))

  const start = new Date()
  start.setFullYear(semester === '1' ? year : year + 1)
  start.setMonth(semester === '1' ? 7 : 2)
  start.setDate(0)

  return start
}

export const getCalendarRange = (date: Date): [Date, Date] => {
  const start = new Date(date)
  start.setDate(1)
  start.setHours(0)
  start.setMinutes(0)
  start.setSeconds(0)
  start.setDate(start.getDate() - start.getDay() - 1)
  const end = new Date(date)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0)
  end.setHours(23)
  end.setMinutes(59)
  end.setSeconds(59)
  end.setDate(end.getDate() + 7 - end.getDay())
  return [start, end]
}

export const makeHHmmString = (hours24: number, minutes: number) => {
  return (
    (String(hours24).length === 1 ? '0' : '') +
    String(hours24) +
    ':' +
    (String(minutes).length === 1 ? '0' : '') +
    String(minutes)
  )
}

export const getHoursfromHHmmString = (HHmm: string | undefined, defaultValue: number) => {
  return HHmm ? Number(HHmm.split(':')[0]) : defaultValue
}

export const getMinutesfromHHmmString = (HHmm: string | undefined, defaultValue: number) => {
  return HHmm ? Number(HHmm.split(':')[1]) : defaultValue
}

/*
 HH:mm 형식의 시간이 현재시간과 비교하여 지났으면 true
*/
export const isNowOrFuture = (HHmm: string) => {
  const nowH = new Date().getHours()
  const nowM = new Date().getMinutes()

  const [checkH, checkM] = HHmm.split(':').map(Number)

  if (isNaN(checkH) || isNaN(checkM) || checkH < 0 || checkH > 23 || checkM < 0 || checkM > 59) {
    return undefined
  }

  if (nowH < checkH || (nowH === checkH && nowM <= checkM)) {
    return true
  } else {
    return false
  }
}

export const isSameMinute = (time1: string, time2: string) => {
  return time1.substring(0, 16) === time2.substring(0, 16)
}

export const isSameDay = (time1: string, time2: string) => {
  const d1 = new Date(time1)
  const d2 = new Date(time2)

  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export const convertTimeToKorean = (timeString: string) => {
  const [hourStr, minuteStr] = timeString.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  let meridiem = '오전'

  if (hour >= 12) {
    meridiem = '오후'
    if (hour > 12) {
      hour -= 12
    }
  }

  return `${meridiem} ${hour}시 ${minute}분`
}

const getWeekDates = (year: number, week: number) => {
  const januaryFirst = new Date(year, 0, 1)
  const firstDayOfWeekOne = januaryFirst.getDay()
  const daysToAdd = (week - 1) * 7

  // 주의 시작 날짜 계산
  const startDate = new Date(year, 0, 1 + daysToAdd + (7 - firstDayOfWeekOne))

  // 주의 종료 날짜 계산
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  return { startDate, endDate }
}

export const WeekList = (year: number, semester: number) => {
  const weeksArray = []

  let startWeek = 8
  let endWeek = 32

  if (semester === 2) {
    startWeek = 30
    endWeek = 61
  }

  for (let i = startWeek; i < endWeek; i++) {
    const { startDate, endDate } = getWeekDates(year, i)

    const weekString = `${i + 1}주 ${makeDateToStringType2(startDate)}~${makeDateToStringType2(endDate)}`
    weeksArray.push(weekString)
  }

  return weeksArray
}

// 윤년 계산
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// 현재 학년도 해당 월 계산
export const getCurrentSchoolYear = () => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  // 1-2월이면 전년도 학년도, 3-12월이면 현재년도 학년도
  const schoolYear = currentMonth < 3 ? currentYear - 1 : currentYear
  const nextYear = schoolYear + 1

  return {
    start: `${schoolYear}-03-01`,
    end: `${nextYear}-02-${isLeapYear(nextYear) ? '29' : '28'}`,
  }
}

export const getSchoolYear = (date: Date) => {
  return String(date.getMonth() + 1 >= 3 ? date.getFullYear() : date.getFullYear() - 1)
}
