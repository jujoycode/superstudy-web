import { ChangeEventHandler, InputHTMLAttributes, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

import { Input } from '@/legacy/components/common/Input'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { IBInterviewCommonQuestionDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../icon/ColorSVGIcon'

interface FormInputFieldProps {
  index: number
  question: string
  label: string
  deleteQuestion: () => void
  setQuestion?: (question: string) => void
  size?: 40 | 32 | 48
  readOnly?: boolean
}

export const FormInputField = ({
  index,
  question,
  label,
  deleteQuestion,
  setQuestion = () => {},
  size = 40,
  readOnly = false,
}: PropsWithChildren<FormInputFieldProps>) => {
  const onChangeQuestion: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuestion(e.target.value)
  }

  return (
    <section>
      <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <Typography variant="title3" className="font-semibold">
            {label} <span className="text-primary-800">{index + 1}</span>
          </Typography>
          <ColorSVGIcon.Close color="gray700" size={24} onClick={deleteQuestion} className="cursor-pointer" />
        </div>

        <Input.Basic
          className="bg-white"
          placeholder={'항목을 입력해주세요.'}
          size={size}
          readOnly={readOnly}
          value={question} // 부모에서 전달받은 question.question 사용
          onChange={onChangeQuestion}
        />
      </div>
    </section>
  )
}

interface InterviewFormInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  disabled?: boolean
  className?: string
}

FormInputField.Interview = ({ label, className, disabled = false, ...props }: InterviewFormInputFieldProps) => {
  return (
    <div
      className={twMerge(
        'focus:border-brand-1 flex h-12 w-full items-center space-x-2 rounded-md border border-gray-200 bg-white px-4 placeholder-gray-400 focus:ring-0',
        disabled && 'bg-gray-100 text-gray-400',
        className,
      )}
    >
      {label && <div className="whitespace-pre">{label}</div>}
      <input className="block w-full border-0 focus:ring-0" {...props} />
    </div>
  )
}

interface QuestionFormInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  index: number
  dto: IBInterviewCommonQuestionDto
  label: string
  deleteQuestion: () => void
  setQuestion?: (dto: IBInterviewCommonQuestionDto) => void
  size?: 40 | 32 | 48
  readOnly?: boolean
  useHint?: boolean
}

FormInputField.Question = ({
  index,
  dto: { question, hint },
  label,
  deleteQuestion,
  setQuestion = () => {},
  size = 40,
  readOnly = false,
  useHint = true,
}: PropsWithChildren<QuestionFormInputFieldProps>) => {
  const onChangeQuestion: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuestion({ question: e.target.value })
  }

  const onChangeHint: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setQuestion({ question, hint: e.target.value })
  }

  return (
    <section>
      <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <Typography variant="title3" className="font-semibold">
            {label} <span className="text-primary-800">{index + 1}</span>
          </Typography>
          <ColorSVGIcon.Close color="gray700" size={24} onClick={deleteQuestion} className="cursor-pointer" />
        </div>

        <Input.Basic
          className="bg-white"
          placeholder={'항목을 입력해주세요.'}
          size={size}
          readOnly={readOnly}
          value={question} // 부모에서 전달받은 question.question 사용
          onChange={onChangeQuestion}
        />
        {useHint && (
          <TextareaV2
            className="font-base text-14 h-24 w-full resize-none rounded-lg bg-white p-4"
            placeholder={'(선택)예시 답변을 입력해주세요.'}
            value={hint}
            onChange={onChangeHint}
          />
        )}
      </div>
    </section>
  )
}
