import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'

import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { ProposalViewField } from '@/legacy/components/ib/ee/ProposalViewField'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { InputField } from '@/legacy/components/ib/InputField'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { EE_SUBJECT_CATEGORY_언어와문학, EE_SUBJECT_CATEGORY_영어B, EE_SUBJECTS } from '@/legacy/constants/ib'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalUpdate } from '@/legacy/container/ib-proposal-update'
import { useIBRejectPlanByProposal, useIBUpdateIBProposalStatusInProgress } from '@/legacy/generated/endpoint'
import { RequestIBProposalUpdateDto, ResponseIBDtoStatus } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'

export const EEProposalDetailPage = () => {
  const { id, proposalId } = useParams<{ id: string; proposalId: string }>()
  const { me } = useUserStore()
  const { data, klassNum, isLoading } = useIBGetById(Number(id))
  const { push } = useHistory()
  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_EE'

  const proposal = data?.proposals?.filter((el) => el.id === Number(proposalId))?.[0]
  const [rejectModalOpen, setRejectModalOpen] = useState(false) // 제안서 보완 요청 Modal
  const [rejectReason, setRejectReason] = useState('') // 제안서 보완 요청 피드백
  const [editMode, setEditMode] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)

  // 현재 보고 있는 제안서가 반려된 제안서인지 확인
  const isRejectedPlan = data?.proposals?.find((el) => el.id === Number(proposalId))?.status === 'REJECT'

  // 제안서 승인 api 호출
  const { mutate: approve, isLoading: approveLoading } = useIBUpdateIBProposalStatusInProgress({
    mutation: {
      onSuccess: () => {
        setAlertMessage({ text: `제안서가\n승인되었습니다` })
      },
    },
  })

  // 제안서 보완요청 api 호출
  const { mutate: rejectPlan, isLoading: rejectPlanLoading } = useIBRejectPlanByProposal({
    mutation: {
      onSuccess: () => {
        setAlertMessage({ text: `제안서 보완을\n요청하였습니다` })
        setRejectModalOpen(false)
      },
    },
  })

  // 제안서 수정 api 호출
  const { updateIBProposal, isLoading: isUpdateLoading } = useIBProposalUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `제안서가\n수정되었습니다` })
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const { control, handleSubmit, watch, register, setValue } = useForm<RequestIBProposalUpdateDto>({
    defaultValues: proposal || {},
  })

  const requiredFields = watch([
    'subject',
    'modelPaper',
    'modelPaperSummary',
    'researchTopic',
    'researchQuestion',
    'researchNeed',
    'researchMethod',
  ])

  const areAllFieldsFilled = requiredFields.every((field) => field && field.trim() !== '')

  const selectedCategory = watch('category')
  const selectedSubject = watch('subject')

  // 저장 버튼 disabled 여부를 확인하는 함수
  // 언어와문학, 영어B 과목일 경우 category 선택 여부 확인
  const isSubmitDisabled = () => {
    if (selectedSubject === '언어와문학' || selectedSubject === '영어B') {
      return !selectedCategory
    }
    return false
  }

  // 수정 시 저장하기 버튼 클릭
  const onSubmit = (data: RequestIBProposalUpdateDto) => {
    if (isLoading) return

    updateIBProposal({ id: Number(id), proposalId: Number(proposalId), data })
    setEditMode(false)
  }

  const shouldRender = (status: ResponseIBDtoStatus) => {
    // WAIT_MENTOR인 경우 항상 렌더링
    if (status === 'WAIT_MENTOR') return true

    // 다른 모든 상태는 반려된 제안서가 아니고 권한에 따라 렌더링
    return !isRejectedPlan && hasPermission
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
                  onClick={() => setRejectModalOpen(true)}
                >
                  제안서 보완요청
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  onClick={() => {
                    approve({ id: Number(id), proposalId: Number(proposalId) })
                  }}
                >
                  제안서 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'REJECT_PLAN':
        return (
          <div className="mx-auto flex w-[1280px] items-center justify-center">
            <ButtonV2 variant="solid" color="gray100" size={48} className="w-[416px]" disabled>
              제안서 보완요청
            </ButtonV2>
          </div>
        )

      // IN_PROGRESS, WAIT_COMPLETE, REJECT_COMPLETE, COMPLETE : 제안서 승인 후 단계
      default:
        return (
          <div className="mx-auto flex w-[1280px] items-center justify-center">
            <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled>
              제안서 승인
            </ButtonV2>
          </div>
        )
    }
  }

  // subject 변경 시 category 초기화
  useEffect(() => {
    setValue('category', '')
  }, [selectedSubject, setValue])

  if (!data || !me) {
    return <IBBlank />
  }

  if (!proposal) {
    return (
      <div className="col-span-6 flex h-screen w-full items-center justify-center">해당 제안서를 찾을 수 없습니다.</div>
    )
  }

  return (
    <>
      {(isLoading || approveLoading || rejectPlanLoading || isUpdateLoading) && <IBBlank />}
      <div className="col-span-6 h-screen w-full">
        <IBLayout
          className="bg-gray-50"
          topBgColor="bg-white"
          topContent={
            <div>
              <div className="w-full pt-16 pb-6">
                <div className="flex flex-col items-start gap-3">
                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex flex-row gap-1">
                      <BadgeV2 color="dark_green" size={24} type="solid_strong" className="px-[12.5px]">
                        EE
                      </BadgeV2>
                      <BadgeV2 color="gray" size={24} type="solid_regular">
                        제안서
                      </BadgeV2>
                      <BadgeV2 color="gray" size={24} type="line">
                        {proposal.rank}순위
                      </BadgeV2>
                    </div>
                    <Breadcrumb
                      data={{
                        진행상태: '/teacher/project',
                        EE: `/teacher/ib/ee/${id}`,
                        '제안서 상세': `/teacher/ib/ee/${id}/proposal/${proposalId}`,
                      }}
                    />
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <Typography
                      variant="heading"
                      className="max-w-[692px] overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {`${data.leader?.name}의 EE 제안서`}
                    </Typography>
                    <div className="flex items-center space-x-2">
                      <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                        {klassNum} · {data.leader?.name}
                      </div>
                      {data?.activityFrequency && (
                        <div className="text-13 rounded-lg bg-orange-50 px-4 py-3 text-gray-300">
                          <span className="text-orange-800">알림</span>{' '}
                          <span className="ml-2 text-gray-700">
                            {/* TODO: 백엔드에서 내려주는 데이터 확인 필요 */}
                            {/* {data?.activityFrequency} */}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          hasContour={false}
          bottomContent={
            <div className="flex grow flex-col">
              <div className="flex h-full flex-row gap-4 py-6">
                <div className="flex w-[848px] flex-col rounded-xl bg-white p-6">
                  <div>
                    {editMode ? (
                      <>
                        <form>
                          <div className="scroll-box flex h-full flex-col gap-10 overflow-auto">
                            <InputField
                              label="과목"
                              name="subject"
                              control={control}
                              placeholder="과목을 선택해주세요"
                              type="select"
                              options={EE_SUBJECTS}
                              size={40}
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              required
                              mode="page"
                            />

                            {(selectedSubject === '언어와문학' || selectedSubject === '영어B') && (
                              <div className="flex flex-col gap-4">
                                <Typography variant="title2" className="font-semibold">
                                  세부 카테고리<span className="text-old-primary-red-800">*</span>
                                </Typography>
                                <RadioV2.Group className="flex flex-col gap-3">
                                  {selectedSubject === '언어와문학' &&
                                    EE_SUBJECT_CATEGORY_언어와문학.map((category) => (
                                      <React.Fragment key={category.value}>
                                        <RadioV2.Box
                                          value={category.value}
                                          content={category.value}
                                          type="medium"
                                          name="category"
                                          onClick={() => setValue('category', category.value)}
                                          checked={selectedCategory === category.value}
                                        />
                                      </React.Fragment>
                                    ))}
                                  {selectedSubject === '영어B' &&
                                    EE_SUBJECT_CATEGORY_영어B.map((category) => (
                                      <React.Fragment key={category.value}>
                                        <RadioV2.Box
                                          value={category.value}
                                          content={category.value}
                                          type="medium"
                                          name="category"
                                          onClick={() => setValue('category', category.value)}
                                          checked={selectedCategory === category.value}
                                        />
                                      </React.Fragment>
                                    ))}
                                </RadioV2.Group>
                              </div>
                            )}

                            <InputField
                              label="모델 논문"
                              control={control}
                              placeholder="모델 논문을 입력해주세요"
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              mode="page"
                              required
                              {...register('modelPaper')}
                            />
                            <InputField
                              label="모델 논문 요약"
                              control={control}
                              placeholder="모델 논문 요약을 입력해주세요"
                              className="h-40"
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              type="textarea"
                              mode="page"
                              required
                              {...register('modelPaperSummary')}
                            />
                            <InputField
                              label="연구주제"
                              control={control}
                              placeholder="연구주제를 입력해주세요"
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              required
                              mode="page"
                              {...register('researchTopic')}
                            />
                            <InputField
                              label="연구 질문"
                              control={control}
                              placeholder="연구 질문을 입력해주세요"
                              className="h-40"
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              type="textarea"
                              mode="page"
                              required
                              {...register('researchQuestion')}
                            />
                            <InputField
                              label="연구의 필요성"
                              control={control}
                              placeholder="연구의 필요성을 입력해주세요"
                              className="h-40"
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              type="textarea"
                              mode="page"
                              required
                              {...register('researchNeed')}
                            />
                            <InputField
                              label="연구 방법"
                              control={control}
                              placeholder="연구 방법을 입력해주세요"
                              className="h-40"
                              titleClassName="text-gray-900"
                              titleVariant="title2"
                              type="textarea"
                              mode="page"
                              required
                              {...register('researchMethod')}
                            />
                          </div>
                        </form>
                      </>
                    ) : (
                      <div id="pdf-download" className="flex flex-col gap-10">
                        <ProposalViewField label="과목" className="py-[13px]">
                          <div className="flex gap-2">
                            <SVGIcon.Note size={20} color="gray700" weight="bold" className="cursor-default" />
                            <Typography variant="body2" className="text-gray-700">
                              {proposal.subject}
                            </Typography>
                          </div>
                        </ProposalViewField>

                        {(proposal?.subject === '언어와문학' || proposal?.subject === '영어B') && (
                          <div className="flex flex-col gap-4">
                            <Typography variant="title2" className="font-semibold">
                              세부 카테고리
                            </Typography>
                            <RadioV2.Group className="flex flex-col gap-3">
                              {proposal?.subject === '언어와문학' &&
                                EE_SUBJECT_CATEGORY_언어와문학.map((category) => (
                                  <React.Fragment key={category.value}>
                                    <RadioV2.Box
                                      value={category.value}
                                      content={category.value}
                                      type="medium"
                                      checked={proposal?.category === category.value}
                                      disabled
                                    />
                                  </React.Fragment>
                                ))}
                              {proposal?.subject === '영어B' &&
                                EE_SUBJECT_CATEGORY_영어B.map((category) => (
                                  <React.Fragment key={category.value}>
                                    <RadioV2.Box
                                      value={category.value}
                                      content={category.value}
                                      type="medium"
                                      checked={proposal?.category === category.value}
                                      disabled
                                    />
                                  </React.Fragment>
                                ))}
                            </RadioV2.Group>
                          </div>
                        )}
                        <ProposalViewField label="모델 논문" value={proposal.modelPaper} className="py-[13px]" />
                        <ProposalViewField label="모델 논문 요약" value={proposal.modelPaperSummary} />
                        <ProposalViewField label="연구 주제" value={proposal.researchTopic} />
                        <ProposalViewField label="연구 질문" value={proposal.researchQuestion} className="py-[13px]" />
                        <ProposalViewField label="연구의 필요성" value={proposal.researchNeed} />
                        <ProposalViewField label="연구 방법" value={proposal.researchMethod} />
                      </div>
                    )}
                  </div>
                  <div className="mt-10 flex w-full items-center justify-between">
                    {editMode ? (
                      <>
                        <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                          취소
                        </ButtonV2>
                        <ButtonV2
                          size={40}
                          variant="solid"
                          color="orange100"
                          onClick={() => void handleSubmit(onSubmit)()}
                          disabled={isSubmitDisabled() || !areAllFieldsFilled}
                        >
                          저장하기
                        </ButtonV2>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-row items-center gap-2">
                          {/* {data?.status !== 'COMPLETE' && hasPermission && (
                            <ButtonV2
                              size={40}
                              variant="outline"
                              color="gray400"
                              onClick={onEdit}
                              disabled={data?.status === 'WAIT_COMPLETE'}
                            >
                              수정
                            </ButtonV2>
                          )} */}
                        </div>
                        <ButtonV2
                          size={40}
                          variant="solid"
                          color="gray100"
                          onClick={() => push(`/teacher/ib/ee/${id}`)}
                        >
                          목록 돌아가기
                        </ButtonV2>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                  <Typography variant="title1" className="text-gray-900">
                    진행기록
                  </Typography>
                  {proposal?.status === 'ACCEPT' ||
                  (proposal?.status === 'SUBMIT' && data?.status === 'REJECT_PLAN') ? (
                    <div className="h-full w-full">
                      <Feedback
                        referenceId={Number(id)}
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
          floatingButton={!editMode && getFloatingUI(data?.status)}
        />
      </div>

      {/* 제안서 보완 요청 Modal */}
      <PopupModal
        modalOpen={rejectModalOpen}
        setModalClose={() => {
          setRejectModalOpen(false)
          setRejectReason('')
        }}
        title="제안서 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectReason.length).valueOf()}
            onClick={() => rejectPlan({ id: Number(id), proposalId: proposal.id, data: { content: rejectReason } })}
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-4">
          <Typography variant="body1">학생에게 제안서에 대한 피드백을 남겨주세요.</Typography>
          <TextareaV2
            className="h-40 resize-none rounded-lg p-4"
            placeholder="내용을 입력해주세요."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </PopupModal>

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
    </>
  )
}
