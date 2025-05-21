import { useState } from 'react'
import { useLocation, useParams } from 'react-router'

import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import EssayList from '@/legacy/components/ib/ee/EssayList'
import ProposalList from '@/legacy/components/ib/ee/ProposalList'
import RPPFList from '@/legacy/components/ib/ee/RPPFList'
import IBLayout from '@/legacy/components/ib/IBLayout'
import IBProjectList from '@/legacy/components/ib/IBProjectList'
import RRSList from '@/legacy/components/ib/RRSList'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useEssayGetByIBId } from '@/legacy/container/ib-essay-find'
import { useIBEssaySent } from '@/legacy/container/ib-essay-send'
import { useIBRequestComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalSentAll, useIBProposalUpdateWaitPlan } from '@/legacy/container/ib-proposal-sent'
import { useRPPFGetByIBIdFindAll } from '@/legacy/container/ib-rppf-findAll'
import { ResponseRPPFDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export type EEProject = 'PROPOSAL' | 'ESSAY' | 'RPPF' | 'RRS'
export type LocationState = {
  type?: EEProject
}

export const EEMainPage = () => {
  const { me } = useUserStore()
  const { t } = useLanguage()
  const { id: idParams } = useParams<{ id: string }>()
  const location = useLocation()
  const initialType = location.state?.type as LocationState['type']
  const id = Number(idParams)
  const [EEType, setEEType] = useState<EEProject>(initialType || 'PROPOSAL')
  const [toggle, setToggle] = useState<boolean>(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const { data, isLoading, refetch } = useIBGetById(id)
  const { data: Essay, isLoading: EssayLoading } = useEssayGetByIBId(id, {
    enabled: data?.status !== 'PENDING' && data?.status !== 'WAIT_MENTOR' && data?.status !== 'REJECT_PLAN',
  })
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const approvedProposal = data?.proposals?.find((proposal) => proposal.status === 'ACCEPT')
  const approvedProposalTopic =
    data?.status === 'IN_PROGRESS' || data?.status === 'WAIT_COMPLETE'
      ? data.proposals?.find((proposal) => proposal.status === 'ACCEPT')?.researchTopic
      : `${me?.name}의 EE 제안서`

  const { data: rppf, isLoading: rppfLoading } = useRPPFGetByIBIdFindAll(Number(id))

  const isRPPFComplete = (rppf: ResponseRPPFDto[] | undefined): boolean => {
    if (!rppf) return false

    // 모든 필드가 작성되었는지 확인
    return rppf?.[0]?.contents?.length === 3
  }

  const { sentIBProposalAll, isLoading: isSentLoading } = useIBProposalSentAll({
    onSuccess: () => {
      setAlertMessage(`제안서가\n제출되었습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('제안서 승인 요청 중 오류 발생:', error)
    },
  })

  const { sentIBProposalUpdateWaitPlan, isLoading: isUpdateLoading } = useIBProposalUpdateWaitPlan({
    onSuccess: () => {
      setAlertMessage(`제안서가\n제출되었습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('제안서 승인 요청 중 오류 발생:', error)
    },
  })

  const { requestIBProjectComplete, isLoading: isCompleteLoading } = useIBRequestComplete({
    onSuccess: () => {
      setAlertMessage(`활동종료를\n요청하였습니다`)
      refetch()
    },
    onError: (error) => {
      console.error('활동종료 요청 중 오류 발생:', error)
    },
  })

  const { sentIBEssay, isLoading: isSentEssayLoading } = useIBEssaySent({
    onSuccess: () => {
      setAlertMessage(`에세이가\n제출되었습니다`)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  if (me == null) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || EssayLoading || rppfLoading) && <IBBlank />}
      {(isSentLoading || isUpdateLoading || isCompleteLoading || isSentEssayLoading) && <IBBlank type="opacity" />}
      <div className="h-screen w-full">
        <div className="">
          <IBLayout
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
                            data?.status === 'IN_PROGRESS' ||
                            data?.status === 'WAIT_COMPLETE' ||
                            (data?.status === 'WAIT_PLAN_APPROVE' && approvedProposal)
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
                          {data?.status === 'WAIT_PLAN_APPROVE' && approvedProposal
                            ? '보완완료'
                            : t(`IBStatus.${data?.status}`)}
                        </BadgeV2>
                      </div>
                      <Breadcrumb
                        data={{
                          진행상태: '/ib/student',
                          EE: `/ib/student/ee/${id}`,
                        }}
                      />
                    </div>
                    <IBProjectList studentId={me.id} currentProjectId={id}>
                      <div className="relative flex w-full flex-col">
                        <div className="flex w-full max-w-[692px] items-center gap-4">
                          <Typography
                            variant="heading"
                            className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {approvedProposalTopic ? approvedProposalTopic : `${me?.name}의 EE 제안서`}
                          </Typography>
                          <div className="shrink-0">
                            <SVGIcon.Arrow
                              color="gray700"
                              weight="bold"
                              size={16}
                              className="cursor-pointer"
                              rotate={toggle ? 90 : 270}
                              onClick={() => setToggle(!toggle)}
                            />
                          </div>
                        </div>
                      </div>
                    </IBProjectList>
                  </div>
                </div>
                <LayeredTabs.OneDepth onChange={(selectedType: EEProject) => setEEType(selectedType)} value={EEType}>
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
            }
            bottomContent={
              <div className="flex h-full items-center pt-6">
                <div className="flex w-full flex-col rounded-xl bg-white">
                  {data === undefined ? (
                    <div>제안서를 불러올 수 없습니다.</div>
                  ) : (
                    <>
                      {EEType === 'PROPOSAL' && <ProposalList data={data} refetch={refetch} />}
                      {EEType === 'ESSAY' && <EssayList data={data} essay={Essay} refetch={refetch} userId={me.id} />}
                      {EEType === 'RPPF' && (
                        <RPPFList
                          data={data}
                          rppfs={rppf}
                          title={approvedProposalTopic || `${me?.name}의 EE 제안서`}
                          userId={me.id}
                        />
                      )}
                      {EEType === 'RRS' && (
                        <RRSList
                          id={id}
                          title={approvedProposalTopic || `${me?.name}의 EE 제안서`}
                          status={data.status}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-gray-50"
            floatingButton={
              (EEType === 'PROPOSAL' &&
                (data?.status === 'PENDING' || data?.status === 'REJECT_PLAN') &&
                data?.proposals?.some((proposal) =>
                  Object.entries(proposal)
                    .filter(([key]) => key !== 'category')
                    .every(([_, value]) => value !== ''),
                ) && (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    onClick={() => {
                      if (data?.status === 'REJECT_PLAN') {
                        sentIBProposalUpdateWaitPlan(data.id)
                      } else {
                        sentIBProposalAll(data.id)
                      }
                    }}
                  >
                    제안서 승인요청
                  </ButtonV2>
                )) ||
              (EEType === 'PROPOSAL' && (data?.status === 'WAIT_PLAN_APPROVE' || data?.status === 'WAIT_MENTOR') && (
                <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled>
                  제안서 승인요청
                </ButtonV2>
              )) ||
              ((data?.status === 'IN_PROGRESS' ||
                data?.status === 'REJECT_COMPLETE' ||
                data?.status === 'WAIT_COMPLETE') &&
                Essay?.status === 'SUBMIT' &&
                isRPPFComplete(rppf) && (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    disabled={data?.status === 'WAIT_COMPLETE'}
                    onClick={() => setIsApproveModalOpen(true)}
                  >
                    활동종료 승인요청
                  </ButtonV2>
                )) ||
              (EEType === 'ESSAY' && Essay?.status === 'PENDING' && (
                <ButtonV2
                  variant="solid"
                  color="orange800"
                  size={48}
                  className="w-[416px]"
                  onClick={() => sentIBEssay(Essay?.id)}
                >
                  에세이 제출
                </ButtonV2>
              ))
            }
          />
        </div>
      </div>
      {isApproveModalOpen && (
        <AlertV2
          message={`활동종료 승인을 요청하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            requestIBProjectComplete(Number(id))
            setIsApproveModalOpen(!isApproveModalOpen)
          }}
          description={'승인요청을 하면 제출물에 대한 수정이 불가능합니다.\n수정할 내용이 없는지 확인해주세요.'}
          onCancel={() => setIsApproveModalOpen(false)}
        />
      )}

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
