import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 학교 정보 타입 정의
interface School {
  id: string
  name: string
  logo?: string
  address?: string
  type?: string
  domain?: string
}

type SchoolState = {
  // 상태
  currentSchool: School | null
  schoolList: School[]

  // 액션
  setCurrentSchool: (school: School | null) => void
  setSchoolList: (schools: School[]) => void
  addSchool: (school: School) => void
  updateCurrentSchool: (partialSchool: Partial<School>) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  currentSchool: null,
  schoolList: [],
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
      reset: () => set(initialState),
    }),
    {
      name: 'school-storage',
      partialize: (state) => ({
        currentSchool: state.currentSchool,
        schoolList: state.schoolList,
      }),
    },
  ),
)
