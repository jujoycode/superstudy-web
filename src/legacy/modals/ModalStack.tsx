import { cloneElement, ReactElement, useEffect } from 'react'
import { useLocation } from 'react-router'
import { create } from 'zustand'

interface ModalState {
  modals: ReactElement[]
  pushModal: (modal: ReactElement) => void
  popModal: () => void
  clearModals: () => void
}

export const useModals = create<ModalState>((set) => ({
  modals: [],
  // Actions
  pushModal: (modal: ReactElement) => set((state) => ({ modals: [...state.modals, modal] })),
  popModal: () => set((state) => ({ modals: state.modals.slice(0, -1) })),
  clearModals: () => set({ modals: [] }),
}))

export function ModalStack() {
  const { pathname } = useLocation()
  const { modals, clearModals } = useModals()

  useEffect(() => {
    clearModals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return <>{modals.map((modal, key) => cloneElement(modal, { key }))}</>
}
