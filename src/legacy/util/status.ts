// import preval from 'preval.macro'
// import { format } from 'date-fns'

import type { errorType } from '@/legacy/types'

export const padLeftstr = (number: string | number, length: number = 2, character = '0'): string => {
  let result = String(number)
  if (result) {
    for (let i = result.length; i < length; ++i) {
      result = character + result
    }
    return result
  } else {
    return ''
  }
}

export const makeStudNum5 = (klass: string | { grade: number; classNum: number; studentNum: number }): string => {
  if (typeof klass === 'string') {
    const result = klass.replace('학년', '$').replace('반', '$').replace(' ', '').split('$')
    return result[0] + padLeftstr(result[1], 2) + padLeftstr(result[2], 2)
  } else {
    return String(klass.grade) + padLeftstr(klass.classNum, 2) + padLeftstr(klass.studentNum, 2)
  }
}

export const checkNewVersion = () => {
  // 빌드 시간을 사용합니다
  const buildDateNew = import.meta.env.VITE_BUILD_TIME
  const buildDateOld = localStorage.getItem('buildDate')
  if (buildDateNew !== buildDateOld) {
    localStorage.setItem('buildDate', buildDateNew)
    window?.location?.reload()
  }
}

export const getPeriodNum = (p?: string) => {
  return p ? (p === '조회' ? 99 : p === '종례' ? 100 : p === '점심시간' ? 101 : Number(p)) : 0
}

export const getPeriodStr = (p?: number) => {
  return p ? (p === 99 ? '조회' : p === 100 ? '종례' : p === 101 ? '점심시간' : p.toString()) : '0'
}

export const getPeriodStrEx = (p?: number) => {
  return p ? (p === 99 ? '조회' : p === 100 ? '종례' : p === 101 ? '점심시간' : p.toString() + '교시') : '0'
}

export const getErrorMsg = (err: any) => {
  const errorMsg: errorType | undefined = err?.response?.data as unknown as errorType

  return errorMsg.message || '일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

export const getNickName = (nickName: string | undefined | null) => {
  return nickName ? '(' + nickName + ')' : ''
}
