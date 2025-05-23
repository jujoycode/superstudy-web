import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

// sessionStorage에서 user-storage 데이터 가져오기
const getUserStorageData = () => {
  try {
    const userStorageData = sessionStorage.getItem('user-storage')
    if (userStorageData) {
      const parsedData = JSON.parse(userStorageData)
      if (parsedData.state && parsedData.state.me) {
        return parsedData.state.me
      }
    }
    return undefined
  } catch (error) {
    console.error('사용자 데이터 파싱 오류:', error)
    return undefined
  }
}

// 초기 상태
const initialState = {
  me: getUserStorageData(),
  child: undefined,
  selectedGroupId: 0,
  isUpdateMe: false,
  isUpdateNotice: false,
  initialized: false,
}

export const useUserStore = create<UserState>()(
  persist(
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
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        me: state.me,
        child: state.child,
        selectedGroupId: state.selectedGroupId,
        isUpdateMe: state.isUpdateMe,
        isUpdateNotice: state.isUpdateNotice,
        initialized: state.initialized,
      }),
    },
  ),
)
