import { TOptions } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '@/stores/language'

export const useLanguage = () => {
  const { t: originalT, i18n } = useTranslation()
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguageStore()

  const changeLanguage = (language: (typeof supportedLanguages)[number]) => {
    localStorage.setItem('language', language)

    i18n.changeLanguage(language)
    setLanguage(language)
  }

  const t = (key: string, defaultText?: string, options?: TOptions & { defaultValue?: string }): string => {
    const defaultValue = options?.defaultValue || defaultText
    return originalT(key, { ...options, defaultValue })
  }

  return { currentLanguage, changeLanguage, t }
}
