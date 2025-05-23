/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { Board } from './board'

export interface ResponsePaginatedBoardDto {
  /** 학급게시판의 게시글들 */
  items: Board[]
  /** 전체갯수 */
  total: number
  /** 읽지 않은 학급게시판id 리스트 */
  unreadIdList: number[] | null
}
