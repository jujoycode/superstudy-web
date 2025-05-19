import { useState } from 'react'
import { useLocation, useParams } from 'react-router'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import IBProjectList from '@/legacy/components/ib/IBProjectList'
import ExhibitionList from '@/legacy/components/ib/tok/ExhibitionList'
import ExhibitionPlanList from '@/legacy/components/ib/tok/ExhibitionPlanList'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalUpdateWaitPlan } from '@/legacy/container/ib-proposal-sent'
import {
  useexhibitionGetByIBId,
  useExhibitionPlanSubmit,
  useExhibitionSubmit,
} from '@/legacy/container/ib-tok-exhibition'
import { ResponseExhibitionDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useUserStore } from '@/stores/user'

export type TOKProject = 'EXHIBITION' | 'EXHIBITION_PLAN'
export type LocationState = {
  type?: TOKProject
}

export const ExhibitionMainPage = () => {
  const { t } = useLanguage()
  const { id: idParams } = useParams<{ id: string }>()
  const { me } = useUserStore()
  const location = useLocation()
  const initialType = location.state?.type as LocationState['type']
  const id = Number(idParams)
  const [toggle, setToggle] = useState<boolean>(false)
  const [type, setType] = useState<TOKProject>(initialType || 'EXHIBITION_PLAN')
  const [open, setOpen] = useState<boolean>(false)

  const { data, isLoading, refetch } = useIBGetById(id)

  const { data: Exhibition, isLoading: isFetching } = useexhibitionGetByIBId(id)
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)

  const { submitExhibition, isLoading: isSubmitLoading } = useExhibitionSubmit({
    onSuccess: () => {
      setAlertMessage({ text: `전시회 종료를\n요청하였습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 제출 중 오류 발생:', error)
    },
  })

  const { sentIBProposalUpdateWaitPlan, isLoading: isUpdateLoading } = useIBProposalUpdateWaitPlan({
    onSuccess: () => {
      setAlertMessage({ text: `기획안이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 보완제출 중 오류 발생:', error)
    },
  })

  const { submitExhibitionPlan, isLoading: isSubmitExhibitionPlanLoading } = useExhibitionPlanSubmit({
    onSuccess: () => {
      setAlertMessage({ text: `기획안이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 기획안 제출 중 오류 발생:', error)
    },
  })

  if (data === undefined) return <IBBlank />
  const canCreate = !['PENDING', 'WAIT_MENTOR', 'REJECT_PLAN'].includes(data?.status)

  const isExhibitionComplete = (exhibition: ResponseExhibitionDto | undefined) => {
    if (!exhibition) return false

    return (
      !!exhibition.themeQuestion &&
      !!exhibition.targetContent1 &&
      !!exhibition.targetImage1 &&
      !!exhibition.wordCount1 &&
      !!exhibition.targetContent2 &&
      !!exhibition.targetImage2 &&
      !!exhibition.wordCount2 &&
      !!exhibition.targetContent3 &&
      !!exhibition.targetImage3 &&
      !!exhibition.wordCount3 &&
      !!exhibition.reference
    )
  }

  if (me == null) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || isUpdateLoading || isSubmitLoading || isSubmitExhibitionPlanLoading || isFetching) && <IBBlank />}
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
                          진행상태: '/ib/student',
                          'TOK 전시회': `/ib/student/tok/exhibition/${id}`,
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
                            {data?.title}
                          </Typography>
                          <div className="flex-shrink-0">
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
                <LayeredTabs.OneDepth onChange={(selectedType: TOKProject) => setType(selectedType)} value={type}>
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
                    <div>제안서를 불러올 수 없습니다.</div>
                  ) : (
                    <>
                      {type === 'EXHIBITION_PLAN' && <ExhibitionPlanList data={data} />}
                      {type === 'EXHIBITION' && (
                        <ExhibitionList canCreate={canCreate} ibId={id} data={Exhibition} refetch={refetch} />
                      )}
                    </>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-gray-50"
            floatingButton={
              (type === 'EXHIBITION_PLAN' &&
                ['PENDING', 'REJECT_PLAN', 'WAIT_PLAN_APPROVE', 'WAITING_FOR_NEXT_PROPOSAL', 'WAIT_MENTOR'].includes(
                  data.status,
                ) &&
                data.tokExhibitionPlan !== undefined &&
                Object.values(data.tokExhibitionPlan).every((value) => value !== null || value !== '') && (
                  <div className="flex w-full max-w-[1280px] justify-center">
                    <ButtonV2
                      variant="solid"
                      color="orange800"
                      size={48}
                      className="w-[416px]"
                      disabled={data.status === 'WAIT_MENTOR' || data.status === 'WAIT_PLAN_APPROVE'}
                      onClick={() => {
                        if (data?.tokExhibitionPlan?.id !== undefined) {
                          if (data.status === 'REJECT_PLAN') {
                            sentIBProposalUpdateWaitPlan(data.id)
                          } else {
                            submitExhibitionPlan({ id, exhibitionPlanId: data?.tokExhibitionPlan?.id })
                          }
                        } else {
                          console.error('exhibitionPlanId가 정의되지 않았습니다.')
                        }
                      }}
                    >
                      기획안 승인요청
                    </ButtonV2>
                  </div>
                )) ||
              (Exhibition?.id && data.status !== 'COMPLETE' && (
                <div>
                  <div className="mx-auto flex w-[1280px] items-center justify-between">
                    <Typography variant="caption2" className="flex items-center gap-1 text-gray-500">
                      <SolidSVGIcon.Info color="gray400" size={16} />세 가지 대상과 이에 대한 이미지, 설명, 레퍼런스를
                      모두 입력 및 추가하셔야 전시회 종료 승인 요청이 가능합니다.
                    </Typography>
                    <ButtonV2
                      variant="solid"
                      color="orange800"
                      size={48}
                      className="w-[200px]"
                      disabled={data?.status === 'WAIT_COMPLETE' || !isExhibitionComplete(Exhibition)}
                      onClick={() => setOpen(true)}
                    >
                      전시회 종료 승인요청
                    </ButtonV2>
                  </div>
                </div>
              ))
            }
          />
        </div>
      </div>

      {open && (
        <AlertV2
          message={`전시회 종료 승인을 요청하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            submitExhibition({ id: Number(Exhibition?.id), ibId: id })
            setOpen(!open)
          }}
          description={'승인요청을 하면 제출물에 대한 수정이 불가능합니다.\n수정할 내용이 없는지 확인해주세요.'}
          onCancel={() => setOpen(!open)}
        />
      )}
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
