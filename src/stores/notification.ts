import { create } from 'zustand'

interface NotificationState {
  toast: string | undefined
  warning: string | undefined
  newsletterOpenedGroup: string[]
  newMsgCnt: number

  setToast: (toast: string) => void
  setWarning: (toast: string) => void
  setNewsletterOpenedGroup: (groups: string[]) => void
  setNewMsgCnt: (count: number) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  toast: undefined,
  warning: undefined,
  newsletterOpenedGroup: [],
  newMsgCnt: 0
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  ...initialState,

  // 액션
  setToast: (toast) => set({ toast }),
  setWarning: (warning) => set({ warning }),
  setNewsletterOpenedGroup: (newsletterOpenedGroup) => set({ newsletterOpenedGroup }),
  setNewMsgCnt: (newMsgCnt) => set({ newMsgCnt }),
  reset: () => set(initialState),
}))
