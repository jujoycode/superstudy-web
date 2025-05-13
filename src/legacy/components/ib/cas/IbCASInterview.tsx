import clsx from 'clsx'
import { PropsWithChildren, useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useCheckListGetByStudent } from '@/legacy/container/ib-checklist-find'
import { useIBInterviewCreate } from '@/legacy/container/ib-student-interview'
import { RequestCreateQnaDto, ResponseStudentInterviewDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbCASInterviewProps {
  modalOpen: boolean
  setModalClose: () => void
  onSuccess: (action: 'INTERVIEW', data?: any) => void
  handleBack?: () => void
  data: ResponseStudentInterviewDto[]
  ablePropragation?: boolean
  studentId: number
}

// const CHECKLIST = [
//   { id: 1, content: 'C,A,S의 조화가 중요합니다.', check: false },
//   {
//     id: 2,
//     content:
//       'C,A,S 활동(일반) CAS project 활동은 18개월 (DP1 3월부터 DP2 9월까지, 방학포함)동안 꾸준히 이루어져야 합니다.',
//     check: false,
//   },
//   {
//     id: 3,
//     content:
//       'CAS project 활동은 1달 이상의 장기 프로젝트로 C,A,S를 융합한 활동입니다. 또한 CAS project는 1회 이상 필수입니다.',
//     check: false,
//   },
//   { id: 4, content: '7가지 학습성과를 18개월 동안 꼭 달성해야 합니다.', check: false },
//   { id: 5, content: '교과(DP6그룹) 내 평가에 들어가는 활동은 CAS활동으로 입력할 수 없습니다.', check: false },
//   { id: 6, content: '꾸준함을 1달을 기준으로 2주에 한번 이상의 기록을 필수로 합니다.', check: false },
//   { id: 7, content: '3번의 성찰 점검표 및 인터뷰, 1번의 전시회가 필수적으로 이루어집니다.', check: false },
// ];

export function IbCASInterview({
  modalOpen,
  setModalClose,
  onSuccess,
  handleBack,
  studentId,
  data,
  ablePropragation = false,
}: PropsWithChildren<IbCASInterviewProps>) {
  const {
    handleSubmit,
    register,
    watch,
    formState: {},
  } = useForm<RequestCreateQnaDto>()

  const { CheckList } = useCheckListGetByStudent(studentId, 'CAS')
  const [step, setStep] = useState<number>(0)
  const [selectedValue, setSelectedValue] = useState<number>()
  const [selectedData, setSelectedData] = useState<ResponseStudentInterviewDto>()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [check, setChecked] = useState<boolean>(false)
  const handleGroupChange = (selectedValues: number[]) => {
    setSelectedIds(selectedValues)
    setChecked(selectedValues.length === CheckList?.length)
  }

  const handleRadioChange = (value: number) => {
    setSelectedValue(value)
    const matchedData = data?.find((item) => item.id === value)
    if (!matchedData) {
      console.error(`해당 id(${value})를 가진 데이터가 없습니다.`)
    }
    setSelectedData(matchedData || data[0])
  }

  const handleAllCheck = () => {
    setChecked((prev) => {
      const newCheckState = !prev
      if (newCheckState) {
        // 모든 아이템 선택
        setSelectedIds(CheckList?.map((item) => item.id) || [])
      } else {
        // 모든 아이템 선택 해제
        setSelectedIds([])
      }
      return newCheckState
    })
  }

  const { createIBInterview, isLoading } = useIBInterviewCreate({
    onSuccess: (data) => {
      setModalClose()
      onSuccess('INTERVIEW', data)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const onSubmit = (formData: RequestCreateQnaDto) => {
    if (isLoading || !data || !selectedData) return

    const content = (selectedData.commonQuestion || []).map(({ question }, index: number) => ({
      question,
      answer: formData.content[index]?.answer || '',
    }))

    createIBInterview({ id: selectedData.id, data: { content } })
  }

  const answers = watch('content', [])
  const isNextButtonEnabled = answers.some((answer: FieldValues) => answer?.answer?.trim()?.length > 0)

  useEffect(() => {
    if (data.length > 0) {
      const uncreatedData = data.find((item) => !item.is_created)
      if (uncreatedData) {
        setSelectedValue(uncreatedData.id)
        setSelectedData(uncreatedData)
      } else {
        setSelectedValue(data[0].id)
        setSelectedData(data[0])
      }
    }
  }, [data])
  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {step === 0 ? (
        <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white`}>
          <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6 backdrop-blur-[20px]">
            <Typography variant="title1">인터뷰일지 작성</Typography>
            <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
          </div>
          <div className="scroll-box flex max-h-[608px] flex-col gap-4 overflow-auto px-8 pt-4 pb-8">
            {data && (
              <>
                <RadioV2.Group
                  selectedValue={selectedValue}
                  onChange={handleRadioChange}
                  className="scroll-box flex min-h-[40px] flex-row gap-2 overflow-x-auto"
                >
                  {data.map((interview) => (
                    <RadioV2.Chip
                      value={interview.id}
                      label={interview.title}
                      key={interview.id}
                      disabled={interview.is_created}
                    />
                  ))}
                </RadioV2.Group>
                {selectedData && (
                  <div className="scroll-box flex flex-col overflow-auto">
                    <div className="flex flex-col gap-4 pt-2">
                      {selectedData.commonQuestion.map(({ question, hint }, index: number) => {
                        return (
                          <div key={question} className="flex flex-col gap-3">
                            <div className="flex flex-row items-start">
                              <Typography variant="title3" className="text-primary-orange-800">
                                Q{index + 1}.&nbsp;
                              </Typography>
                              <Typography variant="title3">{question}</Typography>
                            </div>
                            <TextareaV2
                              key={`${selectedValue}-${index}`}
                              placeholder={hint || '답변을 입력해주세요'}
                              {...register(`content.${index}.answer`)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div
            className={clsx(
              'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-end gap-3 border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]',
            )}
          >
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
              이전
            </ButtonV2>
            {CheckList && CheckList.length > 0 ? (
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={() => setStep(1)}
                disabled={!isNextButtonEnabled}
              >
                다음
              </ButtonV2>
            ) : (
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleSubmit(onSubmit)}
                disabled={!isNextButtonEnabled}
              >
                저장하기
              </ButtonV2>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative w-[632px] overflow-hidden rounded-xl bg-white`}>
          {isLoading && <IBBlank type="section-opacity" />}
          <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6 backdrop-blur-[20px]">
            <Typography variant="title1">체크리스트 작성</Typography>
            <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
          </div>

          <div className="scroll-box flex max-h-[616px] flex-col gap-4 overflow-auto px-8 pt-4 pb-8">
            <div className="flex flex-col gap-4">
              <Typography variant="body1" className="pb-2">
                {`각 항목에 대해 이해했는지 체크해보세요.\n이해가 안된다면 지도교사와의 인터뷰를 통해 점검해보세요.`}
              </Typography>
              <Check.Group selectedValues={selectedIds} onChange={handleGroupChange} className="flex flex-col gap-3">
                {CheckList?.map((item) => (
                  <Check.Box key={item.id} label={item.content} size={20} value={item.id} checked={item.check} />
                ))}
              </Check.Group>
              <div className="flex items-center gap-2">
                <Check.Basic checked={check} onChange={handleAllCheck} />
                <Typography
                  variant="title3"
                  className="text-primary-gray-900 cursor-pointer font-medium"
                  onClick={handleAllCheck}
                >
                  모든 내용을 확인하였습니다.
                </Typography>
              </div>
            </div>
          </div>
          <div
            className={clsx(
              'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] items-center justify-end gap-3 border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]',
            )}
          >
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={() => setStep(0)}>
              이전
            </ButtonV2>
            <ButtonV2
              variant="solid"
              color="orange800"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={selectedIds.length !== (CheckList?.length || 0)}
            >
              저장하기
            </ButtonV2>
          </div>
        </div>
      )}
    </div>
  )
}
