/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { ActivityV3 } from './activityV3'
import type { Record } from './record'
import type { User } from './user'

export interface StudentActivityV3 {
  /** 아이디 */
  id: number
  /** 생성일 */
  createdAt: string
  /** 수정일 */
  updatedAt: string
  /** 제목 */
  title: string | null
  /** 관찰 기록 */
  record: string | null
  /** 활동요약 */
  summary: string
  /** 학생 활동 보고서 */
  studentText: string
  /** 유저 ID */
  userId: number
  /** 학생유저 */
  user: User
  /** 활동아이디 */
  activityv3Id: number
  /** 활동 */
  activityv3: ActivityV3
  /** 관찰기록들 */
  records: Record[] | null
}
