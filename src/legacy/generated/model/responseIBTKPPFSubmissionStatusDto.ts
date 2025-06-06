/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { ResponseIBStudentDto } from './responseIBStudentDto'
import type { ResponseIBTKPPFSubmissionStatusDtoDetailStatus } from './responseIBTKPPFSubmissionStatusDtoDetailStatus'
import type { ResponseIBTKPPFSubmissionStatusDtoIbType } from './responseIBTKPPFSubmissionStatusDtoIbType'
import type { ResponseTKPPFDto } from './responseTKPPFDto'

export interface ResponseIBTKPPFSubmissionStatusDto {
  /** ID */
  id: number
  /** 생성일시 */
  createdAt: string
  /** 수정일시 */
  updatedAt: string
  /** IB 프로젝트 타입 */
  ibType: ResponseIBTKPPFSubmissionStatusDtoIbType
  /** 프로젝트 리더 */
  leader: ResponseIBStudentDto
  /** TKPPF 내역 */
  tkppf: ResponseTKPPFDto
  /** 상세 상태 */
  detailStatus: ResponseIBTKPPFSubmissionStatusDtoDetailStatus
}
