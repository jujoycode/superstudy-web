import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRecoilValue } from 'recoil'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useIBCreate } from '@/legacy/container/ib-project'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { RequestIBDto, RequestIBTokExhibitionPlanDto } from '@/legacy/generated/model'
import { meState } from '@/stores'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { Input } from '@/legacy/components/common/Input'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { InputField } from '../InputField'

interface IbExhibitionProps {
  modalOpen: boolean
  setModalClose?: () => void
  size?: 'medium' | 'large'
  handleBack?: () => void
  onSuccess: (action: 'TOK_EXHIBITION', data?: any) => void
  ablePropragation?: boolean
}

interface Commetary {
  targetKey: string
  checkedAttributes: string[]
}

export function IbExhibitionPlan({
  modalOpen,
  setModalClose,
  handleBack,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbExhibitionProps>) {
  const me = useRecoilValue(meState)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [checkedAttributes, setCheckedAttributes] = useState<Commetary[]>([
    { targetKey: 'target1', checkedAttributes: [] },
    { targetKey: 'target2', checkedAttributes: [] },
    { targetKey: 'target3', checkedAttributes: [] },
  ])
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RequestIBDto>()

  const requiredFields = watch([
    'tokExhibitionPlan.themeQuestion',
    'tokExhibitionPlan.target1',
    'tokExhibitionPlan.conceptualLens1',
    'tokExhibitionPlan.knowledgeFrame1',
    'tokExhibitionPlan.target2',
    'tokExhibitionPlan.conceptualLens2',
    'tokExhibitionPlan.knowledgeFrame2',
    'tokExhibitionPlan.target3',
    'tokExhibitionPlan.conceptualLens3',
    'tokExhibitionPlan.knowledgeFrame3',
  ])
  const areAllFieldsFilled = requiredFields.every((field) => field && field.trim() !== '') && selectedNames.length > 0

  const { data, isLoading: isFetching } = useThemeQuestionFindAll('TOK_EXHIBITION')
  const { categoryData: knowledgeArea } = useCodeByCategoryName('tokExhibitionPlanKnowledgeArea')
  const { categoryData: commentary } = useCodeByCategoryName('tokCommentary')

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
      onSuccess('TOK_EXHIBITION', data)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const handleGroupChange = (selectedValues: number[]) => {
    setSelectedIds(selectedValues)
    const selectedNames =
      knowledgeArea?.filter((item) => selectedValues.includes(item.id)).map((item) => item.name) || []
    setSelectedNames(selectedNames)
  }

  const handleCheckChange = (targetKey: string, attribute: string) => {
    setCheckedAttributes((prev) => {
      const target = prev.find((item) => item.targetKey === targetKey)
      if (!target) return prev

      const isChecked = target.checkedAttributes.includes(attribute)
      const updatedAttributes = isChecked
        ? target.checkedAttributes.filter((attr) => attr !== attribute)
        : [...target.checkedAttributes, attribute]

      return prev.map((item) =>
        item.targetKey === targetKey ? { ...item, checkedAttributes: updatedAttributes } : item,
      )
    })
  }

  const onSubmit = (data: RequestIBDto) => {
    if (!me?.id) {
      console.error('Leader ID가 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    if (isLoading) {
      return
    }

    const requestData: RequestIBDto = {
      title: `${me?.name}의 TOK 전시회`,
      ibType: 'TOK_EXHIBITION',
      description: 'TOK 전시회입니다.',
      leaderId: me.id,
      tokExhibitionPlan: {
        ...data.tokExhibitionPlan,
        knowledgeArea: selectedNames,
        themeQuestion: data.tokExhibitionPlan?.themeQuestion || '',
        description: data.tokExhibitionPlan?.description || '',
        commentary: checkedAttributes,
      } as RequestIBTokExhibitionPlanDto,
    }
    createIBProject(requestData)
  }

  const target1Value = watch('tokExhibitionPlan.target1')
  const target2Value = watch('tokExhibitionPlan.target2')
  const target3Value = watch('tokExhibitionPlan.target3')
  const themeQuestionValue = watch('tokExhibitionPlan.themeQuestion')

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
          <Typography variant="title1">기획안 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="scroll-box flex max-h-[608px] flex-col overflow-auto pt-4 pb-8">
          <div className="border-b-primary-gray-100 border-b">
            <div className="flex flex-col gap-6 px-8 pb-8">
              <InputField
                label="질문 선택"
                name="tokExhibitionPlan.themeQuestion"
                control={control}
                dropdownWidth="w-full"
                placeholder="질문을 선택하세요"
                type="select"
                options={transformedOptions}
                size={40}
                required
              />
              <InputField
                label="질문 설명"
                name="tokExhibitionPlan.description"
                control={control}
                placeholder="질문을 설명해주세요"
                type="textarea"
                className="h-40"
              />
              <div className="flex flex-col gap-3">
                <Typography variant="title3" className="font-semibold">
                  지식영역<span className="text-primary-red-800">*</span>
                </Typography>
                <Check.Group
                  selectedValues={selectedIds}
                  onChange={handleGroupChange}
                  className="grid grid-cols-4 gap-3"
                >
                  {knowledgeArea?.map((item) => (
                    <Check.Box
                      key={item.id}
                      label={item.name}
                      size={20}
                      value={item.id}
                      checked={selectedIds.includes(item.id)}
                    />
                  ))}
                </Check.Group>
              </div>
            </div>
          </div>
          <div className="border-b-primary-gray-100 border-b">
            <div className="flex flex-col gap-6 p-8">
              <InputField
                label="대상"
                subLabel="1"
                name="tokExhibitionPlan.target1"
                control={control}
                placeholder="대상을 입력해주세요"
                required
              />
              <InputField
                label="연관 개념 렌즈"
                name="tokExhibitionPlan.conceptualLens1"
                control={control}
                placeholder="내용을 입력해주세요"
                className="h-40"
                type="textarea"
                required
              />
              <InputField
                label="Knowledge Frame"
                name="tokExhibitionPlan.knowledgeFrame1"
                control={control}
                placeholder="내용을 입력해주세요"
                className="h-40"
                type="textarea"
                required
              />
            </div>
          </div>
          <div className="border-b-primary-gray-100 border-b">
            <div className="flex flex-col gap-6 p-8">
              <InputField
                label="대상"
                subLabel="2"
                name="tokExhibitionPlan.target2"
                control={control}
                placeholder="대상을 입력해주세요"
                required
              />
              <InputField
                label="연관 개념 렌즈"
                name="tokExhibitionPlan.conceptualLens2"
                control={control}
                placeholder="내용을 입력해주세요"
                className="h-40"
                type="textarea"
                required
              />
              <InputField
                label="Knowledge Frame"
                name="tokExhibitionPlan.knowledgeFrame2"
                control={control}
                placeholder="내용을 입력해주세요"
                className="h-40"
                type="textarea"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 p-8">
            <InputField
              label="대상"
              subLabel="3"
              name="tokExhibitionPlan.target3"
              control={control}
              placeholder="대상을 입력해주세요"
              required
            />
            <InputField
              label="연관 개념 렌즈"
              name="tokExhibitionPlan.conceptualLens3"
              control={control}
              placeholder="내용을 입력해주세요"
              className="h-40"
              type="textarea"
              required
            />
            <InputField
              label="Knowledge Frame"
              name="tokExhibitionPlan.knowledgeFrame3"
              control={control}
              placeholder="내용을 입력해주세요"
              className="h-40"
              type="textarea"
              required
            />
          </div>
          <div className="border-t-primary-gray-100 flex flex-col gap-3 border-t px-8 pt-8">
            <header className="flex flex-row items-center justify-between">
              <Typography variant="title3">Commentary 구성</Typography>
              <Typography variant="caption" className="text-primary-gray-500">
                설정한 세 가지 대상이 아래 기준에 부합하는지 확인해보세요.
              </Typography>
            </header>
            <div className="flex w-full flex-col">
              {/* Table Head */}
              <div className="text-15 bottom-1 flex flex-row items-center gap-4 bg-white px-6 py-4 text-gray-500">
                <div className="min-w-[172px] text-start">세 가지 대상</div>
                <Input.Basic disabled={true} value={target1Value} size={32} placeholder="대상 1" />
                <Input.Basic disabled={true} value={target2Value} size={32} placeholder="대상 2" />
                <Input.Basic disabled={true} value={target3Value} size={32} placeholder="대상 3" />
              </div>
              {/* Table Body */}
              {commentary?.map((item, index) => (
                <div
                  key={item.id}
                  className={`text-15 text-primary-gray-700 flex h-[54px] flex-row items-center gap-4 px-6 font-medium ${
                    index % 2 === 0 ? 'bg-primary-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="min-w-[172px] text-start">{item.name}</div>
                  <div className="flex w-full items-center justify-center">
                    <Check.Basic
                      size={24}
                      checked={checkedAttributes
                        .find((attr) => attr.targetKey === 'target1')
                        ?.checkedAttributes.includes(item.name)}
                      onChange={() => handleCheckChange('target1', item.name)}
                    />
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <Check.Basic
                      size={24}
                      checked={checkedAttributes
                        .find((attr) => attr.targetKey === 'target2')
                        ?.checkedAttributes.includes(item.name)}
                      onChange={() => handleCheckChange('target2', item.name)}
                    />
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <Check.Basic
                      size={24}
                      checked={checkedAttributes
                        .find((attr) => attr.targetKey === 'target3')
                        ?.checkedAttributes.includes(item.name)}
                      onChange={() => handleCheckChange('target3', item.name)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={
            'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-end gap-4 border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]'
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
