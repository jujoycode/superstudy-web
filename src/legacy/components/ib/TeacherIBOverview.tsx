import clsx from 'clsx'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useGroupsFindAllKlassBySchool } from '@/legacy/generated/endpoint'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import SelectBar from '@/legacy/components/common/SelectBar'
import ActivityLogView from './overview/CAS/ActivityLogView'
import InterviewView from './overview/CAS/InterviewView'
import EssayView from './overview/EE/EssayView'
import ProposalView from './overview/EE/ProposalView'
import RPPFView from './overview/EE/RPPFView'
import RRSView from './overview/EE/RRSView'
import TOKEssayView from './overview/TOK/Essay/EssayView'
import OutlineView from './overview/TOK/Essay/OutlineView'
import TOKRRSView from './overview/TOK/Essay/RRSView'
import TKPPFView from './overview/TOK/Essay/TKPPFView'
import ExhibitionView from './overview/TOK/Exhibition/ExhibitionView'
import PlanView from './overview/TOK/Exhibition/PlanView'
// TODO : 이미 등록된 타입 파일 찾을 시 변경 필요
type IBProject = 'CAS' | 'EE' | 'TOK'
type CASProject = 'ACTIVITY_LOG' | 'INTERVIEW' | ''
type EEProject = 'PROPOSAL' | 'ESSAY' | 'RPPF' | 'RRS' | ''
type TOKProject = 'EXHIBITION' | 'ESSAY'
type TOKExhibitionType = 'PLAN' | 'EXHIBITION'
type TOKEssayType = 'OUTLINE' | 'ESSAY' | 'TKPPF' | 'RRS'

export default function TeacherIBOverview() {
  const [projectType, setProjectType] = useState<IBProject>(
    () => (sessionStorage.getItem('projectIBType') as IBProject) || 'EE',
  )
  const [CASType, setCASType] = useState<CASProject>(
    () => (sessionStorage.getItem('projectCASType') as CASProject) || 'ACTIVITY_LOG',
  )
  const [EEType, setEEType] = useState<EEProject>(
    () => (sessionStorage.getItem('projectEEType') as EEProject) || 'PROPOSAL',
  )
  const [TOKType, setTOKType] = useState<TOKProject>(
    () => (sessionStorage.getItem('projectTOKType') as TOKProject) || 'EXHIBITION',
  )
  const [TOKExhibitionType, setTOKExhibitionType] = useState<TOKExhibitionType>(
    () => (sessionStorage.getItem('projectTOKExhibitionType') as TOKExhibitionType) || 'PLAN',
  )

  const [TOKEssayType, setTOKEssayType] = useState<TOKEssayType>(
    () => (sessionStorage.getItem('projectTOKEssayType') as TOKEssayType) || 'OUTLINE',
  )

  const [selectedOptions, setSelectedOptions] = useState(() => ({
    // 시연 위해 기본으로 2학년 지정
    // grade: 1,
    grade: Number(sessionStorage.getItem('projectGrade')) || 2,
    klass: Number(sessionStorage.getItem('projectKlass')) || 0,
  }))

  const { data: klassGroups } = useGroupsFindAllKlassBySchool()

  const grades = [
    { id: 0, value: 0, text: '학년 전체' },
    { id: 1, value: 2, text: '2학년' },
    { id: 2, value: 3, text: '3학년' },
  ]

  const klasses = _(klassGroups)
    .filter((group) => group.grade === selectedOptions.grade)
    .map('klass')
    .uniq()
    .map((klass, index) => ({ id: index + 1, value: klass, text: `${klass}반` }))
    .concat([{ id: 0, value: 0, text: '반 전체' }])
    .orderBy('value')
    .value()

  const handleOptionChange = (optionType: 'grade' | 'klass', value: number) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [optionType]: value,
    }))
  }

  useEffect(() => {
    sessionStorage.setItem('projectGrade', String(selectedOptions.grade))
    sessionStorage.setItem('projectKlass', String(selectedOptions.klass))
  }, [selectedOptions])

  useEffect(() => {
    sessionStorage.setItem('projectIBType', projectType)
  }, [projectType])

  useEffect(() => {
    sessionStorage.setItem('projectCASType', CASType)
  }, [CASType])

  useEffect(() => {
    sessionStorage.setItem('projectEEType', EEType)
  }, [EEType])

  useEffect(() => {
    sessionStorage.setItem('projectTOKType', TOKType)
  }, [TOKType])

  useEffect(() => {
    sessionStorage.setItem('projectTOKExhibitionType', TOKExhibitionType)
  }, [TOKExhibitionType])

  useEffect(() => {
    sessionStorage.setItem('projectTOKEssayType', TOKEssayType)
  }, [TOKEssayType])

  // 선택한 학년 변경 시 선택한 반 초기화
  useEffect(() => {
    setSelectedOptions({
      ...selectedOptions,
      klass: 0,
    })
  }, [selectedOptions.grade])

  return (
    <main className="w-full">
      <header className="flex flex-row gap-3 py-5">
        <div className="flex flex-row items-center gap-2">
          <SelectBar
            options={grades}
            value={selectedOptions.grade}
            onChange={(value: number) => handleOptionChange('grade', value)}
            placeholder="학년 선택"
            size={40}
            containerWidth="w-30"
            dropdownWidth="w-40"
            priorityFontClass="text-primary-gray-900"
          />
          <SelectBar
            options={klasses}
            value={selectedOptions.klass}
            onChange={(value: number) => handleOptionChange('klass', value)}
            placeholder="반 선택"
            size={40}
            containerWidth="w-30"
            dropdownWidth="w-40"
            priorityFontClass="text-primary-gray-900"
          />
        </div>
        <div>
          <LayeredTabs.TwoDepth
            onChange={(selectedType: IBProject) => setProjectType(selectedType)}
            value={projectType}
          >
            <Tab
              value="CAS"
              childrenWrapperClassName={clsx(
                projectType === 'CAS' ||
                  projectType === 'EE' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={clsx({ 'text-primary-gray-700': projectType === 'CAS' })}>CAS</p>
            </Tab>
            <Tab
              value="EE"
              childrenWrapperClassName={clsx(
                projectType === 'EE' ||
                  projectType === 'TOK' ||
                  'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-primary-gray-200 after:content-[""] after:z-10',
              )}
            >
              <p className={clsx({ 'text-primary-gray-700': projectType === 'EE' })}>EE</p>
            </Tab>
            <Tab value="TOK">
              <p className={clsx({ 'text-primary-gray-700': projectType === 'TOK' })}>TOK</p>
            </Tab>
          </LayeredTabs.TwoDepth>
        </div>
      </header>
      <section className="flex flex-col">
        <nav className="pt-3 pb-10">
          {projectType === 'CAS' && (
            <LayeredTabs.ThirdDepth onChange={(selectedType: CASProject) => setCASType(selectedType)} value={CASType}>
              <Tab value="ACTIVITY_LOG">
                <p>성찰일지</p>
              </Tab>
              <Tab value="INTERVIEW">
                <p>인터뷰일지</p>
              </Tab>
            </LayeredTabs.ThirdDepth>
          )}
          {projectType === 'EE' && (
            <LayeredTabs.ThirdDepth onChange={(selectedType: EEProject) => setEEType(selectedType)} value={EEType}>
              <Tab value="PROPOSAL">
                <p>제안서</p>
              </Tab>
              <Tab value="ESSAY">
                <p>에세이</p>
              </Tab>
              <Tab value="RPPF">
                <p>RPPF</p>
              </Tab>
              <Tab value="RRS">
                <p>RRS</p>
              </Tab>
            </LayeredTabs.ThirdDepth>
          )}
          {projectType === 'TOK' && (
            <LayeredTabs.ThirdDepth onChange={(selectedType: TOKProject) => setTOKType(selectedType)} value={TOKType}>
              <Tab value="EXHIBITION">
                <p>전시회</p>
              </Tab>
              <Tab value="ESSAY">
                <p>에세이</p>
              </Tab>
            </LayeredTabs.ThirdDepth>
          )}
        </nav>
        {projectType === 'CAS' && (
          <article>
            {CASType === 'ACTIVITY_LOG' && (
              <ActivityLogView grade={selectedOptions.grade} klass={selectedOptions.klass} />
            )}
            {CASType === 'INTERVIEW' && <InterviewView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
          </article>
        )}
        {projectType === 'EE' && (
          <article>
            {EEType === 'PROPOSAL' && <ProposalView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
            {EEType === 'ESSAY' && (
              <EssayView grade={selectedOptions.grade} klass={selectedOptions.klass} ibType={'EE'} />
            )}
            {EEType === 'RPPF' && <RPPFView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
            {EEType === 'RRS' && <RRSView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
          </article>
        )}
        {projectType === 'TOK' && TOKType === 'EXHIBITION' && (
          <>
            <LayeredTabs.Title
              value={TOKExhibitionType}
              onChange={(selectedType: TOKExhibitionType) => setTOKExhibitionType(selectedType)}
            >
              <Tab value="PLAN">기획안</Tab>
              <Tab value="EXHIBITION">전시회</Tab>
            </LayeredTabs.Title>
            <article>
              {TOKExhibitionType === 'PLAN' && <PlanView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
              {TOKExhibitionType === 'EXHIBITION' && (
                <ExhibitionView grade={selectedOptions.grade} klass={selectedOptions.klass} />
              )}
            </article>
          </>
        )}
        {projectType === 'TOK' && TOKType === 'ESSAY' && (
          <>
            <LayeredTabs.Title
              value={TOKEssayType}
              onChange={(selectedType: TOKEssayType) => setTOKEssayType(selectedType)}
            >
              <Tab value="OUTLINE">아웃라인</Tab>
              <Tab value="ESSAY">에세이</Tab>
              <Tab value="TKPPF">TKPPF</Tab>
              <Tab value="RRS">RRS</Tab>
            </LayeredTabs.Title>
            <article>
              {TOKEssayType === 'OUTLINE' && (
                <OutlineView grade={selectedOptions.grade} klass={selectedOptions.klass} />
              )}
              {TOKEssayType === 'ESSAY' && (
                <TOKEssayView grade={selectedOptions.grade} klass={selectedOptions.klass} ibType={'TOK_ESSAY'} />
              )}
              {TOKEssayType === 'TKPPF' && <TKPPFView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
              {TOKEssayType === 'RRS' && <TOKRRSView grade={selectedOptions.grade} klass={selectedOptions.klass} />}
            </article>
          </>
        )}
      </section>
    </main>
  )
}
