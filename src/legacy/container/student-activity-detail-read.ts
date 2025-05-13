import { useState } from 'react'

import {
  useStudentActivityCommentCreate,
  useStudentActivityCommentDelete,
  useStudentActivityCommentFindAll,
  useStudentActivityCommentUpdate,
} from '@/legacy/generated/endpoint'
import { RequestCreateActivityCommentDto } from '@/legacy/generated/model'

export function useStudentActivityDetailRead(studentActivityId: number, setLoading: (s: boolean) => void) {
  const [text, setText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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

  const { mutate: createComment } = useStudentActivityCommentCreate({
    mutation: {
      onSuccess: () => {
        refetchComment()
        setLoading(false)
        setText('')
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
        setLoading(false)
        setText('')
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
        setLoading(false)
        setText('')
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
    isLoading: isCommentsLoading,
    comments,
    errorMessage,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
  }
}
