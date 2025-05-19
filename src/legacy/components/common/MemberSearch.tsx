import React, { useEffect, useMemo, useState } from 'react'

import { useUserSearch } from '@/legacy/container/ib-find-user'
import { ResponseIBStudentDto } from '@/legacy/generated/model'

import { ButtonV2 } from './ButtonV2'
import { Check } from './Check'
import { Input } from './Input'
import { Typography } from './Typography'
import SVGIcon from '../icon/SVGIcon'

interface MemberSearchProps {
  initialStudents?: ResponseIBStudentDto[]
  onSave?: (member: ResponseIBStudentDto[]) => void
  onCancel?: () => void
  id?: number
}

const MemberSearch: React.FC<MemberSearchProps> = ({ initialStudents, onSave, onCancel, id }) => {
  const { data } = useUserSearch()
  const [localData, setLocalData] = useState<ResponseIBStudentDto[]>(initialStudents || [])
  const [searchText, setSearchText] = useState('')
  const [grade, setGrade] = useState<number>(0)
  const [klass, setKlass] = useState<number>(0)

  useEffect(() => {
    setLocalData(initialStudents || [])
  }, [initialStudents])

  const groupedData = useMemo(() => {
    if (!data) return {}

    const grouped = data.reduce((acc: any, student: ResponseIBStudentDto) => {
      if (!acc[student.studentGroup.group.grade]) {
        acc[student.studentGroup.group.grade] = {}
      }
      if (!acc[student.studentGroup.group.grade][student.studentGroup.group.klass]) {
        acc[student.studentGroup.group.grade][student.studentGroup.group.klass] = []
      }
      acc[student.studentGroup.group.grade][student.studentGroup.group.klass].push(student)
      return acc
    }, {})

    for (const gradeKey in grouped) {
      for (const klassKey in grouped[gradeKey]) {
        grouped[gradeKey][klassKey].sort(
          (a: ResponseIBStudentDto, b: ResponseIBStudentDto) =>
            a.studentGroup.studentNumber - b.studentGroup.studentNumber,
        )
      }
    }

    return grouped
  }, [data])

  const selectedGroup = useMemo(() => {
    if (grade === 0 || klass === 0) return []
    return groupedData[grade]?.[klass] || []
  }, [groupedData, grade, klass])

  const allStudentsSorted = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [data])

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data || []

    return (Array.isArray(data) ? data : []).filter((student: ResponseIBStudentDto) => {
      const fullStudentNumber = `${student.studentGroup.group.grade}${String(student.studentGroup.group.klass).padStart(
        2,
        '0',
      )}${String(student.studentGroup.studentNumber).padStart(2, '0')}`
      return (
        student.name.includes(searchText) || // 이름 검색
        fullStudentNumber.includes(searchText) // 학번 검색
      )
    })
  }, [data, searchText])

  const handleCheckChange = (student: ResponseIBStudentDto, checked: boolean) => {
    setLocalData((prev) =>
      checked
        ? prev.some((s) => s.id === student.id)
          ? prev
          : [...prev, student]
        : prev.filter((s) => s.id !== student.id),
    )
  }

  const handleSave = () => {
    if (onSave) {
      onSave(localData)
    }
  }

  return (
    <div className="border-primary-gray-200 text-13 z-100 flex h-[473px] w-[280px] flex-col items-center rounded-lg border bg-white py-4 shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)]">
      <div className="top-0 z-10 flex w-[248px] flex-col items-center gap-2 pb-4">
        <div className="flex w-full items-center justify-around gap-1">
          <Input.Basic
            isSearch={true}
            size={40}
            placeholder="이름, 학번 검색"
            type="text"
            className="w-[248px]"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </div>
      </div>
      {searchText === '' ? (
        <>
          <div className="top-0 z-10 flex w-[248px] flex-col">
            {grade === 0 ? (
              <Typography variant="body3" className="text-primary-gray-500 px-2 py-1.5">
                전체 학년
              </Typography>
            ) : klass === 0 ? (
              <div
                className="top-0 flex cursor-pointer flex-row items-center gap-1 px-2 py-1.5"
                onClick={() => setGrade(0)}
              >
                <SVGIcon.Arrow weight="bold" color="gray400" size={16} />
                <Typography variant="body3" className="text-primary-gray-500">
                  {grade}학년
                </Typography>
              </div>
            ) : (
              <div
                className="top-0 flex cursor-pointer flex-row items-center gap-1 px-2 py-1.5"
                onClick={() => setKlass(0)}
              >
                <SVGIcon.Arrow weight="bold" color="gray400" size={16} />
                <Typography variant="body3" className="text-primary-gray-500">
                  {grade}학년 {klass}반
                </Typography>
              </div>
            )}
          </div>
          <div className="scroll-box flex flex-col overflow-y-auto pb-4">
            <div className="flex w-[248px] flex-col pb-4">
              {grade === 0 ? (
                <>
                  <div
                    className="flex cursor-pointer flex-row items-center justify-between gap-2 px-2 py-1.5"
                    onClick={() => setGrade(1)}
                  >
                    <Typography variant="body2" className="font-medium">
                      1학년
                    </Typography>
                    <SVGIcon.Arrow weight="bold" color="gray700" size={16} rotate={180} />
                  </div>
                  <div
                    className="flex cursor-pointer flex-row items-center justify-between gap-2 px-2 py-1.5"
                    onClick={() => setGrade(2)}
                  >
                    <Typography variant="body2" className="font-medium">
                      2학년
                    </Typography>
                    <SVGIcon.Arrow weight="bold" color="gray700" size={16} rotate={180} />
                  </div>
                  <div
                    className="flex cursor-pointer flex-row items-center justify-between gap-2 px-2 py-1.5"
                    onClick={() => setGrade(3)}
                  >
                    <Typography variant="body2" className="font-medium">
                      3학년
                    </Typography>
                    <SVGIcon.Arrow weight="bold" color="gray700" size={16} rotate={180} />
                  </div>
                </>
              ) : klass === 0 ? (
                <>
                  {Object.keys(groupedData[grade] || {}).map((klassKey) => (
                    <div
                      key={klassKey}
                      className={`flex cursor-pointer flex-row items-center justify-between gap-2 px-2 py-1.5 ${
                        klass === Number(klassKey) ? 'bg-primary-gray-100' : ''
                      }`}
                      onClick={() => setKlass(Number(klassKey))}
                    >
                      <Typography variant="body2" className="font-medium">
                        {grade}학년 {klassKey}반
                      </Typography>
                      <SVGIcon.Arrow weight="bold" color="gray700" size={16} rotate={180} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <ul>
                    {selectedGroup.map((student: ResponseIBStudentDto) => {
                      const isChecked = student.id === id || localData.some((s) => s.id === student.id)
                      const me = student.id === id
                      return (
                        <li
                          key={student.id}
                          className="hover:bg-primary-gray-50 flex cursor-pointer justify-between px-2 py-1.5 hover:rounded-md"
                          onClick={(e) => {
                            if (!me) handleCheckChange(student, !isChecked)
                            e.stopPropagation() // 클릭 이벤트 중지
                          }}
                        >
                          <Typography variant="body2" className={`font-medium ${isChecked && 'text-primary-800'}`}>
                            {student.name}&nbsp;·&nbsp;{student.studentGroup.group.grade}
                            {String(student.studentGroup.group.klass).padStart(2, '0')}
                            {String(student.studentGroup.studentNumber).padStart(2, '0')}
                          </Typography>
                          <Check.Basic
                            size={16}
                            checked={isChecked}
                            onChange={(checked) => handleCheckChange(student, checked)}
                            disabled={me}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
            <div className="border-t-primary-gray-100 flex w-[248px] flex-col border-t pt-4">
              <Typography variant="body3" className="text-primary-gray-500 px-2 py-1.5">
                전체 학년
              </Typography>
              <ul>
                {allStudentsSorted.map((student) => {
                  const isChecked = student.id === id || localData.some((s) => s.id === student.id)
                  const me = student.id === id
                  return (
                    <li
                      key={student.id}
                      className="hover:bg-primary-gray-50 flex cursor-pointer justify-between px-2 py-1.5 hover:rounded-md"
                      onClick={(e) => {
                        if (!me) handleCheckChange(student, !isChecked)
                        e.stopPropagation() // 클릭 이벤트 중지
                      }}
                    >
                      <Typography variant="body2" className={`font-medium ${isChecked && 'text-primary-800'}`}>
                        {student.name}&nbsp;·&nbsp;{student.studentGroup.group.grade}
                        {String(student.studentGroup.group.klass).padStart(2, '0')}
                        {String(student.studentGroup.studentNumber).padStart(2, '0')}
                      </Typography>
                      <Check.Basic
                        size={16}
                        checked={isChecked}
                        onChange={(checked) => handleCheckChange(student, checked)}
                        disabled={me}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="scroll-box flex w-[248px] flex-col overflow-y-auto pb-4">
          <ul>
            {filteredData.map((student) => {
              const isChecked = student.id === id || localData.some((s) => s.id === student.id)
              const me = student.id === id
              return (
                <li
                  key={student.id}
                  className="hover:bg-primary-gray-50 flex cursor-pointer justify-between px-2 py-1.5 hover:rounded-md"
                  onClick={(e) => {
                    if (!me) handleCheckChange(student, !isChecked)
                    e.stopPropagation() // 클릭 이벤트 중지
                  }}
                >
                  <Typography variant="body2" className={`font-medium ${isChecked && 'text-primary-800'}`}>
                    {student.name}&nbsp;·&nbsp;{student.studentGroup.group.grade}
                    {String(student.studentGroup.group.klass).padStart(2, '0')}
                    {String(student.studentGroup.studentNumber).padStart(2, '0')}
                  </Typography>
                  <Check.Basic
                    size={16}
                    checked={isChecked}
                    onChange={(checked) => handleCheckChange(student, checked)}
                    disabled={me}
                    onClick={(e) => e.stopPropagation()}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <footer className="border-t-primary-gray-100 mt-auto flex w-full flex-row items-center justify-end gap-2 border-t px-4 pt-4">
        <ButtonV2 color="gray100" variant="solid" size={32} onClick={onCancel}>
          취소
        </ButtonV2>
        <ButtonV2 color="orange800" variant="solid" size={32} onClick={handleSave}>
          적용
        </ButtonV2>
      </footer>
    </div>
  )
}

export default MemberSearch
