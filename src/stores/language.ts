import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Languages } from '@/legacy/util/i18n'

type LanguageState = {
  // 상태
  currentLanguage: Languages
  supportedLanguages: Languages[]

  // 액션
  setLanguage: (code: Languages) => void
  setSupportedLanguages: (languages: Languages[]) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  currentLanguage: (localStorage.getItem('languageState') as Languages) || 'ko',
  supportedLanguages: ['ko', 'en'] as Languages[],
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      ...initialState,

      // 액션
      setLanguage: (currentLanguage) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('languageState', currentLanguage)
        }
        return set({ currentLanguage })
      },
      setSupportedLanguages: (supportedLanguages) => set({ supportedLanguages }),
      reset: () => set(initialState),
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    },
  ),
)
