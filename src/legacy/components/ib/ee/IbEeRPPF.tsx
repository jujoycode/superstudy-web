import clsx from 'clsx'
import { format } from 'date-fns'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useIBDeadline } from '@/legacy/container/ib-deadline'
import { useIBRPPFCreate } from '@/legacy/container/ib-rppf-create'
import { useRPPFGetById } from '@/legacy/container/ib-rppf-findId'
import { RequestCreateRPPFDto, ResponseRPPFDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbEeRPPFProps {
  modalOpen: boolean
  setModalClose: () => void
  size?: 'medium' | 'large'
  projectId?: number
  RPPFData?: ResponseRPPFDto
  onSuccess: () => void
  ablePropragation?: boolean
}

export function IbEeRPPF({
  modalOpen,
  setModalClose,
  projectId,
  onSuccess,
  RPPFData,
  ablePropragation = false,
}: PropsWithChildren<IbEeRPPFProps>) {
  const [wordCounts, setWordCounts] = useState<number[]>([0, 0, 0])

  const handleWordCountChange = (index: number, count: number) => {
    setWordCounts((prev) => {
      const updatedCounts = [...prev]
      updatedCounts[index] = count
      return updatedCounts
    })
  }

  const { createIBRPPF, isLoading } = useIBRPPFCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('RPPF 생성 중 오류 발생:', error)
    },
  })

  const { deadline, isFetching } = useIBDeadline({ type: 'IB_EE', model: 'RPPF' })
  const { data: rppf, isLoading: isRppfLoading } =
    projectId && RPPFData?.id ? useRPPFGetById(projectId, RPPFData.id) : { data: null, isLoading: false }

  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestCreateRPPFDto>({
    defaultValues: {
      contents:
        rppf?.contents?.map((data) => ({
          id: data.id,
          sequence: data.sequence,
          text: data.text || '',
          wordCount: Number(data.wordCount) || 0,
        })) || [],
    },
  })

  useEffect(() => {
    if (rppf?.contents) {
      setWordCounts(rppf.contents.map((content) => content.wordCount || 0))
    }
  }, [rppf])

  const onSubmit = (data: RequestCreateRPPFDto) => {
    const filteredContents = data.contents
      .map((content, index) => ({
        ...content,
        sequence: index + 1,
        wordCount: wordCounts[index],
      }))
      .filter((content) => content.text && content.text.trim() !== '')

    const updatedData = {
      ...data,
      contents: filteredContents,
    }

    if (projectId !== undefined) {
      createIBRPPF({ ibId: projectId, data: updatedData })
    }
  }

  const isTextareaReadonly = (index: number) => {
    // RPPF 작성 모달 Textarea 활성화 조건
    // 1. 기존에 작성한 내용이 있다면 return true => ReadOnly
    // 2. 2차 RPPF 열리는 기간 ===  1차 RPPF 마감기한 < 현재 일자 < 2차 RPPF 마감기한
    // 3. 마감기한이 지났어도 기존에 작성한 내용이 없다면 작성 가능 (2번을 충족하면서)

    const currentDate = new Date()

    // 기본값 확인
    const defaultValue = rppf?.contents?.[index]?.text || ''

    // 기본값이 있으면 무조건 비활성화
    if (defaultValue.trim() !== '') return true

    // 마감 기한 데이터가 없는 경우 비활성화
    if (!deadline || !deadline[index]?.deadlineTime) return true

    // 이전 차수들의 마감 기한 확인
    const previousDeadlinesPassed = deadline.slice(0, index).every((d) => new Date(d.deadlineTime) < currentDate)

    return !previousDeadlinesPassed
  }

  const watchedContents = watch(['contents.0.text', 'contents.1.text', 'contents.2.text'])

  const isSaveButtonDisabled = () => {
    // 모든 텍스트가 readonly 인 경우 버튼 비활성화
    const allReadonly = watchedContents?.every((_, index) => isTextareaReadonly(index))

    // 텍스트가 readonly가 아니고 비어있는 경우 버튼 비활성화
    const isEmpty = watchedContents?.some((content, index) => {
      if (isTextareaReadonly(index)) return false
      return content?.trim() === ''
    })
    return allReadonly || isEmpty
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
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
        {(isLoading || isFetching || isRppfLoading) && <IBBlank type="section-opacity" />}
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">RPPF 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <form>
          <div className="scroll-box flex max-h-[608px] flex-col overflow-auto pt-4 pb-8">
            {['RPPF 1차', 'RPPF 2차', 'RPPF 3차'].map((title, index) => {
              const content = rppf?.contents.find((item) => item.sequence === index + 1) || {
                text: '',
                createdAt: '',
              }
              return (
                <div
                  key={index}
                  className={clsx('flex flex-col gap-3 px-8', {
                    'border-b-primary-gray-100 border-b pb-6': index === 0,
                    'border-b-primary-gray-100 border-b py-6': index === 1,
                    'pt-6': index === 2,
                  })}
                >
                  <div className="flex flex-row items-center justify-between gap-2">
                    <Typography variant="title3" className="font-semibold">
                      {title}
                    </Typography>
                    {content.createdAt && (
                      <Typography variant="caption" className="text-primary-gray-500">
                        최초 제출일 : {format(new Date(content.createdAt), 'yy.MM.dd')}
                      </Typography>
                    )}
                  </div>
                  <TextareaV2
                    showWordCount={true}
                    onWordCountChange={(count) => handleWordCountChange(index, count)}
                    placeholder={isTextareaReadonly(index) ? '입력 기간이 아닙니다.' : '내용을 입력해주세요.'}
                    className="h-[308px]"
                    readonlyBackground="bg-primary-gray-100"
                    value={content.text}
                    readonly={isTextareaReadonly(index)}
                    {...register(`contents.${index}.text` as const)}
                  />
                </div>
              )
            })}
          </div>

          <div
            className={clsx(
              'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-between gap-4 border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]',
            )}
          >
            <div className="text-12 flex flex-row items-center">
              <p className="text-primary-gray-500">총 단어 수</p>&nbsp;
              <p className="text-primary-orange-800 font-medium">
                {wordCounts.reduce((total, count) => total + count, 0)}
              </p>
            </div>
            <ButtonV2
              disabled={isSaveButtonDisabled()}
              type="submit"
              variant="solid"
              color="orange100"
              size={48}
              onClick={handleSubmit(onSubmit)}
            >
              저장하기
            </ButtonV2>
          </div>
        </form>
      </div>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`제안서가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  )
}
