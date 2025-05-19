// ProposalInputField.tsx
import { PropsWithChildren, useState } from 'react'

import { Input } from '@/legacy/components/common/Input'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { FAQContentDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../icon/ColorSVGIcon'

interface FaqInputFieldProps {
  index: number
  initialQuestion: FAQContentDto // 초기 질문 데이터
  onUpdate: (index: number, updatedContent: FAQContentDto) => void // 부모에 변경사항 전달
  onDelete: (index: number) => void // 삭제 이벤트
  size?: 40 | 32 | 48
  readOnly?: boolean
}

export const FaqInputField = ({
  index,
  initialQuestion,
  onUpdate,
  onDelete,
  size = 40,
  readOnly = false,
}: PropsWithChildren<FaqInputFieldProps>) => {
  const [questionData, setQuestionData] = useState<FAQContentDto>(initialQuestion)
  const onChangeField = (field: 'question' | 'answer', value: string) => {
    const updatedData = { ...questionData, [field]: value }
    setQuestionData(updatedData)
    onUpdate(index, updatedData) // 부모에 변경사항 전달
  }

  return (
    <section>
      <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <Typography variant="title3" className="font-semibold text-gray-900">
            질문 <span className="text-primary-800">{index + 1}</span>
          </Typography>
          <ColorSVGIcon.Close color="gray700" size={24} onClick={() => onDelete(index)} />
        </div>

        <Input.Basic
          className="bg-white"
          placeholder={'질문을 입력해주세요.'}
          size={size}
          readOnly={readOnly}
          value={questionData.question}
          onChange={(e) => onChangeField('question', e.target.value)}
        />
        <TextareaV2
          className="h-20 bg-white"
          placeholder={'답변을 입력해주세요.'}
          readOnly={readOnly}
          value={questionData.answer}
          onChange={(e) => onChangeField('answer', e.target.value)}
        />
      </div>
    </section>
  )
}
