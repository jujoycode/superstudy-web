import clsx from 'clsx'
import { useState } from 'react'
import { useLocation, useParams } from 'react-router'
import NODATA from '@/assets/images/no-data.png'
import { useHistory } from '@/hooks/useHistory'
import { useSchoolStore } from '@/stores/school'
import { useUserStore } from '@/stores/user'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Input } from '@/legacy/components/common/Input'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { Typography } from '@/legacy/components/common/Typography'
import { CheckList } from '@/legacy/components/ib/CheckList'
import { IbEeEssay } from '@/legacy/components/ib/ee/IbEeEssay'
import { EvaluationList } from '@/legacy/components/ib/EvaluationList'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { IBDetailPlagiarimInspectResultBadge } from '@/legacy/components/ib/plagiarismInspect/IBDetailPlagiarimInspectResultBadge'
import { useEssayGetByIBId } from '@/legacy/container/ib-essay-find'
import { useEvaluationGetByStudent } from '@/legacy/container/ib-evaluation'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useRPPFGetByIBIdFindAll } from '@/legacy/container/ib-rppf-findAll'
import { useGetIBPlagiarismInspectRatio } from '@/legacy/container/plagiarism-inspector'
import { CopykillerTargetTable, ResponseCopykillerResponseDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { usePolling } from '@/legacy/hooks/usePolling'
import { getUrlFromFile, handleDownload } from '@/legacy/util/file'

type tabType = 'feedback' | 'evaluation' | 'checklist'

export const EEEssayPage = () => {
  const location = useLocation()
  const _type = location.state?.type
  const locationStudentData = location.state?.student || null
  const { id, essayId } = useParams<{ id: string; essayId: string }>()
  const { data: ibData, klassNum: ibKlassNum } = useIBGetById(Number(id), {
    enabled: !locationStudentData,
  })
  const data = location.state?.data || ibData

  const { data: rppfData = [] } = useRPPFGetByIBIdFindAll(Number(id))

  const studentId = Number(data?.leader.id)
  const klassNum = location.state?.student?.klassNum || ibKlassNum

  const { push } = useHistory()
  const { me } = useUserStore()
  const { schoolProperties } = useSchoolStore()
  const [type, setType] = useState<tabType>(_type || 'checklist')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [plagiarismInspectData, setPlagiarismInspectData] = useState<{
    status: ResponseCopykillerResponseDto['completeStatus'] | null
    copyRatio: ResponseCopykillerResponseDto['copyRatio'] | null
    errorMessage: ResponseCopykillerResponseDto['errorMessage'] | null
    id: number | null
  } | null>(null)

  // 표절 검사 활성화 여부
  const enabledPlagiarismInspect = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')
    ?.value

  const { data: essayData, isLoading: essayLoading, refetch } = useEssayGetByIBId(Number(id))
  const { data: evaluationData, isFetching: evaluationLoading } = useEvaluationGetByStudent(studentId, {
    location: 'ESSAY',
  })

  const { refetch: refetchPlagiarismInspectRatio } = useGetIBPlagiarismInspectRatio(
    CopykillerTargetTable.EE_ESSAY,
    Number(id ?? 0),
    {
      query: {
        enabled: false, // 자동 호출 비활성화, 폴링으로만 실행
      },
    },
  )

  // 폴링 훅 사용
  usePolling<ResponseCopykillerResponseDto>({
    enabled: enabledPlagiarismInspect && !!essayData?.id,
    fetchFn: refetchPlagiarismInspectRatio,
    maxPollingCount: 20,
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

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_EE'

  const handleChange = (selectedType: tabType) => {
    setType(selectedType)
  }

  const handleSuccess = () => {
    setIsOpen(!isOpen)
    refetch()
    setAlertMessage(`체크리스트가\n수정되었습니다`)
  }

  const isLoading = essayLoading || evaluationLoading
  const [isEssayLoading, setIsEssayLoading] = useState(true)

  if (me == null) {
    return <IBBlank />
  }

  if (!essayData || !data) {
    return <IBBlank />
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
                <Typography variant="body2" className="text-gray-900">
                  진행기록이 없습니다.
                </Typography>
              </div>
            ) : (
              <Feedback
                referenceId={essayData.id}
                referenceTable="ESSAY"
                user={me}
                useTextarea={data?.status !== 'COMPLETE'}
              />
            )}
          </div>
        )
      case 'evaluation':
        return (
          <EvaluationList
            academicIntegrityConsent={rppfData[0]?.academicIntegrityConsent ?? false}
            evaluationData={evaluationData}
            studentId={data.leader.id}
            disabled={data.status === 'COMPLETE' || !hasPermission}
          />
        )
      case 'checklist':
        return (
          <div className="flex h-full flex-col justify-between">
            <CheckList studentId={studentId} type="update" location="ESSAY" />
            <div>
              <div className="mb-6 flex flex-row items-center justify-between rounded-lg">
                <Typography variant="body3">사용 단어 수</Typography>
                <Input.Basic size={32} type="number" value={essayData.charCount} readonly />
              </div>
              {data.status !== 'COMPLETE' && hasPermission && (
                <div className="flex items-center justify-end">
                  <ButtonV2
                    size={40}
                    variant="outline"
                    color="gray400"
                    disabled={data?.status === 'WAIT_COMPLETE'}
                    onClick={() => {
                      setIsOpen(!isOpen)
                    }}
                  >
                    수정
                  </ButtonV2>
                </div>
              )}
            </div>
          </div>
        )
      // return <CheckList.Teacher student={data?.leader} charCount={essayData.charCount} />;
    }
  }

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      <IBLayout
        className="bg-gray-50"
        topBgColor="bg-white"
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="dark_green" size={24} type="solid_strong" className="self-start px-[12.5px]">
                      EE
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular" className="self-start">
                      에세이
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/teacher/project',
                      EE: `/teacher/ib/ee/${id}`,
                      '에세이 상세': `/teacher/ib/ee/${id}/essay/${essayId}`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {`${data?.leader?.name}의 EE 에세이`}
                  </Typography>
                  <div className="text-16 text-primary-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
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
                {isEssayLoading && <IBBlank type="section-opacity" />}
                <div className="h-full w-full">
                  <iframe
                    src={getUrlFromFile(essayData.filePath)}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="PDF Viewer"
                    onLoad={() => {
                      setIsEssayLoading(false)
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
                    onClick={() => push(`/teacher/ib/ee/${id}`, { type: 'ESSAY' })}
                  >
                    목록 돌아가기
                  </ButtonV2>
                </footer>
              </div>
              <div className="flex h-[812px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <LayeredTabs.TwoDepth onChange={handleChange} value={type} fullWidth={true}>
                  <Tab
                    value="feedback"
                    childrenWrapperClassName={clsx(
                      type === 'checklist' &&
                        'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-gray-200 after:content-[""] after:z-10',
                    )}
                  >
                    <p>진행기록</p>
                  </Tab>
                  <Tab
                    value="evaluation"
                    childrenWrapperClassName={clsx(
                      type === 'feedback' &&
                        'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-gray-200 after:content-[""] after:z-10',
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
        <IbEeEssay
          modalOpen={isOpen}
          setModalClose={() => setIsOpen(!isOpen)}
          type={'update_check'}
          projectId={Number(id)}
          onSuccess={handleSuccess}
          studentId={studentId}
          user="teacher"
          essayData={essayData}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
