import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResponseSchoolPropertyDto } from '@/legacy/generated/model'

type SchoolState = {
  // 상태
  schoolProperties: ResponseSchoolPropertyDto[]

  // 액션
  setSchoolProperties: (properties: ResponseSchoolPropertyDto[]) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  currentSchool: null,
  schoolList: [],
  schoolProperties: [],
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      ...initialState,

      // 액션
      setSchoolProperties: (schoolProperties) => set({ schoolProperties }),
      reset: () => set(initialState),
    }),
    {
      name: 'school-storage',
      partialize: (state) => ({
        schoolProperties: state.schoolProperties,
      }),
    },
  ),
)
