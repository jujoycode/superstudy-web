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
export function compareFieldTrips(
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

interface SortableUsr {
  id: number
  name: string
  nickName: string | undefined
  grade: number
  klass: string | number | null
  studentNumber: number | string
}

export function compareUsers(a: SortableUsr, b: SortableUsr, sortType: string, sortOrder: 'ASC' | 'DESC'): number {
  let comparison = 0

  switch (sortType) {
    case 'name':
      if (a.name && b.name) {
        comparison = a.name.localeCompare(b.name)
      }
      break
    case 'num':
      if (a.grade !== b.grade) {
        comparison = a.grade - b.grade
        break
      }
      if (typeof a.klass === 'number' && typeof b.klass === 'number' && a.klass !== b.klass) {
        comparison = a.klass - b.klass
        break
      }
      if (typeof a.klass === 'string' && typeof b.klass === 'string' && a.klass !== b.klass) {
        comparison = a.klass.localeCompare(b.klass)
        break
      }
      if (a.studentNumber !== b.studentNumber) {
        comparison = Number(a.studentNumber) - Number(b.studentNumber)
        break
      }
      comparison = a.id - b.id
      break
    default:
      break
  }

  return sortOrder === 'ASC' ? comparison : -comparison
}
