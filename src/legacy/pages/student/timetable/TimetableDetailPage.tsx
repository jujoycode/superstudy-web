import { useState } from 'react'
import { ReactComponent as KlassIcon } from '@/assets/svg/attendance-class.svg'
import { ReactComponent as UserIcon } from '@/assets/svg/attendance-user.svg'
import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { useStudentTimetableDetail } from '@/legacy/container/student-timetable-detail'
import { LectureType, ResponseTimetableV3Dto, Role } from '@/legacy/generated/model'
import { dayOfKorWeek } from '@/legacy/util/date'

export function TimetableDetailPage() {
  const { me } = useUserStore()
  const { child: myChild } = useUserStore()

  let hasSaturdayClass = me?.school.hasSaturdayClass || false

  if (me?.role === Role.PARENT) {
    hasSaturdayClass = myChild?.school.hasSaturdayClass || false
  }

  const [selectedLectureInfo, setSelectedLectureInfo] = useState<ResponseTimetableV3Dto | undefined>()

  const { timetableV3Student, error, loading } = useStudentTimetableDetail()

  const timesArray: number[] | undefined = timetableV3Student?.map((item: ResponseTimetableV3Dto) => item.time)
  const maxTime: number = timesArray ? Math.max(...timesArray) : 0

  const todayNum = new Date().getDay()

  const lectureData = (day: number, time: number) => {
    const lectures = timetableV3Student?.filter((item) => item.day === day && item.time === time)

    // TODO lectures[0] 을 무조건 가져오는게 아니고, type = move 를 가져와야 함.
    // return lectures ? lectures[0] : undefined;
    const moveLecture = lectures?.find((lecture) => lecture.type === 'MOVE')
    return moveLecture || lectures?.[0] || undefined
  }

  const timeTableV3Click = (lecture: ResponseTimetableV3Dto | undefined) => {
    if (lecture && lecture?.type !== LectureType.UNKNOWN) {
      setSelectedLectureInfo(lecture)
    }
  }

  return (
    <div className="w-full bg-white">
      {loading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar left={<BackButton />} title="시간표" />
      <div className="scroll-box h-screen w-full overflow-y-auto px-2 py-8">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="" />
              <th className="" />
              <th className="min-w-max rounded-l-xl bg-gray-50 py-4">월</th>
              <th className="min-w-max bg-gray-50">화</th>
              <th className="min-w-max bg-gray-50">수</th>
              <th className="min-w-max bg-gray-50">목</th>
              <th className={`min-w-max ${hasSaturdayClass ? '' : 'rounded-r-xl'} bg-gray-50`}>금</th>
              {hasSaturdayClass && <th className="min-w-max rounded-r-xl bg-gray-50">토</th>}
            </tr>
            <tr>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxTime }, (_, i) => (
              <tr key={i}>
                <td
                  className={`min-h-10.5 w-10 bg-gray-50 px-1 py-2 ${i === 0 ? 'rounded-t-xl' : ''} ${i === maxTime - 1 ? 'rounded-b-xl' : ''}`}
                >
                  {i + 1}
                </td>
                <div className="px-0.5"></div>
                {Array.from({ length: hasSaturdayClass ? 6 : 5 }, (_, dayNum) => {
                  const lecture = lectureData(dayNum + 1, i + 1)
                  return (
                    <td
                      key={dayNum}
                      className={`min-h-10.5 min-w-9.5 cursor-pointer border border-gray-50 px-1 py-2 text-xs md:text-sm ${
                        todayNum === dayNum + 1 ? 'bg-primary-800/20' : 'bg-orange-100'
                      } ${i === 0 && dayNum === 0 ? 'rounded-tl-xl border-t-0 border-l-0' : ''} ${
                        i === 0 && dayNum === (hasSaturdayClass ? 5 : 4) ? 'rounded-tr-xl border-t-0 border-r-0' : ''
                      } ${i === maxTime - 1 && dayNum === 0 ? 'rounded-bl-xl border-b-0 border-l-0' : ''} ${
                        i === maxTime - 1 && dayNum === (hasSaturdayClass ? 5 : 4)
                          ? 'rounded-br-xl border-r-0 border-b-0'
                          : ''
                      } ${i === 0 || i === maxTime - 1 ? 'border-t-0 border-b-0' : ''} ${dayNum === 0 || dayNum === (hasSaturdayClass ? 5 : 4) ? 'border-r-0 border-l-0' : ''} ${
                        lecture?.id !== undefined && selectedLectureInfo?.id === lecture?.id
                          ? 'bg-yellow-200 text-red-500'
                          : ''
                      } `}
                      onClick={() => {
                        timeTableV3Click(lecture)
                      }}
                    >
                      {lecture?.subject && (
                        <>
                          {lecture?.subject}
                          <span className="text-gray-600">
                            <br />
                            {lecture?.room}
                          </span>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {selectedLectureInfo && (
          <div className="mt-8 w-full">
            <div className="rounded-xl border border-gray-500 bg-white px-4">
              <Section>
                {/* <div className="absolute top-5 right-5 cursor-pointer p-3 text-red-500">
                X
              </div> */}

                <div>
                  <div className="mb-2 flex text-base text-gray-500">
                    {dayOfKorWeek(selectedLectureInfo.day)}요일 {selectedLectureInfo.time + '교시'}
                  </div>
                  <div className="pb-1 text-lg font-bold">{selectedLectureInfo?.subject}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <UserIcon />
                  <div className="text-lg">{selectedLectureInfo?.teacherName} 선생님</div>
                </div>

                <div className="flex items-center space-x-2">
                  <KlassIcon />
                  <div className="text-lg">{selectedLectureInfo?.room}</div>
                </div>
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
