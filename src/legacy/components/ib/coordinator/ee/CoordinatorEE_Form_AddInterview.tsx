import { PropsWithChildren, useRef, useState } from 'react'
import { cn } from '@/utils/commonUtil'

import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useUpdateInterview } from '@/legacy/container/ib/update-interview'
import { useInterviewCreateByTeacher, useInterviewUpdateByTeacher } from '@/legacy/generated/endpoint'
import { ResponseInterviewDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import SVGIcon from '../../../icon/SVGIcon'
import { FormInputField } from '../../FormInputField'

interface CoordinatorEE_Form_AddInterviewProps {
  modalOpen: boolean
  setModalClose: () => void
  interviewItems: ResponseInterviewDto[]
  onSuccess: () => void
  handleBack?: () => void
}

export function CoordinatorEE_Form_AddInterview({
  modalOpen,
  setModalClose,
  interviewItems,
  onSuccess,
  handleBack,
}: PropsWithChildren<CoordinatorEE_Form_AddInterviewProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    state: { selectedInterviewIndex, interviewContents, createInterviews },
    setState: { setSelectedInterviewIndex },
    interviews,
    selectedInterview,
    handleCreateInterview,
    handleUpdateInterview,
    handleDeleteInterview,
    handleCreateQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    reset,
  } = useUpdateInterview(interviewItems)

  const { mutate: createInterview, isLoading: createLoading } = useInterviewCreateByTeacher({
    mutation: {
      onSuccess,
    },
  })
  const { mutate: updateInterview, isLoading: updateLoading } = useInterviewUpdateByTeacher({
    mutation: {
      onSuccess,
    },
  })

  const isLoading = createLoading || updateLoading

  const handleSubmit = () => {
    for (const createContent of createInterviews) {
      createInterview({ data: { ...createContent, category: 'EE_RPPF' } })
    }
    for (const [id, updateContent] of Object.entries(interviewContents)) {
      updateInterview({ id: Number(id), data: updateContent })
    }
    return
  }

  const isDisabled = () => {
    for (const key in interviewContents) {
      if (interviewContents[key].title === '' || interviewContents[key].description === '') {
        return true
      }
      if (interviewContents[key].commonQuestion.some((q) => q.question === '')) {
        return true
      }
    }

    if (createInterviews.some((interview) => interview.commonQuestion.some((q) => q.question === ''))) {
      return true
    }

    if (createInterviews.some((interview) => interview.title === '' || interview.description === '')) {
      return true
    }

    return false
  }

  return (
    <>
      {isLoading && <Blank />}
      <div
        className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black/50 ${
          !modalOpen && 'hidden'
        }`}
      >
        <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
          <div className="backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
            <Typography variant="title1">인터뷰 작성</Typography>
            <ColorSVGIcon.Close
              color="gray700"
              className="cursor-pointer"
              size={32}
              onClick={() => {
                setModalClose()
                reset()
              }}
            />
          </div>
          <div className="flex items-start justify-between space-x-4 py-2">
            <div className="flex w-full flex-row items-center gap-2 overflow-x-auto">
              {interviews?.map((interview, index) => (
                <div
                  key={JSON.stringify(interview)}
                  onClick={() => setSelectedInterviewIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-center rounded-lg px-4 py-[9px] whitespace-pre',
                    index === selectedInterviewIndex
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  {interview.title}
                </div>
              ))}
            </div>
            <ButtonV2
              variant="outline"
              size={40}
              color="gray400"
              onClick={handleCreateInterview}
              className="flex items-center justify-center gap-1 whitespace-pre"
            >
              <SVGIcon.Plus color="gray700" size={16} weight="bold" />
              추가
            </ButtonV2>
          </div>
          <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pt-4 pb-8">
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between py-2">
                <Typography variant="title2">{selectedInterview.title}</Typography>
                {!interviewItems[selectedInterviewIndex] && (
                  <ColorSVGIcon.Close
                    className="cursor-pointer"
                    color="gray700"
                    size={32}
                    onClick={handleDeleteInterview}
                  />
                )}
              </div>
              <FormInputField.Interview
                label="인터뷰 유형"
                value={selectedInterview?.title}
                onChange={(e) => handleUpdateInterview({ title: e.target.value })}
              />
              <FormInputField.Interview
                label="인터뷰 설명"
                value={selectedInterview?.description}
                onChange={(e) => handleUpdateInterview({ description: e.target.value })}
              />
            </div>
            {selectedInterview?.commonQuestion?.map((dto, index) => (
              <FormInputField.Question
                key={index}
                index={index}
                label="항목"
                dto={dto}
                setQuestion={(dto) => handleUpdateQuestion(dto, index)}
                deleteQuestion={() => handleDeleteQuestion(index)}
              />
            ))}

            <div className="flex justify-center">
              <ButtonV2
                variant="outline"
                size={40}
                color="gray400"
                className="flex flex-row items-center gap-1"
                onClick={handleCreateQuestion}
              >
                <SVGIcon.Plus color="gray700" size={16} weight="bold" />
                항목 추가하기
              </ButtonV2>
            </div>
          </div>

          <div
            className={
              'backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8'
            }
          >
            <div className="flex justify-end gap-3">
              <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
                이전
              </ButtonV2>
              <ButtonV2
                type="submit"
                variant="solid"
                disabled={isLoading || isDisabled()}
                color="orange800"
                size={48}
                onClick={handleSubmit}
              >
                저장하기
              </ButtonV2>
            </div>
          </div>
        </div>
        {isOpen && (
          <AlertV2 confirmText="확인" message={`인터뷰가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
        )}
      </div>
    </>
  )
}
