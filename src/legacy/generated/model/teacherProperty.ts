/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */

export interface TeacherProperty {
  /** 아이디 */
  id: number
  /** 생성일 */
  createdAt: string
  /** 수정일 */
  updatedAt: string
  /** 선생님 ID */
  teacherId: number
  /** 직책 */
  position: string | null
  /** 부서 */
  department: string | null
  /** 대화가능시작시각 */
  chatStartTime: string
  /** 대화가능종료시각 */
  chatEndTime: string
}
