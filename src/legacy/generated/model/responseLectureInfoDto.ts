/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { LectureType } from './lectureType'
import type { ResponseStudentGroupWithKlassDto } from './responseStudentGroupWithKlassDto'

export interface ResponseLectureInfoDto {
  /** 수업종류 */
  type: LectureType
  /** 그룹 아이디 */
  groupId: number
  /** 월~금요일(1~5) */
  day: number
  /** 수업교시 */
  time: number
  /** 교실이름 */
  room: string
  /** 유효한 주 번호, 기본은 0, 예) 23이면 23주차에만 유효 */
  validityWeek: number
  /** 과목명 */
  subject: string
  /** 선생님 유저 아이디 */
  teacherId: number
  /** 선생님 이름 */
  teacherName: string
  /** 그룹 명 */
  groupName: string
  /** 그룹에 속한 학생 리스트 */
  studentList: ResponseStudentGroupWithKlassDto[] | null
}
