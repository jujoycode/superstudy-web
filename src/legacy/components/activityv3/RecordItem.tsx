import { format } from 'date-fns'
import { FC, useState } from 'react'
import { Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useRecordDelete, useRecordUpdate } from '@/legacy/generated/endpoint'
import { Record } from '@/legacy/generated/model'
import { useNotificationStore } from '@/stores2/notification'
import { SuperModal } from '../SuperModal'

interface RecordItemProps {
  record: Record
  refetch: () => void
}

export const RecordItem: FC<RecordItemProps> = ({ record, refetch }) => {
  const { setToast: setToastMsg } = useNotificationStore()
  const [updateView, setUpdateView] = useState(false)
  const [content, setContent] = useState<string>(record.content || '')
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

  const { mutate: updateRecord, isLoading: updateRecordLoading } = useRecordUpdate({
    mutation: {
      onSuccess: () => {
        refetch()
        setUpdateView(false)
        setContent('')
      },
      onError: (error) => setToastMsg(error.message),
    },
  })
  const { mutate: deleteRecord, isLoading: deleteRecordLoading } = useRecordDelete({
    mutation: {
      onSuccess: () => {
        setDeleteModalOpen(false)
        setToastMsg('관찰기록이 삭제되었습니다.')
        refetch()
      },
      onError: (error) => {
        setDeleteModalOpen(false)
        setToastMsg(error.message)
      },
    },
  })

  const isRecordLoading = updateRecordLoading || deleteRecordLoading

  return (
    <>
      {isRecordLoading && <div className="bg-littleblack absolute inset-0">로딩 중...</div>}
      <div>
        {updateView ? (
          <>
            <div className="bg-light_orange rounded p-2 whitespace-pre-line">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex h-auto w-full resize-none border-none bg-white p-2 text-sm whitespace-pre-wrap"
              />
            </div>
            <div className="flex items-center justify-end">
              <div className="text-13 text-[#777]">{format(new Date(record.createdAt), 'yyyy.MM.dd HH:mm')}</div>
              <Button
                onClick={() => {
                  setUpdateView(false)
                  setContent(record.content || '')
                }}
                disabled={isRecordLoading}
                className="px-2 py-0.5 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500"
              >
                취소
              </Button>
              <Button
                disabled={isRecordLoading}
                className="text-brand-1 hover:bg-light_orange px-2 py-1 disabled:bg-gray-50 disabled:text-gray-500"
                onClick={() => updateRecord({ id: record.id, data: { content } })}
              >
                저장
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-light_orange rounded p-4 text-sm whitespace-pre-line">{record.content}</div>
            <div className="flex items-center justify-end">
              <div className="text-13 text-[#777]">{format(new Date(record.createdAt), 'yyyy.MM.dd HH:mm')}</div>
              <Button
                onClick={() => setUpdateView(true)}
                disabled={isRecordLoading}
                className="px-2 py-0.5 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500"
              >
                수정
              </Button>
              <Button
                disabled={isRecordLoading}
                className="px-2 py-1 text-red-500 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500"
                onClick={() => setDeleteModalOpen(true)}
              >
                삭제
              </Button>
            </div>
          </>
        )}
        <SuperModal modalOpen={isDeleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              해당 피드백을 삭제하시겠습니까?
            </div>
            <Button.lg
              disabled={isRecordLoading}
              children="삭제하기"
              onClick={() => deleteRecord({ id: record.id })}
              className="filled-primary disabled:filled-gray-dark"
            />
          </Section>
        </SuperModal>
      </div>
    </>
  )
}
