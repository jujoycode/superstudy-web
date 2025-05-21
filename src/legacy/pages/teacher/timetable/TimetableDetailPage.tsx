import { cn } from '@/utils/commonUtil'
import { range } from 'lodash'
import { ChangeEvent, useEffect, useState } from 'react'

import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import { Badge, Blank, Select } from '@/legacy/components/common'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherTimetableDetail } from '@/legacy/container/teacher-timetable-v3-detail'
import { LectureType, ResponseTimetableV3Dto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { convertClassFormat } from '@/legacy/util/validator'

interface TimetableDetailPageProps {
  onSelectLecture: (info: ResponseTimetableV3Dto | undefined) => void
  onIsKlass: (st: boolean) => void
}

export function TimetableDetailPage({ onSelectLecture, onIsKlass }: TimetableDetailPageProps) {
  const { t } = useLanguage()
  const { me } = useUserStore()
  const hasSaturdayClass = me?.school.hasSaturdayClass || false

  const { allKlassGroupsUnique: allKlassGroups } = GroupContainer.useContext()
  const [selectedMyClass, setSelectedMyClass] = useState(false)
  const [selectedLectureId, setSelectedLectureId] = useState<number>()

  useEffect(() => {
    onIsKlass(selectedMyClass)
  }, [selectedMyClass])

  // 학급 교사 시간표
  const {
    teachers,
    groupId,
    teacherId,
    isLoading,
    error,
    changeTeacher,
    changeKlass,
    timetableV3Klass = [],
    timetableV3Teacher = [],
  } = useTeacherTimetableDetail()

  const order = [LectureType.MOVE, LectureType.SELECT, LectureType.FIX, LectureType.UNKNOWN]
  const timetableV3 = (selectedMyClass ? timetableV3Klass : timetableV3Teacher).sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type),
  )

  const timesArray = timetableV3.map((item) => item.time)
  const maxTime = Math.max(...timesArray, 0)

  const day = new Date().getDay()
  const todayNum = new Date().getDay()

  function timeTableV3Click(lecture: ResponseTimetableV3Dto | undefined) {
    if (lecture && lecture?.type !== LectureType.UNKNOWN) {
      setSelectedLectureId(lecture.id)
      onSelectLecture(lecture)
    }
  }

  function lectureData(day: number, time: number): ResponseTimetableV3Dto | undefined {
    // TODO: [0] 을 무조건 가져오는게 아니고, type = move 를 가져와야 함.
    return timetableV3.filter((item) => item.day === day && item.time === time)[0]
  }

  function handleTeacherSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    changeTeacher(+e.target.value)
    setSelectedLectureId(undefined)
    onSelectLecture(undefined)
  }

  function handleKlassSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    changeKlass(+e.target.value)
    setSelectedLectureId(undefined)
    onSelectLecture(undefined)
  }

  return (
    <div className="my-2 max-w-256 px-2">
      {isLoading && <Blank reversed />}
      {error && <ErrorBlank />}

      <div className="flex justify-between">
        <div className="">
          {/* 학급별 */}
          {selectedMyClass && (
            <Select.lg
              className="w-full"
              placeholder={t('selection', '선택')}
              value={groupId}
              onChange={(e) => handleKlassSelectChange(e)}
            >
              <option value="0">{t('selection', '선택')}</option>
              {allKlassGroups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name?.replace('학년 ', '-').replace('반', '')}
                </option>
              ))}
            </Select.lg>
          )}

          {/* 교사별 */}
          {!selectedMyClass && (
            <Select.lg
              className="w-full"
              placeholder={t('select_teacher', '선생님 선택')}
              value={teacherId}
              onChange={(e) => handleTeacherSelectChange(e)}
            >
              <option value="0">{t('selection', '선택')}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                  {teacher.nickName && '(' + teacher.nickName + ')'}
                </option>
              ))}
            </Select.lg>
          )}
        </div>
        <div className="flex items-center justify-center space-x-2 py-4">
          <Badge
            children={t('by_teacher', '교사별')}
            onClick={() => setSelectedMyClass(false)}
            className={cn('py-1.5', !selectedMyClass ? 'bg-black text-white' : 'bg-white text-black')}
          />
          <Badge
            children={t('by_class', '학급별')}
            onClick={() => setSelectedMyClass(true)}
            className={cn('py-1.5', !selectedMyClass ? 'bg-white text-black' : 'bg-black text-white')}
          />
        </div>
      </div>

      <table className="mx-auto w-full table-fixed text-center">
        <thead>
          <tr>
            <th colSpan={4}></th>
            <th colSpan={1}></th>
            <th colSpan={10} className={cn('min-w-max rounded-l-xl py-4', day === 1 ? 'bg-gray-900/10' : 'bg-gray-9')}>
              {t('monday', '월')}
            </th>
            <th colSpan={10} className={cn('min-w-max', day === 2 ? 'bg-brand-1/20' : 'bg-gray-9')}>
              {t('tuesday', '화')}
            </th>
            <th colSpan={10} className={cn('min-w-max', day === 3 ? 'bg-brand-1/20' : 'bg-gray-9')}>
              {t('wednesday', '수')}
            </th>
            <th colSpan={10} className={cn('min-w-max', day === 4 ? 'bg-brand-1/20' : 'bg-gray-9')}>
              {t('thursday', '목')}
            </th>
            <th
              colSpan={10}
              className={cn(
                'min-w-max',
                !hasSaturdayClass && 'rounded-r-xl',
                day === 5 ? 'bg-brand-1/20' : 'bg-gray-9',
              )}
            >
              {t('friday', '금')}
            </th>
            {hasSaturdayClass && (
              <th colSpan={10} className={cn('min-w-max rounded-r-xl', day === 6 ? 'bg-brand-1/20' : 'bg-gray-9')}>
                {t('saturday', '토')}
              </th>
            )}
          </tr>
          <tr>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {selectedMyClass && (
            <tr>
              <td colSpan={4}></td>
              <td colSpan={1}></td>
              {range(hasSaturdayClass ? 6 : 5).map((dayNum) => {
                const lecture = lectureData(dayNum + 1, 0)
                return (
                  <td
                    colSpan={10}
                    key={dayNum + 10}
                    className={cn(
                      'min-w-9.5 cursor-pointer',
                      dayNum === 0 ? 'rounded-tl-xl rounded-bl-xl' : '',
                      dayNum === (hasSaturdayClass ? 5 : 4) ? 'rounded-tr-xl rounded-br-xl' : '',
                      todayNum === dayNum + 1 ? 'bg-brand-1 bg-opacity-20' : 'bg-orange-300',
                      lecture?.id !== undefined && selectedLectureId === lecture?.id
                        ? 'bg-yellow-200 text-red-500'
                        : '',
                    )}
                    onClick={() => timeTableV3Click(lecture)}
                  >
                    {t('morning_inquiry', '조회')}
                  </td>
                )
              })}
            </tr>
          )}
          {selectedMyClass && (
            <tr>
              <td className="pb-2"></td>
            </tr>
          )}

          {range(maxTime).map((i) => (
            <tr key={i}>
              <td
                colSpan={4}
                className={cn(
                  'min-h-10.5 min-w-9.5 bg-gray-50 px-1 py-2',
                  i === 0 && 'rounded-t-xl',
                  i === maxTime - 1 && 'rounded-b-xl',
                )}
              >
                {i + 1}
              </td>
              <td colSpan={1}></td>
              {range(hasSaturdayClass ? 6 : 5).map((dayNum) => {
                const lecture = lectureData(dayNum + 1, i + 1)
                return (
                  <td
                    colSpan={10}
                    key={dayNum}
                    className={cn(
                      'min-h-10.5 min-w-9.5 cursor-pointer border border-gray-50 px-1 py-2 text-xs md:text-base',
                      todayNum === dayNum + 1 ? 'bg-brand-1 bg-opacity-20' : 'bg-orange-100',
                      i === 0 && dayNum === 0 ? 'rounded-tl-xl border-t-0 border-l-0' : '',
                      i === 0 && dayNum === (hasSaturdayClass ? 5 : 4) ? 'rounded-tr-xl border-t-0 border-r-0' : '',
                      i === maxTime - 1 && dayNum === 0 ? 'rounded-bl-xl border-b-0 border-l-0' : '',
                      i === maxTime - 1 && dayNum === (hasSaturdayClass ? 5 : 4)
                        ? 'rounded-br-xl border-r-0 border-b-0'
                        : '',
                      i === 0 || i === maxTime - 1 ? 'border-t-0 border-b-0' : '',
                      dayNum === 0 || dayNum === (hasSaturdayClass ? 5 : 4) ? 'border-r-0 border-l-0' : '',
                      lecture?.id !== undefined && selectedLectureId === lecture?.id
                        ? 'bg-yellow-200 text-red-500'
                        : '',
                    )}
                    onClick={() => timeTableV3Click(lecture)}
                  >
                    {lecture?.type === LectureType.SELECT ? '분반' : lecture?.subject}
                    {!selectedMyClass && (
                      <span className="text-gray-600">
                        <br />
                        {convertClassFormat(lecture?.room)}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}

          {!selectedMyClass && (teacherId === 0 || timetableV3.length === 0) && (
            <tr>
              <td colSpan={5}></td>
              <td colSpan={50} className="h-30">
                {teacherId === 0
                  ? '선생님을 선택해주세요.'
                  : timetableV3.length === 0
                    ? '등록된 시간표가 없습니다.'
                    : ''}
              </td>
            </tr>
          )}
          {selectedMyClass && (groupId === 0 || timetableV3.length === 0) && (
            <tr>
              <td colSpan={5}></td>
              <td colSpan={50} className="h-30">
                {groupId === 0 ? '학급을 선택해주세요.' : timetableV3.length === 0 ? '등록된 시간표가 없습니다.' : ''}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
