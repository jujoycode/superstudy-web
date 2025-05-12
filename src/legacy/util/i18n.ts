import i18n, { type Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'

import adminEn from '@/legacy/locales/en/admin.json'
import translationEn from '@/legacy/locales/en/common.json'
import modalEn from '@/legacy/locales/en/modal.json'
import studentEn from '@/legacy/locales/en/student.json'
import teacherEn from '@/legacy/locales/en/teacher.json'

import adminKo from '@/legacy/locales/ko/admin.json'
import translationKo from '@/legacy/locales/ko/common.json'
import modalKo from '@/legacy/locales/ko/modal.json'
import studentKo from '@/legacy/locales/ko/student.json'
import teacherKo from '@/legacy/locales/ko/teacher.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false
  }
}

// 다국어 리소스 객체를 정의
const resources = {
  en: { admin: adminEn, translation: translationEn, modal: modalEn, student: studentEn, teacher: teacherEn },
  ko: { admin: adminKo, translation: translationKo, modal: modalKo, student: studentKo, teacher: teacherKo },
} satisfies Resource

// 사용자의 브라우저 언어 설정을 확인하고, 설정이 없으면 기본값으로 사용할 언어를 결정
const userLanguage = window.navigator.language.split('-')[0] // 'ko-KR' 같은 값을 'ko'로 변환

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || userLanguage || 'en',
  fallbackLng: 'ko',
  keySeparator: '.',
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
export const languages = ['en', 'ko'] as const
export type Languages = (typeof languages)[number]
