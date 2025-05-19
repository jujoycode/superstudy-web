import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { useIBFAQCreate, useIBFAQUpdate } from '@/legacy/container/ib-coordinator'
import {
  FAQContentDto,
  ReferenceInfoGetReferenceInfoListCategory,
  RequestCreateFAQDto,
  RequestFAQDto,
  ResponseFAQDto,
} from '@/legacy/generated/model'

import ColorSVGIcon from '../../../icon/ColorSVGIcon'
import SVGIcon from '../../../icon/SVGIcon'
import { FaqInputField } from '../../FaqInputField'
import { InputField } from '../../InputField'

interface CoordinatorEE_FAQ_AddFaqProps {
  modalOpen: boolean
  setModalClose: () => void
  handleBack?: () => void
  onSuccess: () => void
  ablePropragation?: boolean
  type?: 'create' | 'update'
  category?: ReferenceInfoGetReferenceInfoListCategory
  data?: ResponseFAQDto
}

export function CoordinatorEE_FAQ_AddFaq({
  modalOpen,
  setModalClose,
  handleBack,
  onSuccess,
  ablePropragation = false,
  category = 'IB_ALL',
  type = 'create',
  data: FAQData,
}: PropsWithChildren<CoordinatorEE_FAQ_AddFaqProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { createIBFAQ, isLoading } = useIBFAQCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const { updateIBFAQ } = useIBFAQUpdate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('FAQ 업데이트 중 오류 발생:', error)
    },
  })

  const [qaList, setQaList] = useState<FAQContentDto[]>(FAQData?.content || [{ question: '', answer: '' }])

  const prevMessageCount = useRef(qaList.length) // 이전 메시지 개수를 저장

  const addQA = () => {
    setQaList([...qaList, { question: '', answer: '' }])
    scrollToBottom()
  }

  const updateQA = (index: number, updatedContent: FAQContentDto) => {
    const updatedList = qaList.map((item, i) => (i === index ? updatedContent : item))
    setQaList(updatedList)
  }

  const deleteQA = (index: number) => {
    const updatedList = qaList.filter((_, i) => i !== index)
    setQaList(updatedList)
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (qaList.length > prevMessageCount.current) {
      scrollToBottom()
    }
    prevMessageCount.current = qaList.length
  }, [qaList])

  const {
    control,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestCreateFAQDto>({
    defaultValues:
      type === 'update' && FAQData
        ? FAQData
        : {
            content: [],
            title: '',
          },
  })

  const title = watch('title')
  const isDisabled = !title || qaList.some((qa) => !qa.question || !qa.answer)

  const onSubmit = (data: RequestFAQDto) => {
    if (isLoading) return
    const _data = {
      ...data,
      content: qaList,
    }

    const createData: RequestCreateFAQDto = {
      ...data,
      content: qaList,
      category: category,
    }

    if (type === 'create') {
      createIBFAQ(createData)
    } else {
      updateIBFAQ({ id: Number(FAQData?.id), data: _data })
    }
  }

  const onPreview = () => {
    const formData = watch()

    const previewData = {
      ...formData,
      content: qaList,
    }

    const previewWindow = window.open('/reference/preview', '_blank')

    if (previewWindow) {
      previewWindow.onload = () => {
        previewWindow.opener.previewData = {
          type: 'FAQ',
          data: previewData,
        }
      }
    }
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
        <div className=".backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6">
          <Typography variant="title1" className="text-gray-900">
            {type === 'create' ? 'FAQ 작성' : 'FAQ 수정'}
          </Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} />
        </div>

        <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pt-4 pb-8">
          <InputField name="title" control={control} placeholder="제목을 입력해주세요" />

          {qaList.map((qa, index) => (
            <FaqInputField key={index} index={index} onUpdate={updateQA} initialQuestion={qa} onDelete={deleteQA} />
          ))}

          <div className="flex justify-center">
            <ButtonV2
              variant="outline"
              size={40}
              color="gray400"
              className="flex flex-row items-center gap-1"
              onClick={addQA}
            >
              <SVGIcon.Plus color="gray400" size={16} weight="bold" />
              질문 추가하기
            </ButtonV2>
          </div>
        </div>

        <div
          className={
            '.backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-between gap-4 border-t border-t-gray-100 bg-white/70 pt-6 pb-8'
          }
        >
          <div>
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
              {type === 'create' ? '이전' : '취소'}
            </ButtonV2>
          </div>
          <div className="flex justify-end gap-3">
            <ButtonV2 variant="outline" color="gray400" size={48} onClick={onPreview} disabled={isDisabled}>
              미리보기
            </ButtonV2>
            <ButtonV2
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={isDisabled}
            >
              저장하기
            </ButtonV2>
          </div>
        </div>
      </div>
      {isOpen && <AlertV2 confirmText="확인" message={`FAQ가\n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />}
    </div>
  )
}
