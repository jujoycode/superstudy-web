import clsx from 'clsx'
import { useState } from 'react'
import { Link, Route, Switch, useHistory, useLocation } from 'react-router'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import FileUploadInspector from '@/legacy/components/ib/plagiarismInspect/FileUploadInspector'
import InputInspector from '@/legacy/components/ib/plagiarismInspect/InputInspector'
import TeacherIBOverview from '@/legacy/components/ib/TeacherIBOverview'
import TeacherIBPortfolioList from '@/legacy/components/ib/TeacherIBPortfolioList'
import TeacherIBStatus from '@/legacy/components/ib/TeacherIBStatus'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useGetPlagiarismInspectList } from '@/legacy/container/plagiarism-inspector'
import PlagiarismInspectPage from '@/legacy/pages/plagiarismInspect/teacher/PlagiarismInspectPage'
import { twMerge } from 'tailwind-merge'
import { meState, schoolPropertiesState } from '@/stores'
import { useRecoilValue } from 'recoil'
import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'

export default function IBTeacherMainPage() {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const { permission } = useCoordinatorCheck()
  const schoolProperties = useRecoilValue(schoolPropertiesState)
  const me = useRecoilValue(meState)

  // 표절 검사 활성화 여부
  const enabledPlagiarismInspect = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')
    ?.value

  // 표절 검사를 위한 상태 추가
  const [showInspector, setShowInspector] = useState(false)
  const [selectedType, setSelectedType] = useState<'upload' | 'input' | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const {
    data: plagiarismInspectList = { items: [] as ResponseCopykillerResponseDto[] },
    isLoading,
    isError,
    error,
  } = useGetPlagiarismInspectList()

  // 표절 검사 시작 핸들러
  const handleShowInspector = (type: 'upload' | 'input') => {
    setSelectedType(type)
    setShowInspector(true)
  }

  // 표절 검사 뒤로가기 핸들러
  const handleBack = () => {
    setShowInspector(false)
    setSelectedType(null)
  }

  // 파일 업로드 핸들러
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  return (
    <div className="col-span-6">
      {showInspector ? (
        <div className="w-full py-16">
          {selectedType === 'upload' ? (
            <FileUploadInspector fileData={uploadedFiles[0]} handleBack={handleBack} />
          ) : (
            <InputInspector handleBack={handleBack} />
          )}
        </div>
      ) : (
        <div className="h-screen w-full">
          <div className="">
            <IBLayout
              topContent={
                <div className="h-44">
                  <div className="h-32 w-full pt-16">
                    <div className="flex h-10 w-full flex-row items-center justify-between gap-2">
                      <Typography variant="heading">프로젝트</Typography>
                      <div className="flex flex-row items-center gap-4">
                        {/* <SVGIcon.Bell size={24} color="gray700" /> */}
                        <div className="flex gap-2">
                          {permission === 'UNAUTHORIZED' && (
                            <ButtonV2
                              variant="outline"
                              size={40}
                              color="gray400"
                              onClick={() => push('/teacher/ib/reference')}
                            >
                              자료실
                            </ButtonV2>
                          )}

                          {(permission === 'IB_ALL' ||
                            permission === 'IB_EE' ||
                            permission === 'IB_TOK' ||
                            permission === 'IB_CAS') && (
                            <ButtonV2
                              variant="solid"
                              size={40}
                              color="orange100"
                              onClick={() => push(`/teacher/ib/coordinatorPage/IB`)}
                            >
                              프로젝트 관리
                            </ButtonV2>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-12 w-max flex-row items-end gap-4">
                    <Link
                      to={`/teacher/project`}
                      className={twMerge(
                        clsx(
                          'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                          pathname.startsWith('/teacher/project') &&
                            !pathname.includes('portfolio') &&
                            !pathname.includes('overview') &&
                            !pathname.includes('plagiarism-inspection')
                            ? 'border-b-2 border-[#121316] text-[#121316]'
                            : 'mb-[2px] text-[#898d94]',
                        ),
                      )}
                    >
                      <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                        진행상태
                      </div>
                    </Link>
                    <Link
                      to={`/teacher/project/overview`}
                      className={twMerge(
                        clsx(
                          'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                          pathname.startsWith('/teacher/project/overview')
                            ? 'border-b-2 border-[#121316] text-[#121316]'
                            : 'mb-[2px] text-[#898d94]',
                        ),
                      )}
                    >
                      <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                        현황관리
                      </div>
                    </Link>
                    <Link
                      to={`/teacher/project/portfolio`}
                      className={twMerge(
                        clsx(
                          'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                          pathname.startsWith('/teacher/project/portfolio')
                            ? 'border-b-2 border-[#121316] text-[#121316]'
                            : 'mb-[2px] text-[#898d94]',
                        ),
                      )}
                    >
                      <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                        CAS Portfolio
                      </div>
                    </Link>
                    {enabledPlagiarismInspect && (
                      <Link
                        to={`/teacher/project/plagiarism-inspection`}
                        className={twMerge(
                          clsx(
                            'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                            pathname.startsWith('/teacher/project/plagiarism-inspection')
                              ? 'border-b-2 border-[#121316] text-[#121316]'
                              : 'mb-[2px] text-[#898d94]',
                          ),
                        )}
                      >
                        <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                          표절률 검사
                        </div>
                      </Link>
                    )}
                  </div>
                  {/* <LayeredTabs.OneDepth onChange={(selectedType) => setType(selectedType)} value={type} className="pt-3">
                  <Tab value="status">
                    <p>진행상태</p>
                  </Tab>
                  <Tab value="overview">
                    <p>현황관리</p>
                  </Tab>
                </LayeredTabs.OneDepth> */}
                </div>
              }
              bottomContent={
                <div className="flex h-full items-center">
                  <Switch>
                    <Route exact path="/teacher/project" render={() => <TeacherIBStatus />} />
                    <Route exact path="/teacher/project/overview" render={() => <TeacherIBOverview />} />
                    <Route exact path="/teacher/project/portfolio" render={() => <TeacherIBPortfolioList />} />
                    <Route
                      exact
                      path="/teacher/project/plagiarism-inspection"
                      render={() => (
                        <PlagiarismInspectPage
                          showInspector={showInspector}
                          selectedType={selectedType}
                          data={plagiarismInspectList.items}
                          onShowInspector={handleShowInspector}
                          onBack={handleBack}
                          onFileUpload={handleFileUpload}
                          isLoading={isLoading}
                        />
                      )}
                    />
                  </Switch>
                </div>
              }
              bottomBgColor={clsx(
                pathname.includes('plagiarism-inspection') && plagiarismInspectList.items.length > 0 && 'bg-gray-50',
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
