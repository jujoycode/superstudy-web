/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { ResponseStudentGroupWithGroupDto } from './responseStudentGroupWithGroupDto'

export interface ResponseUserWithKlassDto {
  /** 아이디 */
  id: number
  /** 이름 */
  name: string
  /** 닉네임 */
  nickName: string
  /** 학년 */
  grade: number
  /** 반 */
  klass: number
  /** 번호 */
  studentNumber: number
  /** 학생그룹 */
  studentGroups: ResponseStudentGroupWithGroupDto[] | null
}
