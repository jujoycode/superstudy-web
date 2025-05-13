import clsx from 'clsx'
import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { useCourseGet } from '@/legacy/generated/endpoint'
import { Course, CourseStatus } from '@/legacy/generated/model'
import { meState } from '@/stores'
import { courseTimeToString } from '@/legacy/util/course'
import { dayOfKorWeek } from '@/legacy/util/date'

interface TimetableCoursesPageProps {
  selectedCourse?: Course
  onSelectCourse: (course: Course) => void
}

export function TimetableCoursesPage({ selectedCourse, onSelectCourse }: TimetableCoursesPageProps) {
  const me = useRecoilValue(meState)

  const { data: courses = [] } = useCourseGet({ teacherId: me?.id ?? 0 }, { query: { enabled: !!me } })

  const activeCourses = useMemo(() => courses.filter((c) => c.status === CourseStatus.IN_LECTURE), [courses])
  const inactiveCourses = useMemo(
    () =>
      courses.filter((c) =>
        (
          [
            CourseStatus.CONFIRMED,
            CourseStatus.POSTED,
            CourseStatus.APPLY_ENDED,
            CourseStatus.EXTRA_APPLY_STARTED,
            CourseStatus.EXTRA_APPLY_ENDED,
            CourseStatus.OPENED,
          ] as CourseStatus[]
        ).includes(c.status),
      ),
    [courses],
  )

  return (
    <div className="mb-10 flex flex-col gap-5 px-2">
      <div className="flex flex-col gap-2">
        <h3 className="text-18">강의중</h3>
        <table>
          <thead>
            <tr className="border-y">
              <th className="p-2">강좌명</th>
              <th className="p-2">시간</th>
              <th className="p-2">강의실</th>
            </tr>
          </thead>
          <tbody>
            {activeCourses.map((course) => (
              <tr
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className={clsx(
                  'cursor-pointer border-y',
                  course.id === selectedCourse?.id ? 'bg-gray-100' : 'hover:bg-gray-50',
                )}
              >
                <td className="p-2 text-center">{course.name}</td>
                <td className="p-2 text-center">
                  {course.lectureTimes.map((time) => (
                    <div key={time.id}>{`${dayOfKorWeek(time.week)} ${courseTimeToString(
                      time.startTime,
                    )} - ${courseTimeToString(time.endTime)}`}</div>
                  ))}
                </td>
                <td className="p-2 text-center">{course.lectureRoom.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-18">대기중</h3>
        <table>
          <thead>
            <tr className="border-y">
              <th className="p-2">강좌명</th>
              <th className="p-2">시간</th>
              <th className="p-2">강의실</th>
            </tr>
          </thead>
          <tbody>
            {inactiveCourses.map((course) => (
              <tr
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className={clsx(
                  'cursor-pointer border-y',
                  course.id === selectedCourse?.id ? 'bg-gray-100' : 'hover:bg-gray-50',
                )}
              >
                <td className="p-2 text-center">{course.name}</td>
                <td className="p-2 text-center">
                  {course.lectureTimes.map((time) => (
                    <div key={time.id}>{`${dayOfKorWeek(time.week)} ${courseTimeToString(
                      time.startTime,
                    )} - ${courseTimeToString(time.endTime)}`}</div>
                  ))}
                </td>
                <td className="p-2 text-center">{course.lectureRoom.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
