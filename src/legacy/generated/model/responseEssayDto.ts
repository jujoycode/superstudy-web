/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { ResponseEssayDtoEditStatus } from './responseEssayDtoEditStatus'
import type { ResponseEssayDtoStatus } from './responseEssayDtoStatus'

export interface ResponseEssayDto {
  /** ID */
  id: number
  /** 생성일시 */
  createdAt: string
  /** 수정일시 */
  updatedAt: string
  /** 에세이 타이틀 */
  title: string
  /** 
에세이 상태 값:
- **PENDING**: 제출 전
- **SUBMIT**: 제출
 */
  status: ResponseEssayDtoStatus
  /** 파일 S3 경로 */
  filePath: string
  /** 글자수 */
  charCount: number
  /** 학문적 진실성 동의 */
  academicIntegrityConsent: boolean
  /** 
수정가능 상태 값:
- **LOCK**: 수정불가능
- **REQUEST_UNLOCK**: 수정 요청상태
- **UNLOCK**: 수정가능상태
 */
  editStatus: ResponseEssayDtoEditStatus
}
