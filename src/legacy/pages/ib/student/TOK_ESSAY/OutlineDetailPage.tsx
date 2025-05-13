import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { InputField } from '@/legacy/components/ib/InputField'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalUpdateWaitPlan } from '@/legacy/container/ib-proposal-sent'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { useOutlineSubmit, useOutlineUpdate } from '@/legacy/container/ib-tok-essay'
import { RequestIBTokOutlineDto } from '@/legacy/generated/model'
import { meState } from '@/stores'

import NODATA from '@/legacy/assets/images/no-data.png'

export const OutlineDetailPage = () => {
  const history = useHistory()
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const [editMode, setEditMode] = useState<boolean>(false)
  const me = useRecoilValue(meState)
  const { data, isLoading, refetch } = useIBGetById(id)
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)
  const { data: Questions } = useThemeQuestionFindAll('TOK_ESSAY')
  const { categoryData: knowledgeArea } = useCodeByCategoryName('tokOutlineKnowledgeArea')
  const { updateOutline, isLoading: isUpdateLoading } = useOutlineUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `아웃라인이\n저장되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('아웃라인 수정 중 오류 발생:', error)
    },
  })

  const { submitOutline, isLoading: isSubmitOutlineLoading } = useOutlineSubmit({
    onSuccess: () => {
      setAlertMessage({ text: `아웃라인이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('아웃라인 제출 중 오류 발생:', error)
    },
  })

  const { sentIBProposalUpdateWaitPlan, isLoading: isSentProposalUpdateWaitPlanLoading } = useIBProposalUpdateWaitPlan({
    onSuccess: () => {
      setAlertMessage({ text: `아웃라인이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('아웃라인 보완제출 중 오류 발생:', error)
    },
  })

  const transformedOptions =
    Questions?.flatMap((item) =>
      item.questions.map((question, index) => ({
        id: index,
        value: question,
        text: question,
      })),
    ) || []

  const knowledgeAreaOptions =
    knowledgeArea?.map((subject) => ({
      id: subject.id,
      value: subject.name,
      text: subject.name,
    })) || []

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {},
  } = useForm<RequestIBTokOutlineDto>({
    defaultValues: data?.tokOutline,
  })

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

  useEffect(() => {
    if (data) {
      reset(data.tokOutline)
    }
  }, [data, reset])

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(data?.tokOutline)
  }

  const onSubmit = (OutlineData: RequestIBTokOutlineDto) => {
    if (isLoading) return

    if (data?.tokOutline?.id !== undefined) {
      updateOutline({ id, outlineId: data?.tokOutline?.id, data: OutlineData })
    }
    setEditMode(!editMode)
  }

  if (me == null || data === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || isUpdateLoading || isSubmitOutlineLoading || isSentProposalUpdateWaitPlanLoading) && <IBBlank />}
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
                      아웃라인
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      'TOK 에세이': `/ib/student/tok/essay/${id}`,
                      '아웃라인 상세': `/ib/student/tok/essay/outline/${id}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {data?.tokOutline?.themeQuestion}
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
                    <div className="scroll-box flex flex-col overflow-auto">
                      <div className="flex flex-col gap-10 pb-10">
                        <InputField
                          label="주제"
                          mode="page"
                          titleVariant="title2"
                          name="themeQuestion"
                          control={control}
                          dropdownWidth="w-[700px] max-h-[320px]"
                          placeholder="주제를 선택하세요"
                          type="select"
                          fixedHeight={true}
                          options={transformedOptions}
                          size={48}
                          required
                        />
                        <InputField
                          label="핵심용어 (설명)"
                          name="keyword"
                          mode="page"
                          control={control}
                          placeholder="핵심 용어를 설명해주세요"
                          className="h-[308px]"
                          type="textarea"
                          titleVariant="title2"
                          required
                        />
                        <InputField
                          label="본인이 이해한 주제의 내용은?"
                          name="content"
                          mode="page"
                          control={control}
                          placeholder="본인이 이해한 주제의 내용을 입력하세요."
                          className="h-[96px]"
                          type="textarea"
                          titleVariant="title2"
                          required
                        />
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <InputField
                          label="지식영역"
                          subLabel="1"
                          name="knowledgeArea1"
                          mode="page"
                          control={control}
                          type="select"
                          options={knowledgeAreaOptions}
                          placeholder="지식영역을 선택하세요"
                          size={48}
                          required
                          titleVariant="title2"
                        />
                        <div className="flex flex-col gap-3">
                          <InputField
                            label="지식주장"
                            mode="page"
                            size={48}
                            name="argument1"
                            control={control}
                            placeholder="본인이 생각한 지식주장에 대해 입력하세요"
                            required
                            titleVariant="title2"
                          />
                          <InputField
                            name="argument1Example"
                            mode="page"
                            control={control}
                            placeholder="지식주장과 관련된 예시를 입력하세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <InputField
                            label="반론"
                            mode="page"
                            size={48}
                            name="counterArgument1"
                            control={control}
                            placeholder="지식주장에 대한 반론을 입력하세요"
                            titleVariant="title2"
                            required
                          />
                          <InputField
                            name="counterArgument1Example"
                            mode="page"
                            control={control}
                            placeholder="반론 예시를 입력하세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            required
                          />
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <InputField
                          label="지식영역"
                          subLabel="2"
                          name="knowledgeArea2"
                          mode="page"
                          control={control}
                          type="select"
                          options={knowledgeAreaOptions}
                          placeholder="지식영역을 선택하세요"
                          size={48}
                          titleVariant="title2"
                          required
                        />
                        <div className="flex flex-col gap-3">
                          <InputField
                            label="지식주장"
                            mode="page"
                            name="argument2"
                            size={48}
                            control={control}
                            placeholder="본인이 생각한 지식주장에 대해 입력하세요"
                            titleVariant="title2"
                            required
                          />
                          <InputField
                            name="argument2Example"
                            mode="page"
                            control={control}
                            placeholder="지식주장과 관련된 예시를 입력하세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <InputField
                            label="반론"
                            size={48}
                            mode="page"
                            name="counterArgument2"
                            control={control}
                            placeholder="지식주장에 대한 반론을 입력하세요"
                            titleVariant="title2"
                            required
                          />
                          <InputField
                            name="counterArgument2Example"
                            mode="page"
                            control={control}
                            placeholder="반론 예시를 입력하세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                        <Typography variant="title1">{data?.tokOutline?.themeQuestion}</Typography>
                        <Typography variant="body3" className="text-primary-gray-500">
                          {format(new Date(data?.createdAt), 'yyyy.MM.dd')}
                        </Typography>
                      </div>
                      <div className="flex flex-col gap-4 pt-6">
                        <Typography variant="title2">핵심용어 (설명)</Typography>
                        <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                          <Typography variant="body2" className="text-primary-gray-700 font-medium">
                            {data?.tokOutline?.keyword}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex flex-col py-10">
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">본인이 이해한 주제의 내용은?</Typography>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokOutline?.content}
                            </Typography>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">지식영역</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-orange-800">
                              1
                            </Typography>
                          </div>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokOutline?.knowledgeArea1}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">지식주장</Typography>
                          <div className="flex flex-col gap-3">
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.argument1}
                              </Typography>
                            </div>
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.argument1Example}
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">반론</Typography>
                          <div className="flex flex-col gap-3">
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.counterArgument1}
                              </Typography>
                            </div>
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.counterArgument1Example}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">지식영역</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-orange-800">
                              2
                            </Typography>
                          </div>
                          <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                            <Typography variant="body2" className="text-primary-gray-700 font-medium">
                              {data?.tokOutline?.knowledgeArea2}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">지식주장</Typography>
                          <div className="flex flex-col gap-3">
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.argument2}
                              </Typography>
                            </div>
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.argument2Example}
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">반론</Typography>
                          <div className="flex flex-col gap-3">
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.counterArgument2}
                              </Typography>
                            </div>
                            <div className="border-primary-gray-200 rounded-lg border bg-white px-4 py-[13px]">
                              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                                {data?.tokOutline?.counterArgument2Example}
                              </Typography>
                            </div>
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
                        onClick={() => history.push(`/ib/student/tok/essay/${id}`, { type: 'OUTLINE' })}
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
          (data?.status === 'PENDING' ||
            data?.status === 'WAIT_MENTOR' ||
            data?.status === 'WAIT_PLAN_APPROVE' ||
            data?.status === 'REJECT_PLAN') &&
          data?.tokOutline !== undefined &&
          Object.values(data.tokOutline).every((value) => value !== null || value !== '') && (
            <ButtonV2
              variant="solid"
              color="orange800"
              size={48}
              className="w-[416px]"
              disabled={data?.status === 'WAIT_MENTOR' || data?.status === 'WAIT_PLAN_APPROVE'}
              onClick={() => {
                if (data?.tokOutline?.id !== undefined) {
                  if (data.status === 'REJECT_PLAN') {
                    sentIBProposalUpdateWaitPlan(data.id)
                  } else {
                    submitOutline({ id, outlineId: data?.tokOutline?.id })
                  }
                } else {
                  console.error('outlineId가 없습니다.')
                }
              }}
            >
              아웃라인 승인요청
            </ButtonV2>
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
