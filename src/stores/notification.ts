import { create } from 'zustand'

interface NotificationState {
  toast: string | undefined
  newsletterOpenedGroup: string[]
  newMsgCnt: number

  setToast: (toast: string) => void
  setNewsletterOpenedGroup: (groups: string[]) => void
  setNewMsgCnt: (count: number) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  toast: undefined,
  newsletterOpenedGroup: [],
  newMsgCnt: 0
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  ...initialState,

  // 액션
  setToast: (toast) => set({ toast }),
  setNewsletterOpenedGroup: (newsletterOpenedGroup) => set({ newsletterOpenedGroup }),
  setNewMsgCnt: (newMsgCnt) => set({ newMsgCnt }),
  reset: () => set(initialState),
}))
