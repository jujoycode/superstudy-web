import { useState } from 'react'
import { useLocation } from 'react-router'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
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
import { useEssayGetByIBId } from '@/legacy/container/ib-essay-find'
import { useIBEssaySent } from '@/legacy/container/ib-essay-send'
import { ResponseIBDto } from '@/legacy/generated/model'
import { getUrlFromFile, handleDownload } from '@/legacy/util/file'
import { meState } from '@/stores'

import NODATA from '@/assets/images/no-data.png'

interface LocationState {
  project: ResponseIBDto
  type?: string
}

export const TOKEssayDetailPage = () => {
  const history = useHistory()
  const location = useLocation()
  const project = location.state?.project as LocationState['project']
  const _type = location.state?.type as LocationState['type']
  const me = useRecoilValue(meState)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { data: essay, refetch, isLoading } = useEssayGetByIBId(project.id)
  const [modalType, setModalType] = useState<'update' | 'update_check'>('update')
  const [type, setType] = useState<string>(_type || 'checklist')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [isEssayLoading, setIsEssayLoading] = useState<boolean>(true)

  const { sentIBEssay, isLoading: isSentEssayLoading } = useIBEssaySent({
    onSuccess: () => {
      setAlertMessage(`에세이가\n제출되었습니다`)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  const handleChange = (selectedType: string) => {
    setType(selectedType)
  }

  const handleSuccess = (action: 'update' | 'update_check' | 'create') => {
    setIsOpen(!isOpen)
    refetch()
    setAlertMessage(action === 'update' ? `에세이가 \n저장되었습니다` : `체크리스트가\n수정되었습니다`)
  }

  if (me == null) {
    return <IBBlank />
  }

  if (essay == undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isLoading || isSentEssayLoading) && <IBBlank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
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
                      진행상태: '/ib/student',
                      'TOK 에세이': `/ib/student/tok/essay/${project.id}`,
                      '에세이 상세': `/ib/student/tok/${project.id}/essay/${essay.id}`,
                    }}
                  />
                </div>

                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {project?.tokOutline?.themeQuestion}
                </Typography>
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
                    src={getUrlFromFile(essay.filePath)}
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
                  <div className="flex flex-row items-center gap-2">
                    <ButtonV2
                      size={40}
                      variant="outline"
                      color="gray400"
                      onClick={() => {
                        handleDownload(getUrlFromFile(essay.filePath))
                      }}
                    >
                      다운로드
                    </ButtonV2>
                    {project.status !== 'COMPLETE' && (
                      <ButtonV2
                        size={40}
                        variant="outline"
                        color="gray400"
                        disabled={project.status === 'WAIT_COMPLETE'}
                        onClick={() => {
                          setModalType('update')
                          setIsOpen(!isOpen)
                        }}
                      >
                        에세이 재업로드
                      </ButtonV2>
                    )}
                  </div>
                  <ButtonV2
                    size={40}
                    variant="solid"
                    color="gray100"
                    onClick={() => history.push(`/ib/student/tok/essay/${project.id}`, { type: 'ESSAY' })}
                  >
                    목록 돌아가기
                  </ButtonV2>
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <LayeredTabs.TwoDepth onChange={handleChange} value={type} fullWidth={true}>
                  <Tab value="feedback">
                    <p>진행기록</p>
                  </Tab>
                  <Tab value="checklist">
                    <p>체크리스트</p>
                  </Tab>
                </LayeredTabs.TwoDepth>
                {type === 'feedback' ? (
                  <div className="h-full w-full">
                    {essay.status === 'PENDING' ? (
                      <div className="flex flex-col items-center gap-6 py-20">
                        <div className="h-12 w-12 px-[2.50px]">
                          <img src={NODATA} className="h-12 w-[43px] object-cover" />
                        </div>
                        <Typography variant="body2">진행기록이 없습니다.</Typography>
                      </div>
                    ) : (
                      <Feedback
                        referenceId={essay.id}
                        referenceTable="ESSAY"
                        user={me}
                        useTextarea={project.status !== 'COMPLETE'}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="flex flex-row items-center justify-between rounded-lg">
                      <Typography variant="body3">사용 단어 수</Typography>
                      <Input.Basic size={32} type="number" value={essay.charCount} readonly />
                    </div>
                    {project.status !== 'COMPLETE' && (
                      <div className="flex items-center justify-end">
                        <ButtonV2
                          size={40}
                          variant="outline"
                          color="gray400"
                          disabled={project.status === 'WAIT_COMPLETE'}
                          onClick={() => {
                            setModalType('update_check')
                            setIsOpen(!isOpen)
                          }}
                        >
                          수정
                        </ButtonV2>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        floatingButton={
          essay?.status === 'PENDING' && (
            <ButtonV2
              variant="solid"
              color="orange800"
              size={48}
              className="w-[416px]"
              onClick={() => sentIBEssay(essay.id)}
            >
              에세이 제출
            </ButtonV2>
          )
        }
        bottomBgColor="bg-primary-gray-50"
      />
      {isOpen && (
        <IbEssay
          modalOpen={isOpen}
          setModalClose={() => setIsOpen(!isOpen)}
          type={modalType}
          projectId={project.id}
          onSuccess={handleSuccess}
          essayData={essay}
        />
      )}

      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
