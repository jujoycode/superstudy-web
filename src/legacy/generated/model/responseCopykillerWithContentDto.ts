/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { ResponseCopykillerWithContentDtoCompleteStatus } from './responseCopykillerWithContentDtoCompleteStatus'
import type { ResponseCopykillerWithContentDtoTargetTable } from './responseCopykillerWithContentDtoTargetTable'

export interface ResponseCopykillerWithContentDto {
  /** ID */
  id: number
  /** 생성일시 */
  createdAt: string
  /** 수정일시 */
  updatedAt: string
  /** 문서식별코드 */
  uri: string
  /** 문서제목 */
  title: string
  /** 첨부파일들 s3 경로 */
  files: string[]
  /** 표절률 0~100(%) */
  copyRatio: string
  /** 에러 메시지 */
  errorMessage: string
  /** 학교아이디 */
  schoolId: number
  /** 유저아이디 */
  userId: number
  /** 대상 테이블명 */
  targetTable?: ResponseCopykillerWithContentDtoTargetTable
  /** 대상 테이블 아이디 */
  targetId?: number | null
  /** 검사상태 */
  completeStatus: ResponseCopykillerWithContentDtoCompleteStatus
  /** 검사완료일 */
  completeDate?: string | null
  /** 직접 입력 본문 내용 */
  content: string
}
