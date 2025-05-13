import clsx from 'clsx'
import _ from 'lodash'
import QueryString from 'qs'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useRecoilValue } from 'recoil'
import { useHistory } from '@/hooks/useHistory'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Input } from '@/legacy/components/common/Input'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import SelectBar, { SelectBarOptionProps } from '@/legacy/components/common/SelectBar'
import { Typography } from '@/legacy/components/common/Typography'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useCoordinatorCheck } from '@/legacy/container/ib-coordinator'
import { useGroupsFindAllKlassBySchool, useStudentGroupsFindByGroupId } from '@/legacy/generated/endpoint'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { padLeftstr } from '@/legacy/util/status'
import { meState } from '@/stores'

import ProjectList from './ProjectList'

export const STATUS_GROUPS = {
  담당교사_지정대기: ['WAIT_MENTOR', 'WAITING_FOR_NEXT_PROPOSAL'],
  계획중: ['WAIT_PLAN_APPROVE', 'REJECT_PLAN', 'REJECT_MENTOR'],
  진행중: ['IN_PROGRESS', 'REJECT_COMPLETE', 'WAIT_COMPLETE'],
  완료: ['COMPLETE'],
}

interface SelectedOptions {
  grade: number
  klass: number
  projectType: IBProjectTypes
  studentId: number
  studentName: string
  checked: boolean
  pages: Record<string, number>
  groupId: number
}

type IBProjectTypes = 'NORMAL' | 'EE' | 'CAS' | 'TOK'

export default function TeacherIBStatus() {
  const location = useLocation()
  const history = useHistory()
  const me = useRecoilValue(meState)
  const { setQueryParamsWithStorage, removeStoredQueryParams } = useQueryParams()
  const defaultOptions: SelectedOptions = {
    grade: 0,
    klass: 0,
    projectType: 'NORMAL',
    studentId: 0,
    studentName: '',
    checked: true,
    pages: {
      page1: 1,
      page2: 1,
      page3: 1,
      page4: 1,
    },
    groupId: 0,
  }

  const parseQueryParams = (): SelectedOptions => {
    const params = QueryString.parse(location.search, { ignoreQueryPrefix: true })
    return {
      grade: Number(params.grade) || defaultOptions.grade,
      klass: Number(params.klass) || defaultOptions.klass,
      projectType: (params.projectType as IBProjectTypes) || defaultOptions.projectType,
      studentId: Number(params.studentId) || defaultOptions.studentId,
      studentName: (params.studentName as string) || defaultOptions.studentName,
      checked: params.checked !== undefined ? params.checked === 'true' : defaultOptions.checked,
      pages: {
        page1: Number(params.page1) || defaultOptions.pages.page1,
        page2: Number(params.page2) || defaultOptions.pages.page2,
        page3: Number(params.page3) || defaultOptions.pages.page3,
        page4: Number(params.page4) || defaultOptions.pages.page4,
      },
      groupId: Number(params.groupId) || defaultOptions.groupId,
    }
  }

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(parseQueryParams)
  const [selectedSubject, setSelectedSubject] = useState()
  const [searchStudentName, setSearchStudentName] = useState('')
  const projectListRefs = useRef<Record<string, HTMLDivElement | null>>({
    page1: null,
    page2: null,
    page3: null,
    page4: null,
  })

  const [counts, setCounts] = useState<Record<string, number>>({})
  const { data: klassGroups, isLoading: isKlassGroupsLoading } = useGroupsFindAllKlassBySchool()
  const { categoryData: subjects } = useCodeByCategoryName('eeKnowledgeArea')
  const subjectOptions: SelectBarOptionProps[] = [
    { id: 0, value: undefined, text: '과목 전체' },
    ...(subjects?.map((subject) => ({
      id: subject.id,
      value: subject.name,
      text: subject.name,
    })) || []),
  ]

  const { data: studentGroups, isLoading: isStudentGroupsLoading } = useStudentGroupsFindByGroupId(
    selectedOptions.groupId,
    {
      query: { enabled: !!selectedOptions.groupId },
    },
  )

  const { permission } = useCoordinatorCheck()

  const isOptionSelected = !!selectedOptions.grade && !!selectedOptions.klass

  const handleOptionChange = (optionType: keyof SelectedOptions, value: any) => {
    const updatedOptions = {
      ...selectedOptions,
      [optionType]: value,
      ...(optionType === 'grade' ? { klass: 0, groupId: 0, studentId: 0 } : {}),
      ...(optionType === 'klass' ? { groupId: 0, studentId: 0 } : {}),
      ...(optionType === 'projectType' ? { pages: { ...defaultOptions.pages } } : {}),
      ...(optionType === 'checked' ? { pages: { ...defaultOptions.pages } } : {}),
    }

    if (optionType === 'grade' || optionType === 'klass') {
      const groupDatas = klassGroups?.filter(
        (group) => group.grade === updatedOptions.grade && group.klass === updatedOptions.klass,
      )
      updatedOptions.groupId = groupDatas?.[0]?.id || 0
    }

    setSelectedOptions(updatedOptions)
    updateSearchParams(updatedOptions)
  }

  useEffect(() => {
    setSelectedOptions(parseQueryParams())
  }, [location.search])

  const updateSearchParams = (updatedOptions: SelectedOptions) => {
    const params = {
      grade: updatedOptions.grade !== defaultOptions.grade ? updatedOptions.grade : undefined,
      klass: updatedOptions.klass !== defaultOptions.klass ? updatedOptions.klass : undefined,
      projectType: updatedOptions.projectType !== defaultOptions.projectType ? updatedOptions.projectType : undefined,
      studentId: updatedOptions.studentId !== defaultOptions.studentId ? updatedOptions.studentId : undefined,
      studentName: updatedOptions.studentName !== defaultOptions.studentName ? updatedOptions.studentName : undefined,
      checked: updatedOptions.checked !== defaultOptions.checked ? updatedOptions.checked : undefined,
      groupId: updatedOptions.groupId !== defaultOptions.groupId ? updatedOptions.groupId : undefined,
      ...updatedOptions.pages,
    }
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined),
    ) as Record<string, string>
    setQueryParamsWithStorage(filteredParams)
    history.replace({ search: QueryString.stringify(filteredParams, { addQueryPrefix: true }) })
  }

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

  const students = _(studentGroups)
    .map((sg, index) => {
      const { grade, klass } = selectedOptions
      return {
        id: index + 1,
        value: sg.user.id,
        text: `${grade}${padLeftstr(klass)}${padLeftstr(sg.studentNumber)} ${sg.user.name}`,
      }
    })
    .value()

  const handleSearch = () => {
    if (!searchStudentName) {
      alert('텍스트 내용을 입력해주세요.')
    } else {
      handleOptionChange('studentName', searchStudentName)
    }
  }

  const handleSetCount = (statusKey: string, count: number) => {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [statusKey]: count,
    }))
  }

  useEffect(() => {
    const currentPage = Object.keys(selectedOptions.pages).find(
      (key) => selectedOptions.pages[key] !== defaultOptions.pages[key],
    )
    if (currentPage && projectListRefs.current[currentPage]) {
      projectListRefs.current[currentPage]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedOptions.pages])

  useEffect(() => {
    removeStoredQueryParams()
  }, [])

  if (me == null) {
    return <IBBlank />
  }

  if (isKlassGroupsLoading || isStudentGroupsLoading) {
    return <IBBlank />
  }

  return (
    <>
      <main className="w-full">
        <header className="flex flex-row items-center gap-3 py-5">
          <div className="flex w-full justify-between">
            <div className="flex flex-row items-center gap-3">
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
                  disabled={!selectedOptions.grade}
                  options={klasses}
                  value={selectedOptions.klass}
                  onChange={(value: number) => handleOptionChange('klass', value)}
                  placeholder="반 선택"
                  size={40}
                  containerWidth="w-30"
                  dropdownWidth="w-40"
                  className={clsx({ 'cursor-not-allowed': !selectedOptions.grade })}
                  priorityFontClass={clsx({ 'text-primary-gray-900': selectedOptions.grade })}
                />
                <SelectBar
                  disabled={!isOptionSelected}
                  options={students}
                  value={selectedOptions.studentId}
                  onChange={(value: number) => handleOptionChange('studentId', value)}
                  placeholder="이름 선택"
                  size={40}
                  containerWidth="min-w-[120px]"
                  dropdownWidth="w-40"
                  priorityFontClass={clsx({ 'text-primary-gray-900': isOptionSelected })}
                />
              </div>
              <div className="h-[40px] w-[244px]">
                <LayeredTabs.TwoDepth
                  onChange={(selectedType: IBProjectTypes) => handleOptionChange('projectType', selectedType)}
                  value={selectedOptions.projectType}
                  fullWidth
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
              {selectedOptions.projectType === 'EE' && ( // 'EE'일 때만 출력
                <SelectBar
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={(value: any) => setSelectedSubject(value)}
                  placeholder="과목 선택"
                  size={40}
                  containerWidth="min-w-[140px]"
                  dropdownWidth="w-[240px]"
                />
              )}
            </div>
            <div className="flex flex-row items-center gap-3">
              <label className="flex cursor-pointer flex-row items-center gap-2">
                <Check.Basic
                  checked={selectedOptions.checked}
                  onChange={() => handleOptionChange('checked', !selectedOptions.checked)}
                  size={20}
                />
                <Typography variant="body3" className="text-primary-gray-700 font-medium">
                  담당학생만 보기
                </Typography>
              </label>
              <Input.Basic
                size={40}
                placeholder="이름 검색"
                type="text"
                value={searchStudentName || selectedOptions.studentName}
                className="w-[160px]"
                isSearch
                onSearch={handleSearch}
                onChange={(e) => setSearchStudentName(e.target.value)}
              />
            </div>
          </div>
        </header>
        <section className="flex flex-col">
          {selectedOptions.studentName && (
            <div className="flex items-center gap-4 py-4">
              <hr className="flex-1" />
              <Typography variant="body3" className="font-medium">
                {selectedOptions.studentName} <span className="text-primary-gray-700 font-normal">검색결과</span>{' '}
                <span className="text-primary-orange-800">
                  {counts['COMPLETE'] +
                    counts['IN_PROGRESS,REJECT_COMPLETE,WAIT_COMPLETE'] +
                    counts['WAIT_MENTOR,WAITING_FOR_NEXT_PROPOSAL'] +
                    counts['WAIT_PLAN_APPROVE,REJECT_PLAN,REJECT_MENTOR']}
                </span>
              </Typography>
              <hr className="flex-1" />
            </div>
          )}
          <div
            ref={(el) => {
              projectListRefs.current.page1 = el
            }}
            className="border-b-primary-gray-200 border-b pt-5 pb-10"
          >
            <ProjectList
              title="담당교사 지정대기"
              params={{
                limit: 12,
                grade: selectedOptions.grade || undefined,
                klass: selectedOptions.klass || undefined,
                studentId: selectedOptions.studentId || undefined,
                ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                mentorId: selectedOptions.checked ? me?.id : undefined,
                proposalSubject: selectedSubject || undefined,
                studentName: selectedOptions.studentName || undefined,
              }}
              statuses={STATUS_GROUPS.담당교사_지정대기.join(',')}
              user={me}
              setCount={(count) => handleSetCount(STATUS_GROUPS.담당교사_지정대기.join(','), count)}
              permission={permission}
              currentPage={selectedOptions.pages[`page1`]}
              onPageChange={(page: number) =>
                handleOptionChange('pages', { ...selectedOptions.pages, [`page1`]: page })
              }
            />
          </div>
          <div
            ref={(el) => {
              projectListRefs.current.page2 = el
            }}
            className="border-b-primary-gray-200 border-b py-10"
          >
            <ProjectList
              title="계획중"
              params={{
                limit: 12,
                grade: selectedOptions.grade || undefined,
                klass: selectedOptions.klass || undefined,
                studentId: selectedOptions.studentId || undefined,
                ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                mentorId: selectedOptions.checked ? me?.id : undefined,
                proposalSubject: selectedSubject || undefined,
                studentName: selectedOptions.studentName || undefined,
              }}
              statuses={STATUS_GROUPS.계획중.join(',')}
              user={me}
              setCount={(count) => handleSetCount(STATUS_GROUPS.계획중.join(','), count)}
              permission={permission}
              currentPage={selectedOptions.pages[`page2`]}
              onPageChange={(page: number) =>
                handleOptionChange('pages', { ...selectedOptions.pages, [`page2`]: page })
              }
            />
          </div>
          <div
            ref={(el) => {
              projectListRefs.current.page3 = el
            }}
            className="border-b-primary-gray-200 border-b py-10"
          >
            <ProjectList
              title="진행중"
              params={{
                limit: 12,
                grade: selectedOptions.grade || undefined,
                klass: selectedOptions.klass || undefined,
                studentId: selectedOptions.studentId || undefined,
                ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                mentorId: selectedOptions.checked ? me?.id : undefined,
                proposalSubject: selectedSubject || undefined,
                studentName: selectedOptions.studentName || undefined,
              }}
              statuses={STATUS_GROUPS.진행중.join(',')}
              user={me}
              setCount={(count) => handleSetCount(STATUS_GROUPS.진행중.join(','), count)}
              currentPage={selectedOptions.pages[`page3`]}
              onPageChange={(page: number) =>
                handleOptionChange('pages', { ...selectedOptions.pages, [`page3`]: page })
              }
              permission={permission}
            />
          </div>
          <div
            ref={(el) => {
              projectListRefs.current.page4 = el
            }}
            className="border-b-primary-gray-200 border-b py-10"
          >
            <ProjectList
              title="완료"
              params={{
                limit: 12,
                grade: selectedOptions.grade || undefined,
                klass: selectedOptions.klass || undefined,
                studentId: selectedOptions.studentId || undefined,
                ibTypes: selectedOptions.projectType === 'NORMAL' ? undefined : selectedOptions.projectType,
                mentorId: selectedOptions.checked ? me?.id : undefined,
                proposalSubject: selectedSubject || undefined,
                studentName: selectedOptions.studentName || undefined,
              }}
              statuses={STATUS_GROUPS.완료.join(',')}
              user={me}
              setCount={(count) => handleSetCount(STATUS_GROUPS.완료.join(','), count)}
              permission={permission}
              currentPage={selectedOptions.pages[`page4`]}
              onPageChange={(page: number) =>
                handleOptionChange('pages', { ...selectedOptions.pages, [`page4`]: page })
              }
            />
          </div>
        </section>
      </main>
    </>
  )
}
