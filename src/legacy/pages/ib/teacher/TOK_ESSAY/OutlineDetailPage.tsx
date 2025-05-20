import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { SuperModal } from '@/legacy/components'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { InputField } from '@/legacy/components/ib/InputField'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { useIBOutlineStatusApprove, useIBOutlineStatusReject, useOutlineUpdate } from '@/legacy/container/ib-tok-essay'
import { RequestIBTokOutlineDto, ResponseIBDtoStatus, ResponseIBTokOutlineDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'

export const OutlineDetailPage = () => {
  const history = useHistory()

  const { me } = useUserStore()
  const { ibId: idParam, outlineId: outlineIdParam } = useParams<{ ibId: string; outlineId: string }>()
  const id = Number(idParam)
  const outlineId = Number(outlineIdParam)

  const { data: ibData, klassNum: ibKlassNum, refetch, isLoading } = useIBGetById(Number(id))

  const permission = usePermission(ibData?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const outlineData = ibData?.tokOutline

  const klassNum = ibKlassNum
  const { data: Questions } = useThemeQuestionFindAll('TOK_ESSAY')
  const { categoryData: knowledgeArea } = useCodeByCategoryName('tokOutlineKnowledgeArea')

  const [editMode, setEditMode] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)

  const [rejectOutlineModalOpen, setRejectOutlineModalOpen] = useState(false) // 아웃라인 보완 요청 Modal
  const [rejectOutlineConfirmModalOpen, setRejectOutlineConfirmModalOpen] = useState(false) // 아웃라인 보완 요청 완료 Alert
  const [rejectOutlineReason, setRejectOutlineReason] = useState('') // 아웃라인 보완 요청 피드백
  const [approveOutlineModalOpen, setApproveOutlineModalOpen] = useState(false) // 아웃라인 승인 Alert

  // 아웃라인 반려 api 호출 (보완요청 버튼 클릭 시 실행)
  const { rejectOutline } = useIBOutlineStatusReject({
    onSuccess: () => {
      setRejectOutlineConfirmModalOpen(true) // 보완 요청 완료 Alert
    },
  })

  // 아웃라인 승인 api 호출
  const { approveOutline } = useIBOutlineStatusApprove({
    onSuccess: () => {
      setApproveOutlineModalOpen(true)
    },
  })

  const { updateOutline } = useOutlineUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `아웃라인이\n수정되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('아웃라인 수정 중 오류 발생:', error)
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

  const { control, handleSubmit, watch, reset } = useForm<RequestIBTokOutlineDto>({
    defaultValues: outlineData,
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
    if (ibData) {
      reset(outlineData)
    }
  }, [ibData, reset, outlineData])

  const onSubmit = (OutlineData: RequestIBTokOutlineDto) => {
    if (isLoading) return

    if (outlineData?.id !== undefined) {
      updateOutline({ id, outlineId: outlineData?.id, data: OutlineData })
    }
    setEditMode(!editMode)
  }

  const shouldRender = (status: ResponseIBDtoStatus) => {
    // WAIT_MENTOR인 경우 항상 렌더링
    if (status === 'WAIT_MENTOR') return true

    // WAIT_PLAN_APPROVE는 권한에 따라 렌더링
    return hasPermission
  }

  const getFloatingUI = (status: ResponseIBDtoStatus | undefined) => {
    // 상태가 없거나 렌더링 권한이 없는 경우 UI를 표시하지 않음
    if (!status || !shouldRender(status)) return

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
                  onClick={() => setRejectOutlineModalOpen(true)}
                >
                  아웃라인 보완요청
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  onClick={() => {
                    approveOutline(id, outlineId)
                  }}
                >
                  아웃라인 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'IN_PROGRESS':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled>
                아웃라인 승인
              </ButtonV2>
            </div>
          </div>
        )

      case 'REJECT_PLAN':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="gray700" disabled>
                아웃라인 보완요청
              </ButtonV2>
            </div>
          </div>
        )
    }
  }

  if (ibData === undefined || outlineData === undefined || me === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  return (
    <div className="col-span-6">
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
                      진행상태: '/teacher/project',
                      'TOK 에세이': `/teacher/ib/tok/essay/${ibData.id}`,
                      '아웃라인 상세': `/teacher/ib/tok/outline/${ibData.id}`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {outlineData.themeQuestion}
                  </Typography>
                  <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                    {klassNum} · {ibData?.leader?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-gray-50"
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
                {editMode ? (
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
                    <div className="flex flex-col gap-10 border-t border-t-gray-100 py-10">
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
                    <div className="flex flex-col gap-10 border-t border-t-gray-100 py-10">
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
                ) : (
                  <div className="flex flex-col pb-10" id="pdf-download">
                    <div className="mb-6 flex flex-col gap-1">
                      <Typography variant="title1">{outlineData.themeQuestion}</Typography>
                      <Typography variant="body3" className="text-gray-500">
                        {format(new Date(outlineData.createdAt), 'yyyy.MM.dd')}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-10">
                      <div className="flex flex-col gap-4 border-t border-t-gray-100 pt-6">
                        <Typography variant="title2" className="text-gray-900">
                          핵심용어 (설명)
                        </Typography>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <Typography variant="body2" className="font-medium">
                            {outlineData.keyword}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Typography variant="title2" className="text-gray-900">
                          본인이 이해한 주제의 내용은?
                        </Typography>
                        <div className="rounded-lg border border-gray-200 p-4">
                          <Typography variant="body2" className="font-medium">
                            {outlineData.content}
                          </Typography>
                        </div>
                      </div>
                      {[1, 2].map((num) => {
                        const knowledgeAreaKey = `knowledgeArea${num}` as keyof ResponseIBTokOutlineDto
                        const argumentKey = `argument${num}` as keyof ResponseIBTokOutlineDto
                        const argumentExampleKey = `argument${num}Example` as keyof ResponseIBTokOutlineDto
                        const counterArgumentKey = `counterArgument${num}` as keyof ResponseIBTokOutlineDto
                        const counterArgumentExampleKey =
                          `counterArgument${num}Example` as keyof ResponseIBTokOutlineDto

                        return (
                          <div key={num} className="flex flex-col gap-10 border-t border-t-gray-100 pt-10">
                            <div className="flex flex-col gap-4">
                              <Typography variant="title2" className="text-gray-900">
                                지식영역 <span className="text-primary-800">{num}</span>
                              </Typography>
                              <div className="rounded-lg border border-gray-200 p-4">
                                <Typography variant="body2" className="font-medium">
                                  {outlineData[knowledgeAreaKey]}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4">
                              <Typography variant="title2" className="text-gray-900">
                                지식주장
                              </Typography>
                              <div className="flex flex-col gap-3">
                                <div className="rounded-lg border border-gray-200 p-4">
                                  <Typography variant="body2" className="font-medium">
                                    {outlineData[argumentKey]}
                                  </Typography>
                                </div>
                                <div className="rounded-lg border border-gray-200 p-4">
                                  <Typography variant="body2" className="font-medium">
                                    {outlineData[argumentExampleKey]}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4">
                              <Typography variant="title2" className="text-gray-900">
                                반론
                              </Typography>
                              <div className="flex flex-col gap-3">
                                <div className="rounded-lg border border-gray-200 p-4">
                                  <Typography variant="body2" className="font-medium">
                                    {outlineData[counterArgumentKey]}
                                  </Typography>
                                </div>
                                <div className="rounded-lg border border-gray-200 p-4">
                                  <Typography variant="body2" className="font-medium">
                                    {outlineData[counterArgumentExampleKey]}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
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
                        {/* {ibData?.status !== 'COMPLETE' && hasPermission && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={ibData?.status === 'WAIT_MENTOR' || ibData?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )} */}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/teacher/ib/tok/essay/${id}`, { type: 'OUTLINE' })}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1">진행기록</Typography>
                {ibData?.status !== 'PENDING' && ibData?.status !== 'WAIT_MENTOR' ? (
                  <div className="h-full w-full">
                    <Feedback
                      referenceId={id}
                      referenceTable="IB"
                      user={me}
                      useTextarea={ibData?.status !== 'COMPLETE'}
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
        floatingButton={getFloatingUI(ibData?.status)}
      />
      {/* 아웃라인 보완 요청 Modal */}
      <PopupModal
        modalOpen={rejectOutlineModalOpen}
        setModalClose={() => {
          setRejectOutlineModalOpen(false)
          setRejectOutlineReason('')
        }}
        title="아웃라인 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectOutlineReason.length).valueOf()}
            onClick={() => rejectOutline(id, outlineId, { content: rejectOutlineReason })}
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-6">
          <Typography variant="body1">학생에게 아웃라인에 대한 피드백을 남겨주세요.</Typography>
          <TextareaV2
            className="h-40 resize-none rounded-lg p-4"
            placeholder="내용을 입력해주세요."
            value={rejectOutlineReason}
            onChange={(e) => setRejectOutlineReason(e.target.value)}
          />
        </div>
      </PopupModal>

      {/* 아웃라인 보완 요청 완료 Alert */}
      <SuperModal
        modalOpen={rejectOutlineConfirmModalOpen}
        setModalClose={() => setRejectOutlineConfirmModalOpen(false)}
        hasClose={false}
        className="w-[416px]"
      >
        <div className="w-full">
          <Typography variant="title2" className="p-8 text-center">
            아웃라인 보완을
            <br />
            요청하였습니다
          </Typography>
          <div className="p-5 pt-0">
            <ButtonV2
              variant="solid"
              color="orange800"
              size={48}
              onClick={() => {
                setRejectOutlineConfirmModalOpen(false)
                setRejectOutlineModalOpen(false)
              }}
              className="w-full"
            >
              확인
            </ButtonV2>
          </div>
        </div>
      </SuperModal>

      {/* 아웃라인 승인 완료 Alert */}
      <SuperModal
        modalOpen={approveOutlineModalOpen}
        setModalClose={() => setApproveOutlineModalOpen(false)}
        hasClose={false}
        className="w-[416px]"
      >
        <div className="w-full">
          <div className="p-8 text-center">
            <Typography variant="title2">아웃라인이 승인되었습니다</Typography>
          </div>
          <div className="p-5 pt-0">
            <ButtonV2
              variant="solid"
              color="orange800"
              size={48}
              className="w-full"
              onClick={() => setApproveOutlineModalOpen(false)}
            >
              확인
            </ButtonV2>
          </div>
        </div>
      </SuperModal>

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
