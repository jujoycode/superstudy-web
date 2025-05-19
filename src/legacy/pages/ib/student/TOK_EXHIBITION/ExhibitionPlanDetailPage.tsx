import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Input } from '@/legacy/components/common/Input'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { InputField } from '@/legacy/components/ib/InputField'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalUpdateWaitPlan } from '@/legacy/container/ib-proposal-sent'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { useExhibitionPlanSubmit, useExhibitionPlanUpdate } from '@/legacy/container/ib-tok-exhibition'
import { RequestIBTokExhibitionPlanDto } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

import NODATA from '@/assets/images/no-data.png'

interface Commetary {
  targetKey: string
  checkedAttributes: string[]
}

export const ExhibitionPlanDetailPage = () => {
  const history = useHistory()
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const [editMode, setEditMode] = useState<boolean>(false)
  const { me } = useUserStore()
  const { data, isLoading, refetch } = useIBGetById(id)
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [checkedAttributes, setCheckedAttributes] = useState<Commetary[]>([
    { targetKey: 'target1', checkedAttributes: [] },
    { targetKey: 'target2', checkedAttributes: [] },
    { targetKey: 'target3', checkedAttributes: [] },
  ])
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)
  const { data: Questions, isLoading: isFetching } = useThemeQuestionFindAll('TOK_EXHIBITION')
  const { categoryData: knowledgeArea } = useCodeByCategoryName('tokExhibitionPlanKnowledgeArea')
  const { categoryData: commentary } = useCodeByCategoryName('tokCommentary')
  const { updateExhibitionPlan, isLoading: isUpdateExhibitionPlanLoading } = useExhibitionPlanUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `기획안이\n수정되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 수정 중 오류 발생:', error)
    },
  })

  const { submitExhibitionPlan, isLoading: isSubmitExhibitionPlanLoading } = useExhibitionPlanSubmit({
    onSuccess: () => {
      setAlertMessage({ text: `기획안이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 제출 중 오류 발생:', error)
    },
  })

  const { sentIBProposalUpdateWaitPlan, isLoading: isUpdateLoading } = useIBProposalUpdateWaitPlan({
    onSuccess: () => {
      setAlertMessage({ text: `기획안이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 보완제출 중 오류 발생:', error)
    },
  })

  const transformedOptions =
    Questions?.flatMap((item) =>
      item.questions.map((question) => ({
        id: item.id,
        value: question,
        text: question,
      })),
    ) || []

  const handleGroupChange = (selectedNames: string[]) => {
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

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: {},
  } = useForm<RequestIBTokExhibitionPlanDto>({
    defaultValues: data?.tokExhibitionPlan,
  })

  const requiredFields = watch([
    'themeQuestion',
    'target1',
    'conceptualLens1',
    'knowledgeFrame1',
    'target2',
    'conceptualLens2',
    'knowledgeFrame2',
    'target3',
    'conceptualLens3',
    'knowledgeFrame3',
  ])

  const areAllFieldsFilled = requiredFields.every((field) => field && field.trim() !== '') && selectedNames.length > 0

  useEffect(() => {
    if (data?.tokExhibitionPlan) {
      setSelectedNames(data.tokExhibitionPlan.knowledgeArea)
      setCheckedAttributes(data.tokExhibitionPlan.commentary)
    }
  }, [data?.tokExhibitionPlan])

  useEffect(() => {
    if (data) {
      reset(data.tokExhibitionPlan)
    }
  }, [data, reset])

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(data?.tokExhibitionPlan)
  }

  const onSubmit = (ExhibitionData: RequestIBTokExhibitionPlanDto) => {
    if (isUpdateExhibitionPlanLoading) return

    const requestData: RequestIBTokExhibitionPlanDto = {
      ...ExhibitionData,
      commentary: checkedAttributes,
      knowledgeArea: selectedNames,
    }

    if (data?.tokExhibitionPlan?.id !== undefined) {
      updateExhibitionPlan({ id, exhibitionPlanId: data?.tokExhibitionPlan?.id, data: requestData })
    }
    setEditMode(!editMode)
  }

  const target1Value = watch('target1')
  const target2Value = watch('target2')
  const target3Value = watch('target3')

  if (me == null || data === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading ||
        isUpdateExhibitionPlanLoading ||
        isSubmitExhibitionPlanLoading ||
        isFetching ||
        isUpdateLoading) && <IBBlank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="brown" size={24} type="solid_strong">
                      TOK
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      기획안
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      'TOK 전시회': `/ib/student/tok/exhibition/${id}`,
                      '기획안 상세': `/ib/student/tok/exhibition/plan/${id}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {data?.tokExhibitionPlan?.themeQuestion}
                </Typography>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col rounded-xl bg-white p-6">
                {editMode ? (
                  <>
                    <div className="scroll-box flex flex-col overflow-auto pb-10">
                      <div className="flex flex-col gap-10">
                        <InputField
                          label="질문 선택"
                          name="themeQuestion"
                          control={control}
                          dropdownWidth="w-full"
                          titleVariant="title2"
                          placeholder="질문을 선택하세요"
                          type="select"
                          options={transformedOptions}
                          size={40}
                          required
                          mode="page"
                        />
                        <InputField
                          label="질문 설명"
                          name="description"
                          control={control}
                          dropdownWidth="w-full"
                          titleVariant="title2"
                          placeholder="내용을 입력해주세요"
                          type="textarea"
                          className="h-40"
                          mode="page"
                        />
                        <div className="border-b-primary-gray-100 flex flex-col gap-4 border-b pb-10">
                          <Typography variant="title2">
                            지식영역<span className="text-primary-red-800">*</span>
                          </Typography>
                          <Check.Group
                            selectedValues={selectedNames}
                            onChange={handleGroupChange}
                            className="grid grid-cols-4 gap-3"
                          >
                            {knowledgeArea?.map((item) => (
                              <Check.Box
                                key={item.id}
                                label={item.name}
                                size={20}
                                value={item.name}
                                checked={selectedNames.includes(item.name)}
                              />
                            ))}
                          </Check.Group>
                        </div>
                        <div className="border-b-primary-gray-100 flex flex-col gap-10 border-b pb-10">
                          <InputField
                            label="대상"
                            subLabel="1"
                            name="target1"
                            titleVariant="title2"
                            control={control}
                            placeholder="대상을 입력해주세요"
                            required
                            mode="page"
                          />
                          <InputField
                            label="연관 개념 렌즈"
                            titleVariant="title2"
                            name="conceptualLens1"
                            control={control}
                            placeholder="내용을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            required
                            mode="page"
                          />
                          <InputField
                            label="Knowledge Frame"
                            titleVariant="title2"
                            name="knowledgeFrame1"
                            control={control}
                            placeholder="내용을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            required
                            mode="page"
                          />
                        </div>
                        <div className="border-b-primary-gray-100 flex flex-col gap-10 border-b pb-10">
                          <InputField
                            label="대상"
                            subLabel="2"
                            titleVariant="title2"
                            name="target2"
                            control={control}
                            placeholder="대상을 입력해주세요"
                            mode="page"
                            required
                          />
                          <InputField
                            label="연관 개념 렌즈"
                            titleVariant="title2"
                            name="conceptualLens2"
                            control={control}
                            placeholder="내용을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            mode="page"
                            required
                          />
                          <InputField
                            label="Knowledge Frame"
                            titleVariant="title2"
                            name="knowledgeFrame2"
                            control={control}
                            placeholder="내용을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            mode="page"
                            required
                          />
                        </div>
                        <div className="border-b-primary-gray-100 flex flex-col gap-10 border-b pb-10">
                          <InputField
                            label="대상"
                            titleVariant="title2"
                            subLabel="3"
                            name="target3"
                            control={control}
                            placeholder="대상을 입력해주세요"
                            mode="page"
                            required
                          />
                          <InputField
                            label="연관 개념 렌즈"
                            titleVariant="title2"
                            name="conceptualLens3"
                            control={control}
                            placeholder="내용을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            mode="page"
                            required
                          />
                          <InputField
                            label="Knowledge Frame"
                            titleVariant="title2"
                            name="knowledgeFrame3"
                            control={control}
                            placeholder="내용을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            mode="page"
                            required
                          />
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-4 border-t pt-10">
                        <header className="flex flex-row items-center justify-between">
                          <Typography variant="title2">Commentary 구성</Typography>
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
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                        <Typography variant="title1">{data?.tokExhibitionPlan?.themeQuestion}</Typography>
                        <Typography variant="body3" className="text-primary-gray-500">
                          {format(new Date(data?.createdAt), 'yyyy.MM.dd')}
                        </Typography>
                      </div>
                      <div className="flex flex-col gap-10 pt-6 pb-10">
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">질문 설명</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.description}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">지식영역</Typography>
                          <Check.Group
                            selectedValues={selectedNames}
                            onChange={handleGroupChange}
                            className="grid grid-cols-4 gap-3"
                          >
                            {knowledgeArea?.map((item) => (
                              <Check.Box
                                key={item.id}
                                label={item.name}
                                size={20}
                                value={item.name}
                                disabled={true}
                                checked={selectedNames.includes(item.name)}
                              />
                            ))}
                          </Check.Group>
                        </div>
                      </div>

                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">대상</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-800">
                              1
                            </Typography>
                          </div>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.target1}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">연관 개념 렌즈</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.conceptualLens1}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">Knowledge Frame</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.knowledgeFrame1}
                            </Typography>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">대상</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-800">
                              2
                            </Typography>
                          </div>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.target2}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">연관 개념 렌즈</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.conceptualLens2}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">Knowledge Frame</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.knowledgeFrame2}
                            </Typography>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">대상</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-800">
                              3
                            </Typography>
                          </div>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.target3}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">연관 개념 렌즈</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.conceptualLens3}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">Knowledge Frame</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokExhibitionPlan?.knowledgeFrame3}
                            </Typography>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-4 border-t py-10">
                        <header className="flex flex-row items-center justify-between">
                          <Typography variant="title2">Commentary 구성</Typography>
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
                                  disabled={true}
                                />
                              </div>
                              <div className="flex w-full items-center justify-center">
                                <Check.Basic
                                  size={24}
                                  checked={checkedAttributes
                                    .find((attr) => attr.targetKey === 'target2')
                                    ?.checkedAttributes.includes(item.name)}
                                  onChange={() => handleCheckChange('target2', item.name)}
                                  disabled={true}
                                />
                              </div>
                              <div className="flex w-full items-center justify-center">
                                <Check.Basic
                                  size={24}
                                  checked={checkedAttributes
                                    .find((attr) => attr.targetKey === 'target3')
                                    ?.checkedAttributes.includes(item.name)}
                                  onChange={() => handleCheckChange('target3', item.name)}
                                  disabled={true}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <footer className={`flex flex-row items-center justify-between`}>
                  {editMode ? (
                    <>
                      <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                        취소
                      </ButtonV2>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="orange100"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!areAllFieldsFilled}
                      >
                        저장하기
                      </ButtonV2>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center gap-2">
                        {data?.status !== 'COMPLETE' && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={data?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/tok/exhibition/${id}`, { type: 'EXHIBITION_PLAN' })}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1">진행기록</Typography>
                {data?.status !== 'PENDING' && data?.status !== 'WAIT_MENTOR' ? (
                  <div className="h-full w-full">
                    <Feedback
                      referenceId={id}
                      referenceTable="IB"
                      user={me}
                      useTextarea={data?.status !== 'COMPLETE'}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 py-20">
                    <div className="h-12 w-12 px-[2.50px]">
                      <img src={NODATA} className="h-12 w-[43px] object-cover" />
                    </div>
                    <Typography variant="body2">진행기록이 없습니다.</Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
        floatingButton={
          !editMode &&
          ['PENDING', 'REJECT_PLAN', 'WAIT_PLAN_APPROVE', 'WAITING_FOR_NEXT_PROPOSAL', 'WAIT_MENTOR'].includes(
            data.status,
          ) &&
          data.tokExhibitionPlan !== undefined &&
          areAllFieldsFilled && (
            <div className="flex w-full max-w-[1280px] justify-center">
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                className="w-[416px]"
                disabled={data.status === 'WAIT_MENTOR' || data.status === 'WAIT_PLAN_APPROVE'}
                onClick={() => {
                  if (data?.tokExhibitionPlan?.id !== undefined) {
                    if (data.status === 'REJECT_PLAN') {
                      sentIBProposalUpdateWaitPlan(data.id)
                    } else {
                      submitExhibitionPlan({ id, exhibitionPlanId: data?.tokExhibitionPlan?.id })
                    }
                  } else {
                    console.error('exhibitionPlanId가 정의되지 않았습니다.')
                  }
                }}
              >
                기획안 승인요청
              </ButtonV2>
            </div>
          )
        }
      />

      {alertMessage && (
        <AlertV2
          message={alertMessage.text}
          confirmText="확인"
          onConfirm={() => {
            if (alertMessage.action) alertMessage.action()
            setAlertMessage(null)
          }}
        />
      )}
    </div>
  )
}
