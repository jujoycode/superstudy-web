import { FC, useState } from 'react'

import { Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useStudentRecordontrollerDelete, useStudentRecordontrollerUpdate } from '@/legacy/generated/endpoint'
import { StudentRecord } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

import { SuperModal } from '../SuperModal'

interface StudentRecordItemProps {
  record: StudentRecord
  refetch: () => void
}

export const StudentRecordItem: FC<StudentRecordItemProps> = ({ record, refetch }) => {
  const { t, currentLang } = useLanguage()
  const [updateView, setUpdateView] = useState(false)
  const [title, setTitle] = useState(record.title)
  const [content, setContent] = useState(record.content)
  const [modalOpen, setModalOpen] = useState(false)

  const reportContent = updateView ? content : record.content
  const byteLength = new TextEncoder().encode(reportContent).length
  const trimmedContent = reportContent.replaceAll(' ', '')
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
            <div className="border-brand-1 text-15 text-brand-1 w-min rounded-xl border px-3 py-1.5 whitespace-pre">
              {record.type}
            </div>
            <div className="text-sm">작성자 : {record?.writer?.name} 선생님</div>
          </div>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <Button className="bg-gray-300 text-gray-600" onClick={() => setUpdateView(false)}>
              취소
            </Button>
            <Button
              className="bg-brand-1 text-white"
              onClick={() =>
                updateStudentRecord({
                  id: record.id,
                  data: { title, content },
                })
              }
            >
              제출
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-col space-y-2 rounded-lg border border-gray-300 p-4" key={record.id}>
          <div className="flex items-center justify-between">
            <div className="border-brand-1 text-15 text-brand-1 w-min rounded-xl border px-3 py-1.5 whitespace-pre">
              {record.type}
            </div>
            <div className="text-sm">작성자 : {record?.writer?.name} 선생님</div>
          </div>
          <TextInput readOnly value={record.title} placeholder="제목을 입력해주세요" />
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
          </div>{' '}
          <div className="flex w-full items-center space-x-2">
            <Button className="bg-brand-1 text-white" onClick={() => setUpdateView(true)}>
              수정
            </Button>
            <Button className="bg-red-500 text-white" onClick={() => setModalOpen(true)}>
              삭제
            </Button>
          </div>
        </div>
      )}
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            해당 활동기록 초안을 삭제하시겠습니까?
          </div>
          <Button.lg
            children="삭제하기"
            onClick={() => {
              deleteStudentRecord({ id: record.id })
              setModalOpen(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
    </>
  )
}
