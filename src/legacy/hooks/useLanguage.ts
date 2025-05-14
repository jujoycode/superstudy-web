import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '@/stores/language'
import type { TOptions } from 'i18next'

export const useLanguage = () => {
  const { currentLanguage, setLanguage } = useLanguageStore()
  const { t: originalT, i18n } = useTranslation<'translation'>()

  const changeLanguage = () => {
    const nextLang = currentLanguage === 'ko' ? 'en' : 'ko'

    i18n.changeLanguage(nextLang)
    localStorage.setItem('language', nextLang)
    setLanguage(nextLang)
  }

  const t = (key: string, defaultText?: string, options?: TOptions & { defaultValue?: string }): string => {
    const defaultValue = options?.defaultValue || defaultText
    return originalT(key, { ...options, defaultValue })
  }

  return { currentLang: currentLanguage, t, changeLanguage }
}