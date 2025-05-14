import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResponseUserDto } from '@/legacy/generated/model'

type UserState = {
  // 상태
  me: ResponseUserDto | undefined
  child: ResponseUserDto | undefined
  selectedGroupId: number | undefined
  isUpdateMe: boolean
  isUpdateNotice: boolean
  initialized: boolean

  // 액션
  setMe: (me: ResponseUserDto | undefined) => void
  setChild: (child: ResponseUserDto | undefined) => void
  setSelectedGroupId: (id: number | undefined) => void
  setIsUpdateMe: (isUpdate: boolean) => void
  setIsUpdateNotice: (isUpdate: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  me: undefined,
  child: undefined,
  selectedGroupId: 0,
  isUpdateMe: false,
  isUpdateNotice: false,
  initialized: false,
}

export const useUserStore = create<UserState>()(
  (set) => ({
    ...initialState,
    // 액션
    setMe: (me) => set({ me }),
    setChild: (child) => set({ child }),
    setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
    setIsUpdateMe: (isUpdateMe) => set({ isUpdateMe }),
    setIsUpdateNotice: (isUpdateNotice) => set({ isUpdateNotice }),
    setInitialized: (initialized) => set({ initialized }),
    reset: () => set(initialState),
  }),
)
