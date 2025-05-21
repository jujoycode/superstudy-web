import { useState } from 'react'

import { useUserStore } from '@/stores/user'
import { useStudentTimetableDetail } from '@/legacy/container/teacher-student-timetable-detail'
import { LectureType, ResponseTimetableV3Dto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { dayOfKorWeek } from '@/legacy/util/date'

interface TimeTableCardProps {
  studentId?: number
}

export function TimeTableCard({ studentId }: TimeTableCardProps) {
  const [selectedLectureInfo, setSelectedLectureInfo] = useState<ResponseTimetableV3Dto | undefined>()
  const { t } = useLanguage()
  const { timetableV3Student } = useStudentTimetableDetail(studentId)

  const { me } = useUserStore()
  const hasSaturdayClass = me?.school.hasSaturdayClass || false

  const timesArray: number[] | undefined = timetableV3Student?.map((item: ResponseTimetableV3Dto) => item.time)
  const maxTime: number = timesArray ? Math.max(...timesArray) : 0

  const todayNum = new Date().getDay()

  const lectureData = (day: number, time: number) => {
    const lectures = timetableV3Student?.filter((item) => item.day === day && item.time === time)

    // TODO lectures[0] 을 무조건 가져오는게 아니고, type = move 를 가져와야 함.
    return lectures ? lectures[0] : undefined
  }

  const timeTableV3Click = (lecture: ResponseTimetableV3Dto | undefined) => {
    if (lecture && lecture?.type !== LectureType.UNKNOWN) {
      setSelectedLectureInfo(lecture)
    }
  }

  return (
    <div className="relative mt-4 rounded-md border-2 bg-white p-4">
      <h6 className="pt-3 text-lg font-semibold md:pt-0">{t('student_personal_timetable', '학생 개인 시간표')}</h6>
      <table className="mx-auto mt-4 w-full rounded-md border text-center">
        <thead>
          <tr>
            <td colSpan={2} className="bg-gray-9 border" />
            <td className="bg-gray-9 min-w-max border py-4">{t('monday', '월')}</td>
            <td className="bg-gray-9 min-w-max border">{t('tuesday', '화')}</td>
            <td className="bg-gray-9 min-w-max border">{t('wednesday', '수')}</td>
            <td className="bg-gray-9 min-w-max border">{t('thursday', '목')}</td>
            <td className="bg-gray-9 min-w-max border">{t('friday', '금')}</td>
            {hasSaturdayClass && <td className="bg-gray-9 min-w-max border">{t('saturday', '토')}</td>}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxTime }, (_, i) => (
            <tr key={i}>
              <td colSpan={2} className="bg-gray-9 border px-2 py-2.5">
                {i + 1}
              </td>
              {Array.from({ length: hasSaturdayClass ? 6 : 5 }, (_, dayNum) => {
                const lecture = lectureData(dayNum + 1, i + 1)
                return (
                  <td
                    key={dayNum}
                    className={`min-h-10.5 min-w-9.5 cursor-pointer border border-gray-50 px-1 py-2 text-xs md:text-base ${todayNum === dayNum + 1 ? 'bg-brand-1 bg-opacity-20' : ''} ${i === 0 && dayNum === 0 ? 'border-t-0 border-l-0' : ''} ${i === 0 && dayNum === (hasSaturdayClass ? 5 : 4) ? 'border-t-0 border-r-0' : ''} ${i === maxTime - 1 && dayNum === 0 ? 'border-b-0 border-l-0' : ''} ${
                      i === maxTime - 1 && dayNum === (hasSaturdayClass ? 5 : 4) ? 'border-r-0 border-b-0' : ''
                    } ${i === 0 || i === maxTime - 1 ? 'border-t-0 border-b-0' : ''} ${dayNum === 0 || dayNum === (hasSaturdayClass ? 5 : 4) ? 'border-r-0 border-l-0' : ''} ${
                      lecture?.id !== undefined && selectedLectureInfo?.id === lecture?.id
                        ? 'bg-yellow-200 text-red-500'
                        : ''
                    } `}
                    onClick={() => {
                      timeTableV3Click(lecture)
                    }}
                  >
                    {lecture?.subject}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLectureInfo && (
        <div className="mt-2 flex w-full items-center justify-center">
          <div className="w-full rounded-xl border border-gray-500 bg-white px-4">
            <div className="text-base text-gray-500">
              {dayOfKorWeek(selectedLectureInfo.day)}요일 {selectedLectureInfo.time + '교시'}
            </div>

            <table className="mb-2 w-full table-fixed">
              <tr>
                <td colSpan={2} className="rounded-l-lg bg-gray-300 text-center">
                  과목
                </td>
                <td colSpan={3} className="bg-gray-9 pl-2 font-bold">
                  {selectedLectureInfo?.subject}
                </td>
                <td colSpan={2} className="bg-gray-300 text-center">
                  선생님
                </td>
                <td colSpan={3} className="bg-gray-9 pl-2 font-bold">
                  {selectedLectureInfo.teacherName}
                </td>
                <td colSpan={2} className="bg-gray-300 text-center">
                  장소
                </td>
                <td colSpan={3} className="bg-gray-9 rounded-r-lg pl-2 font-bold">
                  {selectedLectureInfo?.room}
                </td>
              </tr>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
