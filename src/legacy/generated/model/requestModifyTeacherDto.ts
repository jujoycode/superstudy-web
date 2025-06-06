/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * Super School 백엔드
 * Super School API 상세
 * OpenAPI spec version: 0.1
 */
import type { Role } from './role'

export interface RequestModifyTeacherDto {
  /** 이메일 */
  email?: string | null
  /** 역할 */
  role?: Role
  /** 이름 */
  name?: string
  /** 학년 */
  headNumber?: number
  /** 전화번호 */
  phone?: string
  /** 만료여부, 미사용 사용자는 true (전학 등) */
  expired?: boolean
  /** 만료사유, 탈퇴, 전학 등 사유 입력 */
  expiredReason?: string | null
  /** 공지사항수정가능여부 */
  canEditNotice?: boolean
  /** 가정통신문수정가능여부 */
  canEditNewsletter?: boolean
  /** 시간표/출석체크수정가능여부수정가능여부 */
  canEditTimetable?: boolean
  /** 급식일정수정가능여부수정가능여부 */
  canEditCanteen?: boolean
  /** 로그인 실패 카운트 */
  loginFailCount?: number
  /** 별명 */
  nickName?: string | null
  /** 부서 */
  department?: string | null
  /** 직책 */
  position?: string | null
  /** 담임학급 */
  homeRoomKlass?: string | null
  /** 학급 년도 */
  year?: number | null
  /** 프로필이미지URL */
  profile?: string | null
  /** 관리자모드 - 선생님정보 */
  adminTeacher?: boolean | null
  /** 관리자모드 - 학생정보 */
  adminStudent?: boolean | null
  /** 관리자모드 - 보호자정보 */
  adminParent?: boolean | null
  /** 관리자모드 - 학급정보 */
  adminClass?: boolean | null
  /** 관리자모드 - 그룹정보 */
  adminGroup?: boolean | null
  /** 관리자모드 - 결재라인정보 */
  adminApprovalLine?: boolean | null
  /** 관리자모드 - 시간표정보 */
  adminTimetable?: boolean | null
  /** 관리자모드 - 문자정보 */
  adminSms?: boolean | null
  /** 관리자모드 - 성적관리 */
  adminScore?: boolean | null
  /** 관리자모드 - IB관리 */
  adminIb?: boolean | null
}
