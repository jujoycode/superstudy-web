import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import IBProjectList from '@/legacy/components/ib/IBProjectList'
import EssayList from '@/legacy/components/ib/tok/EssayList'
import OutlineList from '@/legacy/components/ib/tok/OutlineList'
import RRSList from '@/legacy/components/ib/tok/RRSList'
import TKPPFList from '@/legacy/components/ib/tok/TKPPFList'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useEssayGetByIBId } from '@/legacy/container/ib-essay-find'
import { useIBEssaySent } from '@/legacy/container/ib-essay-send'
import { useIBRequestComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBProposalUpdateWaitPlan } from '@/legacy/container/ib-proposal-sent'
import { useOutlineSubmit, useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { ResponseTKPPFDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState } from 'src/store'

export type TOKEssayProject = 'OUTLINE' | 'ESSAY' | 'TKPPF' | 'RRS'
export type LocationState = {
  type?: TOKEssayProject
}

export const EssayMainPage = () => {
  const { t } = useLanguage()
  const { id: idParams } = useParams<{ id: string }>()
  const location = useLocation<LocationState>()
  const initialType = location.state?.type || 'OUTLINE'
  const id = Number(idParams)
  const me = useRecoilValue(meState)
  const [type, setType] = useState<TOKEssayProject>(initialType)
  const [toggle, setToggle] = useState<boolean>(false)
  const { data, isLoading, refetch } = useIBGetById(id)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const { data: Essay, isLoading: EssayLoading } = useEssayGetByIBId(id, {
    enabled: data?.status !== 'PENDING' && data?.status !== 'WAIT_MENTOR' && data?.status !== 'REJECT_PLAN',
  })
  const {
    data: TKPPF,
    isLoading: TKPPFLoading,
    refetch: TKPPFrefetch,
  } = useTKPPFGetByIBId(id, {
    enabled: data?.status !== 'PENDING' && data?.status !== 'WAIT_MENTOR' && data?.status !== 'REJECT_PLAN',
  })
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)

  const { submitOutline, isLoading: isSubmitOutlineLoading } = useOutlineSubmit({
    onSuccess: () => {
      setAlertMessage({ text: `아웃라인이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('아웃라인 제출 중 오류 발생:', error)
    },
  })

  const { sentIBProposalUpdateWaitPlan, isLoading: isUpdateLoading } = useIBProposalUpdateWaitPlan({
    onSuccess: () => {
      setAlertMessage({ text: `아웃라인이\n제출되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('아웃라인 보완제출 중 오류 발생:', error)
    },
  })

  const { requestIBProjectComplete, isLoading: isRequestCompleteLoading } = useIBRequestComplete({
    onSuccess: () => {
      setAlertMessage({ text: `활동종료를\n요청하였습니다` })
      TKPPFrefetch()
    },
    onError: (error) => {
      console.error('활동종료 요청 중 오류 발생:', error)
    },
  })

  const { sentIBEssay, isLoading: isSentEssayLoading } = useIBEssaySent({
    onSuccess: () => {
      setAlertMessage({ text: `에세이가\n제출되었습니다` })
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const isTKPPFComplete = (tkppf: ResponseTKPPFDto | undefined): boolean => {
    if (!tkppf || Object.keys(tkppf).length === 0) return false

    // 모든 필드가 작성되었는지 확인
    return !!tkppf?.sequence1?.text && !!tkppf?.sequence2?.text && !!tkppf?.sequence3?.text
  }

  if (data === undefined) return <IBBlank />

  if (me == null) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading ||
        isUpdateLoading ||
        isSubmitOutlineLoading ||
        TKPPFLoading ||
        isRequestCompleteLoading ||
        isSentEssayLoading) && <IBBlank />}
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
                          'TOK 에세이': `/ib/student/ee/${id}`,
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
                            {data?.status === 'PENDING' ? data?.title : data?.tokOutline?.themeQuestion}
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
                <LayeredTabs.OneDepth onChange={(selectedType: TOKEssayProject) => setType(selectedType)} value={type}>
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
                    <div>제안서를 불러올 수 없습니다.</div>
                  ) : (
                    <>
                      {type === 'OUTLINE' && <OutlineList data={data} />}
                      {type === 'ESSAY' && <EssayList data={Essay} ibData={data} refetch={refetch} />}
                      {type === 'TKPPF' && (
                        <TKPPFList
                          data={TKPPF && Object.keys(TKPPF).length ? TKPPF : undefined}
                          refetch={refetch}
                          ibData={data}
                        />
                      )}
                      {type === 'RRS' && <RRSList id={data.id} status={data.status} />}
                    </>
                  )}
                </div>
              </div>
            }
            bottomBgColor="bg-primary-gray-50"
            floatingButton={
              (type === 'OUTLINE' &&
                (data.status === 'PENDING' ||
                  data.status === 'WAIT_MENTOR' ||
                  data.status === 'WAIT_PLAN_APPROVE' ||
                  data.status === 'REJECT_PLAN') &&
                data?.tokOutline !== undefined &&
                Object.values(data.tokOutline).every((value) => value !== null || value !== '') && (
                  <ButtonV2
                    variant="solid"
                    color="orange800"
                    size={48}
                    className="w-[416px]"
                    disabled={data?.status === 'WAIT_MENTOR' || data?.status === 'WAIT_PLAN_APPROVE'}
                    onClick={() => {
                      if (data?.tokOutline?.id !== undefined) {
                        if (data.status === 'REJECT_PLAN') {
                          sentIBProposalUpdateWaitPlan(data.id)
                        } else {
                          submitOutline({ id, outlineId: data?.tokOutline?.id })
                        }
                      } else {
                        console.error('outlineId가 없습니다.')
                      }
                    }}
                  >
                    아웃라인 승인요청
                  </ButtonV2>
                )) ||
              ((data.status === 'IN_PROGRESS' ||
                data.status === 'REJECT_COMPLETE' ||
                data.status === 'WAIT_COMPLETE') &&
                Essay?.status === 'SUBMIT' &&
                isTKPPFComplete(TKPPF) && (
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
              (type === 'ESSAY' && Essay?.status === 'PENDING' && (
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
