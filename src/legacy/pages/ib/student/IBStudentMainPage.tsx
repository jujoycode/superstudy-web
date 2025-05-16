import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

import CAS from '@/assets/images/CAS.png'
import EE from '@/assets/images/EE.png'
import TOK from '@/assets/images/TOK.png'
import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { RadioV2 } from '@/legacy/components/common/RadioV2'
import { Typography } from '@/legacy/components/common/Typography'
import { IbCASNormal } from '@/legacy/components/ib/cas/IbCASNormal'
import { IbCASProject } from '@/legacy/components/ib/cas/IbCASProject'
import { IbEeProposal } from '@/legacy/components/ib/ee/IbEeProposal'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { IbExhibitionPlan } from '@/legacy/components/ib/tok/IbExhibitionPlan'
import { IbOutline } from '@/legacy/components/ib/tok/IbOutline'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useGetIBProject } from '@/legacy/container/ib-project-get-filter'
import { ResponseIBDto } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

export type IBProject = '' | 'CAS' | 'EE' | 'TOK'
export type ModalType = 'projectSelection' | 'IbEeProposal' | 'IbTok' | 'IbCAS' | null
export type CategoryType = 'Exhibition' | 'Essay' | 'Normal' | 'Project' | ''

export const IBStudentMainPage = () => {
  const [step, setStep] = useState<number>(0)
  const { push } = useHistory()
  const { pathname } = useLocation()
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('')
  const [savedProjectData, setSavedProjectData] = useState<ResponseIBDto>()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [selectedValue, setSelectedValue] = useState<IBProject>('')
  const { me } = useUserStore()

  const handleSuccess = (
    action: 'save' | 'requestApproval' | 'TOK_EXHIBITION' | 'TOK_ESSAY' | 'CAS_NORMAL' | 'CAS_PROJECT',
    data?: ResponseIBDto,
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

  const handleBackToProjectSelection = () => {
    setStep((prev) => prev - 1)
    if (step === 1) {
      setActiveModal('projectSelection')
    }
  }

  const { data, getIBProject, isLoading } = useGetIBProject()

  useEffect(() => {
    getIBProject({ studentId: me?.id || 0 })
  }, [])

  if (me == null) {
    return <IBBlank />
  }

  const isEETypeExists = data?.items?.some((item) => item.ibType === 'EE')
  const isESSAYTypeExists = data?.items?.some((item) => item.ibType === 'TOK_ESSAY')
  const isEXHTypeExists = data?.items?.some((item) => item.ibType === 'TOK_EXHIBITION')

  return (
    <div className="col-span-6">
      {isLoading && <IBBlank />}
      <div className="h-screen w-full">
        <div className="">
          <IBLayout
            topContent={
              <div className="h-44">
                <div className="h-32 w-full pt-16">
                  <div className="flex h-10 w-full flex-row items-center justify-between gap-2">
                    <Typography variant="heading">프로젝트</Typography>
                    <div className="flex flex-row items-center gap-2">
                      {/* <SVGIcon.Bell size={24} color="gray700" /> */}
                      <ButtonV2
                        variant="outline"
                        size={40}
                        color="gray400"
                        onClick={() => push('/ib/student/reference')}
                      >
                        자료실
                      </ButtonV2>
                      <ButtonV2
                        variant="solid"
                        size={40}
                        color="orange800"
                        className="flex flex-row items-center gap-1"
                        onClick={toggleProjectSelectionModal}
                      >
                        <SVGIcon.Plus color="white" size={16} weight="bold" />
                        프로젝트 생성
                      </ButtonV2>
                    </div>
                  </div>
                </div>
                <div className="flex h-12 w-max flex-row items-end gap-4">
                  <Link
                    to={`/ib/student`}
                    className={twMerge(
                      clsx(
                        'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                        pathname.startsWith('/ib/student') && !pathname.includes('portfolio')
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
                    to={`/ib/student/portfolio`}
                    className={twMerge(
                      clsx(
                        'flex min-w-[44px] cursor-pointer items-center justify-center px-2 py-2.5 text-base font-semibold',
                        pathname.startsWith('/ib/student/portfolio')
                          ? 'border-b-2 border-[#121316] text-[#121316]'
                          : 'mb-[2px] text-[#898d94]',
                      ),
                    )}
                  >
                    <div className="shrink grow basis-0 text-center text-[16px] leading-[24px] font-semibold">
                      CAS Portfolio
                    </div>
                  </Link>
                </div>
                {/* <LayeredTabs.OneDepth onChange={(selectedType) => setType(selectedType)} value={type}>
                  <Tab value="status">
                    <p>진행상태</p>
                  </Tab>
                  <Tab value="portfolio">
                    <p>CAS Portfolio</p>
                  </Tab>
                </LayeredTabs.OneDepth> */}
              </div>
            }
            bottomContent={
              <div className="flex h-full items-center">
                <Outlet context={{ data }} />
              </div>
            }
            bottomBgColor={pathname.startsWith('/ib/student/portfolio') ? 'bg-primary-gray-50' : 'white'}
          />
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
        </div>
      </div>
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

              setActiveModal(null)
            }
          }}
        />
      )}
    </div>
  )
}
