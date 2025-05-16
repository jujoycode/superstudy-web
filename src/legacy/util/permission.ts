import { approveButtonType } from '@/legacy/types'
import { Role } from '@/legacy/generated/model'

export const PermissionUtil = {
  hasOutingAuthorization: (userRole?: Role) => {
    if (!userRole) return false
    return (
      userRole === Role.TEACHER ||
      userRole === Role.HEAD ||
      userRole === Role.PRE_HEAD ||
      userRole === Role.PRINCIPAL ||
      userRole === Role.PRE_PRINCIPAL ||
      userRole === Role.VICE_PRINCIPAL ||
      userRole === Role.HEAD_PRINCIPAL ||
      userRole === Role.STAFF ||
      userRole === Role.ADMIN
    )
  },
  isNotStudentNotParent: (userRole?: Role) => {
    if (!userRole) return false
    return (
      userRole === Role.TEACHER ||
      userRole === Role.PRE_HEAD ||
      userRole === Role.HEAD ||
      userRole === Role.PRE_PRINCIPAL ||
      userRole === Role.PRINCIPAL ||
      userRole === Role.VICE_PRINCIPAL ||
      userRole === Role.HEAD_PRINCIPAL ||
      userRole === Role.ADMIN ||
      userRole === Role.STAFF ||
      userRole === Role.SECURITY
    )
  },
  isExecutiveTeachers: (userRole?: Role) => {
    if (!userRole) return false
    return (
      userRole === Role.PRE_HEAD ||
      userRole === Role.HEAD ||
      userRole === Role.PRE_PRINCIPAL ||
      userRole === Role.PRINCIPAL ||
      userRole === Role.VICE_PRINCIPAL ||
      userRole === Role.HEAD_PRINCIPAL
    )
  },
}

export const getRoleTitle = (role: Role, headNumber?: number) => {
  return role === Role.HEAD_PRINCIPAL
    ? '교장선생님'
    : role === Role.VICE_PRINCIPAL
      ? '교감선생님'
      : role === Role.PRINCIPAL
        ? '교무부장선생님'
        : role === Role.PRE_PRINCIPAL
          ? '교무계선생님'
          : role === Role.HEAD
            ? (headNumber ? headNumber.toString() : '') + '학년부장선생님'
            : role === Role.PRE_HEAD
              ? (headNumber ? headNumber.toString() : '') + '학년계선생님'
              : role === Role.TEACHER
                ? '선생님'
                : role === Role.ADMIN
                  ? '관리자'
                  : role === Role.STAFF
                    ? '교직원'
                    : role === Role.SECURITY
                      ? '보안관'
                      : ''
}

/**
 * 버튼별 활성화 조건
 * 버튼이 활성 상태 조건이면 true 반환
 * */
export const buttonEnableState = (
  bottonType: approveButtonType,
  approver: boolean,
  nowApprove: boolean,
  status: string,
  isHomeRoomTeacher = false, // 담임선생님 여부
) => {
  if ((approver || isHomeRoomTeacher) && bottonType === approveButtonType.DOWNLOAD) {
    return true //status === 'PROCESSED'; // 미결 서류도 다운로드 가능하도록 수정
  } else if ((approver || isHomeRoomTeacher) && bottonType === approveButtonType.DELETE) {
    return status !== 'DELETE_APPEAL'
  } else if ((approver || isHomeRoomTeacher) && bottonType === approveButtonType.RETURN) {
    return (
      status !== 'RETURNED' &&
      status !== 'DELETE_APPEAL' &&
      (status === 'PROCESSING' || status === 'BEFORE_TEACHER_APPROVAL') &&
      nowApprove
    )
  } else if ((approver || isHomeRoomTeacher) && bottonType === approveButtonType.EDIT) {
    return status !== 'RETURNED' && status !== 'DELETE_APPEAL' && status !== 'BEFORE_PARENT_CONFIRM'
  } else if (approver && bottonType === approveButtonType.APPROVE) {
    return (
      status !== 'RETURNED' &&
      status !== 'DELETE_APPEAL' &&
      (status === 'PROCESSING' || status === 'BEFORE_TEACHER_APPROVAL') &&
      nowApprove
    )
  } else {
    return false
  }
}
