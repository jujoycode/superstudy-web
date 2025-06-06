import { FC, useState } from 'react'

import { Button } from '@/atoms/Button'
import { Textarea } from '@/legacy/components/common'
import { useStudentRecordontrollerDelete, useStudentRecordontrollerUpdate } from '@/legacy/generated/endpoint'
import { StudentRecord } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

import { SuperModal } from '../SuperModal'

interface AnnualReviewRecordItemProps {
  record: StudentRecord
  refetch: () => void
}

export const AnnualReviewRecordItem: FC<AnnualReviewRecordItemProps> = ({ record, refetch }) => {
  const { t, currentLang } = useLanguage()
  const [updateView, setUpdateView] = useState(false)
  const [title] = useState(record.title || '')
  const [content, setContent] = useState(record.content)
  const [modalOpen, setModalOpen] = useState(false)

  const reportContent = updateView ? content : record.content
  const byteLength = new TextEncoder().encode(reportContent).length
  const trimmedContent = reportContent.replace(/ /g, '')
  const trimmedByteLength = new TextEncoder().encode(trimmedContent).length

  const { mutate: updateStudentRecord } = useStudentRecordontrollerUpdate({
    mutation: {
      onSuccess: () => {
        setUpdateView(false)
        refetch()
      },
    },
  })
  const { mutate: deleteStudentRecord } = useStudentRecordontrollerDelete({
    mutation: {
      onSuccess: () => {
        setUpdateView(false)
        refetch()
      },
    },
  })

  return (
    <>
      {updateView ? (
        <div className="mt-2 flex flex-col space-y-2 rounded-lg border border-gray-300 p-4" key={record.id}>
          <div className="flex items-center justify-between">
            <div className="border-primary-800 text-15 text-primary-800 w-min rounded-xl border px-3 py-1.5 whitespace-pre">
              {record.type}
            </div>
            <div className="text-sm">작성자 : {record?.writer?.name} 선생님</div>
          </div>
          <Textarea className="h-72" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="mt-2 flex w-full items-center justify-between pb-4 text-sm">
            <div>
              <span className="text-gray-500">{t('exclude_space_characters', '공백 제외')} </span>
              {currentLang === 'en' && trimmedContent.length}
              {currentLang !== 'en' && `${trimmedContent.length} 자`}
              &nbsp;/&nbsp;{trimmedByteLength}
              Byte <span className="text-gray-500">{t('include_space_characters', '공백 포함')}</span>{' '}
              {currentLang === 'en' && reportContent.length}
              {currentLang !== 'en' && `${reportContent.length} 자`}
              &nbsp;/&nbsp;
              {byteLength}Byte
            </div>
          </div>
          <div className="flex w-full items-center space-x-2">
            <Button color="tertiary" children="취소" onClick={() => setUpdateView(false)} />
            <Button
              children="제출"
              onClick={() =>
                updateStudentRecord({
                  id: record.id,
                  data: { title, content },
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-col space-y-2 rounded-lg border border-gray-300 p-4" key={record.id}>
          <div className="flex items-center justify-between">
            <div className="border-primary-800 text-15 text-primary-800 w-min rounded-xl border px-3 py-1.5 whitespace-pre">
              {record.type}
            </div>
            <div className="text-sm">작성자 : {record?.writer?.name} 선생님</div>
          </div>
          <Textarea className="h-72" readOnly value={record.content} placeholder="" />
          <div className="mt-2 flex w-full items-center justify-between pb-4 text-sm">
            <div>
              <span className="text-gray-500">{t('exclude_space_characters', '공백 제외')} </span>
              {currentLang === 'en' && trimmedContent.length}
              {currentLang !== 'en' && `${trimmedContent.length} 자`}
              &nbsp;/&nbsp;{trimmedByteLength}
              Byte <span className="text-gray-500">{t('include_space_characters', '공백 포함')}</span>{' '}
              {currentLang === 'en' && reportContent.length}
              {currentLang !== 'en' && `${reportContent.length} 자`}
              &nbsp;/&nbsp;
              {byteLength}Byte
            </div>
          </div>
          <div className="flex w-full items-center space-x-2">
            <Button color="tertiary" children="수정" onClick={() => setUpdateView(true)} />
            <Button color="tertiary" children="삭제" onClick={() => setModalOpen(true)} />
          </div>
        </div>
      )}
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            해당 행동특성 및 종합의견 초안을 삭제하시겠습니까?
          </div>
          <Button
            children="삭제하기"
            onClick={() => {
              deleteStudentRecord({ id: record.id })
              setModalOpen(false)
            }}
            className="w-full"
          />
        </div>
      </SuperModal>
    </>
  )
}
