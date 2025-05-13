import { create } from 'zustand'

// 알림 타입 정의
interface Notification {
  id: string
  message: string
  title?: string
  timestamp: number
  read: boolean
  data?: string | number | boolean | object | null | undefined
}

type NotificationState = {
  // 상태
  notifications: Notification[]
  unreadCount: number
  isUpdateNotice: boolean

  // 액션
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  setIsUpdateNotice: (isUpdate: boolean) => void
}

// 초기 상태
const initialState = {
  notifications: [],
  unreadCount: 0,
  isUpdateNotice: false,
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  ...initialState,

  // 액션
  addNotification: (notification) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...notification,
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      }
    }),

  markAsRead: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      const wasUnread = state.notifications.some((n) => n.id === id && !n.read)

      return {
        notifications: updatedNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set(initialState),
  
  setIsUpdateNotice: (isUpdateNotice) => set({ isUpdateNotice }),
}))
