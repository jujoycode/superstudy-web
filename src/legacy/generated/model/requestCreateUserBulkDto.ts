/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */

export interface RequestCreateUserBulkDto {
  /** 아이디 */
  id: number
  /** 이메일 */
  email: string | null
  /** 신규추가 */
  isNew: boolean | null
  /** 생성결과 */
  result: boolean | null
  /** 실패사유 */
  failReason: string | null
}
