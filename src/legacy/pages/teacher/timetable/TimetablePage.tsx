import { cn } from '@/utils/commonUtil'
import { useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { BackButton, Blank, Divider, TopNavbar } from '@/legacy/components/common'
import { useSchoolsFindOne } from '@/legacy/generated/endpoint'
import { Course, ResponseTimetableV3Dto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { TimetableAttendancePage } from './TimetableAttendancePage'
import { TimetableCoursePage } from './TimetableCoursePage'
import { TimetableCoursesPage } from './TimetableCoursesPage'
import { TimetableDetailPage } from './TimetableDetailPage'

export function TimetablePage() {
  const { goBack } = useHistory()
  const { t } = useLanguage()
  const { me } = useUserStore()
  const [blankOpen, setBlankOpen] = useState(false)
  const [lectureInfo, setLectureInfo] = useState<ResponseTimetableV3Dto>()
  const [isKlass, setIsKlass] = useState(false)
  const [course, setCourse] = useState<Course>()

  const { data: school } = useSchoolsFindOne(me?.schoolId ?? 0, { query: { enabled: !!me } })

  return (
    <>
      {/* Mobile V */}
      <div className="block md:hidden">
        {blankOpen && <Blank />}
        <TopNavbar
          title="시간표/출석체크"
          left={
            <BackButton
              onClick={() => {
                if (lectureInfo || course) {
                  setLectureInfo(undefined)
                  setCourse(undefined)
                } else {
                  goBack()
                }
              }}
            />
          }
          right={
            <button
              children="새로고침"
              onClick={() => {
                setBlankOpen(true)
                window?.location?.reload()
              }}
              className="text-primary-800 text-sm"
            />
          }
        />

        <div className={cn('flex flex-col gap-8', (lectureInfo || course) && 'hidden')}>
          <TimetableDetailPage
            onSelectLecture={(info) => {
              setLectureInfo(info)
              setCourse(undefined)
            }}
            onIsKlass={(st) => setIsKlass(st)}
          />
          {school?.isCourseActive && (
            <TimetableCoursesPage
              selectedCourse={course}
              onSelectCourse={(course) => {
                setLectureInfo(undefined)
                setCourse(course)
              }}
            />
          )}
        </div>
      </div>

      {/* Desktop V */}
      <div className="col-span-2 hidden h-screen md:block">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold">
            {t('timetable', '시간표')}/{t('attendance_check', '출석체크')}
          </h1>
        </div>
        <Divider className="h-0.5" />
        <div className="scroll-box h-screen-6 hidden w-full gap-8 overflow-y-auto md:flex md:flex-col">
          <TimetableDetailPage
            onSelectLecture={(info) => {
              setLectureInfo(info)
              setCourse(undefined)
            }}
            onIsKlass={(st) => setIsKlass(st)}
          />
          {school?.isCourseActive && (
            <TimetableCoursesPage
              selectedCourse={course}
              onSelectCourse={(course) => {
                setLectureInfo(undefined)
                setCourse(course)
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile / Desktop V */}
      <div className="p-6 md:col-span-4 md:block">
        {lectureInfo && <TimetableAttendancePage lectureInfo={lectureInfo} isKlass={isKlass} />}
        {course && <TimetableCoursePage course={course} />}
      </div>
    </>
  )
}
