import { SortState } from '@/constants/enumConstant'
import type { User } from '@/legacy/generated/model'

interface SortableItem {
  startAt?: string
  createdAt?: string
  studentName?: string | null
  studentGradeKlass?: string
  studentNumber?: number
}

interface SortableAbsFt {
  startAt?: string
  createdAt?: string
  student?: User
  studentGradeKlass?: string
  studentNumber?: number
}

function makeStudentNumber(studentGradeKlass: string, studentNumber: string): number {
  const grade = parseInt(studentGradeKlass.split(' ')[0])
  const klass = parseInt(studentGradeKlass.split(' ')[1])
  return grade * 10000 + klass * 100 + parseInt(studentNumber)
}

export function compareOutings(a: SortableItem, b: SortableItem, sortType: string, sortOrder: 'ASC' | 'DESC'): number {
  let comparison = 0

  switch (sortType) {
    case 'period':
      comparison = new Date(a.startAt || '').getTime() - new Date(b.startAt || '').getTime()
      break
    case 'request':
      comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
      break
    case 'name':
      if (a.studentName && b.studentName) {
        comparison = a.studentName.localeCompare(b.studentName)
      }
      break
    case 'num':
      if (a.studentGradeKlass && a.studentNumber && b.studentGradeKlass && b.studentNumber) {
        const studentNumberA = makeStudentNumber(a.studentGradeKlass, a.studentNumber.toString())
        const studentNumberB = makeStudentNumber(b.studentGradeKlass, b.studentNumber.toString())
        comparison = studentNumberA - studentNumberB
      }
      break
    default:
      break
  }

  return sortOrder === 'ASC' ? comparison : -comparison
}

export function compareAbsents(
  a: SortableAbsFt,
  b: SortableAbsFt,
  sortType: string,
  sortOrder: 'ASC' | 'DESC',
): number {
  let comparison = 0

  switch (sortType) {
    case 'period':
      comparison = new Date(a.startAt || '').getTime() - new Date(b.startAt || '').getTime()
      break
    case 'request':
      comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
      break
    case 'name':
      if (a.student?.name && b.student?.name) {
        comparison = a.student.name.localeCompare(b.student.name)
      }
      break
    case 'num':
      if (a.studentGradeKlass && a.studentNumber && b.studentGradeKlass && b.studentNumber) {
        const studentNumberA = makeStudentNumber(a.studentGradeKlass, a.studentNumber.toString())
        const studentNumberB = makeStudentNumber(b.studentGradeKlass, b.studentNumber.toString())
        comparison = studentNumberA - studentNumberB
      }
      break
    default:
      break
  }

  return sortOrder === 'ASC' ? comparison : -comparison
}
export function compareFieldTrips(a: SortableAbsFt, b: SortableAbsFt, sortType: string, sortOrder: SortState): number {
  let comparison = 0

  switch (sortType) {
    case 'period':
      comparison = new Date(a.startAt || '').getTime() - new Date(b.startAt || '').getTime()
      break
    case 'request':
      comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
      break
    case 'name':
      if (a.student?.name && b.student?.name) {
        comparison = a.student.name.localeCompare(b.student.name)
      }
      break
    case 'num':
      if (a.studentGradeKlass && a.studentNumber && b.studentGradeKlass && b.studentNumber) {
        const studentNumberA = makeStudentNumber(a.studentGradeKlass, a.studentNumber.toString())
        const studentNumberB = makeStudentNumber(b.studentGradeKlass, b.studentNumber.toString())
        comparison = studentNumberA - studentNumberB
      }
      break
    default:
      break
  }

  return sortOrder === SortState.ASC ? comparison : -comparison
}
