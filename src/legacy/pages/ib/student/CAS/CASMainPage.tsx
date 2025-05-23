import moment from 'moment'
import { useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router'

import { twMerge } from 'tailwind-merge'
import { cn } from '@/utils/commonUtil'

import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Typography } from '@/legacy/components/common/Typography'
import { IbApprove } from '@/legacy/components/ib/cas/IbApprove'
import { IbCASCheckList } from '@/legacy/components/ib/cas/IbCASCheckList'
import { IbCASMentorSelect } from '@/legacy/components/ib/cas/IbCASMentorSelect'
import Timeline from '@/legacy/components/ib/cas/Timeline'
import IBLayout from '@/legacy/components/ib/IBLayout'
import IBProjectList from '@/legacy/components/ib/IBProjectList'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useCheckListGetByStudent } from '@/legacy/container/ib-checklist-find'
import { useIBHopeMentor, useIBRequestComplete, useIBWaitMentor } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalUpdateWaitPlan } from '@/legacy/container/ib-proposal-sent'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateUtil } from '@/legacy/util/date'

export type CASProject = 'ACTIVITY_PLAN' | 'ACTIVITY_LOG'

export const CASMainPage = () => {
  const [edit, setEdit] = useState<boolean>(false)
  const { t } = useLanguage()
  const { id: idParams } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const id = Number(idParams)
  const { me } = useUserStore()
  const { data, isLoading, refetch } = useIBGetById(id)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [toggle, setToggle] = useState<boolean>(false)
  const [approveOpen, setApproveOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { sentIBProposalUpdateWaitPlan, isLoading: isProposalUpdateLoading } = useIBProposalUpdateWaitPlan({
    onSuccess: () => {
      setAlertMessage(`계획서가\n제출되었습니다`)
      setIsOpen(false)
      refetch()
    },
    onError: (error) => {
      console.error('계획서 제출 중 오류 발생:', error)
    },
  })

  const { requestIBWaitMentor, isLoading: isWaitMentorLoading } = useIBWaitMentor({
    onSuccess: () => {
      setAlertMessage(`계획서가\n제출되었습니다`)
      setIsOpen(false)
      refetch()
    },
    onError: (error) => {
      console.error('계획서 제출 중 오류 발생:', error)
    },
  })

  const { requestIBProjectComplete, isLoading: isRequestCompleteLoading } = useIBRequestComplete({
    onSuccess: () => {
      setAlertMessage(`활동종료를\n요청하였습니다`)
      setApproveOpen(!approveOpen)
      refetch()
    },
    onError: (error) => {
      console.error('활동종료 요청 중 오류 발생:', error)
    },
  })

  const { requestIBSetHopeMentor, isLoading: isHopeMentorLoading } = useIBHopeMentor({
    onSuccess: () => {
      setAlertMessage(`계획서 승인을\n요청하였습니다`)
      setConfirmOpen(!confirmOpen)
      refetch()
    },
    onError: (error) => {
      console.error('계획서 승인 중 오류 발생:', error)
    },
  })

  const { CheckList } = useCheckListGetByStudent(me?.id || 0, 'CAS')

  const sevenDaysBeforeEndAt = data?.endAt
    ? DateUtil.getStartDate(moment(data.endAt).subtract(7, 'days').toDate())
    : null

  const isWithinApprovalRequestPeriod = sevenDaysBeforeEndAt
    ? moment().isSameOrAfter(moment(sevenDaysBeforeEndAt))
    : false

  const isCASComplete =
    !!data?.cas &&
    !!data.cas.goal?.trim() &&
    !!data.cas.strands &&
    Object.values(data.cas.strands).some((value) => typeof value === 'number' && value > 0) &&
    !!data.cas.learningOutcome &&
    Object.values(data.cas.learningOutcome).some((value) => value === true) &&
    (data.ibType === 'CAS_NORMAL'
      ? !!data.cas.sixWhDescription && Object.values(data.cas.sixWhDescription).every((value) => !!value?.trim())
      : true) &&
    (data.ibType === 'CAS_PROJECT'
      ? !!data.cas.step && Object.values(data.cas.step).every((value) => !!value?.trim())
      : true)

  if (data === undefined) {
    return <IBBlank />
  }

  if (me == null) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      {(isProposalUpdateLoading || isWaitMentorLoading || isRequestCompleteLoading || isHopeMentorLoading) && (
        <IBBlank type="opacity" />
      )}
      <div className="h-screen w-full">
        <div>
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
                        data={{
                          진행상태: '/ib/student',
                          CAS: `/ib/student/cas/${id}/plan`,
                        }}
                      />
                    </div>

                    <IBProjectList studentId={me.id} currentProjectId={id}>
                      <div className="relative flex w-full flex-col">
                        <div className="flex w-full max-w-[692px] items-center gap-4">
                          <Typography
                            variant="heading"
                            className="grow overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {data?.ibType === 'CAS_NORMAL' ? '[일반]' : '[프로젝트]'}&nbsp;{data?.title}
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
                    <Timeline data={data} />
                  </div>
                </div>
                <div className="flex h-12 w-max flex-row items-end gap-4">
                  <Link
                    to={`/ib/student/cas/${data.id}/plan`}
                    className={twMerge(
                      cn(
                        'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                        pathname.startsWith('/ib/student/cas') && !pathname.includes('activitylog')
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
                    to={`/ib/student/cas/${data.id}/activitylog`}
                    className={twMerge(
                      cn(
                        'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                        pathname.startsWith('/ib/student/cas') && !pathname.includes('plan')
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
                        setEdit,
                        type: me.role === 'USER' ? 'student' : 'teacher',
                        status: data.status,
                        id: data.id,
                        writerId: me.id,
                      }}
                    />
                    // <Routes>
                    //   <Route
                    //     path="/ib/student/cas/:id/plan"
                    //     Component={() =>
                    //       data.ibType === 'CAS_NORMAL' ? (
                    //         <ActivityPlan data={data} refetch={refetch} setEdit={setEdit} />
                    //       ) : data.ibType === 'CAS_PROJECT' ? (
                    //         <ProjectActivityPlan data={data} refetch={refetch} setEdit={setEdit} />
                    //       ) : (
                    //         <div>잘못된 IB 타입입니다.</div>
                    //       )
                    //     }
                    //   />
                    //   <Route
                    //     path="/ib/student/cas/:id/activitylog/:activitylogId"
                    //     Component={() => <AcitivityLogDetail status={data.status} />}
                    //   />
                    //   <Route
                    //     path="/ib/student/cas/:id/activitylog"
                    //     Component={() => <ActivityLogList id={data.id} status={data.status} writerId={me.id} />}
                    //   />
                    // </Routes>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-gray-50"
            floatingButton={
              edit === false ? (
                data.status === 'PENDING' ? (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    onClick={() => {
                      if (CheckList?.length === 0) {
                        requestIBWaitMentor(data.id)
                      } else {
                        setIsOpen(!isOpen)
                      }
                    }}
                    disabled={!isCASComplete}
                  >
                    계획서 제출
                  </ButtonV2>
                ) : data.status === 'WAIT_MENTOR' &&
                  data.mentor === null &&
                  pathname.startsWith('/ib/student/cas') &&
                  !pathname.includes('activitylog') ? (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    onClick={() => setConfirmOpen(!confirmOpen)}
                  >
                    희망 감독교사 선택 및 승인요청
                  </ButtonV2>
                ) : data.status === 'WAIT_MENTOR' &&
                  data.mentor !== null &&
                  data.leader.id === me.id &&
                  pathname.startsWith('/ib/student/cas') &&
                  !pathname.includes('activitylog') ? (
                  <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled={true}>
                    계획서 승인요청
                  </ButtonV2>
                ) : data.status === 'REJECT_PLAN' &&
                  data.leader.id === me.id &&
                  pathname.startsWith('/ib/student/cas') &&
                  !pathname.includes('activitylog') ? (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    onClick={() => {
                      if (CheckList?.length === 0) {
                        sentIBProposalUpdateWaitPlan(data.id)
                      } else {
                        setIsOpen(!isOpen)
                      }
                    }}
                  >
                    계획서 승인요청
                  </ButtonV2>
                ) : data.status === 'WAIT_PLAN_APPROVE' &&
                  data.leader.id === me.id &&
                  pathname.startsWith('/ib/student/cas') &&
                  !pathname.includes('activitylog') ? (
                  <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled>
                    계획서 승인요청
                  </ButtonV2>
                ) : data.status === 'IN_PROGRESS' && data.leader.id === me.id && isWithinApprovalRequestPeriod ? (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    onClick={() => setApproveOpen(!approveOpen)}
                  >
                    활동종료 승인요청
                  </ButtonV2>
                ) : data.status === 'WAIT_COMPLETE' && data.leader.id === me.id && isWithinApprovalRequestPeriod ? (
                  <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled>
                    활동종료 승인요청
                  </ButtonV2>
                ) : data.status === 'REJECT_COMPLETE' && data.leader.id === me.id && isWithinApprovalRequestPeriod ? (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    onClick={() => setApproveOpen(!approveOpen)}
                  >
                    활동종료 승인요청
                  </ButtonV2>
                ) : null
              ) : null

              // edit === false && !shouldHideFloatingButton ? (
              //   <div className="flex w-full max-w-[1280px] justify-center">
              //     {isWithinApprovalRequestPeriod && data.leader.id === me?.id ? (
              //       <ButtonV2
              //         variant="solid"
              //         color="orange800"
              //         size={48}
              //         className="w-[416px]"
              //         onClick={() => setApproveOpen(!approveOpen)}
              //         disabled={data.status === 'WAIT_COMPLETE'}
              //       >
              //         활동종료 승인요청
              //       </ButtonV2>
              //     ) : pathname.startsWith('/ib/student/cas') &&
              //       !pathname.includes('activitylog') &&
              //       data.status === 'IN_PROGRESS' ? null : data.status === 'WAIT_MENTOR' && data.mentor === null ? (
              //       <ButtonV2
              //         variant="solid"
              //         color="orange800"
              //         size={48}
              //         className="w-[416px]"
              //         onClick={() => setConfirmOpen(!confirmOpen)}
              //       >
              //         희망 감독교사 선택 및 승인요청
              //       </ButtonV2>
              //     ) : data.status === 'WAIT_MENTOR' && data.mentor !== null ? (
              //       <ButtonV2 variant="solid" color="orange800" size={48} className="w-[416px]" disabled={true}>
              //         계획서 승인요청
              //       </ButtonV2>
              //     ) : data.leader.id === me?.id ? (
              //       <ButtonV2
              //         variant="solid"
              //         color="orange800"
              //         size={48}
              //         className="w-[416px]"
              //         disabled={!isCASComplete || data.status === 'WAIT_PLAN_APPROVE'}
              //         onClick={() => setIsOpen(!isOpen)}
              //       >
              //         {data.status === 'REJECT_PLAN' || data.status === 'WAIT_PLAN_APPROVE'
              //           ? '계획서 승인요청'
              //           : '계획서 제출'}
              //       </ButtonV2>
              //     ) : null}
              //   </div>
              // ) : null
            }
          />
        </div>
      </div>
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
      {isOpen && CheckList && (
        <IbCASCheckList
          modalOpen={isOpen}
          setModalClose={() => setIsOpen(!isOpen)}
          checkList={CheckList}
          onSuccess={() => {
            if (data?.id !== undefined) {
              if (data.status === 'REJECT_PLAN') {
                sentIBProposalUpdateWaitPlan(data.id)
              } else {
                requestIBWaitMentor(data.id)
              }
            } else {
              console.error('프로젝트 ID가 정의되지 않았습니다.')
            }
          }}
        />
      )}
      {confirmOpen && (
        <IbCASMentorSelect
          modalOpen={confirmOpen}
          setModalClose={() => setConfirmOpen(!confirmOpen)}
          onSuccess={(selectedId) => {
            if (data?.id !== undefined) {
              requestIBSetHopeMentor({ id: data.id, mentorId: selectedId })
            } else {
              console.error('프로젝트 ID가 정의되지 않았습니다.')
            }
          }}
        />
      )}
      {approveOpen && (
        <IbApprove
          modalOpen={approveOpen}
          setModalClose={() => setApproveOpen(!approveOpen)}
          onSuccess={() => {
            if (data?.id !== undefined) {
              requestIBProjectComplete(data.id)
            } else {
              console.error('프로젝트 ID가 정의되지 않았습니다.')
            }
          }}
        />
      )}
    </div>
  )
}
