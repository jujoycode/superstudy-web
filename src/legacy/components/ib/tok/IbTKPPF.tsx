import { cn } from '@/utils/commonUtil'
import { format } from 'date-fns'
import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useIBDeadline } from '@/legacy/container/ib-deadline'
import { useIBTKPPFCreate, useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { RequestCreateTKPPFDto, ResponseTKPPFDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../icon/ColorSVGIcon'

interface IbTKPPFProps {
  modalOpen: boolean
  setModalClose: () => void
  size?: 'medium' | 'large'
  projectId?: number
  TKPPFData?: ResponseTKPPFDto
  onSuccess: () => void
  ablePropragation?: boolean
}

export function IbTKPPF({
  modalOpen,
  setModalClose,
  projectId,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbTKPPFProps>) {
  const { createIBTKPPF, isLoading } = useIBTKPPFCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('TKPPF 생성 중 오류 발생:', error)
    },
  })

  const { deadline: deadlineData, isFetching } = useIBDeadline({ type: 'IB_TOK', model: 'TKPPF' })
  const { data: tkppf, isLoading: isRppfLoading } = projectId
    ? useTKPPFGetByIBId(projectId)
    : { data: null, isLoading: false }

  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, watch } = useForm<RequestCreateTKPPFDto>()

  const onSubmit = (data: RequestCreateTKPPFDto) => {
    const filteredData = {
      ...(data.sequence1?.text?.trim() ? { sequence1: data.sequence1 } : {}),
      ...(data.sequence2?.text?.trim() ? { sequence2: data.sequence2 } : {}),
      ...(data.sequence3?.text?.trim() ? { sequence3: data.sequence3 } : {}),
    }

    if (projectId !== undefined) {
      createIBTKPPF({ ibId: projectId, data: filteredData })
    }
  }

  const isTextareaReadonly = (index: number) => {
    // RPPF 작성 모달 Textarea 활성화 조건
    // 1. 기존에 작성한 내용이 있다면 return true => ReadOnly
    // 2. 2차 RPPF 열리는 기간 ===  1차 RPPF 마감기한 < 현재 일자 < 2차 RPPF 마감기한
    // 3. 마감기한이 지났어도 기존에 작성한 내용이 없다면 작성 가능 (2번을 충족하면서)

    const deadline = deadlineData?.sort((a, b) => a.type.localeCompare(b.type)) // 차시순 정렬

    const currentDate = new Date()

    // 기본값 확인
    const defaultValues = [tkppf?.sequence1?.text || '', tkppf?.sequence2?.text || '', tkppf?.sequence3?.text || '']

    // 기본값이 존재하면 비활성화
    if (defaultValues[index]?.trim() !== '') return true

    // 마감 기한 데이터가 없는 경우 비활성화
    if (!deadline || !deadline[index]?.deadlineTime) return true

    // 이전 차수들의 마감 기한 확인
    const previousDeadlinesPassed = deadline.slice(0, index).every((d) => new Date(d.deadlineTime) < currentDate)

    return !previousDeadlinesPassed
  }

  const watchedContents = watch(['sequence1.text', 'sequence2.text', 'sequence3.text'])

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
        <div className=".backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
          <Typography variant="title1">TKPPF 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <form>
          <div className="scroll-box flex max-h-[608px] flex-col overflow-auto pt-4 pb-8">
            <div className={cn('flex flex-col gap-3 border-b border-b-gray-100 pb-6')}>
              <div className="flex flex-row items-center justify-between gap-2">
                <Typography variant="title3" className="font-semibold">
                  TKPPF 1차
                </Typography>
                {tkppf?.sequence1 && (
                  <Typography variant="caption" className="text-gray-500">
                    최초 제출일 : {format(new Date(tkppf?.sequence1?.updatedAt), 'yy.MM.dd')}
                  </Typography>
                )}
              </div>
              <TextareaV2
                placeholder="내용을 입력해주세요."
                className="h-[308px]"
                readonlyBackground="bg-gray-100"
                value={tkppf?.sequence1?.text}
                readonly={isTextareaReadonly(0)}
                {...register(`sequence1.text`)}
              />
            </div>
            <div className={cn('flex flex-col gap-3 border-b border-b-gray-100 py-6')}>
              <div className="flex flex-row items-center justify-between gap-2">
                <Typography variant="title3" className="font-semibold">
                  TKPPF 2차
                </Typography>
                {tkppf?.sequence2 && (
                  <Typography variant="caption" className="text-gray-500">
                    최초 제출일 : {format(new Date(tkppf?.sequence2?.updatedAt), 'yy.MM.dd')}
                  </Typography>
                )}
              </div>
              <TextareaV2
                placeholder="내용을 입력해주세요."
                className="h-[308px]"
                readonlyBackground="bg-gray-100"
                value={tkppf?.sequence2?.text}
                readonly={isTextareaReadonly(1)}
                {...register(`sequence2.text`)}
              />
            </div>
            <div className={cn('flex flex-col gap-3 pt-6')}>
              <div className="flex flex-row items-center justify-between gap-2">
                <Typography variant="title3" className="font-semibold">
                  TKPPF 3차
                </Typography>
                {tkppf?.sequence3 && (
                  <Typography variant="caption" className="text-gray-500">
                    최초 제출일 : {format(new Date(tkppf?.sequence3?.updatedAt), 'yy.MM.dd')}
                  </Typography>
                )}
              </div>
              <TextareaV2
                placeholder="내용을 입력해주세요."
                className="h-[308px]"
                readonlyBackground="bg-gray-100"
                value={tkppf?.sequence3?.text}
                readonly={isTextareaReadonly(2)}
                {...register(`sequence3.text`)}
              />
            </div>
          </div>

          <div
            className={cn(
              '.backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8',
            )}
          >
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
        <AlertV2 confirmText="확인" message={`TKPPF가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  )
}
