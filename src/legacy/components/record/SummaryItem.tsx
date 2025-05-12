import { SetStateAction, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { Blank, Textarea } from '@/legacy/components/common'
import { useTeacherRecordSummaryItem } from '@/legacy/container/teacher-record-summary-item'
import { Summary } from '@/legacy/generated/model'
import { forbiddenWords } from 'src/pages/teacher/ForbiddenWords'
import { meState } from '@/stores'
import { SuperModal } from '../SuperModal'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'

interface SummaryItemProps {
  summary: Summary
}

export function SummaryItem({ summary }: SummaryItemProps) {
  const me = useRecoilValue(meState)
  const [recordSummary, setRecordSummary] = useState(summary.content ?? '')
  const [updateState, setUpdateState] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [forbiddenText, setForbiddenText] = useState('')
  const [recordSubject, setRecordSubject] = useState(summary.subject ?? '')

  const { errorText, updateRecordSummary, deleteRecordSummary, isLoading } = useTeacherRecordSummaryItem({
    id: summary?.id ?? 0,
    recordSummary,
    recordSubject,
  })

  // 로그인 유저와 작성자가 다른 경우
  if (!(me?.id === summary.userId)) {
    return (
      <>
        <div>
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="text-lg font-bold">{summary.subject}</div>
            <div className="text-gray-500">작성자 : {summary.teacherName}</div>
          </div>
          <Textarea value={summary.content} disabled className="h-40 bg-gray-50" />
        </div>

        <div className="h-0 w-full border border-gray-50" />
      </>
    )
  }

  return (
    <>
      {isLoading && <Blank />}
      <div>
        <div className="flex items-center justify-between pb-2">
          {updateState ? (
            // eslint-disable-next-line react/jsx-no-undef, @typescript-eslint/no-unsafe-member-access
            <TextInput
              className="w-2/3"
              value={recordSubject}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setRecordSubject(e.target.value)}
            />
          ) : (
            <div className="pl-4 text-lg font-bold">{summary.subject}</div>
          )}
          <div className="text-gray-500">작성자 : {summary.teacherName}</div>
        </div>
        {updateState ? (
          <>
            <Textarea value={recordSummary} onChange={(e) => setRecordSummary(e.target.value)} className="h-40" />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button.lg
                children="수정 완료"
                onClick={() => {
                  const match = recordSummary.match(new RegExp(forbiddenWords.join('|'), 'g'))
                  if (match?.length) {
                    setModalOpen(true)
                    setForbiddenText(match.join(', '))
                  } else {
                    updateRecordSummary()
                    setForbiddenText('')
                  }
                }}
                className="filled-primary"
              />
              <Button.lg
                children="취소"
                onClick={() => {
                  setUpdateState(false)
                  setRecordSummary(summary?.content || '')
                }}
                className="filled-gray"
              />
            </div>
          </>
        ) : (
          <>
            <Textarea value={summary.content} disabled className="h-40" />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button.lg children="수정하기" onClick={() => setUpdateState(true)} className="filled-primary" />
              <Button.lg children="삭제" onClick={() => setDeleteModalOpen(true)} className="filled-red" />
            </div>
          </>
        )}

        {errorText && <div className="text-red-500">{errorText}</div>}
      </div>

      <div className="h-0 w-full border border-gray-50" />
      <SuperModal modalOpen={deleteModalOpen} setModalClose={() => setDeleteModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            해당 총정리 내용을 삭제하시겠습니까?
          </div>
          <Button.lg
            children="삭제하기"
            onClick={async () => {
              await deleteRecordSummary()
              await setDeleteModalOpen(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            학생부 기재 유의어가 포함되어있습니다. <br />
            <span className="text-red-500">{forbiddenText}</span> <br />
            <br />
            기재 내용을 다시 한번 확인해 주시기 바랍니다. 유의어를 포함하여 저장하시겠습니까?
          </div>
          <Button.lg
            children="저장하기"
            onClick={() => {
              updateRecordSummary()
              setForbiddenText('')
              setRecordSummary('')
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
    </>
  )
}
