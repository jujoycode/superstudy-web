import { useState } from 'react'
import {
  useStudentActivityCommentCreate,
  useStudentActivityCommentDelete,
  useStudentActivityCommentFindAll,
  useStudentActivityCommentUpdate,
  useStudentActivityFindOne,
} from '@/legacy/generated/endpoint'
import { useTeacherActivityDetail } from './teacher-activity-detail'
import type { RequestCreateActivityCommentDto } from '@/legacy/generated/model'

export function useTeacherActivitySubmitDetail(activityId: number, studentActivityId: number) {
  const { activity, isActivityLoading, errorMessage: activityDetailErrorMessage } = useTeacherActivityDetail(activityId)

  const [text, setText] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    data: comments,
    isLoading: isCommentsLoading,
    refetch: refetchComment,
  } = useStudentActivityCommentFindAll(studentActivityId, {
    query: {
      enabled: !!studentActivityId,
      onError: () => {
        setErrorMessage('학생활동댓글을 불러오는데 실패했습니다.')
      },
    },
  })

  const { data: studentActivity, error } = useStudentActivityFindOne(studentActivityId, {
    query: {
      enabled: !!studentActivityId,
    },
  })

  const { mutate: createComment } = useStudentActivityCommentCreate({
    mutation: {
      onSuccess: () => {
        refetchComment()
        setText('')
        setLoading(false)
      },
      onError: () => {
        setErrorMessage('학생활동댓글 추가에 실패했습니다.')
      },
    },
  })

  const { mutate: updateComment } = useStudentActivityCommentUpdate({
    mutation: {
      onSuccess: () => {
        refetchComment()
        setText('')
        setLoading(false)
      },
      onError: () => {
        setErrorMessage('학생활동댓글 수정에 실패했습니다.')
      },
    },
  })

  const { mutate: deleteComment } = useStudentActivityCommentDelete({
    mutation: {
      onSuccess: () => {
        refetchComment()
        setText('')
        setLoading(false)
      },
      onError: () => {
        setErrorMessage('학생활동댓글 삭제에 실패했습니다.')
      },
    },
  })

  const handleCommentCreate = (data: RequestCreateActivityCommentDto) => {
    setLoading(true)
    createComment({ data })
  }

  const handleCommentUpdate = (commentId: number, content: string) => {
    setLoading(true)
    updateComment({ id: commentId, data: { content } })
  }

  const handleCommentDelete = (commentId: number) => {
    setLoading(true)
    deleteComment({ id: commentId })
  }

  return {
    text,
    setText,
    isLoading: isCommentsLoading || isActivityLoading || isLoading,
    activity,
    studentActivity,
    comments,
    errorMessage: errorMessage || activityDetailErrorMessage || error,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
  }
}
