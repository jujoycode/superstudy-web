/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */

export interface RequestUpdateNiceComparisonDto {
  /** 학년도 */
  year: string
  /** 월 */
  month: number
  /** 나이스 파일과 학교 데이터의 차이 */
  differenceNS: number
  /** 나이스 파일에 없는 데이터 수 */
  niceEmptyNumber: number
  /** 슈퍼스쿨에 없는 데이터 수 */
  schoolEmptyNumber: number
  /** 나이스 파일 데이터 (JSON 스트링) */
  content: string
}
