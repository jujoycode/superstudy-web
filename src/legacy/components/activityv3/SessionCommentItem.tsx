import { format } from 'date-fns'
import { FC, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useNotificationStore } from '@/stores/notification'
import { Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useSessionCommentDelete, useSessionCommentUpdate } from '@/legacy/generated/endpoint'
import { ResponseUserDto, SessionComment } from '@/legacy/generated/model'
import { SuperModal } from '../SuperModal'

interface SessionCommentItemProps {
  me?: ResponseUserDto
  sessionComment: SessionComment
  refetch: () => void
}

export const SessionCommentItem: FC<SessionCommentItemProps> = ({ me, sessionComment, refetch }) => {
  const { setToast: setToastMsg } = useNotificationStore()
  const [updateView, setUpdateView] = useState(false)
  const [content, setContent] = useState<string>(sessionComment.content || '')
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

  const { mutate: updateSessionComment, isLoading: updateSessionCommentLoading } = useSessionCommentUpdate({
    mutation: {
      onSuccess: (data) => {
        refetch()
        setUpdateView(false)
        setContent(data.content)
      },
      onError: (error) => setToastMsg(error.message),
    },
  })
  const { mutate: deleteSessionComment, isLoading: deleteSessionCommentLoading } = useSessionCommentDelete({
    mutation: {
      onSuccess: () => {
        setDeleteModalOpen(false)
        setToastMsg('피드백이 삭제되었습니다.')
        refetch()
      },
      onError: (error) => {
        setDeleteModalOpen(false)
        setToastMsg(error.message)
      },
    },
  })

  const isSessionCommentLoading = updateSessionCommentLoading || deleteSessionCommentLoading

  return (
    <>
      {isSessionCommentLoading && <div className="absolute inset-0 bg-neutral-500">로딩 중...</div>}
      <div>
        {updateView ? (
          <>
            <div
              className={twMerge(
                'rounded-sm bg-blue-100 p-2 whitespace-pre-line',
                me?.id === sessionComment.userId && 'bg-primary-50',
              )}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex h-auto w-full resize-none border-none bg-white p-2 text-sm whitespace-pre-wrap"
              />
            </div>

            <div
              className={twMerge(
                'flex items-center justify-end space-x-1 px-1',
                me?.id === sessionComment.userId && 'justify-start',
              )}
            >
              <div className="text-13 text-[#777]">
                {format(new Date(sessionComment.createdAt), 'yyyy.MM.dd HH:mm')}
              </div>
              <Button
                onClick={() => {
                  setUpdateView(false)
                  setContent(sessionComment.content || '')
                }}
                disabled={isSessionCommentLoading}
                className="px-2 py-0.5 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500"
              >
                취소
              </Button>
              <Button
                disabled={isSessionCommentLoading}
                className="text-primary-800 hover:bg-primary-50 px-2 py-1 disabled:bg-gray-50 disabled:text-gray-500"
                onClick={() => updateSessionComment({ id: sessionComment.id, data: { content } })}
              >
                저장
              </Button>
            </div>
          </>
        ) : (
          <>
            <div
              className={twMerge(
                'rounded-sm bg-blue-100 p-4 text-sm whitespace-pre-line',
                me?.id === sessionComment.userId && 'bg-primary-50',
              )}
            >
              {sessionComment.content}
            </div>
            <div
              className={twMerge(
                'flex items-center justify-end space-x-1 px-1',
                me?.id === sessionComment.userId && 'justify-start',
              )}
            >
              <div className="text-13 text-[#777]">
                {format(new Date(sessionComment.createdAt), 'yyyy.MM.dd HH:mm')}
              </div>
              {me?.id === sessionComment.userId && (
                <>
                  <Button
                    onClick={() => setUpdateView(true)}
                    disabled={isSessionCommentLoading}
                    className="px-2 py-0.5 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    수정
                  </Button>
                  <Button
                    disabled={isSessionCommentLoading}
                    className="py-1 text-red-500 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    삭제
                  </Button>
                </>
              )}
            </div>
          </>
        )}
        <SuperModal modalOpen={isDeleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              해당 피드백을 삭제하시겠습니까?
            </div>
            <Button.lg
              children="삭제하기"
              disabled={isSessionCommentLoading}
              onClick={() => deleteSessionComment({ id: sessionComment.id })}
              className="filled-primary disabled:filled-gray-dark"
            />
          </Section>
        </SuperModal>
      </div>
    </>
  )
}
