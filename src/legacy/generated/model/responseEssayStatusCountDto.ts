/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */

export interface ResponseEssayStatusCountDto {
  /** 전체 학생 수 */
  total: number
  /** 미제출 학생 수 */
  notSubmitted: number
  /** 진행중 학생 수 */
  inProgress: number
  /** 평가 중 학생 수 */
  evaluating: number
  /** 활동 완료 학생 수 */
  complete: number
}
