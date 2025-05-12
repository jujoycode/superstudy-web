import clsx from 'clsx'
import QueryString from 'qs'
import { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import { useRecoilValue } from 'recoil'
import CAS from '@/legacy/assets/images/CAS.png'
import EE from '@/legacy/assets/images/EE.png'
import TOK from '@/legacy/assets/images/TOK.png'
import NODATA from '@/legacy/assets/images/no-data.png'
import { ResponsePaginatedIBDto } from '@/legacy/generated/model'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { CategoryType, IBProject, ModalType } from '@/legacy/pages/ib/student/IBStudentMainPage'
import { meState } from '@/stores'
import { PopupModal } from '../PopupModal'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import ProjectList from './ProjectList'
import { IbCASNormal } from './cas/IbCASNormal'
import { IbCASProject } from './cas/IbCASProject'
import { IbEeProposal } from './ee/IbEeProposal'
import { IbExhibitionPlan } from './tok/IbExhibitionPlan'
import { IbOutline } from './tok/IbOutline'

export const STATUS_GROUPS = {
  담당교사_지정대기: ['PENDING', 'WAIT_MENTOR', 'WAITING_FOR_NEXT_PROPOSAL'],
  계획중: ['WAIT_PLAN_APPROVE', 'REJECT_PLAN', 'REJECT_MENTOR'],
  진행중: ['IN_PROGRESS', 'REJECT_COMPLETE', 'WAIT_COMPLETE'],
  완료: ['COMPLETE'],
}

interface StudentIBStatusProps {
  data?: ResponsePaginatedIBDto
}

interface SelectedOptions {
  projectType: IBProjectTypes
  pages: Record<string, number>
}

type IBProjectTypes = 'NORMAL' | 'EE' | 'CAS' | 'TOK'

export default function StudentIBStatus({ data }: StudentIBStatusProps) {
  const me = useRecoilValue(meState)
  const history = useHistory()
  const { setQueryParamsWithStorage, removeStoredQueryParams } = useQueryParams()
  const location = useLocation<{ alertMessage?: string }>()
  const defaultOptions: SelectedOptions = {
    projectType: 'NORMAL',
    pages: {
      page1: 1,
      page2: 1,
      page3: 1,
      page4: 1,
    },
  }

  const parseQueryParams = () => {
    const params = QueryString.parse(location.search, { ignoreQueryPrefix: true })
    return {
      projectType: (params.projectType as IBProjectTypes) || 'NORMAL',
      pages: {
        page1: Number(params.page1) || 1,
        page2: Number(params.page2) || 1,
        page3: Number(params.page3) || 1,
        page4: Number(params.page4) || 1,
      },
    }
  }

  const projectListRefs = useRef<Record<string, HTMLDivElement | null>>({
    page1: null,
    page2: null,
    page3: null,
    page4: null,
  })
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(parseQueryParams)
  const [pages, setPages] = useState(() => parseQueryParams().pages)
  const [savedProjectData, setSavedProjectData] = useState<any>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('')
  const [step, setStep] = useState<number>(0)
  const [selectedValue, setSelectedValue] = useState<IBProject>('')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const { push } = useHistory()
  const isEETypeExists = data?.items?.some((item) => item.ibType === 'EE')
  const isESSAYTypeExists = data?.items?.some((item) => item.ibType === 'TOK_ESSAY')
  const isEXHTypeExists = data?.items?.some((item) => item.ibType === 'TOK_EXHIBITION')

  const handleOptionChange = (optionType: keyof SelectedOptions, value: any) => {
    const updatedOptions = {
      ...selectedOptions,
      [optionType]: value,
      ...(optionType === 'projectType' ? { pages: { ...defaultOptions.pages } } : {}),
    }

    setSelectedOptions(updatedOptions)
    updateSearchParams(updatedOptions)
  }

  const updateSearchParams = (updatedOptions: SelectedOptions) => {
    const params = {
      projectType: updatedOptions.projectType !== defaultOptions.projectType ? updatedOptions.projectType : undefined,
      ...updatedOptions.pages,
    }

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined),
    ) as Record<string, string>
    setQueryParamsWithStorage(filteredParams)
    history.replace({ search: QueryString.stringify(filteredParams, { addQueryPrefix: true }) })
  }

  const handleBackToProjectSelection = () => {
    setStep((prev) => prev - 1)
    if (step === 1) {
      setActiveModal('projectSelection')
    }
  }

  const handleSuccess = (
    action: 'save' | 'requestApproval' | 'TOK_EXHIBITION' | 'TOK_ESSAY' | 'CAS_NORMAL' | 'CAS_PROJECT',
    data?: any,
  ) => {
    setSavedProjectData(data)

    switch (action) {
      case 'save':
        setAlertMessage(`제안서가 \n저장되었습니다`)
        break
      case 'requestApproval':
        setAlertMessage(`제안서 승인 요청이\n완료되었습니다`)
        break
      case 'TOK_EXHIBITION':
        setAlertMessage(`기획안이\n저장되었습니다`)
        break
      case 'TOK_ESSAY':
        setAlertMessage(`아웃라인이\n저장되었습니다`)
        break
      case 'CAS_NORMAL':
        setAlertMessage(`CAS 일반 계획서가\n저장되었습니다`)
        break
      case 'CAS_PROJECT':
        setAlertMessage(`CAS 프로젝트 계획서가\n저장되었습니다`)
        break
    }
  }

  const handleNext = () => {
    if (step === 0 && selectedValue !== '') {
      setStep(step + 1)
      if (selectedValue === 'EE') {
        setActiveModal('IbEeProposal')
      } else if (selectedValue === 'CAS') {
        setActiveModal('IbCAS')
      } else {
        setActiveModal('IbTok')
      }
    } else if (step === 1) {
      setStep(2)
    }
  }

  const toggleProjectSelectionModal = () => {
    setActiveModal(activeModal === 'projectSelection' ? null : 'projectSelection')
    setStep(0)
  }

  useEffect(() => {
    if (location.state?.alertMessage) {
      setAlertMessage(location.state.alertMessage)
    }
  }, [location.state])

  useEffect(() => {
    removeStoredQueryParams()
  }, [])

  useEffect(() => {
    setSelectedOptions(parseQueryParams())
  }, [location.search])

  useEffect(() => {
    const currentPage = Object.keys(selectedOptions.pages).find(
      (key) => selectedOptions.pages[key] !== defaultOptions.pages[key],
    )
    if (currentPage && projectListRefs.current[currentPage]) {
      projectListRefs.current[currentPage]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedOptions.pages])

  if (me == null) {
    return <IBBlank />
  }

  return (
    <main className="w-full">
      <header className="flex flex-row gap-3 py-5">
        <div>
          <LayeredTabs.TwoDepth
            onChange={(selectedType: IBProjectTypes) => handleOptionChange('projectType', selectedType)}
            value={selectedOptions.projectType}
          >
            <Tab
              value="NORMAL"
              childrenWrapperClassName={clsx(
                selectedOptions.projectType === 'NORMAL' ||
                  selectedOptions.projectType === 'CAS' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={clsx({ 'text-primary-gray-700': selectedOptions.projectType === 'NORMAL' })}>전체</p>
            </Tab>
            <Tab
              value="CAS"
              childrenWrapperClassName={clsx(
                selectedOptions.projectType === 'CAS' ||
                  selectedOptions.projectType === 'EE' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={clsx({ 'text-primary-gray-700': selectedOptions.projectType === 'CAS' })}>CAS</p>
            </Tab>
            <Tab
              value="EE"
              childrenWrapperClassName={clsx(
                selectedOptions.projectType === 'EE' ||
                  selectedOptions.projectType === 'TOK' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={clsx({ 'text-primary-gray-700': selectedOptions.projectType === 'EE' })}>EE</p>
            </Tab>
            <Tab value="TOK">
              <p className={clsx({ 'text-primary-gray-700': selectedOptions.projectType === 'TOK' })}>TOK</p>
            </Tab>
          </LayeredTabs.TwoDepth>
        </div>
      </header>
      <section className="flex flex-col">
        {data?.total === 0 ? (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="flex flex-col items-center">
              <Typography variant="body2">진행중인 프로젝트가 없습니다.</Typography>
              <Typography variant="body2">프로젝트를 생성해주세요.</Typography>
            </span>
            <span className="flex flex-row items-center">
              <ButtonV2 variant="solid" color="orange100" size={40} onClick={toggleProjectSelectionModal}>
                프로젝트 생성
              </ButtonV2>
            </span>
          </div>
        ) : (
          <>
            <div className="border-b-primary-gray-200 border-b pt-5 pb-10">
              <ProjectList
                title="담당교사 지정대기"
                params={{
                  limit: 12,
                  studentId: me?.id,
                  ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                }}
                statuses={STATUS_GROUPS.담당교사_지정대기.join(',')}
                user={me}
                currentPage={selectedOptions.pages[`page1`]}
                onPageChange={(page: number) =>
                  handleOptionChange('pages', { ...selectedOptions.pages, [`page1`]: page })
                }
              />
            </div>
            <div className="border-b-primary-gray-200 border-b py-10">
              <ProjectList
                title="계획중"
                params={{
                  limit: 12,
                  studentId: me?.id,
                  ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                }}
                statuses={STATUS_GROUPS.계획중.join(',')}
                user={me}
                currentPage={selectedOptions.pages[`page2`]}
                onPageChange={(page: number) =>
                  handleOptionChange('pages', { ...selectedOptions.pages, [`page2`]: page })
                }
              />
            </div>
            <div className="border-b-primary-gray-200 border-b py-10">
              <ProjectList
                title="진행중"
                params={{
                  limit: 12,
                  studentId: me?.id,
                  ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                }}
                statuses={STATUS_GROUPS.진행중.join(',')}
                user={me}
                currentPage={selectedOptions.pages[`page3`]}
                onPageChange={(page: number) =>
                  handleOptionChange('pages', { ...selectedOptions.pages, [`page3`]: page })
                }
              />
            </div>
            <div className="border-b-primary-gray-200 border-b py-10">
              <ProjectList
                title="완료"
                params={{
                  limit: 12,
                  studentId: me?.id,
                  ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                }}
                statuses={STATUS_GROUPS.완료.join(',')}
                user={me}
                currentPage={selectedOptions.pages[`page4`]}
                onPageChange={(page: number) =>
                  handleOptionChange('pages', { ...selectedOptions.pages, [`page4`]: page })
                }
              />
            </div>
          </>
        )}
      </section>
      {activeModal === 'projectSelection' && step === 0 && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'프로젝트 유형을 선택해주세요'}
          bottomBorder={false}
          footerClassName="h-24"
          footerButtons={
            <div className="flex gap-2">
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleNext}
                disabled={selectedValue === ''}
              >
                다음
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group
            selectedValue={selectedValue}
            onChange={(value: IBProject) => setSelectedValue(value)}
            className="flex flex-col gap-3 px-1 pb-2"
          >
            <RadioV2.Box image={CAS} value="CAS" title="CAS" content="Creativity, Activity, Service" />
            <RadioV2.Box image={EE} value="EE" title="EE" content="Extended Essay" disabled={isEETypeExists} />
            <RadioV2.Box
              image={TOK}
              value="TOK"
              title="TOK"
              content="Theory of Knowledge"
              disabled={isESSAYTypeExists && isEXHTypeExists}
            />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'IbEeProposal' && step === 1 && (
        <IbEeProposal
          modalOpen={true}
          type="create"
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'IbCAS' && step === 1 && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'활동 유형을 선택해주세요'}
          bottomBorder={false}
          footerButtons={
            <div className="flex gap-2">
              <ButtonV2 variant="outline" color="gray400" size={48} onClick={toggleProjectSelectionModal}>
                이전
              </ButtonV2>
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleNext}
                disabled={selectedCategory === ''}
              >
                {'다음'}
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group
            selectedValue={selectedCategory}
            onChange={(value: CategoryType) => setSelectedCategory(value)}
            className="flex flex-col gap-3"
          >
            <RadioV2.Box value="Normal" title="일반" />
            <RadioV2.Box value="Project" title="프로젝트" />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'IbTok' && step === 1 && (
        <PopupModal
          modalOpen={true}
          setModalClose={() => setActiveModal(null)}
          title={'TOK 유형을 선택해주세요'}
          bottomBorder={false}
          footerButtons={
            <div className="flex gap-2">
              <ButtonV2 variant="outline" color="gray400" size={48} onClick={toggleProjectSelectionModal}>
                이전
              </ButtonV2>
              <ButtonV2
                variant="solid"
                color="orange800"
                size={48}
                onClick={handleNext}
                disabled={selectedCategory === ''}
              >
                {'다음'}
              </ButtonV2>
            </div>
          }
        >
          <RadioV2.Group
            selectedValue={selectedCategory}
            onChange={(value: CategoryType) => setSelectedCategory(value)}
            className="flex flex-col gap-3"
          >
            <RadioV2.Box value="Exhibition" title="전시회" disabled={isEXHTypeExists} />
            <RadioV2.Box value="Essay" title="에세이" disabled={isESSAYTypeExists} />
          </RadioV2.Group>
        </PopupModal>
      )}
      {activeModal === 'IbCAS' && selectedCategory === 'Normal' && step === 2 && (
        <IbCASNormal
          modalOpen={true}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'IbCAS' && selectedCategory === 'Project' && step === 2 && (
        <IbCASProject
          modalOpen={true}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'IbTok' && selectedCategory === 'Exhibition' && step === 2 && (
        <IbExhibitionPlan
          modalOpen={true}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'IbTok' && selectedCategory === 'Essay' && step === 2 && (
        <IbOutline
          modalOpen={true}
          handleBack={handleBackToProjectSelection}
          onSuccess={handleSuccess}
          setModalClose={() => setActiveModal(null)}
        />
      )}
      {alertMessage && (
        <AlertV2
          message={alertMessage}
          confirmText="확인"
          onConfirm={() => {
            setAlertMessage(null)
            if (savedProjectData) {
              if (activeModal === 'IbEeProposal') {
                push(`/ib/student/ee/${savedProjectData.id}`)
              } else if (activeModal === 'IbTok') {
                if (selectedCategory === 'Essay') {
                  push(`/ib/student/tok/essay/${savedProjectData.id}`)
                } else {
                  push(`/ib/student/tok/exhibition/${savedProjectData.id}`)
                }
              } else {
                push(`/ib/student/cas/${savedProjectData.id}/plan`)
              }
            }

            setActiveModal(null)
          }}
        />
      )}
    </main>
  )
}
