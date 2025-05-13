import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import { ProposalViewField } from '@/legacy/components/ib/ee/ProposalViewField'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { InputField } from '@/legacy/components/ib/InputField'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { EE_SUBJECT_CATEGORY_언어와문학, EE_SUBJECT_CATEGORY_영어B, EE_SUBJECTS } from '@/legacy/constants/ib'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalDelete } from '@/legacy/container/ib-proposal-delete'
import { useIBProposalUpdate } from '@/legacy/container/ib-proposal-update'
import { RequestIBProposalUpdateDto } from '@/legacy/generated/model'
import { meState } from '@/stores'

export const ProposalDetailPage = () => {
  const history = useHistory()
  const { id: idParam, proposalId: proposalIdParam } = useParams<{ id: string; proposalId: string }>()
  const id = Number(idParam)
  const proposalId = Number(proposalIdParam)
  const [editMode, setEditMode] = useState<boolean>(false)
  const me = useRecoilValue(meState)
  const { data, isLoading, refetch } = useIBGetById(id)
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)
  const proposalData = data?.proposals?.find((proposal) => proposal.id === proposalId)
  const { updateIBProposal, isLoading: isUpdateLoading } = useIBProposalUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `제안서가\n저장되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const { deleteIBProposal, isLoading: isDeleteLoading } = useIBProposalDelete({
    onSuccess: () => {
      setAlertMessage({
        text: `제안서를\n삭제하였습니다`,
        action: () => history.push(`/ib/student/ee/${id}`, { type: 'PROPOSAL' }), // 목록으로 이동
      })
    },
    onError: (error) => {
      console.error('제안서 삭제 요청중 오류 발생:', error)
    },
  })

  const { control, handleSubmit, reset, setValue, watch } = useForm<RequestIBProposalUpdateDto>({
    defaultValues: proposalData,
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

  const selectedSubject = watch('subject')
  const selectedCategory = watch('category')

  // 저장 버튼 disabled 여부를 확인하는 함수
  // 언어와문학, 영어B 과목일 경우 category 선택 여부 확인
  const isSubmitDisabled = () => {
    if (selectedSubject === '언어와문학' || selectedSubject === '영어B') {
      return !selectedCategory
    }
    return false
  }

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    reset(proposalData)
  }

  const onSubmit = (data: RequestIBProposalUpdateDto) => {
    if (isLoading) return

    updateIBProposal({ id, proposalId, data })
    setEditMode(!editMode)
  }

  useEffect(() => {
    if (proposalData) {
      reset(proposalData)
    }
  }, [proposalData, reset])

  // subject 변경 시 category 초기화
  useEffect(() => {
    setValue('category', '')
  }, [selectedSubject])

  if (!me) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || isDeleteLoading || isUpdateLoading) && <IBBlank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="dark_green" size={24} type="solid_strong" className="self-start px-[12.5px]">
                      EE
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular" className="self-start">
                      제안서
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="line" className="self-start">
                      {proposalData?.rank}순위
                    </BadgeV2>
                    {proposalData?.status === 'SUBMIT' && (
                      <BadgeV2 color="gray" size={24} type="line" className="self-start">
                        제안
                      </BadgeV2>
                    )}
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      EE: `/ib/student/ee/${id}`,
                      '제안서 상세': `/ib/student/ee/${id}/proposal/${proposalId}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {proposalData?.researchTopic}
                </Typography>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
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
                            required
                            mode="page"
                            titleVariant="title2"
                          />

                          {(selectedSubject === '언어와문학' || selectedSubject === '영어B') && (
                            <div className="flex flex-col gap-4">
                              <Typography variant="title2" className="font-semibold">
                                세부 카테고리
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
                            name="modelPaper"
                            control={control}
                            placeholder="모델 논문을 입력해주세요"
                            titleVariant="title2"
                            mode="page"
                            required
                          />
                          <InputField
                            label="모델 논문 요약"
                            name="modelPaperSummary"
                            control={control}
                            placeholder="모델 논문 요약을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            mode="page"
                            required
                          />
                          <InputField
                            label="연구주제"
                            name="researchTopic"
                            control={control}
                            placeholder="연구주제를 입력해주세요"
                            required
                            titleVariant="title2"
                            mode="page"
                          />
                          <InputField
                            label="연구 질문"
                            name="researchQuestion"
                            control={control}
                            placeholder="연구 질문을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            mode="page"
                            required
                          />
                          <InputField
                            label="연구의 필요성"
                            name="researchNeed"
                            control={control}
                            placeholder="연구의 필요성을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            mode="page"
                            required
                          />
                          <InputField
                            label="연구 방법"
                            name="researchMethod"
                            control={control}
                            placeholder="연구 방법을 입력해주세요"
                            className="h-40"
                            type="textarea"
                            titleVariant="title2"
                            mode="page"
                            required
                          />
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col gap-10">
                      <ProposalViewField label="과목" className="py-[13px]">
                        <div className="flex gap-2">
                          <SVGIcon.Note size={20} color="gray700" weight="bold" className="cursor-default" />
                          <Typography variant="body2" className="text-primary-gray-700">
                            {proposalData?.subject}
                          </Typography>
                        </div>
                      </ProposalViewField>

                      {(proposalData?.subject === '언어와문학' || proposalData?.subject === '영어B') && (
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2" className="font-semibold">
                            세부 카테고리
                          </Typography>
                          <RadioV2.Group className="flex flex-col gap-3">
                            {proposalData?.subject === '언어와문학' &&
                              EE_SUBJECT_CATEGORY_언어와문학.map((category) => (
                                <React.Fragment key={category.value}>
                                  <RadioV2.Box
                                    value={category.value}
                                    content={category.value}
                                    type="medium"
                                    checked={proposalData?.category === category.value}
                                    disabled
                                  />
                                </React.Fragment>
                              ))}
                            {proposalData?.subject === '영어B' &&
                              EE_SUBJECT_CATEGORY_영어B.map((category) => (
                                <React.Fragment key={category.value}>
                                  <RadioV2.Box
                                    value={category.value}
                                    content={category.value}
                                    type="medium"
                                    checked={proposalData?.category === category.value}
                                    disabled
                                  />
                                </React.Fragment>
                              ))}
                          </RadioV2.Group>
                        </div>
                      )}
                      <ProposalViewField label="모델 논문" value={proposalData?.modelPaper} className="py-[13px]" />
                      <ProposalViewField label="모델 논문 요약" value={proposalData?.modelPaperSummary} />
                      <ProposalViewField label="연구 주제" value={proposalData?.researchTopic} />
                      <ProposalViewField
                        label="연구 질문"
                        value={proposalData?.researchQuestion}
                        className="py-[13px]"
                      />
                      <ProposalViewField label="연구의 필요성" value={proposalData?.researchNeed} />
                      <ProposalViewField label="연구 방법" value={proposalData?.researchMethod} />
                    </div>
                  )}
                </div>
                <footer className="mt-10 flex flex-row items-center justify-between">
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
                        disabled={isSubmitDisabled() || !areAllFieldsFilled}
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

                        {proposalData?.status === 'PENDING' &&
                          data?.proposals?.length &&
                          data?.proposals?.length > 1 && (
                            <ButtonV2
                              size={40}
                              variant="outline"
                              color="gray400"
                              onClick={() => deleteIBProposal({ id, proposalId })}
                            >
                              삭제
                            </ButtonV2>
                          )}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/ee/${id}`, { type: 'PROPOSAL' })}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1">진행기록</Typography>
                {proposalData?.status === 'ACCEPT' ||
                (proposalData?.status === 'SUBMIT' && data?.status === 'REJECT_PLAN') ? (
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
        // TODO "제안서 보완요청" 상태일 경우 조건 처리
        // floatingButton={
        //   editMode ? null : proposalData?.status === 'PENDING' ||
        //     (proposalData?.status === 'ACCEPT' && data?.status === 'REJECT_PLAN') ? (
        //     <ButtonV2
        //       variant="solid"
        //       color="orange800"
        //       size={48}
        //       className="w-[416px]"
        //       onClick={() => sentIBProposal({ id, proposalId })}
        //       disabled={data?.status === 'WAIT_PLAN_APPROVE'}
        //     >
        //       제안서 승인요청
        //     </ButtonV2>
        //   ) : null
        // }
        bottomBgColor="bg-primary-gray-50"
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
