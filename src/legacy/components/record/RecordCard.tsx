import { Blank, Label, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { useTeacherRecordCard } from '@/legacy/container/teacher-record-card'
import { StudentActivity } from '@/legacy/generated/model'
import { makeDateToString } from '@/legacy/util/time'

import { ErrorBlank } from '../ErrorBlank'

interface RecordCardProps {
  record: StudentActivity
  selectedSAIds: number[]
  setSelectedSAIds: (ids: number[]) => void
}

export function RecordCard({ record, selectedSAIds, setSelectedSAIds }: RecordCardProps) {
  const activity = record?.activity

  const { errorText, feedback, setFeedback, updateFeedback, isLoading } = useTeacherRecordCard({ record })

  return (
    <div className="overflow-hidden rounded-lg border-2 border-gray-200">
      {isLoading && <Blank />}
      {errorText && <ErrorBlank text={errorText} />}
      <div className="flex items-center justify-between bg-gray-50 px-6 py-3">
        <div>
          <div className="flex items-center space-x-2 font-semibold">
            {record.isSubmitted ? (
              <div className="min-w-7">제출</div>
            ) : (
              <div className="min-w-11 text-red-500">미제출</div>
            )}

            <a className="text-blue-600" href={`/teacher/activity/${activity?.id}`}>
              [{activity?.subject}] {activity?.title}
            </a>
          </div>

          <h3 className="text-gray-3 mt-2 text-sm">{makeDateToString(new Date(activity?.createdAt || ''), '.')}</h3>
        </div>
        <Checkbox
          className="h-6 w-6"
          checked={selectedSAIds.includes(record?.id || 0)}
          onChange={() => {
            if (record?.id) {
              if (selectedSAIds.includes(record.id)) {
                setSelectedSAIds(selectedSAIds.filter((id) => id !== record.id))
              } else {
                setSelectedSAIds(selectedSAIds.concat(record.id))
              }
            }
          }}
        />
      </div>
      <Section>
        <div>
          <h2 className="font-semibold">공통문구</h2>
          <h2 className="mt-2 text-sm">{activity?.commonText}</h2>
        </div>

        <div>
          <h2 className="font-semibold">활동요약</h2>
          {record.summary && <Textarea readOnly value={record.summary} className="h-30"></Textarea>}
        </div>

        <Label.col>
          <Label.Text children="피드백" />
          <Textarea
            placeholder="선생님이 직접 입력하는 부분입니다."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Label.col>
        <div className="mt-6">
          <Button.lg children="등록하기" onClick={() => updateFeedback()} className="filled-primary mx-auto w-[70%]" />
        </div>
      </Section>
    </div>
  )
}
