// src/stores/app-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResponseUserDto, ResponseSchoolPropertyDto } from '@/legacy/generated/model'
import type { Languages } from '@/legacy/util/i18n'

type AppState = {
  token: string | null
  refreshToken: string | null
  twoFactor: string | null
  me: ResponseUserDto | undefined
  child: ResponseUserDto | undefined
  selectedGroupId: number | undefined
  isUpdateMe: boolean
  isUpdateNotice: boolean
  newsletterOpenedGroup: string[]
  newMsgCnt: number
  toastMsg: string | undefined
  warningMsg: string | undefined
  language: Languages
  schoolProperties: ResponseSchoolPropertyDto[] | undefined

  // 액션
  setToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setTwoFactor: (twoFactor: string | null) => void
  setMe: (user: ResponseUserDto | undefined) => void
  setChild: (user: ResponseUserDto | undefined) => void
  setSelectedGroupId: (id: number | undefined) => void
  setIsUpdateMe: (isUpdate: boolean) => void
  setIsUpdateNotice: (isUpdate: boolean) => void
  setNewsletterOpenedGroup: (groups: string[]) => void
  setNewMsgCnt: (count: number) => void
  setToastMsg: (msg: string | undefined) => void
  setWarningMsg: (msg: string | undefined) => void
  setLanguage: (lang: Languages) => void
  setSchoolProperties: (props: ResponseSchoolPropertyDto[] | undefined) => void
  resetState: () => void
}

// 초기 상태
const initialState = {
  token: null,
  refreshToken: null,
  twoFactor: 'false',
  me: undefined,
  child: undefined,
  selectedGroupId: 0,
  isUpdateMe: false,
  isUpdateNotice: false,
  newsletterOpenedGroup: [],
  newMsgCnt: 0,
  toastMsg: undefined,
  warningMsg: undefined,
  language: 'ko' as Languages,
  schoolProperties: undefined,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      // 액션
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setTwoFactor: (twoFactor) => set({ twoFactor }),
      setMe: (me) => set({ me }),
      setChild: (child) => set({ child }),
      setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
      setIsUpdateMe: (isUpdateMe) => set({ isUpdateMe }),
      setIsUpdateNotice: (isUpdateNotice) => set({ isUpdateNotice }),
      setNewsletterOpenedGroup: (newsletterOpenedGroup) => set({ newsletterOpenedGroup }),
      setNewMsgCnt: (newMsgCnt) => set({ newMsgCnt }),
      setToastMsg: (toastMsg) => set({ toastMsg }),
      setWarningMsg: (warningMsg) => set({ warningMsg }),
      setLanguage: (language) => set({ language }),
      setSchoolProperties: (schoolProperties) => set({ schoolProperties }),
      resetState: () => set(initialState),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        twoFactor: state.twoFactor,
        language: state.language,
      }),
    },
  ),
)
