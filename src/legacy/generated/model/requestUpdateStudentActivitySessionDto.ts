/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */

export interface RequestUpdateStudentActivitySessionDto {
  /** 내용 */
  content: string | null
  /** 이미지파일들 s3 경로 */
  images: string[]
  /** 첨부파일들 s3 경로 */
  files: string[]
}
