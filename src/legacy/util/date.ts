// ? 고도화 필요
// date-fns...
import moment from 'moment'

export enum DateFormat {
  'YYYY-MM-DD' = 'YYYY-MM-DD',
  'YYYY/MM/DD' = 'YYYY/MM/DD',
  'YYYY년MM월DD일' = 'YYYY년MM월DD일',
  'YYYY년 MM월 DD일' = 'YYYY년 MM월 DD일',
  'YYYY년 M월 D일' = 'YYYY년 M월 D일',
  'HH:mm' = 'HH:mm',
  'MM-DD HH:mm' = 'MM-DD HH:mm',
  'YYYY-MM-DD HH:mm' = 'YYYY-MM-DD HH:mm',
  'YYYY.MM.DD' = 'YYYY.MM.DD',
  'YYYY.MM.DD HH:mm' = 'YYYY.MM.DD HH:mm',
  'YYYY.MM.DD a hh:mm' = 'YYYY.MM.DD a hh:mm',
}

export const DateUtil = {
  formatDate: (date: Date | string, format: DateFormat = DateFormat['YYYY-MM-DD']) => {
    if (date === '') return ''
    return moment(date).format(format)
  },
  getYear: () => {
    const now = moment()
    return now.year()
  },
  getSchoolYear: () => {
    const now = moment()
    const month = now.month() + 1
    const year = now.year()
    return month >= 3 ? year : year - 1
  },
  getLastSchoolYear: () => {
    const now = moment()
    const month = now.month() + 1
    const year = now.year()
    return month >= 3 ? year - 1 : year - 2
  },
  getAMonthAgo: (date: Date | string, format: DateFormat = DateFormat['YYYY-MM-DD']) => {
    const now = moment(date)
    return now.subtract(1, 'months').format(format)
  },
  getTwoMonthAgo: (date: Date | string, format: DateFormat = DateFormat['YYYY-MM-DD']) => {
    const now = moment(date)
    return now.subtract(2, 'months').format(format)
  },
  getStartDate: (date: Date | string) => {
    const now = moment(date)
    return now.startOf('day').toISOString()
  },
  getEndDate: (date: Date | string) => {
    const now = moment(date)
    return now.endOf('day').toISOString()
  },
  getStartMonthDate: (date: Date | string) => {
    const now = moment(date)
    return now.startOf('month').toISOString()
  },
  getEndMonthDate: (date: Date | string) => {
    const now = moment(date)
    return now.endOf('month').toISOString()
  },
  getTime: (date: Date | string) => {
    const now = moment(date)
    return now.format('HH:mm') // "00:00"
  },
}

export const dayOfKorWeek = (day: number) => {
  const daysOfWeek: string[] = ['일', '월', '화', '수', '목', '금', '토']
  return daysOfWeek[day]
}

export const dayOfEngWeek = (day: number) => {
  const daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wedensday', 'Thursday', 'Friday', 'Saturday']
  return daysOfWeek[day]
}
