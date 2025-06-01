import { ChangeEvent, useEffect, useState } from 'react'
import clsx from 'clsx'
import { range } from 'lodash'
import { useLanguage } from '@/hooks/useLanguage'
import { useUserStore } from '@/stores/user'
import { Badge } from '@/atoms/Badge'
import { Flex } from '@/atoms/Flex'
import { ErrorBlank } from '@/legacy/components'
import { Blank, Select } from '@/legacy/components/common'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherTimetableDetail } from '@/legacy/container/teacher-timetable-v3-detail'
import { LectureType, ResponseTimetableV3Dto } from '@/legacy/generated/model'
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
  const [selectedDayNum, setSelectedDayNum] = useState<number>()

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
      setSelectedDayNum(lecture.day)
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
    setSelectedDayNum(undefined)
    onSelectLecture(undefined)
  }

  function handleKlassSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    changeKlass(+e.target.value)
    setSelectedLectureId(undefined)
    setSelectedDayNum(undefined)
    onSelectLecture(undefined)
  }

  return (
    <div className="my-2 max-w-256 px-2">
      {isLoading && <Blank reversed />}
      {error && <ErrorBlank />}

      <div className="flex flex-row justify-between">
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
        <Flex width="fit-content" items="center" justify="start">
          <Badge
            variant={selectedMyClass ? 'default' : 'active'}
            cursor="pointer"
            onClick={() => setSelectedMyClass(false)}
            className="rounded-full"
          >
            {t('by_teacher', '교사별')}
          </Badge>
          <Badge
            variant={selectedMyClass ? 'active' : 'default'}
            cursor="pointer"
            onClick={() => setSelectedMyClass(true)}
            className="rounded-full"
          >
            {t('by_class', '학급별')}
          </Badge>
        </Flex>
      </div>

      <table className="mx-auto mt-6 w-full table-fixed text-center">
        <thead>
          <tr>
            <th colSpan={4}></th>
            <th colSpan={1}></th>
            <th
              colSpan={10}
              className={clsx(
                'min-w-max rounded-l-xl py-4',
                selectedDayNum === 1 ? 'bg-gray-200' : day === 1 ? 'bg-grey-1/10' : 'bg-grey-9',
              )}
            >
              {t('monday', '월')}
            </th>
            <th
              colSpan={10}
              className={clsx(
                'min-w-max',
                selectedDayNum === 2 ? 'bg-gray-200' : day === 2 ? 'bg-brand-1/20' : 'bg-grey-9',
              )}
            >
              {t('tuesday', '화')}
            </th>
            <th
              colSpan={10}
              className={clsx(
                'min-w-max',
                selectedDayNum === 3 ? 'bg-gray-200' : day === 3 ? 'bg-brand-1/20' : 'bg-grey-9',
              )}
            >
              {t('wednesday', '수')}
            </th>
            <th
              colSpan={10}
              className={clsx(
                'min-w-max',
                selectedDayNum === 4 ? 'bg-gray-200' : day === 4 ? 'bg-brand-1/20' : 'bg-grey-9',
              )}
            >
              {t('thursday', '목')}
            </th>
            <th
              colSpan={10}
              className={clsx(
                'min-w-max',
                !hasSaturdayClass && 'rounded-r-xl',
                selectedDayNum === 5 ? 'bg-gray-200' : day === 5 ? 'bg-brand-1/20' : 'bg-grey-9',
              )}
            >
              {t('friday', '금')}
            </th>
            {hasSaturdayClass && (
              <th
                colSpan={10}
                className={clsx(
                  'min-w-max rounded-r-xl',
                  selectedDayNum === 6 ? 'bg-gray-200' : day === 6 ? 'bg-brand-1/20' : 'bg-grey-9',
                )}
              >
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
                    className={clsx(
                      'min-w-9.5 cursor-pointer',
                      dayNum === 0 ? 'rounded-tl-xl rounded-bl-xl' : '',
                      dayNum === (hasSaturdayClass ? 5 : 4) ? 'rounded-tr-xl rounded-br-xl' : '',
                      todayNum === dayNum + 1 ? 'bg-brand-1 bg-opacity-20' : 'bg-orange-2',
                      lecture?.id !== undefined && selectedLectureId === lecture?.id
                        ? 'text-primary-800 bg-gray-400'
                        : '',
                      selectedDayNum === dayNum + 1 ? 'bg-gray-200' : '',
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
                className={clsx(
                  'bg-grey-9 min-h-10.5 min-w-9.5 px-1 py-2',
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
                    className={clsx(
                      'border-grey-300 min-h-10.5 min-w-9.5 cursor-pointer border px-1 py-2 text-xs md:text-base',
                      todayNum === dayNum + 1 ? 'bg-brand-1 bg-opacity-20' : 'bg-orange-0',
                      i === 0 && dayNum === 0 ? 'rounded-tl-xl border-t-0 border-l-0' : '',
                      i === 0 && dayNum === (hasSaturdayClass ? 5 : 4) ? 'rounded-tr-xl border-t-0 border-r-0' : '',
                      i === maxTime - 1 && dayNum === 0 ? 'rounded-bl-xl border-b-0 border-l-0' : '',
                      i === maxTime - 1 && dayNum === (hasSaturdayClass ? 5 : 4)
                        ? 'rounded-br-xl border-r-0 border-b-0'
                        : '',
                      i === 0 || i === maxTime - 1 ? 'border-t-0 border-b-0' : '',
                      dayNum === 0 || dayNum === (hasSaturdayClass ? 5 : 4) ? 'border-r-0 border-l-0' : '',
                      lecture?.id !== undefined && selectedLectureId === lecture?.id
                        ? 'text-primary-800 bg-gray-400'
                        : 'text-gray-700',
                      selectedDayNum === dayNum + 1 ? 'bg-gray-200' : '',
                    )}
                    onClick={() => timeTableV3Click(lecture)}
                  >
                    {lecture?.type === LectureType.SELECT ? '분반' : lecture?.subject}
                    {!selectedMyClass && (
                      <span
                        className={clsx(
                          lecture?.id !== undefined && selectedLectureId === lecture?.id
                            ? 'text-primary-800'
                            : 'text-gray-700',
                        )}
                      >
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
