import { PropsWithChildren } from 'react'
import { useForm } from 'react-hook-form'
import { useUserStore } from '@/stores/user'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useIBCreate } from '@/legacy/container/ib-project'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { RequestIBDto, RequestIBTokOutlineDto } from '@/legacy/generated/model'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { InputField } from '../InputField'

interface IbOutlineProps {
  modalOpen: boolean
  setModalClose?: () => void
  size?: 'medium' | 'large'
  handleBack?: () => void
  onSuccess: (action: 'TOK_ESSAY', data?: any) => void
  ablePropragation?: boolean
}

export function IbOutline({
  modalOpen,
  setModalClose,
  handleBack,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbOutlineProps>) {
  const { me } = useUserStore()
  const {
    control,
    handleSubmit,
    watch,
    formState: {},
  } = useForm<RequestIBTokOutlineDto>()

  const requiredFields = watch([
    'themeQuestion',
    'keyword',
    'content',
    'knowledgeArea1',
    'argument1',
    'argument1Example',
    'counterArgument1',
    'counterArgument1Example',
    'knowledgeArea2',
    'argument2',
    'argument2Example',
    'counterArgument2',
    'counterArgument2Example',
  ])

  const areAllFieldsFilled = requiredFields.every((field) => field && field.trim() !== '')

  const { data } = useThemeQuestionFindAll('TOK_ESSAY')
  const { categoryData: knowledgeArea } = useCodeByCategoryName('tokOutlineKnowledgeArea')

  const knowledgeAreaOptions =
    knowledgeArea?.map((subject) => ({
      id: subject.id,
      value: subject.name,
      text: subject.name,
    })) || []

  const transformedOptions =
    data?.flatMap((item) =>
      item.questions.map((question, index) => ({
        id: index,
        value: question,
        text: question,
      })),
    ) || []

  const { createIBProject, isLoading } = useIBCreate({
    onSuccess: (data) => {
      onSuccess('TOK_ESSAY', data)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const onSubmit = (data: RequestIBTokOutlineDto) => {
    if (!me?.id) {
      console.error('Leader ID가 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    if (isLoading) {
      return
    }

    const requestData: RequestIBDto = {
      title: `${me?.name}의 TOK 에세이`,
      ibType: 'TOK_ESSAY',
      description: 'TOK 아웃라인입니다.',
      leaderId: me.id,
      tokOutline: data,
    }
    createIBProject(requestData)
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
        {isLoading && <IBBlank type="section-opacity" />}
        <div className=".backdrop-blur-20 sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6">
          <Typography variant="title1">아웃라인 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="scroll-box flex max-h-[608px] flex-col gap-8 overflow-auto pt-4 pb-8">
          <div className="flex flex-col gap-6 px-8 pb-2">
            <InputField
              label="주제"
              name="themeQuestion"
              control={control}
              dropdownWidth="w-[700px] max-h-[320px]"
              placeholder="주제를 선택하세요"
              type="select"
              fixedHeight={true}
              options={transformedOptions}
              size={40}
              required
            />
            <InputField
              label="핵심용어 (설명)"
              name="keyword"
              control={control}
              placeholder="핵심 용어를 설명해주세요"
              className="h-[308px]"
              type="textarea"
              required
            />
            <InputField
              label="본인이 이해한 주제의 내용은?"
              name="content"
              control={control}
              placeholder="본인이 이해한 주제의 내용을 입력하세요."
              className="h-[96px]"
              type="textarea"
              required
            />
          </div>
          <div className="flex flex-col gap-6 border-t border-t-gray-100 px-8 pt-8">
            <InputField
              label="지식영역"
              subLabel="1"
              name="knowledgeArea1"
              control={control}
              type="select"
              options={knowledgeAreaOptions}
              placeholder="지식영역을 선택하세요"
              size={40}
              required
            />
            <div className="flex flex-col gap-3">
              <InputField
                label="지식주장"
                name="argument1"
                control={control}
                placeholder="본인이 생각한 지식주장에 대해 입력하세요"
                required
              />
              <InputField
                name="argument1Example"
                control={control}
                placeholder="지식주장과 관련된 예시를 입력하세요"
                className="h-40"
                type="textarea"
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <InputField
                label="반론"
                name="counterArgument1"
                control={control}
                placeholder="지식주장에 대한 반론을 입력하세요"
                required
              />
              <InputField
                name="counterArgument1Example"
                control={control}
                placeholder="반론 예시를 입력하세요"
                className="h-40"
                type="textarea"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 border-t border-t-gray-100 px-8 pt-8">
            <InputField
              label="지식영역"
              subLabel="2"
              name="knowledgeArea2"
              control={control}
              type="select"
              options={knowledgeAreaOptions}
              size={40}
              placeholder="지식영역을 선택하세요"
              required
            />
            <div className="flex flex-col gap-3">
              <InputField
                label="지식주장"
                name="argument2"
                control={control}
                placeholder="본인이 생각한 지식주장에 대해 입력하세요"
                required
              />
              <InputField
                name="argument2Example"
                control={control}
                placeholder="지식주장과 관련된 예시를 입력하세요"
                className="h-40"
                type="textarea"
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <InputField
                label="반론"
                name="counterArgument2"
                control={control}
                placeholder="지식주장에 대한 반론을 입력하세요"
                required
              />
              <InputField
                name="counterArgument2Example"
                control={control}
                placeholder="반론 예시를 입력하세요"
                className="h-40"
                type="textarea"
                required
              />
            </div>
          </div>
        </div>

        <div
          className={
            '.backdrop-blur-20 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-gray-100 bg-white/70 px-8 pt-6 pb-8'
          }
        >
          <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
            이전
          </ButtonV2>
          <div className="flex gap-3">
            <ButtonV2
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={!areAllFieldsFilled}
            >
              저장하기
            </ButtonV2>
          </div>
        </div>
      </div>
    </div>
  )
}
