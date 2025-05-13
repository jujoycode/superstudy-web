import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import { Blank, Section, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { RecordCard } from '@/legacy/components/record/RecordCard'
import { SummaryItem } from '@/legacy/components/record/SummaryItem'
import { useTeacherRecordDetail } from '@/legacy/container/teacher-record-detail'
import { Group, StudentGroup } from '@/legacy/generated/model'
import { forbiddenWords } from '../ForbiddenWords'

const getRecordSummaryLength = (text: string) => {
  const hangulLength = text.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g)?.length || 0
  const enterLength = text.match(/(\r)|(\n)/g)?.length || 0
  const etcLength = text.length - hangulLength - enterLength
  return hangulLength * 3 + enterLength * 2 + etcLength
}

interface RecordDetailPageProps {
  studentGroups?: StudentGroup[]
  selectedGroup?: Group
}

export function RecordDetailPage({ studentGroups, selectedGroup }: RecordDetailPageProps) {
  const { id } = useParams<{ id: string }>()

  const {
    studentActivities,
    isLoading,
    subjects,
    errorText,
    selectedSubject,
    selectedStudentGroup,
    selectedUser,
    setSelectedSubject,
    recordSummary,
    setRecordSummary,
    createRecordSummary,
    //createOrUpdateRecordSummary,
    summaries,
  } = useTeacherRecordDetail({
    userId: Number(id),
    groupId: Number(selectedGroup?.id ?? 0),
    studentGroups,
  })

  const [subjectFilter, setSubjectFilter] = useState('')
  const [selectedSAIds, setSelectedSAIds] = useState<number[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [forbiddenText, setForbiddenText] = useState('')

  useEffect(() => {
    if (!recordSummary) {
      const record = localStorage.getItem('recordSummary') || ''
      setRecordSummary(record)
    }
  }, [localStorage, recordSummary])

  return (
    <>
      <div className="col-span-4 grid grid-cols-4">
        {isLoading && <Blank />}
        {errorText && <ErrorBlank text={errorText} />}
        <div className="col-span-2 h-screen">
          <Section>
            <div className="mr-7 flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                {selectedGroup?.name} {selectedStudentGroup?.studentNumber}번 {selectedUser?.name}
              </h1>
              <Checkbox
                className="-mr-0.5 h-6 w-6"
                checked={selectedSAIds.length === studentActivities?.length}
                onChange={() => {
                  if (selectedSAIds.length === studentActivities?.length) {
                    setSelectedSAIds([])
                  } else {
                    setSelectedSAIds(studentActivities?.map((el) => el.id) || [])
                  }
                }}
              />
            </div>
            <div className="text-base text-gray-500">
              희망진로 : <span className="text-gray-800">{selectedUser?.hopePath}</span> / 희망학과 :{' '}
              <span className="text-gray-800">{selectedUser?.hopeMajor}</span>
            </div>
            <Select.lg
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value)
                setSelectedSubject(e.target.value)
              }}
            >
              <option selected hidden>
                과목
              </option>
              {subjects?.map((subject) => (
                <option value={subject} key={subject}>
                  {subject}
                </option>
              ))}
            </Select.lg>
            <div className="h-0.5 bg-gray-100"></div>
            {studentActivities
              ?.slice()
              ?.filter((sa) => (subjectFilter ? sa?.activity?.subject === subjectFilter : true))
              ?.sort(
                (a, b) =>
                  new Date(a.activity?.createdAt || '').getTime() - new Date(b.activity?.createdAt || '').getTime(),
              )
              ?.map((record) => (
                <RecordCard
                  record={record}
                  selectedSAIds={selectedSAIds}
                  setSelectedSAIds={(ids: number[]) => setSelectedSAIds(ids)}
                />
              ))}
          </Section>
        </div>

        <div className="overflow-h-scroll scroll-box col-span-2 h-screen">
          <Section className="mt-6">
            <div className="flex w-full items-center justify-between">
              <div className="text-lg font-bold">활동기록 총정리</div>
              <div>
                {recordSummary.length}자 {getRecordSummaryLength(recordSummary)}
                Bytes
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border-2 border-gray-200">
              <Textarea
                value={recordSummary}
                onChange={(e) => {
                  setRecordSummary(e.target.value)
                  localStorage.setItem('recordSummary', e.target.value)
                }}
                className="h-80"
              />
            </div>
            <TextInput value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} />

            <div className="flex w-full items-center justify-end space-x-2">
              <Button.xl
                children="불러오기"
                onClick={() => {
                  let recordText = ''
                  studentActivities
                    ?.filter((sa) => sa.id && selectedSAIds.includes(sa.id) && (!!sa.summary || !!sa.feedback))
                    ?.filter((sa) => (subjectFilter ? sa?.activity?.subject === subjectFilter : true))
                    ?.reverse()
                    ?.map((sa) => {
                      if (sa.activity?.commonText) {
                        recordText += sa.activity.commonText + '\n'
                      }
                      if (sa.summary) {
                        recordText += sa.summary + '\n'
                      }
                      if (sa.feedback) {
                        recordText += sa.feedback + '\n'
                      }
                      recordText += '\n'
                    })
                  setRecordSummary(recordText)
                  localStorage.setItem('recordSummary', recordText)
                }}
                className="filled-primary"
              />
              <Button.xl
                children="저장하기"
                onClick={() => {
                  if (!selectedSubject) {
                    alert('과목을 선택해주세요.')
                    return
                  }

                  const match = recordSummary.match(new RegExp(forbiddenWords.join('|'), 'g'))

                  if (match?.length) {
                    setModalOpen(true)
                    setForbiddenText(match.join(', '))
                  } else {
                    createRecordSummary()
                    //createOrUpdateRecordSummary();
                    setForbiddenText('')
                  }
                }}
                className="filled-primary"
              />
            </div>
          </Section>
          <div className="my-6 h-0 w-full border border-gray-100" />
          <Section>
            {summaries
              ?.slice()
              .sort((a, b) => new Date(b?.createdAt || '').getTime() - new Date(a?.createdAt || '').getTime())
              .map((summary) => <SummaryItem summary={summary} />)}
          </Section>
        </div>
      </div>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            학생부 기재 유의어가 포함되어있습니다. <br />
            <span className="text-red-500">{forbiddenText}</span> <br />
            <br />
            기재 내용을 다시 한번 확인해 주시기 바랍니다. 유의어를 포함하여 저장하시겠습니까?
          </div>
          <Button.xl
            children="저장하기"
            onClick={() => {
              createRecordSummary()
              //createOrUpdateRecordSummary();
              setForbiddenText('')
              setModalOpen(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
    </>
  )
}
