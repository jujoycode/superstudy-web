import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEME_ENUM } from '@/constants/themeConstant'
import type { ResponseSchoolPropertyDto } from '@/legacy/generated/model'

type SchoolState = {
  // 상태
  schoolProperties: ResponseSchoolPropertyDto[]
  schoolBrand: THEME_ENUM

  // 액션
  setSchoolProperties: (properties: ResponseSchoolPropertyDto[]) => void
  setSchoolBrand: (brand: THEME_ENUM) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  currentSchool: null,
  schoolList: [],
  schoolProperties: [],
  schoolBrand: THEME_ENUM.SUPERSCHOOL,
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      ...initialState,
      schoolBrand: THEME_ENUM.SUPERSCHOOL,

      // 액션
      setSchoolProperties: (schoolProperties) => set({ schoolProperties }),
      setSchoolBrand: (brand) => set({ schoolBrand: brand }),
      reset: () => set(initialState),
    }),
    {
      name: 'school-storage',
      partialize: (state) => ({
        schoolProperties: state.schoolProperties,
        schoolBrand: state.schoolBrand,
      }),
    },
  ),
)
