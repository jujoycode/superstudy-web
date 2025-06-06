/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { AbsentStatus } from './absentStatus'
import type { Group } from './group'
import type { User } from './user'

export interface Absent {
  /** 아이디 */
  id: number
  /** 생성일 */
  createdAt: string
  /** 수정일 */
  updatedAt: string
  /** 학년반 */
  studentGradeKlass: string
  /** 출석번호 */
  studentNumber: number
  /** 신고유형 */
  reportType: string
  /** 결석신고서 상태 */
  absentStatus: AbsentStatus
  /** 시작일 */
  startAt: string
  /** 종료일 */
  endAt: string
  /** 시작교시 */
  startPeriod: number
  /** 종료교시 */
  endPeriod: number
  /** 증빙서류확인여부 */
  submitted: boolean
  /** 나이스확인여부 */
  niceSubmitted: boolean
  /** 사유 */
  reason: string
  /** 학생코멘트(상세사유) */
  studentComment: string
  /** 담임교사코멘트 */
  teacherComment: string
  /** 신고상세내용 */
  description: string
  /** 증빙서류종류 */
  evidenceType: string
  /** 증빙서류파일 */
  evidenceFile: string
  /** 증빙서류파일들 */
  evidenceFiles: string[]
  /** 2번째 증빙서류종류 */
  evidenceType2: string
  /** 2번째 증빙서류파일들 */
  evidenceFiles2: string[]
  /** 신청일 */
  reportedAt: string
  /** 학생서명이미지 */
  studentSignature: string | null
  /** 선생님서명이미지 */
  teacherSignature: string | null
  /** 부모님서명이미지 */
  parentSignature: string | null
  /** 부모님코멘트 */
  parentComment: string
  /** 학년계서명이미지 */
  preHeadSignature: string | null
  /** 학년부장서명이미지 */
  headSignature: string | null
  /** 교무계서명이미지 */
  prePrincipalSignature: string | null
  /** 교무부장서명이미지 */
  principalSignature: string | null
  /** 교감선생님서명이미지 */
  vicePrincipalSignature: string | null
  /** 교장선생님서명이미지 */
  headPrincipalSignature: string | null
  /** 반려사유 */
  notApprovedReason: string
  /** 삭제요청사유 */
  deleteReason: string
  /** 수정사유 */
  updateReason: string
  /** 학생유저아이디 */
  studentId: number
  /** 학생유저 */
  student: User
  /** 학생Klass그룹 */
  studentKlassGroup: Group
  /** 선생님유저아이디 */
  teacherId: number
  /** 선생님유저 */
  teacher: User
  /** 학교아이디 */
  schoolId: number
  /** 승인자1 서명 */
  approver1Signature: string | null
  /** 승인자1 유저아이디 */
  approver1Id: number
  /** 승인자1 직급 */
  approver1Title: string | null
  /** 승인자2 서명 */
  approver2Signature: string | null
  /** 승인자2 유저아이디 */
  approver2Id: number
  /** 승인자2 직급 */
  approver2Title: string | null
  /** 승인자3 서명 */
  approver3Signature: string | null
  /** 승인자3 유저아이디 */
  approver3Id: number
  /** 승인자3 직급 */
  approver3Title: string | null
  /** 승인자4 서명 */
  approver4Signature: string | null
  /** 승인자4 유저아이디 */
  approver4Id: number
  /** 승인자4 직급 */
  approver4Title: string | null
  /** 승인자5 서명 */
  approver5Signature: string | null
  /** 승인자5 유저아이디 */
  approver5Id: number
  /** 승인자5 직급 */
  approver5Title: string | null
  /** 다음 승인자 */
  nextApprover: string | null
  /** 다음 승인자Id */
  nextApproverId: number
  /** 다음 승인자 직급 */
  nextApproverTitle: string | null
  /** 결석신고서 작성자 선생님 */
  writerName: string | null
}
