import clsx from 'clsx'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { useIBProfileCreate, useIBProfileTemplateGet, useIBProfileUpdate } from '@/legacy/container/ib-cas'
import { RequestIBProfileDto, ResponseIBProfileDto } from '@/legacy/generated/model'

import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { InputField } from '../InputField'

interface IbCASProfileProps {
  modalOpen: boolean
  setModalClose: () => void
  ablePropragation?: boolean
  onSuccess: () => void
  type?: 'create' | 'update'
  profileData?: ResponseIBProfileDto
}

export function IbCASProfile({
  modalOpen,
  setModalClose,
  onSuccess,
  type = 'create',
  profileData,
  ablePropragation = false,
}: PropsWithChildren<IbCASProfileProps>) {
  const { data } = useIBProfileTemplateGet()

  const {
    handleSubmit,
    control,
    formState: {},
  } = useForm<RequestIBProfileDto>({
    defaultValues: {
      ...profileData,
      casInfo: profileData?.casInfo,
    },
  })

  const { createIBProfile, isLoading } = useIBProfileCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const { updateIBProfile, isLoading: isUpdating } = useIBProfileUpdate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('IB 프로젝트 수정 중 오류 발생:', error)
    },
  })

  const [isAnyFilled, setIsAnyFilled] = useState(false)

  const casInfo = useWatch({ control, name: 'casInfo' })

  const onSubmit = (formData: RequestIBProfileDto) => {
    if (isLoading) return

    const casInfo = data?.commonQuestion.map((question: string, index: number) => ({
      question,
      answer: formData.casInfo?.[index]?.answer || '',
    }))

    const requestData: RequestIBProfileDto = {
      ...formData,
      casInfo,
    }

    if (type === 'create') {
      createIBProfile(requestData)
    } else {
      if (profileData?.id !== undefined) {
        updateIBProfile({ id: profileData?.id, data: requestData })
      }
    }
  }

  useEffect(() => {
    if (casInfo && Array.isArray(casInfo)) {
      const anyAnswerFilled = casInfo.some((item) => item?.answer?.trim() !== '')
      setIsAnyFilled(anyAnswerFilled)
    }
  }, [casInfo])

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
        {isLoading && <IBBlank type="section-opacity" />}
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">{type === 'create' ? '프로필 생성' : '프로필 수정'}</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <form>
          <div className="scroll-box flex max-h-[608px] flex-col gap-4 overflow-auto px-8 pt-4 pb-8">
            {data && (
              <div className="flex flex-col gap-4">
                {data.commonQuestion.map((question: any, index: number) => {
                  return (
                    <div key={question} className="flex flex-col gap-3">
                      <div className="flex flex-row items-start">
                        <Typography variant="title3" className="text-primary-orange-800">
                          Q{index + 1}.&nbsp;
                        </Typography>
                        <Typography variant="title3">{question}</Typography>
                      </div>
                      <InputField
                        type="textarea"
                        key={index}
                        placeholder="답변을 입력해주세요"
                        control={control}
                        name={`casInfo.${index}.answer`}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div
            className={clsx(
              'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-end border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]',
            )}
          >
            <ButtonV2
              disabled={!isAnyFilled || isLoading || isUpdating}
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              onClick={handleSubmit(onSubmit)}
            >
              저장하기
            </ButtonV2>
          </div>
        </form>
      </div>
    </div>
  )
}
