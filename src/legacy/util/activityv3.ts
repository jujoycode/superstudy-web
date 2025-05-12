import type { StudentActivityV3 } from '@/legacy/generated/model'

export const checkSubmitted = (studentActivityV3: StudentActivityV3 | undefined, filter?: string): boolean => {
  if (!studentActivityV3) return false
  switch (filter) {
    case 'studentText':
      return !!studentActivityV3?.studentText
    case 'record':
      return !!studentActivityV3?.records?.length
    case 'summary':
      return !!studentActivityV3?.summary
    default:
      return !!studentActivityV3?.studentText && !!studentActivityV3?.record && !!studentActivityV3?.summary
  }
}
