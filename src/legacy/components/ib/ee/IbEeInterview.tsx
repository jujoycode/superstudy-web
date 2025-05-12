import clsx from 'clsx'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRecoilValue } from 'recoil'
import { useIBInterviewCreate, useInterviewGetByStudentId } from '@/legacy/container/ib-student-interview'
import { RequestCreateQnaDto, ResponseStudentInterviewDto } from '@/legacy/generated/model'
import { meState } from '@/stores'
import { ButtonV2 } from '../@/legacy/components/common/ButtonV2'
import { RadioV2 } from '../@/legacy/components/common/RadioV2'
import { TextareaV2 } from '../@/legacy/components/common/TextareaV2'
import { Typography } from '../@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import SolidSVGIcon from '../../icon/SolidSVGIcon'

interface IbEeInterviewProps {
  modalOpen: boolean
  setModalClose: () => void
  ablePropragation?: boolean
  onSuccess: () => void
}

export function IbEeInterview({
  modalOpen,
  setModalClose,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbEeInterviewProps>) {
  const me = useRecoilValue(meState)
  if (!me) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  const { data = [] } = useInterviewGetByStudentId(me?.id, 'EE_RPPF')
  const [selectedValue, setSelectedValue] = useState<number>()
  const [selectedData, setSelectedData] = useState<ResponseStudentInterviewDto>()

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

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<RequestCreateQnaDto>()

  const { createIBInterview, isLoading } = useIBInterviewCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const onSubmit = (formData: RequestCreateQnaDto) => {
    if (isLoading || !selectedData) return

    const content = (selectedData.commonQuestion || []).map(({ question }, index: number) => ({
      question,
      answer: formData.content[index]?.answer || '',
    }))

    createIBInterview({ id: selectedData.id, data: { content } })
  }

  const handleRadioChange = (value: number) => {
    setSelectedValue(value)
    const matchedData = data?.find((item) => item.id === value)
    if (!matchedData) {
      console.error(`해당 id(${value})를 가진 데이터가 없습니다.`)
    }
    setSelectedData(matchedData || data[0])
  }

  useEffect(() => {
    if (selectedData) {
      const resetContent = selectedData.commonQuestion.map(() => ({ answer: '' }))
      reset({ content: resetContent })
    }
  }, [selectedData, reset])

  if (data.length === 0) {
    return <div>데이터를 불러오는 중입니다...</div>
  }

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
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white`}>
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">인터뷰 준비</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <form>
          <div className="flex max-h-[608px] flex-col gap-4 px-8 pt-4 pb-8">
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
                  <div className="scroll-box flex flex-col gap-4 overflow-auto">
                    <Typography variant="body1" className="pb-2">
                      {selectedData.description}
                    </Typography>
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
              'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-between border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]',
            )}
          >
            <div className="flex flex-row items-center gap-1">
              <SolidSVGIcon.Info color="gray400" size={16} />
              <Typography variant="caption2" className="text-primary-gray-500">
                이미 작성한 인터뷰의 수정은 인터뷰 상세에서 수정 가능합니다
              </Typography>
            </div>
            <ButtonV2 type="submit" variant="solid" color="orange800" size={48} onClick={handleSubmit(onSubmit)}>
              저장하기
            </ButtonV2>
          </div>
        </form>
      </div>
    </div>
  )
}
