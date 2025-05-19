import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import ExhibitionList from '@/legacy/components/ib/tok/teacher/ExhibitionList'
import ExhibitionPlanList from '@/legacy/components/ib/tok/teacher/ExhibitionPlanList'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useGetTokEvaluationInitialData } from '@/legacy/container/ib-evaluation'
import { useIBApproveComplete, useIBStatusRejectComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBExhibitionPlanStatusApprove, useIBExhibitionPlanStatusReject } from '@/legacy/container/ib-tok-exhibition'
import { ResponseIBDtoStatus } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useUserStore } from '@/stores/user'

export type TOKProject = 'EXHIBITION' | 'EXHIBITION_PLAN'

export const ExhibitionMainPage = () => {
  const { t } = useLanguage()
  const { ibId: idParams } = useParams<{ ibId: string }>()
  const location = useLocation()
  const { me } = useUserStore()

  const initialType = location.state?.type || 'EXHIBITION_PLAN'
  const id = Number(idParams)
  const [type, setType] = useState<TOKProject>(initialType)
  const { data, klassNum, isLoading, refetch } = useIBGetById(id)

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [rejectPlanModalOpen, setRejectPlanModalOpen] = useState(false) // 기획안 보완 요청 Modal
  const [rejectPlanReason, setRejectPlanReason] = useState('') // 기획안 보완 요청 피드백

  const [rejectExhibitionConfirmModalOpen, setRejectExhibitionConfirmModalOpen] = useState(false) // 전시회 종료 요청 반려 Modal
  const [approveExhibitionConfirmModalOpen, setApproveExhibitionConfirmModalOpen] = useState(false) // 전시회 종료 요청 승인 Modal

  // 기획안 반려 api 호출 (보완요청 버튼 클릭 시 실행)
  const { rejectExhibitionPlan } = useIBExhibitionPlanStatusReject({
    onSuccess: () => {
      setRejectPlanModalOpen(false)
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

  // 완료 승인 대기 중일 때 평가 조회 api 호출
  const { data: evaluation } = useGetTokEvaluationInitialData(
    { ibId: id || 0, type: 'EXHIBITION' },
    {
      enabled: data?.status === 'WAIT_COMPLETE',
    },
  )

  // 최종 평가 점수
  const evaluationScore = evaluation?.evaluations?.find((evaluation) => evaluation.isFinal)?.score ?? null

  // 전시회 종료 반려 api 호출 (프로젝트 완료 반려)
  const { rejectIBProjectComplete } = useIBStatusRejectComplete({
    onSuccess: () => {
      setAlertMessage(`전시회 종료 요청을\n반려하였습니다`)
      refetch()
    },
  })

  // 전시회 종료 승인 api 호출
  const { approveIBProjectComplete } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage(`전시회 종료를\n승인하였습니다`)
      refetch()
    },
  })

  const acceptExhibitionTitle =
    data?.status === 'IN_PROGRESS' ||
    data?.status === 'WAIT_COMPLETE' ||
    data?.status === 'COMPLETE' ||
    data?.status === 'REJECT_COMPLETE'
      ? data.tokExhibitionPlan?.themeQuestion
      : `${data?.leader.name}의 TOK 전시회`

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
                  onClick={() => setRejectPlanModalOpen(true)}
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
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled>
                기획안 승인
              </ButtonV2>
            </div>
          </div>
        )

      case 'REJECT_PLAN':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="gray700" disabled>
                기획안 보완요청
              </ButtonV2>
            </div>
          </div>
        )
    }
  }

  const exhibitionUI = (status: ResponseIBDtoStatus) => {
    switch (status) {
      case 'WAIT_COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-between">
              <Typography variant="caption2" className="text-primary-gray-400 flex items-center gap-1">
                <SolidSVGIcon.Info color="gray400" size={16} />
                전시회 평가 완료 후 전시회 종료 승인이 가능합니다.
              </Typography>
              <div className="flex items-center gap-4">
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="gray700"
                  onClick={() => setRejectExhibitionConfirmModalOpen(true)}
                >
                  전시회 종료 반려
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  disabled={evaluationScore === null}
                  onClick={() => {
                    setApproveExhibitionConfirmModalOpen(true)
                  }}
                >
                  전시회 종료 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'REJECT_COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="gray700" disabled>
                전시회 종료 반려
              </ButtonV2>
            </div>
          </div>
        )

      case 'COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled>
                전시회 종료 승인
              </ButtonV2>
            </div>
          </div>
        )
    }
  }

  const getFloatingUI = (status: ResponseIBDtoStatus | undefined) => {
    // 상태가 없거나 렌더링 권한이 없는 경우 UI를 표시하지 않음
    if (!status || !shouldRender(status)) return

    if (type === 'EXHIBITION_PLAN') {
      return planUI(status) || exhibitionUI(status)
    } else if (type === 'EXHIBITION') {
      return exhibitionUI(status)
    }
  }
  return (
    <div className="col-span-6">
      {isLoading && <Blank />}
      <div className="h-screen w-full">
        <div className="">
          <IBLayout
            topContent={
              <div>
                <div className="w-full pt-16 pb-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex w-full flex-row items-center justify-between">
                      <div className="flex flex-row items-center gap-1">
                        <BadgeV2 color="brown" size={24} type="solid_strong">
                          TOK
                        </BadgeV2>
                        <BadgeV2
                          color={
                            data?.status === 'IN_PROGRESS' ||
                            data?.status === 'WAIT_COMPLETE' ||
                            data?.status === 'WAIT_PLAN_APPROVE'
                              ? 'blue'
                              : data?.status === 'REJECT_MENTOR' ||
                                  data?.status === 'REJECT_PLAN' ||
                                  data?.status === 'REJECT_COMPLETE'
                                ? 'red'
                                : data?.status === 'COMPLETE'
                                  ? 'green'
                                  : 'gray'
                          }
                          size={24}
                          type="line"
                        >
                          {data?.status === 'WAIT_PLAN_APPROVE' ? '보완완료' : t(`IBStatus.${data?.status}`)}
                        </BadgeV2>
                      </div>
                      <Breadcrumb
                        data={{
                          진행상태: '/teacher/project',
                          'TOK 전시회': `/teacher/ib/tok/exhibition/${id}`,
                        }}
                      />
                    </div>
                    <div className="flex w-full items-start justify-between">
                      <Typography
                        variant="heading"
                        className="text-primary-gray-900 w-[692px] overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {acceptExhibitionTitle}
                      </Typography>
                      <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                        {klassNum} · {data?.leader.name}
                      </div>
                    </div>
                  </div>
                </div>
                <LayeredTabs.OneDepth
                  onChange={(selectedType: TOKProject) => setType(selectedType)}
                  value={type}
                  inActiveClassName="text-primary-gray-900 border-primary-gray-900"
                >
                  <Tab value="EXHIBITION_PLAN">
                    <p>기획안</p>
                  </Tab>
                  <Tab value="EXHIBITION">
                    <p>전시회</p>
                  </Tab>
                </LayeredTabs.OneDepth>
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center pt-6">
                <div className="flex w-full flex-col rounded-xl bg-white">
                  {data === undefined ? (
                    <div>기획안을 불러올 수 없습니다.</div>
                  ) : (
                    <>
                      {type === 'EXHIBITION_PLAN' && (
                        <ExhibitionPlanList data={data} refetch={refetch} isLoading={isLoading} />
                      )}
                      {type === 'EXHIBITION' && <ExhibitionList data={data} refetch={refetch} />}
                    </>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-primary-gray-50"
            floatingButton={getFloatingUI(data?.status)}
          />
        </div>
      </div>

      {/* 기획안 보완 요청 Modal */}
      <PopupModal
        modalOpen={rejectPlanModalOpen}
        setModalClose={() => {
          setRejectPlanModalOpen(false)
          setRejectPlanReason('')
        }}
        title="기획안 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectPlanReason.length).valueOf()}
            onClick={() => rejectExhibitionPlan(Number(id), data!.tokExhibitionPlan!.id, { content: rejectPlanReason })}
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
            value={rejectPlanReason}
            onChange={(e) => setRejectPlanReason(e.target.value)}
          />
        </div>
      </PopupModal>

      {/* 전시회 종료 반려 Confirm Modal */}
      {rejectExhibitionConfirmModalOpen && (
        <AlertV2
          message={`전시회 종료 요청을 반려하시겠습니까?`}
          description={'보완이 필요한 진행기록에 보완사유를 남겨주세요.'}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            rejectIBProjectComplete(Number(id), {})
            setRejectExhibitionConfirmModalOpen(false)
          }}
          onCancel={() => setRejectExhibitionConfirmModalOpen(false)}
        />
      )}

      {/* 전시회 종료 승인 Confirm Modal */}
      {approveExhibitionConfirmModalOpen && (
        <AlertV2
          message={`전시회 종료를 승인하시겠습니까?`}
          description={'승인 시 학생의 활동이 완전히 종료되며\n학생의 제출물과 평가 및 지도의견 수정이 불가합니다.'}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            approveIBProjectComplete(Number(id))
            setApproveExhibitionConfirmModalOpen(false)
          }}
          onCancel={() => setApproveExhibitionConfirmModalOpen(false)}
        />
      )}

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
