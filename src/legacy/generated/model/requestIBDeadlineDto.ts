/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { DeadlineType } from './deadlineType'

export interface RequestIBDeadlineDto {
  /** 데드라인 타입 */
  type: DeadlineType
  /** 마감시간 */
  deadlineTime: string
  /** 일일 알람 주기 */
  remindDays?: number[]
}
