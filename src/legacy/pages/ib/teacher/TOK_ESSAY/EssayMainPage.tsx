import { useState } from 'react'
import { useLocation, useParams } from 'react-router'

import { SuperModal } from '@/legacy/components'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import EssayList from '@/legacy/components/ib/tok/teacher/EssayList'
import OutlineList from '@/legacy/components/ib/tok/teacher/OutlineList'
import RRSList from '@/legacy/components/ib/tok/teacher/RRSList'
import TKPPFList from '@/legacy/components/ib/tok/teacher/TKPPFList'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useGetTokEvaluationInitialData } from '@/legacy/container/ib-evaluation'
import { useIBApproveComplete, useIBStatusRejectComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBOutlineStatusApprove, useIBOutlineStatusReject, useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { ResponseIBDtoStatus } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useUserStore } from '@/stores/user'

export type TOKProject = 'OUTLINE' | 'ESSAY' | 'TKPPF' | 'RRS'
export type LocationState = {
  type?: TOKProject
}

export const EssayMainPage = () => {
  const { t } = useLanguage()
  const { ibId: idParams } = useParams<{ ibId: string }>()
  const location = useLocation()
  const { me } = useUserStore()

  const initialType = location.state?.type || 'OUTLINE'
  const id = Number(idParams)

  const [type, setType] = useState<TOKProject>(initialType)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [rejectOutlineModalOpen, setRejectOutlineModalOpen] = useState(false) // 아웃라인 보완 요청 Modal
  const [rejectOutlineConfirmModalOpen, setRejectOutlineConfirmModalOpen] = useState(false) // 아웃라인 보완 요청 완료 Alert
  const [rejectOutlineReason, setRejectOutlineReason] = useState('') // 아웃라인 보완 요청 피드백
  const [approveOutlineModalOpen, setApproveOutlineModalOpen] = useState(false) // 아웃라인 승인 Alert
  const [rejectCompleteModalOpen, setRejectCompleteModalOpen] = useState(false) // 활동종료 반려 Alert
  const [approveCompleteConfirmModalOpen, setApproveCompleteConfirmModalOpen] = useState(false) // 활동종료 승인 Confirm Modal

  const { data, klassNum, isLoading, refetch } = useIBGetById(id)

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  // 아웃라인 반려 api 호출 (보완요청 버튼 클릭 시 실행)
  const { rejectOutline, isLoading: isRejectOutlineLoading } = useIBOutlineStatusReject({
    onSuccess: () => {
      setRejectOutlineConfirmModalOpen(true) // 보완 요청 완료 Alert
    },
  })

  // 아웃라인 승인 api 호출
  const { approveOutline, isLoading: isApproveOutlineLoading } = useIBOutlineStatusApprove({
    onSuccess: () => {
      setApproveOutlineModalOpen(true)
    },
  })

  const { data: tkppf, isLoading: isTKPPFLoading } = useTKPPFGetByIBId(id)

  // 활동 종료 승인 api 호출
  const { approveIBProjectComplete, isLoading: isApproveCompleteLoading } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage(`활동종료를\n승인하였습니다`)
    },
    onError: (error) => {
      console.error('활동종료 승인 중 오류 발생:', error)
    },
  })

  // 완료 승인 대기 중일 때 평가 조회 api 호출
  const { data: evaluation, isFetching: isEvaluationLoading } = useGetTokEvaluationInitialData(
    { ibId: id || 0, type: 'ESSAY' },
    {
      enabled: data?.status === 'WAIT_COMPLETE',
    },
  )

  // 최종 평가 점수
  const evaluationScore = evaluation?.evaluations?.find((evaluation) => evaluation.isFinal)?.score ?? null

  // 활동종료 반려 api 호출
  const { rejectIBProjectComplete, isLoading: isRejectCompleteLoading } = useIBStatusRejectComplete({
    onSuccess: () => {
      setAlertMessage(`활동종료 요청을\n반려하였습니다`)
      refetch()
    },
  })

  const shouldRender = (status: ResponseIBDtoStatus) => {
    // WAIT_MENTOR인 경우 항상 렌더링
    if (status === 'WAIT_MENTOR') return true

    // 다른 모든 상태는 권한에 따라 렌더링
    return hasPermission
  }

  const outlineUI = (status: ResponseIBDtoStatus) => {
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
                    approveOutline(Number(id), Number(data?.tokOutline?.id))
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

  const essayUI = (status: ResponseIBDtoStatus) => {
    switch (status) {
      case 'WAIT_COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-between">
              <Typography variant="caption2" className="flex items-center gap-1 text-gray-400">
                <SolidSVGIcon.Info color="gray400" size={16} />
                TKPPF 제출정보 기입과 에세이 평가 완료 후 활동종료 승인이 가능합니다.
              </Typography>
              <div className="flex items-center gap-4">
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="gray700"
                  onClick={() => setRejectCompleteModalOpen(true)}
                >
                  활동종료 반려
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  // 최종 평가, TKPPF 제출 동의 여부 확인
                  disabled={evaluationScore === null || !tkppf?.academicIntegrityConsent}
                  onClick={() => setApproveCompleteConfirmModalOpen(true)}
                >
                  활동종료 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'REJECT_COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 variant="solid" color="gray700" size={48} className="w-[416px]" disabled={true}>
                활동종료 반려
              </ButtonV2>
            </div>
          </div>
        )

      case 'COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled>
                활동종료 승인
              </ButtonV2>
            </div>
          </div>
        )
    }
  }

  const getFloatingUI = (status: ResponseIBDtoStatus | undefined) => {
    // 상태가 없거나 렌더링 권한이 없는 경우 UI를 표시하지 않음
    if (!status || !shouldRender(status)) return

    if (type === 'OUTLINE') {
      return outlineUI(status) || essayUI(status)
    } else {
      return essayUI(status)
    }
  }

  if (data === undefined) {
    return <IBBlank />
  }

  if (isLoading || isTKPPFLoading || isEvaluationLoading) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isRejectOutlineLoading || isApproveOutlineLoading || isRejectCompleteLoading || isApproveCompleteLoading) && (
        <IBBlank type="opacity" />
      )}
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
                          'TOK 에세이': `/teacher/ib/tok/essay/${id}`,
                        }}
                      />
                    </div>
                    <div className="flex w-full items-start justify-between">
                      <Typography
                        variant="heading"
                        className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-900"
                      >
                        {`${data?.leader.name}의 TOK 에세이`}
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
                  inActiveClassName="text-gray-900 border-gray-900"
                >
                  <Tab value="OUTLINE">
                    <p>아웃라인</p>
                  </Tab>
                  <Tab value="ESSAY">
                    <p>에세이</p>
                  </Tab>
                  <Tab value="TKPPF">
                    <p>TKPPF</p>
                  </Tab>
                  <Tab value="RRS">
                    <p>RRS</p>
                  </Tab>
                </LayeredTabs.OneDepth>
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center pt-6">
                <div className="flex w-full flex-col rounded-xl bg-white">
                  {data === undefined ? (
                    <div>아웃라인을 불러올 수 없습니다.</div>
                  ) : (
                    <>
                      {type === 'OUTLINE' && <OutlineList data={data} refetch={refetch} isLoading={isLoading} />}
                      {type === 'ESSAY' && <EssayList data={data} refetch={refetch} />}
                      {type === 'TKPPF' && <TKPPFList data={data} refetch={refetch} />}
                      {type === 'RRS' && <RRSList data={data} refetch={refetch} />}
                    </>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-gray-50"
            floatingButton={getFloatingUI(data?.status)}
          />
        </div>
      </div>

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
            onClick={() => rejectOutline(Number(id), data.tokOutline!.id, { content: rejectOutlineReason })}
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

      {/* 활동종료 반려 Confirm Modal */}
      {rejectCompleteModalOpen && (
        <AlertV2
          message={`활동종료 요청을 반려하시겠습니까?`}
          description={'보완이 필요한 진행기록에 보완사유를 남겨주세요.'}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            rejectIBProjectComplete(Number(id), {})
            setRejectCompleteModalOpen(false)
          }}
          onCancel={() => setRejectCompleteModalOpen(false)}
        />
      )}

      {/* 활동종료 승인 Confirm Modal */}
      {approveCompleteConfirmModalOpen && (
        <AlertV2
          message={`활동종료 승인을 요청하시겠습니까?`}
          description={'승인 시 학생의 활동이 완전히 종료되며\n학생의 제출물과 평가 및 지도의견 수정이 불가합니다.'}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            approveIBProjectComplete(Number(id))
            setApproveCompleteConfirmModalOpen(false)
          }}
          onCancel={() => setApproveCompleteConfirmModalOpen(false)}
        />
      )}

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
