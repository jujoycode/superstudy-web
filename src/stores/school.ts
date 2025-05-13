import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResponseSchoolPropertyDto } from '@/legacy/generated/model'

// 학교 정보 타입 정의
interface School {
  id: string
  name: string
  logo?: string
  address?: string
  type?: string
  domain?: string
}

// 학교 속성 타입 정의
interface SchoolProperty {
  id: string
  name: string
  value: string
  schoolId: string
  properties: ResponseSchoolPropertyDto[]
}

type SchoolState = {
  // 상태
  currentSchool: School | null
  schoolList: School[]
  schoolProperties: SchoolProperty[]

  // 액션
  setCurrentSchool: (school: School | null) => void
  setSchoolList: (schools: School[]) => void
  addSchool: (school: School) => void
  updateCurrentSchool: (partialSchool: Partial<School>) => void
  setSchoolProperties: (properties: SchoolProperty[]) => void
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
      setCurrentSchool: (currentSchool) => set({ currentSchool }),
      setSchoolList: (schoolList) => set({ schoolList }),
      addSchool: (school) =>
        set((state) => ({
          schoolList: [...state.schoolList, school],
        })),
      updateCurrentSchool: (partialSchool) =>
        set((state) => ({
          currentSchool: state.currentSchool ? { ...state.currentSchool, ...partialSchool } : null,
        })),
      setSchoolProperties: (schoolProperties) => set({ schoolProperties }),
      reset: () => set(initialState),
    }),
    {
      name: 'school-storage',
      partialize: (state) => ({
        currentSchool: state.currentSchool,
        schoolList: state.schoolList,
        schoolProperties: state.schoolProperties,
      }),
    },
  ),
)
