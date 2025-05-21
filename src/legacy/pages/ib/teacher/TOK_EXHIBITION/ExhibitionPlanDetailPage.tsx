import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { Input } from '@/legacy/components/common/Input'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { InputField } from '@/legacy/components/ib/InputField'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import {
  useExhibitionPlanUpdate,
  useIBExhibitionPlanStatusApprove,
  useIBExhibitionPlanStatusReject,
} from '@/legacy/container/ib-tok-exhibition'
import type {
  RequestIBTokExhibitionPlanDto,
  ResponseIBDtoStatus,
  ResponseIBTokExhibitionPlanDto,
} from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'

interface Commetary {
  targetKey: string
  checkedAttributes: string[]
}

export const ExhibitionPlanDetailPage = () => {
  const history = useHistory()
  const { ibId: idParam } = useParams<{ ibId: string }>()
  const id = Number(idParam)
  const { me } = useUserStore()
  const [editMode, setEditMode] = useState<boolean>(false)
  const { data, klassNum, isLoading, refetch } = useIBGetById(id)

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [checkedAttributes, setCheckedAttributes] = useState<Commetary[]>([
    { targetKey: 'target1', checkedAttributes: [] },
    { targetKey: 'target2', checkedAttributes: [] },
    { targetKey: 'target3', checkedAttributes: [] },
  ])

  const [rejectModalOpen, setRejectModalOpen] = useState(false) // 기획안 보완 요청 Modal
  const [rejectReason, setRejectReason] = useState('') // 기획안 보완 요청 피드백
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const { data: Questions } = useThemeQuestionFindAll('TOK_EXHIBITION')
  const { categoryData: knowledgeArea } = useCodeByCategoryName('tokExhibitionPlanKnowledgeArea')
  const { categoryData: commentary } = useCodeByCategoryName('tokCommentary')

  const { updateExhibitionPlan } = useExhibitionPlanUpdate({
    onSuccess: () => {
      setAlertMessage(`전시회 기획안을\n수정하였습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 수정 중 오류 발생:', error)
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

  const { control, handleSubmit, watch, reset } = useForm<RequestIBTokExhibitionPlanDto>({
    defaultValues: data?.tokExhibitionPlan,
  })

  const target1Value = watch('target1')
  const target2Value = watch('target2')
  const target3Value = watch('target3')

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

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(data?.tokExhibitionPlan)
  }

  const onSubmit = (ExhibitionData: RequestIBTokExhibitionPlanDto) => {
    if (isLoading) return

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

  // 기획안 반려 api 호출 (보완요청 버튼 클릭 시 실행)
  const { rejectExhibitionPlan } = useIBExhibitionPlanStatusReject({
    onSuccess: () => {
      setRejectModalOpen(false)
      setAlertMessage(`기획안 보완을\n요청하였습니다`)
      refetch()
    },
  })

  // 기획안 승인 api 호출
  const { approveExhibitionPlan } = useIBExhibitionPlanStatusApprove({
    onSuccess: () => {
      setAlertMessage(`기획안이\n승인되었습니다`)
      refetch()
    },
  })

  const shouldRender = (status: ResponseIBDtoStatus) => {
    // WAIT_MENTOR인 경우 항상 렌더링
    if (status === 'WAIT_MENTOR') return true

    // 다른 모든 상태는 권한에 따라 렌더링
    return hasPermission
  }

  const planUI = (status: ResponseIBDtoStatus) => {
    switch (status) {
      case 'WAIT_MENTOR':
      case 'WAIT_PLAN_APPROVE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-end">
              <div className="flex items-center gap-4">
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="gray700"
                  onClick={() => setRejectModalOpen(true)}
                >
                  기획안 보완요청
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  onClick={() => {
                    approveExhibitionPlan(Number(id), Number(data?.tokExhibitionPlan?.id))
                  }}
                >
                  기획안 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'IN_PROGRESS':
        return (
          <div>
            <div>
              <div className="mx-auto flex w-[1280px] items-center justify-center">
                <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled>
                  기획안 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'REJECT_PLAN':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 variant="solid" color="gray100" size={48} className="w-[416px]" disabled>
                기획안 보완요청
              </ButtonV2>
            </div>
          </div>
        )
    }
  }

  const getFloatingUI = (status: ResponseIBDtoStatus | undefined) => {
    // 상태가 없거나 렌더링 권한이 없는 경우 UI를 표시하지 않음
    if (!status || !shouldRender(status)) return

    return planUI(status)
  }

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

  if (me == null || data === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  return (
    <div className="col-span-6">
      {isLoading && <Blank />}
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
                      진행상태: '/teacher/project',
                      'TOK 전시회': `/teacher/ib/tok/exhibition/${id}`,
                      '기획안 상세': `/teacher/ib/tok/plan/${id}`,
                    }}
                  />
                </div>
                <div className="flex w-full items-start justify-between">
                  <Typography
                    variant="heading"
                    className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-900"
                  >
                    {data?.tokExhibitionPlan?.themeQuestion}
                  </Typography>
                  <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                    {klassNum} · {data?.leader.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex grow flex-col">
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
                        <div className="flex flex-col gap-4 border-b border-b-gray-100 pb-10">
                          <Typography variant="title2">
                            지식영역<span className="text-old-primary-red-800">*</span>
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
                        <div className="flex flex-col gap-10 border-b border-b-gray-100 pb-10">
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
                        <div className="flex flex-col gap-10 border-b border-b-gray-100 pb-10">
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
                        <div className="flex flex-col gap-10 border-b border-b-gray-100 pb-10">
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
                      <div className="flex flex-col gap-4 pt-10">
                        <header className="flex flex-row items-center justify-between">
                          <Typography variant="title2">Commentary 구성</Typography>
                          <Typography variant="caption" className="text-gray-500">
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
                              className={`text-15 flex h-[54px] flex-row items-center gap-4 px-6 font-medium text-gray-700 ${
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
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
                    <div className="flex flex-col" id="pdf-download">
                      <div className="mb-6 flex flex-col items-start gap-1 border-b border-b-gray-100 pb-6">
                        <Typography variant="title1" className="text-gray-900">
                          {data?.tokExhibitionPlan?.themeQuestion}
                        </Typography>
                        <Typography variant="body3" className="text-gray-500">
                          {format(new Date(data?.createdAt), 'yyyy.MM.dd')}
                        </Typography>
                      </div>
                      <div className="scroll-box flex flex-col overflow-auto pb-10">
                        <div className="flex flex-col gap-10">
                          <div className="flex flex-col gap-4">
                            <Typography variant="title2">질문 설명</Typography>
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="font-medium text-gray-700">
                                {data?.tokExhibitionPlan?.description}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <Typography variant="title2">지식영역</Typography>
                            <Check.Group selectedValues={selectedNames} className="grid grid-cols-4 gap-3">
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
                          <div className="flex flex-col">
                            {[1, 2, 3].map((num) => {
                              const targetKey = `target${num}` as keyof ResponseIBTokExhibitionPlanDto
                              return (
                                <div key={targetKey} className="flex flex-col gap-10 border-t border-t-gray-100 py-10">
                                  <div className="flex flex-col gap-4">
                                    <Typography variant="title2" className="text-gray-900">
                                      대상&nbsp;
                                      <span className="text-primary-800">{num}</span>
                                    </Typography>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-[13px]">
                                      <Typography variant="body2" className="font-medium text-gray-700">
                                        {typeof data?.tokExhibitionPlan?.[targetKey] === 'string'
                                          ? (data?.tokExhibitionPlan?.[targetKey] as string)
                                          : Array.isArray(data?.tokExhibitionPlan?.[targetKey])
                                            ? JSON.stringify(data?.tokExhibitionPlan?.[targetKey])
                                            : data?.tokExhibitionPlan?.[targetKey]?.toString() || ''}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-4">
                                    <Typography variant="title2" className="text-gray-900">
                                      연관 개념 렌즈
                                    </Typography>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-[13px]">
                                      {typeof data?.tokExhibitionPlan?.[
                                        `conceptualLens${num}` as keyof ResponseIBTokExhibitionPlanDto
                                      ] === 'string'
                                        ? (data?.tokExhibitionPlan?.[
                                            `conceptualLens${num}` as keyof ResponseIBTokExhibitionPlanDto
                                          ] as string)
                                        : Array.isArray(
                                              data?.tokExhibitionPlan?.[
                                                `conceptualLens${num}` as keyof ResponseIBTokExhibitionPlanDto
                                              ],
                                            )
                                          ? JSON.stringify(
                                              data?.tokExhibitionPlan?.[
                                                `conceptualLens${num}` as keyof ResponseIBTokExhibitionPlanDto
                                              ],
                                            )
                                          : ''}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-4">
                                    <Typography variant="title2" className="text-gray-900">
                                      Knowledge Frame
                                    </Typography>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-[13px]">
                                      <Typography variant="body2" className="font-medium text-gray-700">
                                        {typeof data?.tokExhibitionPlan?.[
                                          `knowledgeFrame${num}` as keyof ResponseIBTokExhibitionPlanDto
                                        ] === 'string'
                                          ? (data?.tokExhibitionPlan?.[
                                              `knowledgeFrame${num}` as keyof ResponseIBTokExhibitionPlanDto
                                            ] as string)
                                          : Array.isArray(
                                                data?.tokExhibitionPlan?.[
                                                  `knowledgeFrame${num}` as keyof ResponseIBTokExhibitionPlanDto
                                                ],
                                              )
                                            ? JSON.stringify(
                                                data?.tokExhibitionPlan?.[
                                                  `knowledgeFrame${num}` as keyof ResponseIBTokExhibitionPlanDto
                                                ],
                                              )
                                            : ''}
                                      </Typography>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 border-t border-t-gray-100 pt-10">
                          <header className="flex flex-row items-center justify-between">
                            <Typography variant="title2" className="text-gray-900">
                              Commentary 구성
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              설정한 세 가지 대상이 아래 기준에 부합하는지 확인해보세요.
                            </Typography>
                          </header>
                          <div className="flex w-full flex-col">
                            {/* Table Head */}
                            <div className="text-15 bottom-1 flex flex-row items-center gap-4 bg-white px-6 py-4 text-gray-500">
                              <div className="min-w-[172px] text-start font-normal text-gray-500">세 가지 대상</div>
                              {[1, 2, 3].map((num) => {
                                const targetKey = `target${num}` as keyof ResponseIBTokExhibitionPlanDto
                                return (
                                  <Input.Basic
                                    key={targetKey}
                                    disabled={true}
                                    value={
                                      typeof data?.tokExhibitionPlan?.[targetKey] === 'string'
                                        ? (data?.tokExhibitionPlan?.[targetKey] as string)
                                        : Array.isArray(data?.tokExhibitionPlan?.[targetKey])
                                          ? JSON.stringify(data?.tokExhibitionPlan?.[targetKey])
                                          : data?.tokExhibitionPlan?.[targetKey]?.toString() || ''
                                    }
                                    size={32}
                                    placeholder={`대상 ${num}`}
                                    className="w-[176px] text-[14px]"
                                    inputClassName="overflow-hidden text-ellipsis whitespace-nowrap disabled:text-gray-900 text-[14px] font-medium"
                                    onlyInput
                                  />
                                )
                              })}
                            </div>
                            {/* Table Body */}
                            {commentary?.map((item, index) => (
                              <div
                                key={item.id}
                                className={`text-15 flex h-[54px] flex-row items-center gap-4 px-6 font-medium text-gray-700 ${
                                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                }`}
                              >
                                <div className="min-w-[172px] text-start">{item.name}</div>
                                <div className="flex w-full items-center justify-center">
                                  <Check.Basic
                                    size={24}
                                    checked={checkedAttributes
                                      .find((attr) => attr.targetKey === 'target1')
                                      ?.checkedAttributes.includes(item.name)}
                                    disabled={true}
                                  />
                                </div>
                                <div className="flex w-full items-center justify-center">
                                  <Check.Basic
                                    size={24}
                                    checked={checkedAttributes
                                      .find((attr) => attr.targetKey === 'target2')
                                      ?.checkedAttributes.includes(item.name)}
                                    disabled={true}
                                  />
                                </div>
                                <div className="flex w-full items-center justify-center">
                                  <Check.Basic
                                    size={24}
                                    checked={checkedAttributes
                                      .find((attr) => attr.targetKey === 'target3')
                                      ?.checkedAttributes.includes(item.name)}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
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
                        {data?.status !== 'COMPLETE' && hasPermission && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={data?.status === 'WAIT_MENTOR' || data?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/teacher/ib/tok/exhibition/${id}`, { type: 'EXHIBITION_PLAN' })}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1" className="text-gray-900">
                  진행기록
                </Typography>
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
        bottomBgColor="bg-gray-50"
        floatingButton={!editMode && getFloatingUI(data?.status)}
      />

      {/* 기획안 보완 요청 Modal */}
      <PopupModal
        modalOpen={rejectModalOpen}
        setModalClose={() => {
          setRejectModalOpen(false)
          setRejectReason('')
        }}
        title="기획안 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectReason.length).valueOf()}
            onClick={() => rejectExhibitionPlan(Number(id), data.tokExhibitionPlan!.id, { content: rejectReason })}
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-6">
          <Typography variant="body1">학생에게 기획안에 대한 피드백을 남겨주세요.</Typography>
          <TextareaV2
            className="h-40 resize-none rounded-lg p-4"
            placeholder="내용을 입력해주세요."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </PopupModal>

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
