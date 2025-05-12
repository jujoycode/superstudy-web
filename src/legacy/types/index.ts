import type { School, User } from '@/legacy/generated/model'

export type NotNullable<Type> = {
  [Key in keyof Type]-?: NotNullable<NonNullable<Type[Key]>>
}

export enum TabType {
  NOTICE = 'NOTICE', // 공지사항
  NEWSLETTER = 'NEWSLETTER', // 가정통신문
  BOARD = 'BOARD', // 학급별 게시판
}

export enum AbsentTimeType {
  NONE = 'NONE',
  TIME = 'TIME',
  PERIOD = 'PERIOD',
}

export enum AbsentPaperType {
  PARENT = 'parent',
  TEACHER = 'teacher',
  ABSENT = 'absent',
  IMAGE = 'image',
  PDF = 'pdf',
}

export enum AbsentEvidenceType {
  PARENT = '학부모 확인서',
  TEACHER = '담임교사 확인서',
  OTHER = 'other',
}

export enum FieldtripPaperType {
  APPLICATION = 'application',
  APPLICATIONSEPARATE = 'applicationseparate',
  APPLICATIONIMAGE = 'applicationimage',
  RESULT = 'result',
  RESULTSEPARATE = 'resultseparate',
  RESULTIMAGE = 'resultimage',
}

export enum MenuType {
  List = 0,
  Chat = 1,
  SMS = 2,
}

export interface Schedule {
  id?: number
  calendarId?: string
  attendee?: string
  title?: string
  category?: string
  location?: string
  dueDateClass?: string
  isAllDay?: boolean
  start: Date | string
  end: Date | string
  isReadOnly?: boolean
  userId?: number
  user?: User
  schoolId?: number
  school?: School
}

export interface Manager {
  managerStatus: string
  id?: number
  studentGradeKlass?: string
  studentNumber?: number
  reportType?: string
  startAt?: string
  endAt?: string
  reason?: string
  description?: string
  evidenceType?: string
  evidenceFile?: string
  reportedAt?: string
  studentSignature?: string
  teacherSignature?: string
  parentSignature?: string
  headSignature?: string
  principalSignature?: string
  notApprovedReason?: string
  deleteReason?: string
  updateReason?: string
  uuid?: string
  studentId?: number
  student?: User
  teacherId?: number
  teacher?: User
  createdAt?: string
  updatedAt?: string
}

export interface KlassInfo {
  time: string
  timeCode: string
  subject: string
  myClass: boolean
  name: string
  semester: number
  teacherName: string
  type: string
}

export interface AbsentSave {
  period: number
  subject: string
  creator: string
  createtime: string
  editor: string
  edittime: string
  comment: string
  absent: boolean
  type1: string
  type2: string
}

export type AbsentDescription = {
  [key: string]: {
    reasonType: string[]
    evidenceFileType: string[]
  }
}

export interface PeriodSubjectTeacher {
  subject: string
  teacher: string
  period: number
  mark: string
}

export interface UserDatas {
  id: number
  name: string
  role: string
  title: string
  studNum: number
  klass: string
  useNokInfo: boolean
  phone?: string
  userText1?: string
  userText2?: string
  userText3?: string
}

export interface errorType {
  error: string
  message: string
  statusCode: number
  code: string
}

export interface dashboardNewItem {
  messagePre: string
  count: string
  messagePost: string
  url: string
}

export interface nameWithId {
  id: number
  name: string | null
  grade?: number
  klass?: number
}

export enum approveButtonType {
  DOWNLOAD = 'DOWNLOAD',
  DELETE = 'DELETE',
  RETURN = 'RETURN',
  EDIT = 'EDIT',
  APPROVE = 'APPROVE',
}

export interface Question {
  type: string
  title: string
  required: boolean
  id: number
  choices?: any[]
}

export const AccessLevels = [
  { id: 0, name: '비공개' },
  { id: 1, name: '담임공개' },
  { id: 2, name: '결재권자공개' },
  { id: 99, name: '전체공개' },
]

export const periodArray = ['조회', '1', '2', '3', '4', '점심시간', '5', '6', '7', '8', '9', '종례']
