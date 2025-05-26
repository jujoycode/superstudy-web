import _ from 'lodash'
import { FC, useEffect, useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import { cn } from '@/utils/commonUtil'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { Check } from '@/legacy/components/common/Check'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import SelectBar from '@/legacy/components/common/SelectBar'
import { Typography } from '@/legacy/components/common/Typography'
import FrontPaginatedList from '@/legacy/components/FrontPaginatedList '
import { useIBSetMentor, useProfileSetMentor } from '@/legacy/container/ib-coordinator'
import { useGetIBProject } from '@/legacy/container/ib-project-get-filter'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useGroupsFindAllKlassBySchool, useIBProfileGetItems, useUserGetAllTeachers } from '@/legacy/generated/endpoint'
import {
  ResponseIBDto,
  ResponseIBDtoIbType,
  ResponseIBProfileDto,
  ResponseIBStudentDto,
} from '@/legacy/generated/model'

import ConfirmSelectBar from '../ConfirmSelectBar'

const CAS_TYPE_KOR = {
  [ResponseIBDtoIbType.CAS_NORMAL]: '일반',
  [ResponseIBDtoIbType.CAS_PROJECT]: '프로젝트',
}

const ITEMS_PER_PAGE = 10

const CoordinatorCAS_Teacher: FC = () => {
  const type = 'CAS_NORMAL,CAS_PROJECT'

  const [selectedOptions, setSelectedOptions] = useState({
    grade: 0,
    klass: 0,
  })

  const [selectedTeacher, setSelectedTeacher] = useState(0)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [isHeaderChecked, setIsHeaderChecked] = useState(false)
  const [page, setPage] = useState(1)
  const [name, setName] = useState('')
  const [searchName, setSearchName] = useState('')
  const history = useHistory()

  const [mentorType, setMentorType] = useState<string>('INSTRUCTOR')

  const { data: klassGroups } = useGroupsFindAllKlassBySchool()
  const { data: teachersData } = useUserGetAllTeachers()
  const { data: ibProfiles } = useIBProfileGetItems(
    searchName
      ? { studentName: searchName }
      : {
          grade: selectedOptions.grade === 0 ? undefined : selectedOptions.grade,
          klass: selectedOptions.klass === 0 ? undefined : selectedOptions.klass,
          limit: 500,
        },
  )
  const { data: ibProjects, getIBProject } = useGetIBProject()

  const data = mentorType === 'INSTRUCTOR' ? ibProfiles : ibProjects

  const grades = _(klassGroups)
    .map('grade')
    .uniq()
    .map((grade, index) => ({ id: index + 1, value: grade, text: `${grade}학년` }))
    .concat([{ id: 0, value: 0, text: '학년 전체' }])
    .orderBy('value')
    .value()

  const klasses = _(klassGroups)
    .filter((group) => group.grade === selectedOptions.grade)
    .map('klass')
    .uniq()
    .map((klass, index) => ({ id: index + 1, value: klass, text: `${klass}반` }))
    .concat([{ id: 0, value: 0, text: '반 전체' }])
    .orderBy('value')
    .value()

  const teachers = _(teachersData)
    .map((teacher) => ({
      id: teacher.id,
      value: teacher.id,
      text: teacher.name || '이름 없음',
    }))
    .value()

  const { updateIBMentor } = useIBSetMentor({
    onSuccess: () => {
      setAlertMessage(`감독교사가\n변경되었습니다`)
      fetchIBProjects()
    },
    onError: (error) => {
      console.error('감독교사 지정 및 수정 요청 중 오류 발생:', error)
    },
  })

  const { updateProfileIBMentor } = useProfileSetMentor({
    onSuccess: () => {
      setAlertMessage(`지도교사가\n변경되었습니다`)
      fetchIBProjects()
    },
    onError: (error) => {
      console.error('지도교사 지정 및 수정 요청 중 오류 발생:', error)
    },
  })

  const fetchIBProjects = () => {
    getIBProject({
      grade: selectedOptions.grade === 0 ? undefined : selectedOptions.grade,
      klass: selectedOptions.klass === 0 ? undefined : selectedOptions.klass,
      limit: 500,
      ibTypes: type,
      statuses:
        'WAIT_MENTOR,WAITING_FOR_NEXT_PROPOSAL,WAIT_PLAN_APPROVE,REJECT_PLAN,REJECT_MENTOR,IN_PROGRESS,REJECT_COMPLETE,WAIT_COMPLETE,COMPLETE',
    })
  }

  useEffect(() => {
    fetchIBProjects()
  }, [selectedOptions])

  useEffect(() => {
    setIsHeaderChecked(false)
    setSelectedIds([])
    setPage(1)
  }, [selectedOptions, mentorType])

  useEffect(() => {
    const currentPageItems = getCurrentPageItems()
    const currentPageIds = currentPageItems.map((item) => item.id)
    if (currentPageItems.length > 0) {
      const allSelected = currentPageIds.every((id) => selectedIds.includes(id))
      setIsHeaderChecked(allSelected)
    }
  }, [selectedIds, page, selectedOptions, data])

  const handleOptionChange = (optionType: 'grade' | 'klass', value: number) => {
    if (selectedOptions[optionType] !== value) {
      let updatedOptions = { ...selectedOptions }

      if (optionType === 'grade') {
        updatedOptions = {
          grade: value,
          klass: 0,
        }
      } else {
        updatedOptions = {
          ...updatedOptions,
          [optionType]: value,
        }
      }

      setSelectedOptions(updatedOptions)
    }
  }

  const getCurrentPageItems = () => {
    const startIdx = (page - 1) * ITEMS_PER_PAGE
    const endIdx = startIdx + ITEMS_PER_PAGE

    const items = mentorType === 'INSTRUCTOR' ? sortedProfileItems : sortedProjectItems
    return items.slice(startIdx, endIdx)
  }

  const handleHeaderCheck = (isChecked: boolean) => {
    const currentPageItems = getCurrentPageItems()
    const currentPageIds = currentPageItems.map((item) => item.id)

    if (isChecked) {
      setSelectedIds((prev) => _.uniq([...prev, ...currentPageIds])) // 기존 선택 유지하고 추가
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id))) // 현재 페이지 아이템만 선택 해제
    }
  }

  const handleItemCheck = (id: number, isChecked: boolean) => {
    setSelectedIds((prev) => (isChecked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)))
  }

  const sortedProjectItems = _.orderBy(ibProjects?.items || [], 'createdAt', 'desc')

  const sortedProfileItems = _.orderBy(
    ibProfiles?.items || [],
    [
      (item) => Number(item.user.studentGroup.group.grade),
      (item) => Number(item.user.studentGroup.group.klass),
      (item) => Number(item.user.studentGroup.studentNumber),
    ],
    ['asc', 'asc', 'asc'],
  )

  const InstructorHeader = () => (
    <>
      <div className="flex w-[68px] items-center justify-center">
        <Check.Basic checked={isHeaderChecked} onChange={(isChecked) => handleHeaderCheck(isChecked)} />
      </div>
      <div className="w-[164px] text-center">학년</div>
      <div className="w-[164px] text-center">반</div>
      <div className="w-[164px] text-center">번호</div>
      <div className="w-[308px] text-center">이름</div>
      <div className="w-[284px] text-center">담당교사</div>
    </>
  )

  const SupervisorHeader = () => (
    <>
      <div className="flex w-[68px] items-center justify-center">
        <Check.Basic checked={isHeaderChecked} onChange={(isChecked) => handleHeaderCheck(isChecked)} />
      </div>
      <div className="w-[200px] text-center">감독교사</div>
      <div className="w-[92px] text-center">활동 구분</div>
      <div className="w-[416px] text-center">활동명</div>
      <div className="w-[392px] text-center">담당 학생</div>
    </>
  )

  // Item 컴포넌트

  const InstructorItem = ({ item }: { item: ResponseIBProfileDto }) => {
    const isChecked = selectedIds.includes(item.id)
    const [teacher, setTeacher] = useState(item.mentor?.id || 0)

    return (
      <>
        <div className="flex w-[68px] items-center justify-center">
          <Check.Basic checked={isChecked} onChange={(isChecked) => handleItemCheck(item.id, isChecked)} />
        </div>
        <div className="w-[164px] text-center">{item.user.studentGroup.group.grade}</div>
        <div className="w-[164px] text-center">{item.user.studentGroup.group.klass}</div>
        <div className="w-[164px] text-center">{item.user.studentGroup.studentNumber}</div>
        <div className="w-[308px] text-center">{item.user.name}</div>
        <div className="flex w-[284px] items-center justify-center">
          <ConfirmSelectBar
            options={teachers}
            value={teacher}
            onChange={(newValue) => setTeacher(newValue)}
            onConfirm={(mentorId) => {
              updateProfileIBMentor(item.id, mentorId)
            }}
            placeholder="미정"
            size={32}
            containerWidth="w-30"
            dropdownWidth="w-[176px]"
          />
        </div>
      </>
    )
  }

  const SupervisorItem = ({ item }: { item: ResponseIBDto }) => {
    const isChecked = selectedIds.includes(item.id)
    const [teacher, setTeacher] = useState(item.mentor?.id || 0)

    const { data } = useIBGetById(item.id, {
      enabled: item.ibType === 'CAS_PROJECT',
    })

    const getUserInfo = (student: ResponseIBStudentDto) =>
      student.studentGroup.group.grade +
      String(student.studentGroup.group.klass).padStart(2, '0') +
      String(student.studentGroup.studentNumber).padStart(2, '0') +
      ' ' +
      student.name
    return (
      <>
        <div className="flex w-[68px] items-center justify-center">
          <Check.Basic checked={isChecked} onChange={(isChecked) => handleItemCheck(item.id, isChecked)} />
        </div>
        <div className="flex w-[200px] justify-center">
          <ConfirmSelectBar
            options={teachers}
            value={teacher}
            onChange={(newValue) => setTeacher(newValue)}
            onConfirm={(mentorId) => {
              const payload = { mentorId, data: { ibIds: [item.id] } }
              updateIBMentor(payload)
            }}
            placeholder="미정"
            size={32}
            containerWidth="w-30"
            dropdownWidth="w-[176px]"
          />
        </div>
        <div className="w-[92px] text-center">{CAS_TYPE_KOR[item.ibType as 'CAS_NORMAL' | 'CAS_PROJECT']}</div>
        <div
          className="w-[416px] cursor-pointer text-center"
          onClick={() => history.push(`/teacher/ib/cas/${item.id}/plan`)}
        >
          {item.title}
        </div>
        <div className="w-[392px] text-center">
          {data?.members && data?.members?.length > 1 ? (
            <>
              {getUserInfo(item.leader)} 외 {data?.members?.length}명
            </>
          ) : (
            getUserInfo(item.leader)
          )}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="flex flex-row justify-between px-6 pt-6">
        <Typography variant="title1" className="flex h-10 items-center text-gray-900">
          담당교사 지정
        </Typography>
      </div>
      <div className="flex flex-row items-center justify-between p-6">
        <div className="flex flex-row items-center gap-2">
          <LayeredTabs.TwoDepth onChange={(selectedType) => setMentorType(selectedType)} value={mentorType}>
            <Tab
              value="INSTRUCTOR"
              childrenWrapperClassName={
                'relative after:absolute after:right-0 after:h-[14px] after:w-[1px] after:bg-gray-200 after:content-[""] after:z-10'
              }
            >
              <p className={cn({ 'text-gray-700': mentorType === 'INSTRUCTOR' })}>지도교사</p>
            </Tab>
            <Tab value="SUPERVISOR">
              <p className={cn({ 'text-gray-700': mentorType === 'SUPERVISOR' })}>감독교사</p>
            </Tab>
          </LayeredTabs.TwoDepth>
          <SelectBar
            options={grades}
            value={selectedOptions.grade}
            onChange={(value: number) => handleOptionChange('grade', value)}
            placeholder="학년 선택"
            size={40}
            containerWidth="w-30"
            dropdownWidth="w-40"
            priorityFontClass="text-gray-900"
          />
          <SelectBar
            options={klasses}
            disabled={!selectedOptions.grade}
            value={selectedOptions.klass}
            onChange={(value: number) => handleOptionChange('klass', value)}
            placeholder="반 선택"
            size={40}
            containerWidth="w-30"
            dropdownWidth="w-40"
            className={cn({ 'cursor-not-allowed': !selectedOptions.grade })}
            priorityFontClass={cn({ 'text-gray-900': selectedOptions.grade })}
          />
          <SearchInput
            onChange={(e) => {
              setName(e.target.value)
              if (!e.target.value) setSearchName('')
            }}
            onSearch={() => setSearchName(name)}
            value={name}
            placeholder="학생이름 검색"
          />
        </div>
        <ConfirmSelectBar
          options={teachers}
          value={selectedTeacher}
          disabled={selectedIds.length === 0}
          onChange={(newValue) => setSelectedTeacher(newValue)}
          onConfirm={(mentorId: number) => {
            if (selectedIds.length === 0) {
              setAlertMessage('선택된 항목이 없습니다.')
              return
            }
            if (mentorType === 'SUPERVISOR') {
              const payload = { mentorId, data: { ibIds: selectedIds } }
              updateIBMentor(payload)
              setSelectedIds([])
              setSelectedTeacher(0)
            } else if (mentorType === 'INSTRUCTOR') {
              for (const ibId of selectedIds) {
                updateProfileIBMentor(ibId, mentorId)
              }
              setSelectedIds([])
              setSelectedTeacher(0)
            }
          }}
          placeholder="교사 변경하기"
          size={40}
          containerWidth="w-[176px]"
        />
      </div>
      {mentorType === 'INSTRUCTOR' && (
        <FrontPaginatedList<ResponseIBProfileDto>
          headerComponent={<InstructorHeader />}
          itemComponent={(item) => <InstructorItem item={item} />}
          page={page}
          setPage={setPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={sortedProfileItems.length || 0}
          items={sortedProfileItems}
          onSelect={(item) => console.log('선택된 항목:', item)}
          itemClassName="h-auto"
        />
      )}
      {mentorType === 'SUPERVISOR' && (
        <FrontPaginatedList<ResponseIBDto>
          headerComponent={<SupervisorHeader />}
          itemComponent={(item) => <SupervisorItem item={item} />}
          page={page}
          setPage={setPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={sortedProjectItems.length || 0}
          items={sortedProjectItems}
          onSelect={(item) => console.log('선택된 항목:', item)}
          itemClassName="h-auto"
        />
      )}
      {alertMessage && (
        <AlertV2
          confirmText="확인"
          message={alertMessage}
          onConfirm={() => {
            setAlertMessage(null)
          }}
        />
      )}
    </div>
  )
}

export default CoordinatorCAS_Teacher
