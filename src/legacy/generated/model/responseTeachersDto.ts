/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { Role } from './role'

export interface ResponseTeachersDto {
  /** 아이디 */
  id: number
  /** 이메일 */
  email: string | null
  /** 역할 */
  role: Role
  /** 이름 */
  name: string
  /** 학년 */
  headNumber: number
  /** 닉네임 */
  nickName: string
  /** 학년 반 정보 */
  groupName: string | null
  /** 직책 */
  position: string | null
  /** 부서 */
  department: string | null
}
