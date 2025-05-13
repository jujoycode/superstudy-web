import clsx from 'clsx'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'

import { Blank } from '@/legacy/components/common'
import { Input } from '@/legacy/components/common/Input'
import {
  useIBProfileCreateTemplate,
  useIBProfileUpdateTemplateItem,
  useInterviewCreateByTeacher,
  useInterviewUpdateByTeacher,
} from '@/legacy/generated/endpoint'
import {
  IBInterviewCommonQuestionDto,
  RequestCreateInterviewDtoCategory,
  ResponseIBProfileTemplateDto,
  ResponseInterviewDto,
} from '@/legacy/generated/model'

import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import SVGIcon from '../../../icon/SVGIcon'
import { FormInputField } from '../../FormInputField'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'

import { CAS_QUESTION_TYPES } from './CoordinatorCAS_Question'

interface CoordinatorCAS_Question_AddQuestionProps {
  type: string
  interviews: ResponseInterviewDto[]
  profile?: ResponseIBProfileTemplateDto
  selectedInterviewType?: RequestCreateInterviewDtoCategory
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: () => void
  handleBack?: () => void
}

export interface QA {
  id: number // 각 질문/답변을 고유하게 식별하기 위한 ID
  question: string
  answer: string
}

const PORTFOLIO_TYPES: { id: number; value: RequestCreateInterviewDtoCategory; name: string }[] = [
  { id: 1, value: 'CAS_PORTFOLIO_1', name: '1차 인터뷰' },
  { id: 2, value: 'CAS_PORTFOLIO_2', name: '2차 인터뷰' },
  { id: 3, value: 'CAS_PORTFOLIO_3', name: '3차 인터뷰' },
]

export function CoordinatorCAS_Question_AddQuestion({
  type,
  interviews,
  profile,
  selectedInterviewType,
  modalOpen,
  setModalClose,
  onSuccess,
  handleBack,
}: PropsWithChildren<CoordinatorCAS_Question_AddQuestionProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<RequestCreateInterviewDtoCategory>('CAS_PORTFOLIO_1')
  const [profileQuestions, setProfileQuestions] = useState<string[]>([''])
  const [questions, setQuestions] = useState<IBInterviewCommonQuestionDto[]>([{ question: '', hint: '' }])

  const { mutate: createTemplate, isLoading: templateLoading } = useIBProfileCreateTemplate()

  const { mutate: updateTemplate, isLoading: updateTemplateLoading } = useIBProfileUpdateTemplateItem()

  const { mutate: createInterview, isLoading: interviewLoading } = useInterviewCreateByTeacher()

  const { mutate: updateInterview, isLoading: updateInterviewLoading } = useInterviewUpdateByTeacher()

  const reset = () => {
    setTitle('')
    setQuestions([])
    setCategory('CAS_PORTFOLIO_1')
  }

  const interview = interviews.find((el) => (el.category as any) === category)

  useEffect(() => {
    if (type === 'CAS_PROFILE' && profile) {
      setTitle(profile?.title || '')
      setProfileQuestions(profile.commonQuestion)
    }
    if (type === 'INTERVIEW') {
      setTitle(interview?.title || '')
      setQuestions(interview?.commonQuestion || [{ question: '', hint: '' }])
    }
    if (type === 'RISK_ASSESSMENT') {
      setTitle('위험평가 양식')
      setCategory('CAS_RISK_ASSESSMENT')
      setQuestions(interview?.commonQuestion || [{ question: '', hint: '' }])
    }
    if (selectedInterviewType) {
      setCategory(selectedInterviewType)
    }
  }, [interview, profile])

  const isLoading = templateLoading || updateTemplateLoading || interviewLoading || updateInterviewLoading

  return (
    <>
      {isLoading && <Blank />}
      <div
        className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
          !modalOpen && 'hidden'
        }`}
      >
        <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
          <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6 backdrop-blur-[20px]">
            <Typography variant="title1">{CAS_QUESTION_TYPES[type]} 작성</Typography>
            <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} />
          </div>
          {type === 'INTERVIEW' && !selectedInterviewType && (
            <div className="flex items-center justify-between space-x-4 py-2">
              <div className="scroll-box flex w-full flex-row items-center gap-2 overflow-x-auto">
                {PORTFOLIO_TYPES.map(({ id, name, value }) => (
                  <div
                    key={id}
                    onClick={() => setCategory(value)}
                    className={clsx(
                      'flex cursor-pointer items-center justify-center rounded-lg px-4 py-[9px] whitespace-pre',
                      category === value
                        ? 'bg-primary-gray-700 text-white'
                        : 'bg-primary-gray-50 text-primary-gray-700 hover:bg-primary-gray-200',
                    )}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pt-4 pb-8">
            <Input.Basic
              className="bg-white"
              placeholder={'제목을 입력해주세요.'}
              size={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {type === 'CAS_PROFILE' &&
              profileQuestions.map((question, index) => (
                <FormInputField
                  key={index}
                  index={index}
                  label="항목"
                  question={question}
                  setQuestion={(value: string) =>
                    setProfileQuestions((prev) => prev.map((q, i) => (i === index ? value : q)))
                  }
                  deleteQuestion={() =>
                    setProfileQuestions((prev) => {
                      const newQuestions = structuredClone(prev)
                      newQuestions.splice(index, 1)
                      return newQuestions
                    })
                  }
                />
              ))}
            {type === 'INTERVIEW' &&
              questions.map((dto, index) => (
                <FormInputField.Question
                  key={index}
                  index={index}
                  label="항목"
                  dto={dto}
                  setQuestion={(dto) =>
                    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...dto } : q)))
                  }
                  deleteQuestion={() =>
                    setQuestions((prev) => {
                      const newQuestions = structuredClone(prev)
                      newQuestions.splice(index, 1)
                      return newQuestions
                    })
                  }
                />
              ))}
            {type === 'RISK_ASSESSMENT' &&
              questions.map((dto, index) => (
                <FormInputField.Question
                  key={index}
                  index={index}
                  label="항목"
                  dto={dto}
                  setQuestion={(dto) =>
                    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...dto } : q)))
                  }
                  deleteQuestion={() =>
                    setQuestions((prev) => {
                      const newQuestions = structuredClone(prev)
                      newQuestions.splice(index, 1)
                      return newQuestions
                    })
                  }
                />
              ))}
            <div className="flex justify-center">
              <ButtonV2
                variant="outline"
                size={40}
                color="gray400"
                className="flex flex-row items-center gap-1 whitespace-pre"
                onClick={() =>
                  type === 'CAS_PROFILE'
                    ? setProfileQuestions(profileQuestions.concat(''))
                    : setQuestions(questions.concat({ question: '', hint: '' }))
                }
              >
                <SVGIcon.Plus color="gray700" size={16} weight="bold" />
                항목 추가하기
              </ButtonV2>
            </div>
          </div>

          <div
            className={
              'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t bg-white/70 pt-6 pb-8 backdrop-blur-[20px]'
            }
          >
            <div className="flex justify-end gap-3">
              <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
                이전
              </ButtonV2>
              <ButtonV2
                type="submit"
                variant="solid"
                color="orange800"
                size={48}
                disabled={
                  !(
                    (type === 'CAS_PROFILE'
                      ? profileQuestions.filter((el) => !!el).length
                      : questions.filter((el) => !!el.question).length) && title
                  )
                }
                onClick={() => {
                  if (type === 'CAS_PROFILE') {
                    if (profile) {
                      updateTemplate({ data: { title, commonQuestion: profileQuestions } })
                    } else {
                      createTemplate({ data: { title, commonQuestion: profileQuestions } })
                    }
                  } else if (type === 'INTERVIEW') {
                    if (interview) {
                      updateInterview({
                        id: interview.id,
                        data: {
                          title: (PORTFOLIO_TYPES.find((el) => el.value === category)?.name || '인터뷰') + ' 양식',
                          description: title,
                          commonQuestion: questions,
                        },
                      })
                    } else if (category) {
                      createInterview({
                        data: {
                          title: (PORTFOLIO_TYPES.find((el) => el.value === category)?.name || '인터뷰') + ' 양식',
                          description: title,
                          category,
                          commonQuestion: questions,
                        },
                      })
                    }
                  } else if (type === 'RISK_ASSESSMENT') {
                    if (interview) {
                      updateInterview({
                        id: interview.id,
                        data: {
                          title: '위험평가 양식',
                          description: title,
                          commonQuestion: questions,
                        },
                      })
                    } else if (category) {
                      createInterview({
                        data: {
                          title: '위험평가 양식',
                          description: title,
                          category: 'CAS_RISK_ASSESSMENT',
                          commonQuestion: questions,
                        },
                      })
                    }
                  }
                  reset()
                  onSuccess()
                }}
              >
                저장하기
              </ButtonV2>
            </div>
          </div>
        </div>
        {isOpen && (
          <AlertV2 confirmText="확인" message={`참고자료가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
        )}
      </div>
    </>
  )
}
