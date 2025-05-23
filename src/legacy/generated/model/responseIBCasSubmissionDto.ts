/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { BaseResponseDto } from './baseResponseDto'
import type { ResponseIBCasSubmissionDtoIbType } from './responseIBCasSubmissionDtoIbType'
import type { ResponseIBCasSubmissionDtoStatus } from './responseIBCasSubmissionDtoStatus'

export interface ResponseIBCasSubmissionDto {
  /** ID */
  id: number
  /** 생성일시 */
  createdAt: string
  /** 수정일시 */
  updatedAt: string
  /** IB 프로젝트 타입 */
  ibType: ResponseIBCasSubmissionDtoIbType
  /** 프로젝트 타이틀|제목 */
  title: string
  /** IB 프로젝트 진행 상태 값 */
  status: ResponseIBCasSubmissionDtoStatus
  /** CAS */
  cas: BaseResponseDto
}
