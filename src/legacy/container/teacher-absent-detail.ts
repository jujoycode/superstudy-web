import { useEffect, useState } from 'react'

// ! 개선 필요
import { useHistory } from 'react-router-dom'

import {
  useAbsentsDelete,
  useAbsentsDeny,
  useAbsentsFindOne,
  useAbsentsGetAbsentsByTeacher,
  useAbsentsRequestDelete,
  useAbsentsResend,
  useAbsentsTeacherCommentApproval,
} from '@/legacy/generated/endpoint'
import { AbsentStatus } from '@/legacy/generated/model'
import { DateUtil } from '@/legacy/util/date'
import type { errorType } from '@/legacy/types'

type Props = { id: number; setAbsentId: (n: number) => void }

export function useTeacherAbsentDeatil({ id, setAbsentId }: Props) {
  const [deny, setDeny] = useState(false)
  const [deleteAppeal, setDeleteAppeal] = useState(false)
  const [notApprovedReason, setNotApprovedReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { push } = useHistory()
  const [comment, setComment] = useState(false)
  const [teacherComment, setTeacherComment] = useState('')
  const [mensesDialog, setMensesDialog] = useState(false)

  const { data: absent, isLoading: isGetAbsentLoading } = useAbsentsFindOne(id, {
    query: {
      enabled: !!id,
      onError: () => {
        setErrorMessage('이미 삭제되었거나 더 이상 유효하지 않습니다.')
      },
    },
  })

  const { data: menses } = useAbsentsGetAbsentsByTeacher(
    {
      startDate: absent ? DateUtil.getStartMonthDate(absent?.startAt) : '2000-01-01',
      endDate: absent ? DateUtil.getEndMonthDate(absent?.startAt) : '2000-01-01',
      //selectedGroupId: absent.studentKlassGroup.id,
      username: absent?.student.name,
      page: 1,
      limit: 999,
    },
    {
      query: {
        enabled: absent?.reason === '생리' && absent?.absentStatus === AbsentStatus.PROCESSING,
      },
    },
  )

  useEffect(() => {
    setAbsentId(Number(id))
  }, [id, setAbsentId])

  const { mutate: denyAbsentMutate, isLoading: isDenyAbsentLoading } = useAbsentsDeny({
    mutation: {
      onSuccess: () => {
        setDeny(false)
      },
    },
  })

  const denyAbsent = () => {
    denyAbsentMutate({
      id,
      data: {
        notApprovedReason,
      },
    })
  }

  const { mutate: teacherCommentAbsentMutate } = useAbsentsTeacherCommentApproval({
    mutation: {
      onSuccess: () => {
        setComment(false)
      },
    },
  })

  const teacherCommentAbsent = () => {
    teacherCommentAbsentMutate({
      id,
      data: {
        teacherComment,
      },
    })
  }

  const { mutate: deleteAppealAbsentMutate, isLoading: isDeleteAppealAbsentLoading } = useAbsentsRequestDelete({
    mutation: {
      onSuccess: () => {
        setDeleteAppeal(false)
      },
    },
  })

  const deleteAppealAbsent = () => {
    deleteAppealAbsentMutate({
      id,
      data: {
        deleteReason,
      },
    })
  }

  const { mutate: deleteAbsentMutate } = useAbsentsDelete({
    mutation: {
      onSuccess: () => {
        alert('삭제되었습니다')
        push('/teacher/absent')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })
  const deleteAbsent = () => {
    deleteAbsentMutate({
      id,
    })
  }

  const { refetch: resendAlimtalk, isLoading: isResendAlimtalkLoading } = useAbsentsResend(id, {
    query: {
      enabled: false,
      onSuccess: () => {
        alert('신청서 알림톡이 재전송되었습니다.')
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const isLoading = isGetAbsentLoading || isDenyAbsentLoading || isDeleteAppealAbsentLoading || isResendAlimtalkLoading

  return {
    deny,
    setDeny,
    deleteAppeal,
    setDeleteAppeal,
    notApprovedReason,
    setNotApprovedReason,
    teacherComment,
    setTeacherComment,
    deleteReason,
    setDeleteReason,
    deleteAbsent,
    absent,
    menses: menses?.items.filter((t) => t.reason === '생리'),
    denyAbsent,
    deleteAppealAbsent,
    isLoading,
    resendAlimtalk,
    comment,
    setComment,
    mensesDialog,
    setMensesDialog,
    teacherCommentAbsent,
    errorMessage,
  }
}
