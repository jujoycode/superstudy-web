/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { RequestIBCasUpdateDto } from './requestIBCasUpdateDto'

export interface RequestIBUpdateDto {
  /** 프로젝트 타이틀 */
  title?: string
  /** 프로젝트 본문|설명 */
  description?: string
  /** 프로젝트 리더 학생ID */
  leaderId?: number
  /** 프로젝트 멤버 학생ID */
  memberIds?: number[]
  /** 프로젝트 시작 일자 */
  startAt?: string
  /** 프로젝트 종료 일자 */
  endAt?: string
  /** 활동 주기 */
  activityFrequency?: string
  /** CAS Normal */
  cas?: RequestIBCasUpdateDto
}
