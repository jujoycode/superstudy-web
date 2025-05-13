import clsx from 'clsx'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { SuperModal } from '@/legacy/components'
import { Divider, Label, Section, Select } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Constants } from '@/legacy/constants'
import {
  lectureAttendanceSave,
  useCourseLectureGet,
  useCourseSeasonGetOne,
  useCourseTermGetOne,
  useCourseTraineeGet,
  useLectureAttendanceGetOneByForeignKeys,
} from '@/legacy/generated/endpoint'
import { Course, CourseTrainee, User } from '@/legacy/generated/model'
import { exportCSVToExcel } from '@/legacy/util/download-excel'
import { getNickName } from '@/legacy/util/status'
import userSvg from '@/assets/svg/user.svg'

interface TimetableCoursePageProps {
  course: Course
}

export function TimetableCoursePage({ course }: TimetableCoursePageProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'list' | 'table'>('list')
  const [traineeFilter, setTraineeFilter] = useState<'total' | 'present' | 'absent'>('total')
  const [courseLectureId, setCourseLectureId] = useState<number>()
  const [selectedUser, setSelectedUser] = useState<User>()

  const { data: courseSeason } = useCourseSeasonGetOne(course.courseSeasonId)
  const { data: courseTerm } = useCourseTermGetOne(courseSeason?.courseTermId ?? 0, {
    query: { enabled: !!courseSeason },
  })
  const { data: courseLectures = [] } = useCourseLectureGet({ courseId: course.id })
  const { data: courseTrainees = [] } = useCourseTraineeGet({ courseId: course.id })

  useEffect(() => {
    if (courseLectureId || courseLectures.length === 0) return
    setCourseLectureId(courseLectures[0].id)
  }, [courseLectureId, courseLectures])

  const courseLecture = useMemo(
    () => courseLectures.find((cl) => cl.id === courseLectureId),
    [courseLectures, courseLectureId],
  )
  const [presentTrainees, absentTrainees] = useMemo(() => {
    if (!courseLecture) return [[], []]
    const presentTrainees: CourseTrainee[] = []
    const absentTrainees: CourseTrainee[] = []
    courseTrainees.forEach((trainee) => {
      if (courseLecture.lectureAttendances.some((la) => la.userId === trainee.id)) {
        presentTrainees.push(trainee)
      } else {
        absentTrainees.push(trainee)
      }
    })
    return [presentTrainees, absentTrainees]
  }, [courseTrainees, courseLecture])

  async function downloadAsExcel() {
    if (courseLectures.length == 0 || courseTrainees.length == 0) {
      alert('데이터가 존재하지 않습니다.')
      return
    }

    const defaultContent = '이름,학년,반,번호'
    const rounds = courseLectures.map((_, idx) => `${idx + 1}차`).join(',')
    let content = `${defaultContent},${rounds}`

    content =
      `${content}\n` +
      courseTrainees
        .map((trainee) => {
          const studentGroup = trainee.user.studentGroups![0]
          const result = [
            trainee.user.name,
            studentGroup.group.grade,
            studentGroup.group.klass,
            studentGroup.studentNumber,
          ]
          courseLectures.forEach((courseLecture) => {
            result.push(
              courseLecture.lectureAttendances.some((la) => la.userId === trainee.userId && !la.isAttended) ? 'X' : 'O',
            )
          })

          return result
        })
        .join('\n')

    exportCSVToExcel(content, `${course.name}_출결현황`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div>
          <Label.Text children="학년도" />
          <div>{courseTerm?.courseYear}</div>
        </div>
        <div>
          <Label.Text children="학기" />
          <div>{courseTerm?.name}</div>
        </div>
        <div>
          <Label.Text children="시즌" />
          <div>{courseSeason?.name}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <Label.Text children="강좌명" />
          <div>{course.name}</div>
        </div>
        {tab === 'list' && (
          <Label>
            <Label.Text children="회차선택" />
            <Select onChange={(e) => setCourseLectureId(Number(e.target.value))} value={courseLectureId}>
              {courseLectures.map((courseLecture) => (
                <option key={courseLecture.id} value={courseLecture.id}>{`${courseLecture.lectureOrder}회차 ${format(
                  new Date(courseLecture.startAt),
                  'yyyy.MM.dd HH:mm',
                )} - ${format(new Date(courseLecture.endAt), 'HH:mm')}`}</option>
              ))}
            </Select>
          </Label>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          children="출석부"
          onClick={() => setTab('list')}
          className={clsx(tab === 'list' ? 'filled-gray' : 'filled-gray-light')}
        />
        <Button
          children="출결현황"
          onClick={() => setTab('table')}
          className={clsx(tab === 'table' ? 'filled-gray' : 'filled-gray-light')}
        />

        {tab === 'table' && (
          <div className="ml-auto">
            <Button.sm children={t('download_excel')} onClick={downloadAsExcel} className="outlined-gray" />
          </div>
        )}
      </div>

      {tab === 'list' && (
        <div>
          <div className="bg-grey-100 flex flex-wrap items-center justify-between rounded-lg border p-5">
            <p
              className={clsx(
                'flex cursor-pointer flex-wrap',
                traineeFilter === 'total' && 'font-extrabold text-red-500',
              )}
              onClick={() => setTraineeFilter('total')}
            >
              {t('total_students', '총원')} : {courseTrainees.length} {t('count', '명')}
            </p>
            <p
              className={clsx(
                'flex cursor-pointer flex-wrap',
                traineeFilter === 'present' && 'font-extrabold text-red-500',
              )}
              onClick={() => setTraineeFilter('present')}
            >
              {t('attendance', '출석')} : {presentTrainees.length} {t('count', '명')}
            </p>
            <p
              className={clsx(
                'flex cursor-pointer flex-wrap',
                traineeFilter === 'absent' && 'font-extrabold text-red-500',
              )}
              onClick={() => setTraineeFilter('absent')}
            >
              {t('non-attendance', '미출석')} : {absentTrainees.length} {t('count', '명')}
            </p>
          </div>

          <div className="md:scroll-box md:h-screen-13 md:overflow-x-hidden md:overflow-y-auto">
            <div className="mb-10">
              {(traineeFilter === 'total'
                ? courseTrainees
                : traineeFilter === 'present'
                  ? presentTrainees
                  : absentTrainees
              ).map((trainee) => {
                const studentGroup = trainee.user.studentGroups![0]
                const lectureAttendance = courseLecture?.lectureAttendances.find((la) => la.userId == trainee.userId)
                return (
                  <div key={trainee.id} className="flex items-center justify-between py-2 md:px-4">
                    <div className="flex items-center gap-2">
                      {courseLecture?.lectureAttendances.some(
                        (la) => la.userId === trainee.userId && !la.isAttended,
                      ) ? (
                        <div className="rounded bg-red-100 px-2.5 py-1.5 text-sm font-extrabold text-red-500 md:text-base">
                          {t('non-attendance')}
                        </div>
                      ) : (
                        <div className="rounded bg-blue-100 px-2.5 py-1.5 text-sm text-blue-600 md:text-base">
                          {t('attendance')}
                        </div>
                      )}
                      <div>{`${studentGroup.group.grade}학년 ${studentGroup.group.klass}반 ${studentGroup.studentNumber}번 ${trainee.user.name}`}</div>
                    </div>
                    <div>{lectureAttendance ? lectureAttendance.note : ''}</div>
                    <Button.lg
                      children={t('attendance_management')}
                      onClick={() => setSelectedUser(trainee.user)}
                      className="filled-primary"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'table' && (
        <div>
          <table className="w-full">
            <thead>
              <tr className="border-y">
                <th className="p-2">이름</th>
                {courseLectures.map((courseLecture) => (
                  <th key={courseLecture.id} className="p-2">
                    {courseLecture.lectureOrder}차
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseTrainees.map((trainee) => {
                const studentGroup = trainee.user.studentGroups![0]
                return (
                  <tr key={trainee.id} className="border-y">
                    <td className="p-2 text-center">{`${studentGroup.group.grade}학년 ${studentGroup.group.klass}반 ${studentGroup.studentNumber}번 ${trainee.user.name}`}</td>
                    {courseLectures.map((courseLecture) => (
                      <td key={courseLecture.id} className="p-2 text-center">
                        {courseLecture.lectureAttendances.some((la) => la.userId === trainee.userId && !la.isAttended)
                          ? 'X'
                          : 'O'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {courseLectureId && selectedUser && (
        <TimetableCoursePageAttendanceManagementModal
          courseLectureId={courseLectureId}
          user={selectedUser}
          onClose={() => setSelectedUser(undefined)}
        />
      )}
    </div>
  )
}

interface TimetableCoursePageAttendanceManagementModalProps {
  courseLectureId: number
  user: User
  onClose: () => void
}

function TimetableCoursePageAttendanceManagementModal({
  courseLectureId,
  user,
  onClose,
}: TimetableCoursePageAttendanceManagementModalProps) {
  const [isAttended, setIsAttended] = useState(true)
  const [note, setNote] = useState('')
  const [disabled, setDisabled] = useState(false)

  const {
    data: lectureAttendance,
    isLoading,
    remove,
  } = useLectureAttendanceGetOneByForeignKeys({ courseLectureId, userId: user.id })

  useEffect(() => {
    if (isLoading) return
    setIsAttended(lectureAttendance?.isAttended !== false)
    setNote(lectureAttendance?.note ?? '')
  }, [lectureAttendance, isLoading])

  async function save() {
    setDisabled(true)
    await lectureAttendanceSave({ id: lectureAttendance?.id, isAttended, note, courseLectureId, userId: user.id })
    remove()
    onClose()
    setDisabled(false)
  }

  return (
    <SuperModal modalOpen={!!user} setModalClose={onClose}>
      <Section className="flex flex-col gap-2">
        <div className="text-lg font-semibold">출결관리</div>
        <div className="flex h-40">
          <div className="w-2/5 rounded-md bg-white bg-cover bg-no-repeat">
            <LazyLoadImage
              src={`${Constants.imageUrl}${user.profile}`}
              alt=""
              loading="lazy"
              className="h-full w-full rounded object-cover"
              onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = event.currentTarget
                target.onerror = null // prevents looping
                target.src = userSvg
              }}
            />
          </div>
          <div className="ml-2 w-3/5">
            <div className="truncate text-lg font-bold">
              {user.name}
              {getNickName(user.nickName)}
            </div>
          </div>
        </div>
        <Divider />
        <div className="flex w-full items-center justify-between space-x-2">
          <Button
            children="출석"
            onClick={() => setIsAttended(true)}
            className={clsx('w-full', isAttended ? 'filled-blue' : 'bg-gray-100 text-gray-500')}
          />
          <Button
            children="미출석"
            onClick={() => setIsAttended(false)}
            className={clsx('w-full', isAttended ? 'bg-gray-100 text-gray-500' : 'filled-red-light')}
          />
        </div>
        <Label.col>
          <Label.Text children="사유" />
          <TextInput placeholder="특기사항을 입력해주세요." value={note} onChange={(e) => setNote(e.target.value)} />
        </Label.col>
        <Button children="저장하기" disabled={disabled} onClick={save} className="filled-primary" />
      </Section>
    </SuperModal>
  )
}
