import { useState } from 'react'
import { Avatar, ListItem } from '@/legacy/components/common'
import { Time } from '@/legacy/components/common/Time'
import { Button } from '@/legacy/components/common/Button'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { SuperModal } from '@/legacy/components/SuperModal'
import type { Comment } from '@/legacy/generated/model'

interface CommentItemProps {
  comment: Comment
  userId?: number
  userRole?: string
  updateComment: (id: number, content: string) => void
  deleteComment: (id: number) => void
}

export function CommentItem({ comment, userId, userRole, updateComment, deleteComment }: CommentItemProps) {
  const [text, setText] = useState(comment.content || undefined)
  const [updateState, setUpdateState] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleUpdate = async () => {
    if (!text) {
      alert('텍스트 내용을 입력해주세요.')
    } else {
      await updateComment(comment.id, text)
      await setUpdateState(false)
    }
  }

  if (!comment) {
    return <></>
  }
  return (
    <ListItem key={comment.id || 0}>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">해당 댓글을 삭제하시겠습니까?</div>
          <Button.lg
            children="삭제하기"
            onClick={async () => {
              await deleteComment(comment?.id)
              await setModalOpen(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
      <div className="flex space-x-2">
        <Avatar size={10} src={comment.user?.customProfile || comment.user?.profile} />
        <div style={{ width: 'calc(100% - 4rem)' }}>
          <div className="align-center flex justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="text-grey-1 min-w-max font-bold">{comment.user?.name}</div>
              <Time date={comment.updatedAt} />
            </div>
            {!updateState ? (
              userId === comment.userId ? (
                <div className="ml-1 flex items-center space-x-2">
                  <span className="min-w-max cursor-pointer text-gray-500" onClick={() => setUpdateState(!updateState)}>
                    수정
                  </span>
                  <span className="min-w-max cursor-pointer text-red-400" onClick={() => setModalOpen(true)}>
                    삭제
                  </span>
                </div>
              ) : userRole === 'TEACHER' ? (
                <span className="min-w-max cursor-pointer text-red-400" onClick={() => setModalOpen(true)}>
                  삭제
                </span>
              ) : (
                <div />
              )
            ) : (
              <></>
            )}
          </div>
          {updateState ? (
            <>
              <SearchInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                onSearch={handleUpdate}
                className="my-1 w-full bg-gray-50 text-sm"
              />
              <div className="ml-2 flex space-x-2">
                <div
                  onClick={() => {
                    setUpdateState(false)
                    setText(comment.content || undefined)
                  }}
                  className="min-w-max text-gray-400"
                >
                  취소
                </div>
                <div onClick={handleUpdate} className="text-brandblue-1 min-w-max">
                  수정 완료
                </div>
              </div>
            </>
          ) : (
            <div className="text-grey-2 mt-1 text-left whitespace-normal">{comment.content}</div>
          )}
        </div>
      </div>
    </ListItem>
  )
}
