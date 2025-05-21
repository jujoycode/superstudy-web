import { useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router'

import { twMerge } from 'tailwind-merge'
import { cn } from '@/utils/commonUtil'

import { useUserStore } from '@/stores/user'
import { SuperModal } from '@/legacy/components'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import Timeline from '@/legacy/components/ib/cas/Timeline'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { PopupModal } from '@/legacy/components/PopupModal'
import {
  useIBApproveComplete,
  useIBApprovePlan,
  useIBRejectPlanStatus,
  useIBStatusRejectComplete,
} from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { ResponseIBDtoStatus } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export type CASProject = 'ACTIVITY_PLAN' | 'ACTIVITY_LOG'

export const CASMainPage = () => {
  const { me } = useUserStore()
  const { t } = useLanguage()
  const { id: idParams } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const id = Number(idParams)
  const [rejectPlanModalOpen, setRejectPlanModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [approveCompleteModalOpen, setApproveCompleteModalOpen] = useState(false)
  const [rejectPlanReason, setRejectPlanReason] = useState('')
  const [rejectCompleteConfirmModalOpen, setRejectCompleteConfirmModalOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const { data, klassNum, isLoading, refetch } = useIBGetById(id)

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_CAS'

  const { rejectIBPlan, isLoading: isRejectPlanLoading } = useIBRejectPlanStatus({
    onSuccess: () => {
      setRejectPlanModalOpen(!rejectPlanModalOpen)
      setAlertMessage(`계획서 보완을\n요청하였습니다`)
      refetch()
    },
  })

  const { approveIBPlan, isLoading: isApprovePlanLoading } = useIBApprovePlan({
    onSuccess: () => {
      setAlertMessage(`계획서가\n승인되었습니다`)
      refetch()
    },
  })

  const { rejectIBProjectComplete, isLoading: isRejectCompleteLoading } = useIBStatusRejectComplete({
    onSuccess: () => {
      setRejectCompleteConfirmModalOpen(!rejectCompleteConfirmModalOpen)
      setAlertMessage(`활동종료 요청을\n반려하였습니다`)
      refetch()
    },
  })

  const { approveIBProjectComplete, isLoading: isApproveCompleteLoading } = useIBApproveComplete({
    onSuccess: () => {
      setApproveCompleteModalOpen(!approveCompleteModalOpen)
      setAlertMessage(`활동종료를\n승인하였습니다`)
      refetch()
    },
  })

  const shouldRender = (status: ResponseIBDtoStatus) => {
    // WAIT_MENTOR면서 희망 감독교사가 없는 경우 항상 렌더링
    if (status === 'WAIT_MENTOR' && !data?.mentor) return true

    // 다른 모든 경우는 권한에 따라 렌더링
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
                  onClick={() => {
                    if (!data?.mentor?.id) {
                      setAlertMessage(`감독교사가 지정되지 않았습니다.`)
                      return
                    }
                    setRejectPlanModalOpen(true)
                  }}
                >
                  계획서 보완요청
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  onClick={() => {
                    if (!data?.mentor?.id) {
                      setAlertMessage(`감독교사가 지정되지 않았습니다.`)
                      return
                    }
                    setApproveModalOpen(true)
                  }}
                >
                  계획서 승인
                </ButtonV2>
              </div>
            </div>
          </div>
        )

      case 'REJECT_PLAN':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="gray700" disabled={true}>
                계획서 보완요청
              </ButtonV2>
            </div>
          </div>
        )

      case 'IN_PROGRESS':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled={true}>
                계획서 승인
              </ButtonV2>
            </div>
          </div>
        )
    }
  }

  const activityUI = (status: ResponseIBDtoStatus) => {
    switch (status) {
      case 'WAIT_COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-end">
              <div className="flex items-center gap-4">
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="gray700"
                  onClick={() => setRejectCompleteConfirmModalOpen(true)}
                >
                  활동종료 반려
                </ButtonV2>
                <ButtonV2
                  className="w-[200px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  onClick={() => setApproveCompleteModalOpen(true)}
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
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="gray700" disabled={true}>
                활동종료 반려
              </ButtonV2>
            </div>
          </div>
        )

      case 'COMPLETE':
        return (
          <div>
            <div className="mx-auto flex w-[1280px] items-center justify-center">
              <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled={true}>
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

    if (pathname.startsWith('/teacher/ib/cas') && !pathname.includes('activitylog')) {
      return planUI(status) || activityUI(status)
    } else return activityUI(status)
  }

  if (data === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      {(isRejectPlanLoading || isApprovePlanLoading || isRejectCompleteLoading || isApproveCompleteLoading) && (
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
                        <BadgeV2 color="navy" size={24} type="solid_strong">
                          CAS
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
                        data={
                          /\/teacher\/ib\/cas\/\d+\/activitylog\/\d+/.test(pathname)
                            ? {
                                진행상태: '/teacher/project',
                                CAS: `/teacher/ib/cas/${id}/plan`,
                                '활동일지 상세': ``,
                              }
                            : {
                                진행상태: '/teacher/project',
                                CAS: `/teacher/ib/cas/${id}/plan`,
                              }
                        }
                      />
                    </div>
                    <div className="flex w-full items-start justify-between">
                      <Typography
                        variant="heading"
                        className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {data?.ibType === 'CAS_NORMAL' ? '[일반]' : '[프로젝트]'}&nbsp;{data?.title}
                      </Typography>
                      <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                        {klassNum} · {data?.leader.name}
                      </div>
                    </div>
                    <Timeline data={data} />
                  </div>
                </div>
                <div className="flex h-12 w-max flex-row items-end gap-4">
                  <Link
                    to={`/teacher/ib/cas/${data.id}/plan`}
                    className={twMerge(
                      cn(
                        'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                        pathname.startsWith('/teacher/ib/cas') && !pathname.includes('activitylog')
                          ? 'border-b-2 border-[#121316] text-[#121316]'
                          : 'mb-[2px] text-[#898d94]',
                      ),
                    )}
                  >
                    <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                      계획서
                    </div>
                  </Link>
                  <Link
                    to={`/teacher/ib/cas/${data.id}/activitylog`}
                    className={twMerge(
                      cn(
                        'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                        pathname.startsWith('/teacher/ib/cas') && !pathname.includes('plan')
                          ? 'border-b-2 border-[#121316] text-[#121316]'
                          : 'mb-[2px] text-[#898d94]',
                      ),
                    )}
                  >
                    <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                      활동일지
                    </div>
                  </Link>
                </div>
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center pt-6">
                <div className="flex w-full flex-col rounded-xl">
                  {data === undefined ? (
                    <div>계획서를 불러올 수 없습니다.</div>
                  ) : (
                    <Outlet
                      context={{
                        data,
                        refetch,
                        hasPermission,
                        setEdit: () => {},
                        type: 'teacher',
                      }}
                    />
                    // <Routes>
                    //   <Route
                    //     path="/teacher/ib/cas/:id/plan"
                    //     element={
                    //       data.ibType === 'CAS_NORMAL' ? (
                    //         <TeacherActivityPlan data={data} refetch={refetch} hasPermission={hasPermission} />
                    //       ) : data.ibType === 'CAS_PROJECT' ? (
                    //         <ProjectActivityPlan
                    //           data={data}
                    //           refetch={refetch}
                    //           type="teacher"
                    //           setEdit={() => {}}
                    //           hasPermission={hasPermission}
                    //         />
                    //       ) : (
                    //         <div>잘못된 IB 타입입니다.</div>
                    //       )
                    //     }
                    //   />
                    //   <Route
                    //     path="/teacher/ib/cas/:id/activitylog/:activitylogId"
                    //     element={
                    //       <AcitivityLogDetail type="teacher" status={data.status} hasPermission={hasPermission} />
                    //     }
                    //   />
                    //   <Route path="/teacher/ib/cas/:id/activitylog" element={<TeahcerActivityLogList data={data} />} />
                    // </Routes>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-gray-50"
            floatingButton={getFloatingUI(data?.status)}
          />
        </div>
      </div>
      <PopupModal
        modalOpen={rejectPlanModalOpen}
        setModalClose={() => {
          setRejectPlanModalOpen(false)
          setRejectPlanReason('')
        }}
        title="계획서 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectPlanReason.length).valueOf()}
            onClick={() => rejectIBPlan({ id: data.id, data: { content: rejectPlanReason } })}
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-6">
          <Typography variant="body1">학생에게 계획서에 대한 피드백을 남겨주세요.</Typography>
          <TextareaV2
            className="h-40 resize-none rounded-lg p-4"
            placeholder="내용을 입력해주세요."
            value={rejectPlanReason}
            onChange={(e) => setRejectPlanReason(e.target.value)}
          />
        </div>
      </PopupModal>
      <SuperModal
        modalOpen={approveModalOpen}
        setModalClose={() => setApproveModalOpen(false)}
        hasClose={false}
        className="w-[416px]"
      >
        <div>
          <div className="flex flex-col gap-4 p-8">
            <div className="flex flex-col gap-2">
              <Typography variant="title2" className="text-center font-semibold">
                활동을 승인 및 담당하시겠습니까?
              </Typography>
              <Typography variant="body2" className="text-center">
                다음 활동에 대한 감독교사를 담당하게 되며,
                <br />
                학생은 활동을 시작할 수 있습니다.
              </Typography>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <span className="flex flex-row items-start gap-2">
                <Typography variant="body2" className="min-w-[92px] text-gray-500">
                  활동 제목
                </Typography>
                <Typography variant="body2" className="text-gray-700">
                  {data.ibType === 'CAS_NORMAL' ? '[일반]' : '[프로젝트]'}&nbsp;
                  {data.title}
                </Typography>
              </span>
              <span className="flex flex-row items-start gap-2">
                <Typography variant="body2" className="min-w-[92px] text-gray-500">
                  학생
                </Typography>
                {data.ibType === 'CAS_NORMAL' ? (
                  <Typography variant="body2" className="text-gray-700">
                    {data.leader.studentGroup.group.grade}
                    {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
                    {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}&nbsp;{data.leader.name}
                  </Typography>
                ) : (
                  <div className="flex flex-wrap items-center">
                    <Typography variant="body2" className="text-primray-gray-700">
                      {data.leader.studentGroup.group.grade}
                      {String(data.leader.studentGroup.group.klass).padStart(2, '0')}
                      {String(data.leader.studentGroup.studentNumber).padStart(2, '0')}&nbsp;{data.leader.name},&nbsp;
                    </Typography>
                    {data.members &&
                      data.members.map((member, index) => (
                        <Typography variant="body2" className="text-primray-gray-700" key={member.id}>
                          {member.studentGroup.group.grade}
                          {String(member.studentGroup.group.klass).padStart(2, '0')}
                          {String(member.studentGroup.studentNumber).padStart(2, '0')}&nbsp;{member.name}
                          {index < (data.members?.length ?? 0) - 1 && ','}&nbsp;
                        </Typography>
                      ))}
                  </div>
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 px-5 pb-5">
            <ButtonV2
              variant="solid"
              color="gray100"
              size={48}
              onClick={() => {
                setApproveModalOpen(false)
              }}
              className="w-full"
            >
              취소
            </ButtonV2>
            <ButtonV2
              variant="solid"
              color="orange800"
              size={48}
              onClick={() => {
                setApproveModalOpen(false)
                approveIBPlan(Number(id))
              }}
              className="w-full"
            >
              확인
            </ButtonV2>
          </div>
        </div>
      </SuperModal>
      {rejectCompleteConfirmModalOpen && (
        <AlertV2
          message={`활동종료 요청을 반려하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => rejectIBProjectComplete(data.id, {})}
          description={`보완이 필요한 진행기록에 보완사유를 남겨주세요.`}
          onCancel={() => setRejectCompleteConfirmModalOpen(!rejectCompleteConfirmModalOpen)}
        />
      )}
      {approveCompleteModalOpen && (
        <AlertV2
          message={`활동종료를 승인하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => approveIBProjectComplete(data.id)}
          description={`승인 시 학생의 활동이 완전히 종료되며\n학생의 제출물 수정이 불가합니다.`}
          onCancel={() => setApproveCompleteModalOpen(!approveCompleteModalOpen)}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
