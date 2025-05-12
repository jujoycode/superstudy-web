import clsx from 'clsx'
import { range } from 'lodash'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { Label, Section, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { FileUpload } from '@/legacy/components/common/FileUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Tooltip } from '@/legacy/components/common/Tooltip'
import { TooltipButton } from '@/legacy/components/common/TooltipButton'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { Constants } from '@/legacy/constants'
import { useCodeByCategoryName } from '@/legacy/container/category'
import {
  schoolManagementGetRegistTimetable,
  schoolManagementRegistTimetable,
  schoolManagementResetLecture,
  timetableManagementCreateMoveLecture,
  timetableManagementDeleteLecture,
  timetableManagementResetLecture,
  timetableManagementTradeLecture,
  timetableManagementTradeLectureDay,
  useAdminCommonFindAllKlassBySchool,
  useAdminCommonFindGroupByteacherBySchool,
  useAdminCommonSearchStudents,
  useAdminCommonSearchTeachers,
  useTimetableManagementGetLectureInfoWithWeek,
  useTimetableManagementGetTimeTable,
} from '@/legacy/generated/endpoint'
import {
  Category,
  LectureType,
  type ResponseGroupDto,
  type ResponseTeacherInfoDto,
  type ResponseTimetableUploadInfoDto,
  type ResponseTimetableV3Dto,
  UploadFileTypeEnum,
} from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { form } from '@/legacy/lib/form'
import { Routes } from '@/legacy/constants/routes'
import { meState, toastState, warningState } from '@/stores'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getFileNameFromUrl } from '@/legacy/util/file'
import { getNickName } from '@/legacy/util/status'
import { getThisSemester, WeekList } from '@/legacy/util/time'
import { AdminContext } from '../AdminMainPage'

export enum TimetableTarget {
  KLASS = '학급',
  TEACHER = '선생님',
  STUDENT = '학생',
}

enum ExchangeEnum {
  NONE = 0,
  COPY,
  SWAP,
}

enum ExchangeModeEnum {
  NONE = 0,
  LECTURE,
  DAY,
}

enum NeisExcelModeEnum {
  PROGRESS = 0,
  TOTAL,
  STUDENT,
}

interface LectureInfoType {
  id?: number
  day: number
  time: number
  subject?: string
  teacherName?: string
}

export function TimetablePage() {
  const subjectInputRef = useRef<HTMLInputElement>(null)
  const me = useRecoilValue(meState)
  const lastPeriod = me?.school.lastPeriod || 8
  const hasSaturdayClass = me?.school.hasSaturdayClass || false

  const { year } = useContext(AdminContext)
  const { t } = useLanguage()
  const [semester, setSemester] = useState(+getThisSemester())
  const [target, setTarget] = useState(TimetableTarget.KLASS)
  const [klassId, setKlassId] = useState<number>()
  const [teacherId, setTeacherId] = useState<number>(0)
  const [studentId, setStudentId] = useState<number>()
  const [weeksDays, setWeeksDays] = useState<string[]>([])
  const [weekNum, setWeekNum] = useState<number>(0)
  const [weekIndex, setWeekIndex] = useState<number>(0)
  const [lecType, setLecType] = useState<LectureType>(LectureType.FIX)
  const [bulkRegMode, setBulkRegMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [exchangeMode, setExchangeMode] = useState<ExchangeModeEnum>(ExchangeModeEnum.NONE)
  const [exchangeType, setExchangeType] = useState<ExchangeEnum>(0)
  const [exchangeStartWeekNum, setExchangeStartWeekNum] = useState<number>(0)
  const [exchangeEndWeekNum, setExchangeEndWeekNum] = useState<number>(0)
  const [exchangeStartWeekIndex, setExchangeStartWeekIndex] = useState<number>(0)
  const [exchangeEndWeekIndex, setExchangeEndWeekIndex] = useState<number>(0)
  const [subjectInput, setSubjectInput] = useState(false)
  const [subjectUser, setSubjectUser] = useState<string>('')

  const [lecture1, setLecture1] = useState<LectureInfoType>()
  const [lecture2, setLecture2] = useState<LectureInfoType>()

  const [changeDay1, setChangeDay1] = useState(0)
  const [changeDay2, setChangeDay2] = useState(0)

  const [neisRegType, setNeisRegType] = useState<NeisExcelModeEnum>(0)

  const [neisIng, setNeisIng] = useState<ResponseTimetableUploadInfoDto[]>([])

  const daysOfWeekString = ['일', t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), '토']

  const setToastMsg = useSetRecoilState(toastState)
  const setWarningMsg = useSetRecoilState(warningState)

  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (currentMonth === 2 && year !== currentYear) {
      setWarningMsg(`주의 : ${year} 학년도가 선택되어 있습니다.`)
    }
  }, [year])

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ResponseTimetableV3Dto>()
  const lecture = watch()

  useEffect(() => {
    if (exchangeMode === ExchangeModeEnum.NONE) {
      setExchangeType(0)
      setChangeDay1(0)
      setChangeDay2(0)
    }
  }, [lecture.id])

  useEffect(() => setWeeksDays([t('basic_schedule'), ...WeekList(year, semester)]), [year, semester])

  const { data: klasses } = useAdminCommonFindAllKlassBySchool({ year })
  useEffect(() => klasses?.[0] && setKlassId(klasses[0].id), [klasses])
  const klass = klasses?.find((k) => k.id === klassId)

  const uniqueKlasses = useMemo(() => {
    return klasses?.reduce((acc: ResponseGroupDto[], current) => {
      const x = acc.find((item) => item.id === current.id)
      if (!x) {
        acc.push(current)
      }
      return acc
    }, [])
  }, [klasses])

  const { data: klubs } = useAdminCommonFindGroupByteacherBySchool(
    { year, teacherId },
    {
      query: {
        enabled: target === TimetableTarget.TEACHER && !!teacherId,
      },
    },
  )

  const uniqueKlubs = useMemo(() => {
    return klubs?.reduce((acc: ResponseGroupDto[], current) => {
      const x = acc.find((item) => item.id === current.id)
      if (!x) {
        acc.push(current)
      }
      return acc
    }, [])
  }, [klubs])

  const { data: studentsOrg } = useAdminCommonSearchStudents({ year, klass: klass?.name ?? '' })
  const students = useMemo(() => {
    return (
      studentsOrg?.items
        //@ts-ignore
        .filter((student) => !student.notAttend)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) ?? []
    )
  }, [studentsOrg])

  useEffect(() => {
    if (students[0]) {
      setStudentId(students[0].id)
    }
  }, [students])

  const { data: teachers } = useAdminCommonSearchTeachers({ year })
  useEffect(() => {
    if (teachers && teachers.items && teachers.items.length > 0 && teacherId === 0) {
      setTeacherId(teachers.items[0].id)
    }
  }, [teachers, teacherId])

  const uniqueTeacher = useMemo(() => {
    return teachers?.items.reduce((acc: ResponseTeacherInfoDto[], current) => {
      const x = acc.find((item) => item.id === current.id)
      if (!x) {
        acc.push(current)
      }
      return acc
    }, [])
  }, [teachers])

  const { data: timetable } = useTimetableManagementGetTimeTable({
    year,
    groupId: target === TimetableTarget.KLASS || target === TimetableTarget.STUDENT ? klassId : undefined,
    userId: target === TimetableTarget.STUDENT ? studentId : target === TimetableTarget.TEACHER ? teacherId : undefined,
    semester,
    week: weekNum,
  })

  const { data: lectureInfo } = useTimetableManagementGetLectureInfoWithWeek(lecture.id, weekNum, {
    query: { enabled: !!lecture.id },
  })

  const { categoryData: codeSubjects } = useCodeByCategoryName(Category.subjectType)

  useEffect(
    () =>
      timetable &&
      reset(
        timetable.find((l) => lecture.day === l.day && lecture.time === l.time) ?? {
          day: lecture.day,
          time: lecture.time,
          subject: '',
          room: '',
        },
      ),
    [timetable],
  )

  useEffect(() => {
    if (subjectInput) {
      subjectInputRef.current?.focus()
    }
  }, [subjectInput])

  const fetchRegistJobs = async () => {
    const registJobs = await schoolManagementGetRegistTimetable()
    setNeisIng(registJobs)
  }

  async function resetExcel(type: string) {
    if (type === 'file') {
      if (!confirm(`시간표 등록시 사용된 엑셀 파일을 삭제할까요? 등록된 시간표는 유지 됩니다.`)) return
      await schoolManagementResetLecture()
      await fetchRegistJobs()
    } else {
      if (type === 'student') {
        if (!confirm(`학생들의 이동수업을 초기화 하시겠습니까? 초기화 후 학생시간표를 다시 등록하세요.`)) return
      } else if (type === 'all') {
        if (!confirm(`전체시간표를 초기화 하시겠습니까? 초기화 후 엑셀파일을 다시 등록하세요.`)) return
      }
      await timetableManagementResetLecture(type, { year, semester })
    }
  }

  useEffect(() => {
    if (bulkRegMode && neisRegType === NeisExcelModeEnum.PROGRESS) {
      fetchRegistJobs()
    } else if (bulkRegMode && neisRegType === NeisExcelModeEnum.STUDENT) {
      const hasNeisTotal = neisIng.some((item) => item.timeTableType === 'neis-total')
      if (!hasNeisTotal) {
        alert('1.학급시간표를 먼저 등록한 후, 학생시간표를 등록하세요.')
      }
    }
    resetDocuments()
  }, [neisRegType, bulkRegMode])

  async function save(params: ResponseTimetableV3Dto) {
    let reqParams = {
      ...params,
      year: `${year}`,
      semester,
      type: lecType,
      validityWeek: exchangeStartWeekNum,
      validityEndWeek: exchangeEndWeekNum,
    }

    if (subjectInput) {
      reqParams = { ...reqParams, subject: subjectUser }
    }

    if (target === TimetableTarget.TEACHER) {
      reqParams.type = LectureType.MOVE // 선생님은 분반수업만 수정하도록 막음.
    } else if (target === TimetableTarget.KLASS) {
      reqParams.groupId = klassId || 0
    }

    await timetableManagementCreateMoveLecture(weekNum, lecture.id || 0, reqParams)

    setEditMode(false)
  }

  async function deleteLecture() {
    if (!lecture.id) return
    if (!confirm(`${lecture.subject} 수업을 삭제할까요?`)) return
    await timetableManagementDeleteLecture(lecture.id)
  }

  function getWeekIndex(weekNum: number) {
    return weeksDays.findIndex((item) => item.includes(weekNum.toString() + '주'))
  }

  async function handleExchangeButton() {
    if (exchangeType === ExchangeEnum.NONE) {
      alert('수업교환방식(보강 또는 교체)을 선택하세요.')
      return
    }

    if (klassId) {
      if (exchangeMode === ExchangeModeEnum.DAY) {
        const reqParams = {
          groupId: target === TimetableTarget.TEACHER ? -1 : klassId,
          year,
          semester,
          validityWeek: exchangeStartWeekNum,
          validityEndWeek: exchangeEndWeekNum,
          day1: changeDay1,
          day2: changeDay2,
          exchangeMode: exchangeType === ExchangeEnum.COPY ? 'copy' : 'swap',
        }

        await timetableManagementTradeLectureDay(reqParams)
      } else if (exchangeMode === ExchangeModeEnum.LECTURE && lecture2 && lecture1) {
        const reqParams = {
          groupId: target === TimetableTarget.TEACHER ? -1 : klassId,
          year,
          semester,
          validityWeek: exchangeStartWeekNum,
          validityEndWeek: exchangeEndWeekNum,
          lectureId1: lecture1.id || 0,
          day1: lecture1.day,
          time1: lecture1.time,
          lectureId2: lecture2.id || 0,
          day2: lecture2.day,
          time2: lecture2.time,
          exchangeMode: exchangeType === ExchangeEnum.COPY ? 'copy' : 'swap',
        }

        await timetableManagementTradeLecture(reqParams)
      }

      //setModalOpen(false);
      setLecture1(undefined)
      setLecture2(undefined)
      setExchangeMode(ExchangeModeEnum.NONE)
    }
  }

  const { documentObjectMap, handleDocumentAdd, toggleDocumentDelete, resetDocuments } = useImageAndDocument({})

  const { handleUploadFile } = useFileUpload()

  async function handleSubmitNeisTimeTable(timeTableType: string) {
    if (!confirm(`나이스 시간표를 등록할까요?`)) return

    // file document 처리
    const documentFiles = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && value.document instanceof File)
      .map((value) => value.document) as File[]
    const documentFileNames = await handleUploadFile(UploadFileTypeEnum['school/timetable'], documentFiles)

    for (const fileName of documentFileNames) {
      const reqParams = {
        filePath: fileName,
        fileType: 'excel',
        timeTableType,
        validityWeek: weekNum,
        validityEndWeek: weekNum === 0 ? 100 : weekNum,
      }

      await schoolManagementRegistTimetable(reqParams)
    }

    setToastMsg('나이스 시간표를 등록요청 했습니다.')

    setNeisRegType(NeisExcelModeEnum.PROGRESS)
  }

  function cancelExchange() {
    setLecture2(undefined)
    setExchangeMode(ExchangeModeEnum.NONE)
  }

  function initExchangeWeek() {
    setExchangeStartWeekIndex(0)
    setExchangeStartWeekNum(weekNum)
    setExchangeEndWeekIndex(0)
    setExchangeEndWeekNum(weekNum)
  }

  return (
    <div className="flex">
      <Admin.Section className="w-1/2">
        <Admin.H2>{t('class_schedule')}</Admin.H2>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              <option value={1}>{t('first_semester')}</option>
              <option value={2}>{t('second_semester')}</option>
            </Select>
            <Select
              value={weekIndex}
              onChange={(e) => {
                const index = Number(e.target.value)

                const weekNumber = weeksDays[index].match(/(\d+)주/)
                if (weekNumber && index > 0) {
                  setWeekNum(parseInt(weekNumber[1], 10))
                  setWeekIndex(index)
                } else {
                  setWeekNum(0)
                  setWeekIndex(0)
                }

                cancelExchange()
              }}
            >
              {weeksDays?.map((k, index) => (
                <option key={index} value={index}>
                  {k}
                </option>
              ))}
            </Select>
          </div>
          <Button.sm children="일괄등록" onClick={() => setBulkRegMode((prev) => !prev)} className="outlined-gray" />
        </div>
        <div className="flex w-full gap-2">
          <Select value={target} onChange={(e) => setTarget(e.target.value as TimetableTarget)}>
            {Object.entries(TimetableTarget).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </Select>
          {(target === TimetableTarget.KLASS || target === TimetableTarget.STUDENT) && (
            <Select value={klassId} onChange={(e) => setKlassId(Number(e.target.value))}>
              {uniqueKlasses?.map((k: ResponseGroupDto) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </Select>
          )}
          {target === TimetableTarget.STUDENT && (
            <Select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {getNickName(s.nickName)}
                </option>
              ))}
            </Select>
          )}
          {target === TimetableTarget.TEACHER && (
            <Select value={teacherId} onChange={(e) => setTeacherId(Number(e.target.value))}>
              {uniqueTeacher
                ?.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {getNickName(t.nickName)}
                  </option>
                ))}
            </Select>
          )}
        </div>

        <div className="w-full">
          <table className="timetable w-full">
            <thead>
              <tr>
                {daysOfWeekString.slice(0, hasSaturdayClass ? 7 : 6).map((day: string, index) => (
                  <th key={index}>
                    {index > 0 && (
                      <button
                        onClick={() => {
                          if (exchangeMode === ExchangeModeEnum.NONE) {
                            reset()
                            setChangeDay1(index)
                            setChangeDay2(0)

                            setExchangeMode(ExchangeModeEnum.DAY)
                          } else if (exchangeMode === ExchangeModeEnum.DAY) {
                            if (changeDay1 !== index) {
                              setExchangeType(ExchangeEnum.NONE)
                              setChangeDay2(index)

                              //setModalOpen(true);
                            }
                          }
                        }}
                        className={clsx(
                          'h-full w-full',
                          exchangeMode === ExchangeModeEnum.DAY && changeDay1 === index
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-50',
                        )}
                      >
                        {day}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {range(1, lastPeriod + 1).map((time) => (
                <tr key={time}>
                  <th>{time}</th>
                  {range(1, hasSaturdayClass ? 7 : 6).map((day) => {
                    const lec = timetable?.find((l) => day === l.day && time === l.time)
                    return (
                      <td key={day} className="text-sm">
                        <button
                          onClick={() => {
                            setEditMode(false)
                            setSubjectInput(false)
                            if (exchangeMode === ExchangeModeEnum.LECTURE) {
                              if (lecture.day !== day || lecture.time !== time) {
                                setExchangeType(ExchangeEnum.NONE)
                                setLecture2({
                                  id: lec?.id,
                                  day,
                                  time,
                                  teacherName: lec?.teacherName,
                                  subject: lec?.subject,
                                })

                                //setModalOpen(true);
                              }
                            } else {
                              setExchangeType(ExchangeEnum.NONE)
                              if (target !== TimetableTarget.STUDENT || lec) {
                                let room = ''

                                if (target === TimetableTarget.KLASS) {
                                  const selected = klasses?.find((k) => k.id === klassId)
                                  room = selected?.name || ''
                                }

                                setLecType(lec?.type || LectureType.UNKNOWN)

                                if (
                                  lec?.subject &&
                                  lec?.subject !== '' &&
                                  !uniqueKlasses?.map((el) => el.teacherGroupSubject)?.includes(lec?.subject)
                                ) {
                                  setSubjectInput(true)
                                  setSubjectUser(lec?.subject)
                                }

                                initExchangeWeek()
                                reset(lec ?? { day, time, subject: '', room, type: LectureType.UNKNOWN, teacherId })
                              }
                            }
                          }}
                          className={clsx(
                            'h-full w-full',
                            day === lecture?.day && time === lecture.time ? 'bg-gray-100' : 'hover:bg-gray-50',
                          )}
                        >
                          {lec?.subject ? lec?.subject : lec?.type === LectureType.SELECT ? '분반수업' : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Admin.Section>

      {bulkRegMode ? (
        <Admin.Section className="w-1/2">
          <Admin.H2>시간표 일괄 등록</Admin.H2>
          <div>
            <Label.Text children="나이스 엑셀 파일 등록" />
            <div>
              <div className="flex">
                <button
                  key={'reg1'}
                  onClick={(event) => {
                    event.stopPropagation()
                    console.log('onClick : 등록현황')

                    if (neisRegType === NeisExcelModeEnum.PROGRESS) {
                      fetchRegistJobs()
                    } else {
                      setNeisRegType(NeisExcelModeEnum.PROGRESS)
                    }
                  }}
                  className={`flex-1 border border-gray-300 px-4 py-2 text-center ${
                    neisRegType === NeisExcelModeEnum.PROGRESS
                      ? 'border-b-white bg-white font-bold'
                      : 'bg-gray-100 text-gray-500'
                  } first:rounded-tl-md last:rounded-tr-md`}
                >
                  등록현황
                </button>

                <button
                  key={'reg2'}
                  onClick={(event) => {
                    event.stopPropagation()
                    console.log('onClick : 학급시간표')
                    setNeisRegType(NeisExcelModeEnum.TOTAL)
                  }}
                  className={`flex-1 border border-gray-300 px-4 py-2 text-center ${
                    neisRegType === NeisExcelModeEnum.TOTAL
                      ? 'border-b-white bg-white font-bold'
                      : 'bg-gray-100 text-gray-500'
                  } first:rounded-tl-md last:rounded-tr-md`}
                >
                  1. 학급시간표
                </button>

                <button
                  key={'reg3'}
                  onClick={(event) => {
                    event.stopPropagation()
                    console.log('onClick : 학생시간표')
                    setNeisRegType(NeisExcelModeEnum.STUDENT)
                  }}
                  className={`flex-1 border border-gray-300 px-4 py-2 text-center ${
                    neisRegType === NeisExcelModeEnum.STUDENT
                      ? 'border-b-white bg-white font-bold'
                      : 'bg-gray-100 text-gray-500'
                  } first:rounded-tl-md last:rounded-tr-md`}
                >
                  2. 학생시간표
                </button>
              </div>
              <div className="rounded-b-md border border-t-0 border-gray-300 bg-white py-4">
                {neisRegType === NeisExcelModeEnum.PROGRESS && (
                  <>
                    <div className="h-128 overflow-y-auto px-4">
                      {neisIng.map((item) => (
                        <div key={item.id} className="my-1 flex items-center space-x-3">
                          <div
                            className={clsx(
                              'w-24 flex-shrink-0 rounded-md border px-2 py-1 text-center text-sm',
                              item.timeTableType === 'neis-total' ? `text-blue-500` : 'text-orange-400',
                            )}
                          >
                            {item.timeTableType === 'neis-total'
                              ? '학급시간표'
                              : item.timeTableType === 'neis-student'
                                ? '학생시간표'
                                : item.timeTableType}
                          </div>
                          <div className="flex-grow truncate">
                            <div className="text-13 flex items-center space-x-2">
                              <div className="text-lightpurple-4 w-full px-2 whitespace-pre-wrap">
                                <a
                                  href={`${Constants.imageUrl}${item.filePath}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={getFileNameFromUrl(item.filePath)}
                                >
                                  {item.validityWeek === 0 ? '[기본시간표] ' : `[${item.validityWeek}주시간표] `}
                                  {item.filePath.substring(item.filePath.indexOf('_') + 1)}
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="w-40 flex-shrink-0">
                            <div className="flex flex-row-reverse items-center">
                              <div
                                className={clsx(
                                  'w-14 rounded-md px-2 py-1 text-center text-sm font-bold',
                                  item.status === 'FAILED' ? `bg-red-400 text-white` : 'text-text_black bg-green-300',
                                )}
                              >
                                {item.status === 'READY'
                                  ? '대기중'
                                  : item.status === 'SUCCESS'
                                    ? '성공'
                                    : item.status === 'FAILED'
                                      ? '실패'
                                      : item.status}
                              </div>
                              {item.status === 'SUCCESS' && (
                                <div className="mr-3 text-sm">
                                  {DateUtil.formatDate(item.updatedAt, DateFormat['MM-DD HH:mm'])}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-t-gray-300 px-4 pt-4">
                      <div className="flex space-x-2">
                        <Button.lg
                          children="학생 이동수업 초기화"
                          onClick={() => resetExcel('student')}
                          className="outlined-primary"
                        />
                        <Button.lg
                          children="전체 시간표 초기화"
                          onClick={() => resetExcel('all')}
                          className="outlined-primary"
                        />
                      </div>
                      <Button.lg
                        children="등록파일 삭제"
                        onClick={() => resetExcel('file')}
                        className="outlined-primary"
                      />
                    </div>
                  </>
                )}

                {neisRegType === NeisExcelModeEnum.TOTAL && (
                  <div className="px-4">
                    <FileUpload onChange={handleDocumentAdd} className="mt-1 h-80 overflow-y-auto">
                      {[...documentObjectMap].map(([key, value]) => (
                        <DocumentObjectComponent
                          key={key}
                          id={key}
                          documentObjet={value}
                          onDeleteClick={toggleDocumentDelete}
                        />
                      ))}
                      {documentObjectMap.size === 0 && (
                        <div className="flex h-64 items-center justify-center"> 학급시간표를 드래그하세요. </div>
                      )}
                    </FileUpload>
                    {weekIndex > 0 && <div className="text-red-500">※ 주의 : {weekNum}주차 시간표에만 적용됩니다.</div>}
                    <Button.lg
                      children="나이스 학급시간표 등록하기"
                      onClick={() => handleSubmitNeisTimeTable('neis-total')}
                      className="outlined-gray mt-5 w-full"
                    />
                  </div>
                )}

                {neisRegType === NeisExcelModeEnum.STUDENT && (
                  <div className="px-4">
                    <FileUpload onChange={handleDocumentAdd} className="mt-1 h-80 overflow-y-auto">
                      {[...documentObjectMap].map(([key, value]) => (
                        <DocumentObjectComponent
                          key={key}
                          id={key}
                          documentObjet={value}
                          onDeleteClick={toggleDocumentDelete}
                        />
                      ))}
                      {documentObjectMap.size === 0 && (
                        <div className="flex h-64 items-center justify-center"> 학생시간표를 드래그하세요. </div>
                      )}
                    </FileUpload>
                    {weekIndex > 0 && <div className="text-red-500">※ 주의 : {weekNum}주차 시간표에만 적용됩니다.</div>}
                    <Button.lg
                      children="나이스 학생 개인시간표 등록하기"
                      onClick={() => handleSubmitNeisTimeTable('neis-student')}
                      className="outlined-gray mt-5 w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <Label.col>
            <Label.Text children="나이스 API 연동" />

            <Button.lg children="나이스 시간표 가져오기" onClick={loadNEISTimetable} className="outlined-gray w-full" />
          </Label.col> */}
          <Button.lg children="일괄등록 종료" onClick={() => setBulkRegMode(false)} className="filled-gray w-full" />
        </Admin.Section>
      ) : exchangeMode === ExchangeModeEnum.DAY ? (
        <>
          <Admin.Section className="w-1/2">
            <Admin.H2>수업 교환 (요일 전체)</Admin.H2>
            <div className="text-sm text-red-500">
              {weekNum === 0
                ? `기본시간표 : ${year}년도 ${semester}학기`
                : `임시시간표 : ${weeksDays[weekIndex]}에 반영됩니다.`}
            </div>

            <div className="w-full text-lg font-bold text-red-500">시간표에서 교환할 요일을 선택하세요.</div>

            <Button.lg
              children="수업교환 취소"
              onClick={() => setExchangeMode(ExchangeModeEnum.NONE)}
              className="outlined-gray mt-2"
            />
          </Admin.Section>
        </>
      ) : (
        <>
          {lecture.day && lecture.time && (
            <Admin.Section className="w-1/2">
              <Admin.H2>수업 {lecture.id ? (editMode ? '수정' : '') : '추가'}</Admin.H2>
              {lecture.id && (
                <div className="text-sm text-red-500">
                  {lecture.validityWeek === 0
                    ? `기본시간표 : ${year}년도 ${semester}학기`
                    : `임시시간표 : ${weeksDays[getWeekIndex(lecture.validityWeek)]} 부터 ${
                        lecture.validityEndWeek === 100 ? '학기끝' : weeksDays[getWeekIndex(lecture.validityEndWeek)]
                      } 까지 반영됩니다.`}
                </div>
              )}

              {(editMode || !lecture.id) && (
                <div className="flex items-center space-x-2">
                  <div className="rounded-md border border-gray-200 px-4 py-[6px] text-sm">{weeksDays[weekIndex]}</div>
                  <span className="">부터</span>

                  <Select
                    value={exchangeEndWeekIndex}
                    onChange={(e) => {
                      const index = Number(e.target.value)

                      if (index < exchangeStartWeekIndex) {
                        setExchangeEndWeekNum(exchangeStartWeekNum)
                        setExchangeEndWeekIndex(exchangeStartWeekIndex)
                        return
                      }

                      const weekNumber = weeksDays[weekIndex + index].match(/(\d+)주/)
                      if (weekNumber && index > 0) {
                        setExchangeEndWeekNum(parseInt(weekNumber[1], 10))
                        setExchangeEndWeekIndex(index)
                      } else {
                        setWeekNum(0)
                        setWeekIndex(0)
                      }
                    }}
                  >
                    {weeksDays?.slice(weekIndex).map((k, index) => (
                      <option key={index} value={index}>
                        {k}
                      </option>
                    ))}
                  </Select>
                  <span className="">까지</span>
                </div>
              )}

              {target !== TimetableTarget.KLASS && (
                <Label.col>
                  <Label.Text children="학급 또는 그룹" />
                  {editMode || !lecture.id ? (
                    <Select.lg
                      {...register('groupId', {
                        required: true,
                        setValueAs: (v) => Number(v),
                        disabled: !!lecture.id && target === TimetableTarget.STUDENT,
                        onChange: (e) => {
                          const KlassItem = klasses?.find((klass) => klass.id === Number(e.target.value))

                          if (KlassItem) {
                            setLecType(LectureType.FIX)
                            setSubjectInput(false)
                            if (KlassItem.name) {
                              setValue('room', KlassItem.name)
                            }
                          } else {
                            const klubItem = klubs?.find((klub) => klub.id === Number(e.target.value))

                            if (klubItem) {
                              setLecType(LectureType.MOVE)
                              if (klubItem.teacherGroupSubject) {
                                setSubjectUser(klubItem.teacherGroupSubject)
                                setSubjectInput(true)
                              } else {
                                setSubjectInput(false)
                              }

                              if (klubItem.teacherGroupRoom) {
                                setValue('room', klubItem.teacherGroupRoom)
                              }
                            }
                          }
                        },
                      })}
                    >
                      <option key={0} value={0}>
                        선택해주세요.
                      </option>
                      {target !== TimetableTarget.TEACHER &&
                        uniqueKlasses?.map((klass) => (
                          <option key={klass.id} value={klass.id}>
                            {klass.name}
                          </option>
                        ))}

                      {target === TimetableTarget.TEACHER &&
                        uniqueKlubs?.map((klub) => (
                          <option key={klub.id} value={klub.id}>
                            {klub.name}
                          </option>
                        ))}
                    </Select.lg>
                  ) : (
                    <p>{lecture.groupName}</p>
                  )}
                </Label.col>
              )}

              {((editMode === false && !!lecture.id) || target === TimetableTarget.KLASS) && (
                <Label.col>
                  <Label.Text children="수업구분" />
                  {editMode || !lecture.id ? (
                    <>
                      <Select.lg
                        {...register('type', {
                          onChange: (e) => {
                            if (e.target.value === 'SELECT') {
                              setLecType(target === TimetableTarget.TEACHER ? LectureType.MOVE : LectureType.SELECT)
                            } else {
                              if (e.target.value === 'EMPTY') {
                                setValue('subject', '' as string)
                                setSubjectUser('공강')
                                setValue('teacherId', 0 as number)
                              }

                              setLecType(LectureType.FIX)
                            }
                          },
                        })}
                      >
                        <option value={'FIX'}>고정수업</option>
                        <option value={'SELECT'}>분반수업</option>
                        <option value={'EMPTY'}>공강</option>
                      </Select.lg>
                    </>
                  ) : (
                    <p>{lecture.type === LectureType.FIX ? '고정수업' : '분반수업'}</p>
                  )}
                </Label.col>
              )}

              <Label.col>
                <Label.Text children="과목명" />
                {editMode || !lecture.id ? (
                  <>
                    {subjectInput ? (
                      // <TextInput placeholder="과목명을 입력하세요." {...register('subject', form.length(1, 100))} />
                      <TextInput
                        ref={subjectInputRef}
                        placeholder="과목명을 입력하세요."
                        value={subjectUser}
                        maxLength={100}
                        onChange={(e) => setSubjectUser(e.target.value)}
                      />
                    ) : (
                      <Select.lg
                        {...register('subject', {
                          onChange: (e) => {
                            if (!subjectInput) {
                              if (e.target.value === '직접입력') {
                                setSubjectInput(true)
                                setValue('subject', '' as string)
                              } else {
                                setSubjectInput(false)
                                setValue('subject', e.target.value)
                              }
                            }
                          },
                        })}
                      >
                        {codeSubjects
                          ?.sort((a, b) => {
                            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                          })
                          .map((t) => (
                            <option key={t.id} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                        <option value={'직접입력'}>직접입력</option>
                      </Select.lg>
                    )}
                    <Label.Error children={errors.subject?.message} />
                  </>
                ) : (
                  <p>{lecture.subject}</p>
                )}
              </Label.col>
              <Label.col>
                <Label.Text children="교실" />
                {editMode || !lecture.id ? (
                  <>
                    <TextInput placeholder="교실" {...register('room', form.length(1, 100))} />
                    <Label.Error children={errors.room?.message} />
                  </>
                ) : (
                  <p>{lecture.room}</p>
                )}
              </Label.col>
              {/* {target !== TimetableTarget.TEACHER && ( */}
              <Label.col>
                <Label.Text children="선생님" />
                {editMode || !lecture.id ? (
                  <Select.lg
                    {...register('teacherId', {
                      required: lecType !== LectureType.SELECT,
                      setValueAs: (v) => Number(v),
                      disabled: !!lecture.id && target === TimetableTarget.STUDENT,
                    })}
                  >
                    <option key={0} value={0}>
                      공강
                    </option>
                    {uniqueTeacher
                      ?.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {getNickName(t.nickName)} {t.email}
                        </option>
                      ))}
                  </Select.lg>
                ) : (
                  <p>
                    {' '}
                    {(() => {
                      const teacher = uniqueTeacher?.find((t) => t.id === lecture.teacherId)
                      return teacher ? `${teacher.name} ${getNickName(teacher.nickName)}` : null
                    })()}
                  </p>
                )}
              </Label.col>
              {/* )} */}

              {target === TimetableTarget.STUDENT ||
              (target === TimetableTarget.TEACHER && lecture.type === LectureType.FIX) ? (
                <>
                  {target === TimetableTarget.STUDENT && (
                    <div>학생 시간표는 학급 및 이동수업 시간표에 따라 설정되므로 직접 수정할 수 없습니다.</div>
                  )}
                  {target === TimetableTarget.TEACHER && lecture.type === LectureType.FIX && (
                    <div>고정수업은 학급 시간표에서 추가/수정 할 수 있습니다.</div>
                  )}
                </>
              ) : (
                <>
                  <Label.col>
                    <Label.Text children="학생목록" />
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1">
                      {lectureInfo?.studentList?.map((s) => (
                        <TooltipButton
                          key={s.id}
                          moveTo={{ to: `${Routes.admin.student.index}/${s.userId}`, title: '새탭에 학생정보 열기' }}
                          className="flex flex-col"
                        >
                          <Tooltip value={`${s.klass} ${s.studentNumber}번`} showArrow placement="top">
                            <div
                              // to={`${Routes.admin.student.index}/${s.userId}`}
                              className="flex h-14 w-14 items-center justify-center border text-sm hover:bg-gray-50"
                            >
                              {s.userName}
                              <br />
                              {getNickName(s.userNickName)}
                            </div>
                          </Tooltip>
                        </TooltipButton>
                      ))}
                    </div>
                  </Label.col>

                  {exchangeMode !== ExchangeModeEnum.NONE && (
                    <div className="w-full text-lg font-bold text-red-500">
                      {exchangeMode === ExchangeModeEnum.LECTURE
                        ? '시간표에서 교환할 수업을 선택하세요.'
                        : '시간표에서 교환할 요일을 선택하세요.'}
                    </div>
                  )}

                  {editMode || !lecture.id ? (
                    <div className="flex gap-4">
                      {lecture.id && (
                        <Button.lg
                          children="삭제"
                          disabled={lecture.validityWeek !== weekNum}
                          onClick={deleteLecture}
                          className="outlined-gray mt-2 flex-1"
                        />
                      )}
                      <Button.lg
                        children="저장"
                        disabled={!isValid}
                        onClick={handleSubmit(save)}
                        className="filled-gray mt-2 flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {exchangeMode === ExchangeModeEnum.NONE ? (
                        <>
                          <Button.lg
                            children="수정"
                            onClick={() => {
                              initExchangeWeek()
                              setEditMode(!editMode)
                            }}
                            className="outlined-gray mt-2 flex-1"
                          />
                          <Button.lg
                            children="수업교환"
                            onClick={() => {
                              initExchangeWeek()
                              setLecture1(lecture)
                              setExchangeMode(ExchangeModeEnum.LECTURE)
                            }}
                            className="filled-gray mt-2 flex-1"
                          />
                        </>
                      ) : (
                        <Button.lg
                          children="수업교환 취소"
                          onClick={cancelExchange}
                          className="outlined-gray mt-2 flex-1"
                        />
                      )}
                      {/* {exchangeMode === ExchangeModeEnum.NONE && (
                    <Button.lg
                      children="수업교환"
                      onClick={() => setExchangeMode(ExchangeModeEnum.LECTURE)}
                      className="filled-gray mt-2 flex-1"
                    />
                  )} */}
                    </div>
                  )}
                </>
              )}
            </Admin.Section>
          )}
        </>
      )}

      {exchangeMode !== ExchangeModeEnum.NONE && (
        <div className="fixed right-4 bottom-4 w-[600px] rounded-2xl border-1 border-gray-400 bg-gray-50 p-1 shadow-2xl">
          <Section>
            <div className="w-full text-center text-lg font-bold text-gray-900">
              수업교환 방식을 선택하고 교환 버튼을 클릭하세요.
            </div>

            {exchangeMode === ExchangeModeEnum.DAY && (
              <div className="flex items-center space-x-2">
                <div className="w-2/5 text-center">
                  <div className="border-b border-gray-300">{daysOfWeekString[Number(changeDay1)]}요일</div>
                  {exchangeType === ExchangeEnum.SWAP ? (
                    <div className="mt-2">{daysOfWeekString[Number(changeDay2)]}요일 수업</div>
                  ) : (
                    <div className="mt-2">{daysOfWeekString[Number(changeDay1)]}요일 수업</div>
                  )}
                </div>
                <div className="h-full w-1/5 cursor-pointer space-y-2">
                  <Button.sm
                    onClick={() => setExchangeType(ExchangeEnum.COPY)}
                    className={`${
                      exchangeType === ExchangeEnum.COPY ? 'outlined-primary' : 'outlined-gray'
                    } h-10 w-full flex-1`}
                  >
                    →<br />
                    보강
                  </Button.sm>
                  <Button.sm
                    onClick={() => setExchangeType(ExchangeEnum.SWAP)}
                    className={`${
                      exchangeType === ExchangeEnum.SWAP ? 'outlined-primary' : 'outlined-gray'
                    } h-10 w-full flex-1`}
                  >
                    ↔<br />
                    교체
                  </Button.sm>
                </div>
                <div className="w-2/5 text-center">
                  <div className="border-b border-gray-300">{daysOfWeekString[Number(changeDay2)]}요일</div>
                  {exchangeType === ExchangeEnum.NONE ? (
                    <div className="mt-2">{daysOfWeekString[Number(changeDay2)]}요일 수업</div>
                  ) : (
                    <div className="mt-2">{daysOfWeekString[Number(changeDay1)]}요일 수업</div>
                  )}
                </div>
              </div>
            )}

            {exchangeMode === ExchangeModeEnum.LECTURE && (
              <div className="flex items-center space-x-2">
                <div className="w-2/5 text-center">
                  <div className="border-b border-gray-300">{`${daysOfWeekString[Number(lecture.day)]}요일 ${
                    lecture.time
                  }교시`}</div>
                  {exchangeType === ExchangeEnum.SWAP && lecture2 ? (
                    <>
                      <div className="mt-2">{lecture2.subject}</div>
                      <div className="mt-2">{lecture2.teacherName} 선생님</div>
                    </>
                  ) : (
                    <>
                      <div className="mt-2">{lecture1?.subject}</div>
                      <div className="mt-2">{lecture1?.teacherName} 선생님</div>
                    </>
                  )}
                </div>
                <div className="h-full w-1/5 cursor-pointer space-y-2">
                  <Button.sm
                    onClick={() => setExchangeType(ExchangeEnum.COPY)}
                    className={`${
                      exchangeType === ExchangeEnum.COPY ? 'outlined-primary' : 'outlined-gray'
                    } h-10 w-full flex-1`}
                  >
                    →<br />
                    보강
                  </Button.sm>
                  <Button.sm
                    onClick={() => setExchangeType(ExchangeEnum.SWAP)}
                    className={`${
                      exchangeType === ExchangeEnum.SWAP ? 'outlined-primary' : 'outlined-gray'
                    } h-10 w-full flex-1`}
                  >
                    ↔<br />
                    교체
                  </Button.sm>
                </div>
                <div className="w-2/5 text-center">
                  {lecture2 ? (
                    <>
                      <div className="border-b border-gray-300">{`${daysOfWeekString[Number(lecture2.day)]}요일 ${
                        lecture2.time
                      }교시`}</div>
                      {exchangeType === ExchangeEnum.NONE ? (
                        <>
                          <div className="mt-2">{lecture2.subject}</div>
                          <div className="mt-2">{lecture2.teacherName} 선생님</div>
                        </>
                      ) : (
                        <>
                          <div className="mt-2">{lecture1?.subject}</div>
                          <div className="mt-2">{lecture1?.teacherName} 선생님</div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-red-500">시간표에서 교환할 수업을 선택하세요.</div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-2 border-t border-gray-300 p-2">
              <div className="rounded-md border border-gray-200 px-4 py-[6px] text-sm">{weeksDays[weekIndex]}</div>
              <span className="">부터</span>

              <Select
                value={exchangeEndWeekIndex}
                onChange={(e) => {
                  const index = Number(e.target.value)

                  if (index < exchangeStartWeekIndex) {
                    setExchangeEndWeekNum(exchangeStartWeekNum)
                    setExchangeEndWeekIndex(exchangeStartWeekIndex)
                    return
                  }

                  const weekNumber = weeksDays[weekIndex + index].match(/(\d+)주/)
                  if (weekNumber && index > 0) {
                    setExchangeEndWeekNum(parseInt(weekNumber[1], 10))
                    setExchangeEndWeekIndex(index)
                  } else {
                    setWeekNum(0)
                    setWeekIndex(0)
                  }
                }}
              >
                {weeksDays?.slice(weekIndex).map((k, index) => (
                  <option key={index} value={index}>
                    {k}
                  </option>
                ))}
              </Select>
              <span className="">까지</span>
            </div>
            <div className="flex cursor-pointer justify-between space-x-2">
              <Button.lg children="취소" onClick={cancelExchange} className="outlined-gray w-full" />
              <Button.lg children="교환" onClick={handleExchangeButton} className="outlined-gray w-full" />
            </div>
          </Section>
        </div>
      )}

      {/* <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">

        <Section className="mt-7">
          <div className="w-full text-center text-lg font-bold text-gray-900">
            수업교환 방식을 선택하고 교환 버튼을 클릭하세요.
          </div>

          {exchangeMode === ExchangeModeEnum.DAY && (
            <div className="flex items-center space-x-2">
              <div className="w-2/5 text-center">
                <div className="border-b border-gray-300">{daysOfWeekString[Number(changeDay1)]}요일</div>
                {exchangeType === ExchangeEnum.SWAP ? (
                  <div className="mt-2">{daysOfWeekString[Number(changeDay2)]}요일 수업</div>
                ) : (
                  <div className="mt-2">{daysOfWeekString[Number(changeDay1)]}요일 수업</div>
                )}
              </div>
              <div className="h-full w-1/5 cursor-pointer space-y-2">
                <Button.sm
                  onClick={() => setExchangeType(ExchangeEnum.COPY)}
                  className={`${
                    exchangeType === ExchangeEnum.COPY ? 'outlined-primary' : 'outlined-gray'
                  } h-10 w-full flex-1`}
                >
                  →<br />
                  보강
                </Button.sm>
                <Button.sm
                  onClick={() => setExchangeType(ExchangeEnum.SWAP)}
                  className={`${
                    exchangeType === ExchangeEnum.SWAP ? 'outlined-primary' : 'outlined-gray'
                  } h-10 w-full flex-1`}
                >
                  ↔<br />
                  교체
                </Button.sm>
              </div>
              <div className="w-2/5 text-center">
                <div className="border-b border-gray-300">{daysOfWeekString[Number(changeDay2)]}요일</div>
                {exchangeType === ExchangeEnum.NONE ? (
                  <div className="mt-2">{daysOfWeekString[Number(changeDay2)]}요일 수업</div>
                ) : (
                  <div className="mt-2">{daysOfWeekString[Number(changeDay1)]}요일 수업</div>
                )}
              </div>
            </div>
          )}

          {exchangeMode === ExchangeModeEnum.LECTURE && lecture2 && (
            <div className="flex items-center space-x-2">
              <div className="w-2/5 text-center">
                <div className="border-b border-gray-300">{`${daysOfWeekString[Number(lecture.day)]}요일 ${
                  lecture.time
                }교시`}</div>
                {exchangeType === ExchangeEnum.SWAP ? (
                  <>
                    <div className="mt-2">{lecture2.subject}</div>
                    <div className="mt-2">{lecture2.teacherName} 선생님</div>
                  </>
                ) : (
                  <>
                    <div className="mt-2">{lecture.subject}</div>
                    <div className="mt-2">{lecture.teacherName} 선생님</div>
                  </>
                )}
              </div>
              <div className="h-full w-1/5 cursor-pointer space-y-2">
                <Button.sm
                  onClick={() => setExchangeType(ExchangeEnum.COPY)}
                  className={`${
                    exchangeType === ExchangeEnum.COPY ? 'outlined-primary' : 'outlined-gray'
                  } h-10 w-full flex-1`}
                >
                  →<br />
                  보강
                </Button.sm>
                <Button.sm
                  onClick={() => setExchangeType(ExchangeEnum.SWAP)}
                  className={`${
                    exchangeType === ExchangeEnum.SWAP ? 'outlined-primary' : 'outlined-gray'
                  } h-10 w-full flex-1`}
                >
                  ↔<br />
                  교체
                </Button.sm>
              </div>
              <div className="w-2/5 text-center">
                <div className="border-b border-gray-300">{`${daysOfWeekString[Number(lecture2.day)]}요일 ${
                  lecture2.time
                }교시`}</div>
                {exchangeType === ExchangeEnum.NONE ? (
                  <>
                    <div className="mt-2">{lecture2.subject}</div>
                    <div className="mt-2">{lecture2.teacherName} 선생님</div>
                  </>
                ) : (
                  <>
                    <div className="mt-2">{lecture.subject}</div>
                    <div className="mt-2">{lecture.teacherName} 선생님</div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center space-x-2 border-t border-gray-300 p-2">
            <div className="rounded-md border border-gray-200 px-4 py-[6px] text-sm">{weeksDays[weekIndex]}</div>
            <span className="">부터</span>

            <Select
              value={exchangeEndWeekIndex}
              onChange={(e) => {
                const index = Number(e.target.value);

                if (index < exchangeStartWeekIndex) {
                  setExchangeEndWeekNum(exchangeStartWeekNum);
                  setExchangeEndWeekIndex(exchangeStartWeekIndex);
                  return;
                }

                const weekNumber = weeksDays[weekIndex + index].match(/(\d+)주/);
                if (weekNumber && index > 0) {
                  setExchangeEndWeekNum(parseInt(weekNumber[1], 10));
                  setExchangeEndWeekIndex(index);
                } else {
                  setWeekNum(0);
                  setWeekIndex(0);
                }
              }}
            >
              {weeksDays?.slice(weekIndex).map((k, index) => (
                <option key={index} value={index}>
                  {k}
                </option>
              ))}
            </Select>
            <span className="">까지</span>
          </div>
          <div className="flex cursor-pointer justify-between space-x-2">
            <Button.lg children="취소" onClick={() => setModalOpen(false)} className="outlined-gray w-full" />
            <Button.lg children="교환" onClick={handleExchangeButton} className="outlined-gray w-full" />
          </div>
        </Section>
      </SuperModal> */}
    </div>
  )
}
