import clsx from 'clsx'
import { useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import NODATA from '@/legacy/assets/images/no-data.png'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Input } from '@/legacy/components/common/Input'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { IbEssay } from '@/legacy/components/ib/tok/IbEssay'
import { EvaluationList } from '@/legacy/components/ib/tok/teacher/EvaluationList'
import { useEssayGetByIBId } from '@/legacy/container/ib-essay-find'
import { useGetTokEvaluationInitialData } from '@/legacy/container/ib-evaluation'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useGetIBPlagiarismInspectRatio } from '@/legacy/container/plagiarism-inspector'
import { CopykillerTargetTable, ResponseCopykillerResponseDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { usePolling } from '@/legacy/hooks/usePolling'
import { IBDetailPlagiarimInspectResultBadge } from '@/legacy/components/ib/plagiarismInspect/IBDetailPlagiarimInspectResultBadge'
import { meState, schoolPropertiesState } from '@/legacy/store'
import { LocationState } from '@/legacy/type/ib'
import { getUrlFromFile, handleDownload } from '@/legacy/util/file'

type tabType = 'feedback' | 'evaluation' | 'checklist'

interface EssayLocationState extends LocationState {
  type?: tabType
}

export const EssayDetailPage = () => {
  const location = useLocation<EssayLocationState>()
  const { push } = useHistory()
  const me = useRecoilValue(meState)
  const schoolProperties = useRecoilValue(schoolPropertiesState)

  const [isLoading, setIsLoading] = useState(true)
  const _type = location.state?.type
  const { student: locationStudentData } = location.state || {}

  const { ibId: idParam, essayId: essayIdParam } = useParams<{ ibId: string; essayId: string }>()
  const id = Number(idParam)
  const essayId = Number(essayIdParam)

  // 표절 검사 활성화 여부
  const enabledPlagiarismInspect = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')
    ?.value

  const {
    data: ibData,
    klassNum: ibKlassNum,
    isLoading: isIBLoading,
  } = useIBGetById(Number(id), {
    enabled: !locationStudentData,
  })
  const data = location.state?.data || ibData

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const title = data?.tokOutline?.themeQuestion
  const klassNum = ibKlassNum

  const [type, setType] = useState<tabType>(_type || 'checklist')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const [plagiarismInspectData, setPlagiarismInspectData] = useState<{
    status: ResponseCopykillerResponseDto['completeStatus'] | null
    copyRatio: ResponseCopykillerResponseDto['copyRatio'] | null
    errorMessage: ResponseCopykillerResponseDto['errorMessage'] | null
    id: number | null
  } | null>(null)

  const { data: essayData, isLoading: essayLoading, refetch } = useEssayGetByIBId(Number(id))
  const { data: evaluationData, isFetching: evaluationLoading } = useGetTokEvaluationInitialData({
    ibId: id,
    type: 'ESSAY',
  })

  const { refetch: refetchPlagiarismInspectRatio } = useGetIBPlagiarismInspectRatio(
    CopykillerTargetTable.TOK_ESSAY,
    Number(id ?? 0),
    {
      query: {
        enabled: false, // 자동 호출 비활성화, 폴링으로만 실행
      },
    },
  )

  // 폴링 훅 사용
  const { isPolling, stopPolling } = usePolling<ResponseCopykillerResponseDto>({
    enabled: enabledPlagiarismInspect && !!essayData?.id,
    maxPollingCount: 20,
    fetchFn: refetchPlagiarismInspectRatio,
    onSuccess: (data) => {
      setPlagiarismInspectData({
        status: data.completeStatus,
        copyRatio: data.copyRatio,
        errorMessage: data.errorMessage,
        id: data.id,
      })
    },
    onError: (error) => {
      console.error('표절 검사 결과 확인 중 오류 발생:', error)
      setPlagiarismInspectData({
        status: 'F',
        copyRatio: null,
        errorMessage: '오류가 발생했습니다. 다시 시도해 주세요.',
        id: null,
      })
    },
    isComplete: (data) => data.completeStatus !== 'N',
  })

  const handleChange = (selectedType: tabType) => {
    setType(selectedType)
  }

  if (me == null) {
    return <IBBlank />
  }

  if (!essayData || !data) {
    return <IBBlank />
  }

  const handleSuccess = () => {
    setIsOpen(!isOpen)
    refetch()
    setAlertMessage(`체크리스트가\n수정되었습니다`)
  }

  const getUI = (type: tabType) => {
    switch (type) {
      case 'feedback':
        return (
          <div className="h-full w-full">
            {essayData.status === 'PENDING' ? (
              <div className="flex flex-col items-center gap-6 py-20">
                <div className="h-12 w-12 px-[2.50px]">
                  <img src={NODATA} className="h-12 w-[43px] object-cover" />
                </div>
                <Typography variant="body2" className="text-primary-gray-900">
                  진행기록이 없습니다.
                </Typography>
              </div>
            ) : (
              <Feedback
                referenceId={essayData.id}
                referenceTable="ESSAY"
                user={me}
                useTextarea={ibData?.status !== 'COMPLETE'}
              />
            )}
          </div>
        )
      case 'evaluation':
        return (
          <EvaluationList
            evaluationData={evaluationData}
            ibId={id}
            ibStatus={ibData?.status}
            type="essay"
            finalDisabled={!hasPermission}
          />
        )
      case 'checklist':
        return (
          <div className="flex h-full flex-col justify-between">
            <div className="mb-6 flex flex-row items-center justify-between rounded-lg">
              <Typography variant="body3">사용 단어 수</Typography>
              <Input.Basic size={32} type="number" value={essayData.charCount} readonly />
            </div>
            {ibData?.status !== 'COMPLETE' && hasPermission && (
              <div className="flex items-center justify-end">
                <ButtonV2
                  size={40}
                  variant="outline"
                  color="gray400"
                  onClick={() => {
                    setIsOpen(!isOpen)
                  }}
                  disabled={ibData?.status === 'WAIT_COMPLETE'}
                >
                  수정
                </ButtonV2>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="col-span-6">
      {(isIBLoading || essayLoading || evaluationLoading) && <IBBlank />}
      <IBLayout
        className="bg-gray-50"
        topBgColor="bg-white"
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="brown" size={24} type="solid_strong">
                      TOK
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      에세이
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/teacher/project',
                      'TOK 에세이': `/teacher/ib/tok/essay/${id}`,
                      '에세이 상세': `/teacher/ib/tok/essay/${id}/detail/${essayId}`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {title}
                  </Typography>
                  <div className="text-16 text-primary-orange-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                    {klassNum} · {data?.leader?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="relative flex h-[812px] w-[848px] flex-col justify-between gap-6 rounded-xl bg-white p-6">
                {isLoading && <IBBlank type="section-opacity" />}
                <div className="h-full w-full">
                  <iframe
                    src={getUrlFromFile(essayData.filePath)}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="PDF Viewer"
                    onLoad={() => {
                      setIsLoading(false)
                    }}
                  />
                </div>
                <footer className="flex flex-row items-center justify-between">
                  <ButtonV2
                    size={40}
                    variant="outline"
                    color="gray400"
                    onClick={() => {
                      handleDownload(getUrlFromFile(essayData.filePath))
                    }}
                  >
                    다운로드
                  </ButtonV2>

                  <IBDetailPlagiarimInspectResultBadge
                    id={plagiarismInspectData?.id ?? 0}
                    status={plagiarismInspectData?.status ?? null}
                    copyRatio={plagiarismInspectData?.copyRatio ?? null}
                    enabled={enabledPlagiarismInspect}
                    errorMessage={plagiarismInspectData?.errorMessage ?? ''}
                  />
                  <ButtonV2
                    size={40}
                    variant="solid"
                    color="gray100"
                    onClick={() => push(`/teacher/ib/tok/essay/${id}`, { type: 'ESSAY' })}
                  >
                    목록 돌아가기
                  </ButtonV2>
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <LayeredTabs.TwoDepth onChange={handleChange} value={type} fullWidth={true}>
                  <Tab
                    value="feedback"
                    childrenWrapperClassName={clsx(
                      type === 'checklist' &&
                        'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
                    )}
                  >
                    <p>진행기록</p>
                  </Tab>
                  <Tab
                    value="evaluation"
                    childrenWrapperClassName={clsx(
                      type === 'feedback' &&
                        'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
                    )}
                  >
                    <p>평가</p>
                  </Tab>
                  <Tab value="checklist">
                    <p>체크리스트</p>
                  </Tab>
                </LayeredTabs.TwoDepth>
                {getUI(type)}
              </div>
            </div>
          </div>
        }
      />

      {isOpen && (
        <IbEssay
          modalOpen={isOpen}
          setModalClose={() => setIsOpen(!isOpen)}
          type={'update_check'}
          projectId={Number(id)}
          onSuccess={handleSuccess}
          essayData={essayData}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
