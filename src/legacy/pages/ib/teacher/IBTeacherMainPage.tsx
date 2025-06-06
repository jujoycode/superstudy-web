import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { useHistory } from '@/hooks/useHistory'
import { cn } from '@/utils/commonUtil'
import { useSchoolStore } from '@/stores/school'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import FileUploadInspector from '@/legacy/components/ib/plagiarismInspect/FileUploadInspector'
import InputInspector from '@/legacy/components/ib/plagiarismInspect/InputInspector'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useGetPlagiarismInspectList } from '@/legacy/container/plagiarism-inspector'
import type { ResponseCopykillerResponseDto } from '@/legacy/generated/model'

export default function IBTeacherMainPage() {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const { permission } = useCoordinatorCheck()
  const { schoolProperties } = useSchoolStore()

  // 표절 검사 활성화 여부
  const enabledPlagiarismInspect = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')
    ?.value

  // 표절 검사를 위한 상태 추가
  const [showInspector, setShowInspector] = useState(false)
  const [selectedType, setSelectedType] = useState<'upload' | 'input' | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { data: plagiarismInspectList = { items: [] as ResponseCopykillerResponseDto[] }, isLoading } =
    useGetPlagiarismInspectList()

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
    <Grid>
      <GridItem colSpan={12}>
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
                          cn(
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
                          cn(
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
                          cn(
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
                            cn(
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
                    <Outlet
                      context={{
                        showInspector,
                        selectedType,
                        data: plagiarismInspectList.items,
                        onShowInspector: handleShowInspector,
                        onBack: handleBack,
                        onFileUpload: handleFileUpload,
                        isLoading,
                      }}
                    />
                    {/* <Routes>
                    <Route path="/teacher/project" element={<TeacherIBStatus />} />
                    <Route path="/teacher/project/overview" element={<TeacherIBOverview />} />
                    <Route path="/teacher/project/portfolio" element={<TeacherIBPortfolioList />} />
                    <Route
                      path="/teacher/project/plagiarism-inspection"
                      element={
                        <PlagiarismInspectPage
                          showInspector={showInspector}
                          selectedType={selectedType}
                          data={plagiarismInspectList.items}
                          onShowInspector={handleShowInspector}
                          onBack={handleBack}
                          onFileUpload={handleFileUpload}
                          isLoading={isLoading}
                        />
                      }
                    />
                  </Routes> */}
                  </div>
                }
                bottomBgColor={cn(
                  pathname.includes('plagiarism-inspection') && plagiarismInspectList.items.length > 0 && 'bg-gray-50',
                )}
              />
            </div>
          </div>
        )}
      </GridItem>
    </Grid>
  )
}
