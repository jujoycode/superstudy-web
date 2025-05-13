import clsx from 'clsx'
import _ from 'lodash'
import { FC, useContext, useEffect, useState } from 'react'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { Check } from '@/legacy/components/common/Check'
import SelectBar from '@/legacy/components/common/SelectBar'
import { Typography } from '@/legacy/components/common/Typography'
import FrontPaginatedList from '@/legacy/components/FrontPaginatedList '
import { useIBSetMentor } from '@/legacy/container/ib-coordinator'
import { useGetIBProject } from '@/legacy/container/ib-project-get-filter'
import { useGroupsFindAllKlassBySchool, useUserGetAllTeachers } from '@/legacy/generated/endpoint'
import { ResponseIBDto } from '@/legacy/generated/model'

import ConfirmSelectBar from '../ConfirmSelectBar'

import { AdminContext } from '@/legacy/pages/admin/AdminMainPage'

interface Coordinator_TeacherProps {
  type?: string
}

const Coordinator_Teacher: FC<Coordinator_TeacherProps> = ({ type = 'EE' }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    grade: 0,
    klass: 0,
  })

  const [selectedTeacher, setSelectedTeacher] = useState(0)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [isHeaderChecked, setIsHeaderChecked] = useState(false)
  const { year } = useContext(AdminContext)
  const { data: klassGroups } = useGroupsFindAllKlassBySchool()
  const { data: teachersData } = useUserGetAllTeachers()

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

  const { data, getIBProject } = useGetIBProject()
  const { updateIBMentor } = useIBSetMentor({
    onSuccess: () => {
      setAlertMessage(`담당교사가\n변경되었습니다`)
      fetchIBProjects()
    },
    onError: (error) => {
      console.error('담당교사 지정 및 수정 요청 중 오류 발생:', error)
    },
  })

  const fetchIBProjects = () => {
    getIBProject({
      grade: selectedOptions.grade === 0 ? undefined : selectedOptions.grade,
      klass: selectedOptions.klass === 0 ? undefined : selectedOptions.klass,
      limit: 108,
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
  }, [selectedOptions])

  useEffect(() => {
    setIsHeaderChecked(selectedIds.length > 0 && selectedIds.length === (data?.items.length || 0))
  }, [selectedIds, data?.items])

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

  const handleHeaderCheck = (isChecked: boolean) => {
    if (isChecked) {
      const allIds = (data?.items || []).map((item) => item.id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleItemCheck = (id: number, isChecked: boolean) => {
    setSelectedIds((prev) => (isChecked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)))
  }

  const sortedItems = _.orderBy(
    data?.items || [],
    [
      (item) => Number(item.leader.studentGroup.group.grade),
      (item) => Number(item.leader.studentGroup.group.klass),
      (item) => Number(item.leader.studentGroup.studentNumber),
    ],
    ['asc', 'asc', 'asc'],
  )

  const Header = () => (
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

  // Item 컴포넌트

  const Item = ({ item }: { item: ResponseIBDto }) => {
    const isChecked = selectedIds.includes(item.id)
    const [teacher, setTeacher] = useState(item.mentor?.id || 0)

    return (
      <>
        <div className="flex w-[68px] items-center justify-center">
          <Check.Basic checked={isChecked} onChange={(isChecked) => handleItemCheck(item.id, isChecked)} />
        </div>
        <div className="w-[164px] text-center">{item.leader.studentGroup.group.grade}</div>
        <div className="w-[164px] text-center">{item.leader.studentGroup.group.klass}</div>
        <div className="w-[164px] text-center">{item.leader.studentGroup.studentNumber}</div>
        <div className="w-[308px] text-center">{item.leader.name}</div>
        <div className="flex w-[284px] items-center justify-center">
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
      </>
    )
  }

  return (
    <div className="min-h-[664px] rounded-xl bg-white">
      <div className="flex flex-row justify-between px-6 pt-6">
        <Typography variant="title1" className="text-primary-gray-900 flex h-10 items-center">
          담당교사 지정
        </Typography>
      </div>
      <div className="flex flex-row items-center justify-between p-6">
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
            disabled={!selectedOptions.grade}
            value={selectedOptions.klass}
            onChange={(value: number) => handleOptionChange('klass', value)}
            placeholder="반 선택"
            size={40}
            containerWidth="w-30"
            dropdownWidth="w-40"
            className={clsx({ 'cursor-not-allowed': !selectedOptions.grade })}
            priorityFontClass={clsx({ 'text-primary-gray-900': selectedOptions.grade })}
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
            const payload = { mentorId, data: { ibIds: selectedIds } }
            updateIBMentor(payload)
          }}
          placeholder="교사 변경하기"
          size={40}
          containerWidth="w-[176px]"
        />
      </div>
      <FrontPaginatedList<ResponseIBDto>
        headerComponent={<Header />}
        itemComponent={(item) => <Item item={item} />}
        page={1}
        pageSize={10}
        totalItems={data?.items.length || 0}
        items={sortedItems}
        onSelect={(item) => console.log('선택된 항목:', item)}
      />
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

export default Coordinator_Teacher
