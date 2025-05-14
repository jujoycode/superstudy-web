import { useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import EssayList from '@/legacy/components/ib/ee/teacher/EssayList'
import ProposalList from '@/legacy/components/ib/ee/teacher/ProposalList'
import { RPPFList } from '@/legacy/components/ib/ee/teacher/RPPFList'
import RRSList from '@/legacy/components/ib/ee/teacher/RRSList'
import IBLayout from '@/legacy/components/ib/IBLayout'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { useEvaluationGetByStudent } from '@/legacy/container/ib-evaluation'
import { useIBApproveComplete, useIBStatusRejectComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useRPPFGetByIBIdFindAll } from '@/legacy/container/ib-rppf-findAll'
import { ResponseIBDtoStatus } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import type { EEProject } from '@/legacy/pages/ib/student/EE/EEMainPage'
import { useUserStore } from '@/stores2/user'

export const EEMainPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useLanguage()
  const location = useLocation()
  const { me } = useUserStore()
  const { data, klassNum, refetch, isLoading } = useIBGetById(Number(id))
  const [filter, setFilter] = useState<EEProject>(location.state?.type || 'PROPOSAL')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [rejectCompleteModalOpen, setRejectCompleteModalOpen] = useState(false) // 활동종료 반려 Confirm Modal
  const [approveCompleteConfirmModalOpen, setApproveCompleteConfirmModalOpen] = useState(false) // 활동종료 승인 Confirm Modal

  const proposalData = data
    ? {
        ...data,
        proposals: data.proposals?.filter((proposal) => proposal.status !== 'PENDING'),
      }
    : null

  const studentData =
    klassNum && data
      ? {
          klassNum,
          name: data.leader.name,
        }
      : { klassNum: '', name: '' }

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_EE'

  // 완료 승인 대기 중일 때 평가 조회 api 호출
  const { data: evaluation, isFetching: isEvaluationLoading } = useEvaluationGetByStudent(
    data?.leader.id || 0,
    { location: 'ESSAY' },
    {
      enabled: data?.status === 'WAIT_COMPLETE',
    },
  )

  // 평가했는지 확인
  const isEvaluationChecked = evaluation?.comment?.comment !== ''
  const approvedProposal = proposalData?.proposals?.find((proposal) => proposal.status === 'ACCEPT')

  const { data: rppf = [], isLoading: isRPPFLoading } = useRPPFGetByIBIdFindAll(
    Number(id),
    { page: 1, limit: 10 },
    {
      enabled: data?.status === 'WAIT_COMPLETE',
    },
  )

  // 활동종료 반려 api 호출
  const { rejectIBProjectComplete, isLoading: isRejectCompleteLoading } = useIBStatusRejectComplete({
    onSuccess: () => {
      setAlertMessage(`활동종료 요청을\n반려하였습니다`)
      refetch()
    },
  })

  // 활동 종료 승인 api 호출
  const { approveIBProjectComplete, isLoading: isApproveCompleteLoading } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage(`활동종료를\n승인하였습니다`)
    },
    onError: (error) => {
      console.error('활동종료 승인 중 오류 발생:', error)
    },
  })

  if (!proposalData) {
    return <IBBlank />
  }

  if (data === undefined) {
    return <IBBlank />
  }

  const getFloatingUI = (status: ResponseIBDtoStatus | undefined) => {
    if (!status || !hasPermission) return

    switch (status) {
      case 'WAIT_COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-between">
              <Typography variant="caption2" className="text-primary-gray-500 flex items-center gap-1">
                <SolidSVGIcon.Info color="gray400" size={16} />
                RPPF 제출정보 기입과 에세이 평가 완료 후 활동종료 승인이 가능합니다.
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
                  // 평가, RPPF 제출 동의 여부 확인
                  disabled={!isEvaluationChecked || !rppf?.[0]?.academicIntegrityConsent}
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

  return (
    <>
      <div className="col-span-6 h-screen w-full">
        {(isLoading || isEvaluationLoading || isRPPFLoading || isRejectCompleteLoading || isApproveCompleteLoading) && (
          <IBBlank />
        )}
        <IBLayout
          className="bg-gray-50"
          topBgColor="bg-white"
          topContent={
            <div>
              <div className="w-full pt-16 pb-6">
                <div className="flex flex-col items-start gap-3">
                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-1">
                      <BadgeV2 color="dark_green" size={24} type="solid_strong" className="px-[12.5px]">
                        EE
                      </BadgeV2>
                      <BadgeV2
                        color={
                          data.status === 'IN_PROGRESS' ||
                          data.status === 'WAIT_COMPLETE' ||
                          (data.status === 'WAIT_PLAN_APPROVE' && approvedProposal)
                            ? 'blue'
                            : data.status === 'REJECT_MENTOR' ||
                                data.status === 'REJECT_PLAN' ||
                                data.status === 'REJECT_COMPLETE'
                              ? 'red'
                              : data.status === 'COMPLETE'
                                ? 'green'
                                : 'gray'
                        }
                        size={24}
                        type="line"
                      >
                        {data.status === 'WAIT_PLAN_APPROVE' && approvedProposal
                          ? '보완완료'
                          : t(`IBStatus.${data.status}`)}
                      </BadgeV2>
                    </div>
                    <Breadcrumb
                      data={{
                        진행상태: '/teacher/project',
                        EE: `/teacher/ib/ee/${id}`,
                      }}
                    />
                  </div>
                  <div className="flex w-full items-start justify-between">
                    <Typography
                      variant="heading"
                      className="max-w-[692px] overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {`${data.leader?.name}의 EE`}
                    </Typography>
                    <div className="flex items-center space-x-2">
                      <div className="text-16 text-primary-orange-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                        {klassNum} · {proposalData.leader.name}
                      </div>
                      {proposalData.activityFrequency && (
                        <div className="text-13 rounded-lg bg-orange-50 px-4 py-3 text-gray-300">
                          <span className="text-orange-800">알림</span>{' '}
                          <span className="ml-2 text-gray-700">{proposalData.activityFrequency}</span>
                          {/* TODO: 테스트 필요 / 기본 테스트: 활동 완료 승인 요청이 있습니다. */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex h-full items-center">
                <LayeredTabs.OneDepth
                  onChange={(selectedType: EEProject) => setFilter(selectedType)}
                  value={filter}
                  inActiveClassName="text-primary-gray-900 border-primary-gray-900"
                >
                  <Tab value="PROPOSAL">
                    <p>제안서</p>
                  </Tab>
                  <Tab value="ESSAY">
                    <p>에세이</p>
                  </Tab>
                  <Tab value="RPPF">
                    <p>RPPF</p>
                  </Tab>
                  <Tab value="RRS">
                    <p>RRS</p>
                  </Tab>
                </LayeredTabs.OneDepth>
              </div>
            </div>
          }
          hasContour={false}
          bottomContent={
            <div className="flex h-full items-center pt-6">
              <div className="h-[664px] w-full rounded-xl bg-white">
                {filter === 'PROPOSAL' && <ProposalList data={proposalData} refetch={refetch} />}
                {filter === 'ESSAY' && <EssayList data={proposalData} studentData={studentData} refetch={refetch} />}
                {filter === 'RPPF' && (
                  <RPPFList id={Number(id)} data={proposalData} refetch={refetch} studentData={studentData} />
                )}
                {filter === 'RRS' && <RRSList id={Number(id)} studentData={studentData} data={proposalData} />}
              </div>
            </div>
          }
          floatingButton={getFloatingUI(data?.status)}
        />
      </div>

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
    </>
  )
}
