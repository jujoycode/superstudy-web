import { useRecoilState } from 'recoil'
import { useTranslation } from 'react-i18next'
import { languageState } from '@/stores'
import type { TOptions } from 'i18next'
import type { Languages } from '@/legacy/util/i18n'

export const useLanguage = () => {
  const { t: originalT, i18n } = useTranslation<'translation'>()
  const [currentLang, setCurrentLang] = useRecoilState<Languages>(languageState)

  const changeLanguage = () => {
    const nextLang: Languages = currentLang === 'ko' ? 'en' : 'ko'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('language', nextLang)
    setCurrentLang(nextLang)
  }

  const t = (key: string, defaultText?: string, options?: TOptions & { defaultValue?: string }): string => {
    const defaultValue = options?.defaultValue || defaultText
    return originalT(key, { ...options, defaultValue })
  }

  return { currentLang, t, changeLanguage }
}
