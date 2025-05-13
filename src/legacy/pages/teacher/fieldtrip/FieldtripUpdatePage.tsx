import clsx from 'clsx'
import { eachDayOfInterval } from 'date-fns'
import { chain, concat, every, flatten, get } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectValues, SuperModal } from '@/legacy/components'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { Badge, Blank, Label, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { Icon } from '@/legacy/components/common/icons'
import { FieldtripDatePicker } from '@/legacy/components/fieldtrip/FieldtripDatePicker'
import { useTeacherFieldtripUpdate } from 'src/container/teacher-fieldtrip-update'
import { Fieldtrip, ResponseUserDto } from '@/legacy/generated/model'
import { getCustomString } from '@/legacy/util/string'
import { differenceWithSchedulesWithHalfDay, makeDateToString2 } from '@/legacy/util/time'

interface FieldtripUpdatePageProps {
  fieldtrip: Fieldtrip
  me: ResponseUserDto
  setReadState: () => void
  isConfirmed: boolean
}

const relationshipType = ['부', '모', '기타']
const fieldtripTypes = ['가족동반여행', '친·인척 방문', '답사∙견학 활동', '체험활동']

export function FieldtripUpdatePage({ fieldtrip, me, setReadState, isConfirmed }: FieldtripUpdatePageProps) {
  const { t } = useTranslation()

  const hasSaturdayClass = me?.school.hasSaturdayClass || false

  const type = fieldtrip?.type
  const [modalOpen, setModalOpen] = useState(false)
  const [updateReason, setUpdateReason] = useState('')
  const [fieldtripType, setFieldtripType] = useState(fieldtripTypes[0])
  const [count, setCount] = useState(0)
  const [holidays, setHolidays] = useState<Date[]>([])
  const [notSelectableDates, setNotSelectableDates] = useState<Date[]>([])
  const [excludeDates, setExcludeDates] = useState<Date[]>([])

  const [startHalf, setStartHalf] = useState(fieldtrip?.startPeriodS > 0)
  const [startPeriodS, setStartPeriodS] = useState<number>(fieldtrip?.startPeriodS || 0)
  const [endHalf, setEndHalf] = useState(fieldtrip?.endPeriodE > 0)
  const [endPeriodE, setEndPeriodE] = useState<number>(fieldtrip?.endPeriodE || 0)

  const [wholeDayPeriod, setWholeDayPeriod] = useState(fieldtrip?.wholeDayPeriod || '')

  const [sHalfUsedDayCnt, setSHalfUsedDayCnt] = useState(0.0) // 시작반일 사용시 0.5 fix
  const [wholeUsedDayCnt, setWholeUsedDayCnt] = useState(1.0) // 반일 외 사용일수
  const [eHalfUsedDayCnt, setEHalfUsedDayCnt] = useState(0.0) // 종료반일 사용시 0.5 fix
  const [sHalfDate, setSHalfDate] = useState('')
  const [wholeStartDate, setWholeStartDate] = useState('')
  const [wholeEndDate, setWholeEndDate] = useState('')
  const [eHalfDate, setEHalfDate] = useState('')

  const [dayHomePlan, setDayHomePlan] = useState(false)

  const [infoHalfDayModalopen, setInfoHalfDayModalopen] = useState(false)

  const {
    content,
    purpose,
    accommodation,
    destination,
    guideName,
    guidePhone,
    relationship,
    relationshipText,
    homePlan,
    prevUsedDays,
    usedDays,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    reportedAt,
    setReportedAt,
    cannotSchedules,
    overseas,
    setOverseas,
    setContent,
    setDestination,
    setPurpose,
    setAccommodation,
    setGuideName,
    setGuidePhone,
    setRelationship,
    setRelationshipText,
    setHomePlan,
    setUsedDays,
    errorMessage,
    updateFieldtripByTeacher,
    isLoading,

    startAtDate,
    setStartAtDate,
    endAtDate,
    setEndAtDate,
  } = useTeacherFieldtripUpdate({
    fieldtrip,
    updateReason,
    setReadState,
    fieldtripType,
    wholeDayPeriod,
    startHalf,
    startPeriodS,
    endHalf,
    endPeriodE,
  })

  useEffect(() => {
    if (homePlan[0] && homePlan[0].day) {
      setDayHomePlan(true)
    } else {
      setDayHomePlan(false)
    }
  }, [fieldtrip])

  enum RejectScheduleType {
    HOLIDAY = '공휴일',
    NOT_SELECTABLE = '체험학습지정불가',
  }

  const _checkFillHomePlanContent = () => {
    let checkKeys = ['content1', 'subject1']
    if (dayHomePlan) {
      checkKeys = ['day', 'content']
    }

    return every(homePlan, (plan) => {
      return every(checkKeys, (key) => {
        const value = get(plan, key, null)
        return !!value
      })
    })
  }

  const _uniqDate = (date: Date, i: number, self: Date[]) => {
    return self.findIndex((d) => d.getTime() === date.getTime()) === i
  }

  const clearHomePlane = () => {
    const _homePlan = (n: number) => {
      return new Array(n).fill(0).map(() => {
        return {}
      })
    }
    setHomePlan(_homePlan(usedDays))
  }

  useEffect(() => {
    if (startAtDate && endAtDate) {
      //const _usedDays = differenceWithSchedules(startAt, endAt, cannotSchedules);
      //setUsedDays(_usedDays);
      const {
        totalUsedDayCnt: _totalUsedDayCnt,
        sHalfUsedDayCnt: _sHalfUsedDayCnt,
        wholeUsedDayCnt: _wholeUsedDayCnt,
        eHalfUsedDayCnt: _eHalfUsedDayCnt,
        sHalfDate: _sHalfDate,
        wholeStartDate: _wholeStartDate,
        wholeEndDate: _wholeEndDate,
        eHalfDate: _eHalfDate,
      } = differenceWithSchedulesWithHalfDay(
        startAtDate,
        endAtDate,
        startHalf,
        endHalf,
        cannotSchedules,
        hasSaturdayClass,
      )

      setUsedDays(_totalUsedDayCnt)
      setSHalfUsedDayCnt(_sHalfUsedDayCnt)
      setWholeUsedDayCnt(_wholeUsedDayCnt)
      setEHalfUsedDayCnt(_eHalfUsedDayCnt)
      setSHalfDate(_sHalfDate)
      setWholeStartDate(_wholeStartDate)
      setWholeEndDate(_wholeEndDate)
      setWholeDayPeriod(_wholeStartDate + '~' + _wholeEndDate)
      setEHalfDate(_eHalfDate)
    }
  }, [startAtDate, endAtDate, startHalf, endHalf])

  useEffect(() => {
    if (type === 'HOME') {
      const _homePlan = (n: number) => {
        return new Array(n).fill(0).map(() => {
          return {}
        })
      }

      if (!prevUsedDays) {
        if (!homePlan.length) {
          setHomePlan(_homePlan(usedDays))
        }
        return
      }

      if (prevUsedDays < usedDays) {
        const diffDays = usedDays - prevUsedDays
        setHomePlan(concat(homePlan, _homePlan(diffDays)))
        return
      }

      if (prevUsedDays > usedDays) {
        const diffDays = usedDays - prevUsedDays
        const _homePlan = homePlan.slice(0, diffDays)
        setHomePlan(_homePlan)
        return
      }
    }
  }, [usedDays, prevUsedDays])

  useEffect(() => {
    const holidaySchedules = chain(cannotSchedules)
      .filter((schedule) => schedule.attendee === RejectScheduleType.HOLIDAY)
      .map((schedule) => {
        return eachDayOfInterval({
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        })
      })
      .value()
    const excludeSchedules = chain(cannotSchedules)
      .filter((schedule) => schedule.attendee === RejectScheduleType.NOT_SELECTABLE)
      .map((schedule) => {
        return eachDayOfInterval({
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        })
      })
      .value()
    setNotSelectableDates(flatten(excludeSchedules).filter(_uniqDate))
    setHolidays(flatten(holidaySchedules).filter(_uniqDate))
    setExcludeDates(concat(flatten(excludeSchedules), flatten(holidaySchedules)).filter(_uniqDate))
  }, [cannotSchedules])

  const buttonDisabled =
    type === 'HOME'
      ? !destination || !_checkFillHomePlanContent()
      : !content || !destination || !guideName || !guidePhone || !relationship || !relationshipText

  return (
    <div className="scroll-box h-screen-10 md:h-screen-3 overflow-y-scroll rounded-lg border bg-white py-5">
      {isLoading && <Blank reversed />}
      <Section>
        <h1 className="text-xl font-semibold">
          {makeDateToString2(startAtDate || '')} ~ {makeDateToString2(endAtDate || '')} ({usedDays}) 일간{' '}
        </h1>

        <div className="space-y-3 pb-6">
          <div className="mb-2 text-lg whitespace-pre-line">
            남은 일수&nbsp;
            <span className="text-brand-1 underline">
              {fieldtrip ? fieldtrip.currentRemainDays : me?.remainDaysOfFieldtrip}일 중 {usedDays}일을 신청
            </span>
            합니다.
          </div>
          <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
            ※<span className="font-bold">토,일, 개교기념일 등 학교 휴업일</span>은 체험학습 신청 일수에 넣지 않음.
          </div>
          <div className="flex">
            <div className="text-lg font-bold text-gray-800">
              *{type === 'HOME' ? '가정' : '교외 체험'}학습 계획 작성
            </div>
          </div>
          {type === 'SUBURBS' && (
            <div className="w-full">
              <SelectValues
                selectValues={fieldtripTypes}
                label="*체험학습 형태"
                onChange={(f) => setFieldtripType(f)}
                value={fieldtripType}
                className={fieldtripType ? 'border-gray-300' : 'border-red-700'}
              />
            </div>
          )}
          {/* {type === 'SUBURBS' && ( */}
          <div>
            <label className="mb-1 text-sm text-gray-800">*신고일</label>
            <div className="flex items-center">
              <input
                id="startAt"
                type="date"
                value={reportedAt}
                className="focus:border-brand-1 h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                onChange={(e) => {
                  setReportedAt(e.target.value)
                }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 text-sm text-gray-800">*기간</label>
            <div className="space-y-3 pb-6">
              <div>
                {/* <div className="flex items-center">
                  <input
                    id="startAt"
                    type="date"
                    value={startAt.substring(0, 10)}
                    className="h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:border-brand-1 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    onChange={(e) => {
                      setStartAt(e.target.value);
                    }}
                  />
                  <span className="ml-3 flex-shrink-0">부터</span>
                </div> */}

                <div className="flex flex-row items-center">
                  <FieldtripDatePicker
                    selectedDate={startAtDate}
                    excludeDates={excludeDates}
                    hasSaturdayClass
                    placeholderText="시작 날짜"
                    onChange={(selectedDate) => {
                      if (!selectedDate) {
                        return
                      }
                      if (!endAtDate || selectedDate > endAtDate) {
                        setEndAtDate(selectedDate)
                      }
                      setStartAtDate(selectedDate)
                    }}
                  />
                  <span>부터</span>
                </div>

                {type === 'SUBURBS' && (
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center py-2" onClick={() => setInfoHalfDayModalopen(true)}>
                      반일 신청 <Icon.Info className="ml-2 h-7 w-7" />
                    </span>
                    <ToggleSwitch
                      checked={startHalf}
                      onChange={() => {
                        setStartHalf(!startHalf)
                      }}
                    />
                    {/* {!startHalf && <span className="my-2">종일 결석합니다.</span>} */}
                    {startHalf && (
                      <>
                        <SelectValues
                          placeholder="선택"
                          selectValues={['1', '2', '3', '4', '5', '6', '7', '8']}
                          value={startPeriodS.toString()}
                          onChange={(stime: string) => {
                            setStartPeriodS(Number(stime))
                          }}
                          className={
                            startPeriodS !== 0 ? 'border border-gray-300 py-1' : 'border-2 border-red-700 py-1'
                          }
                        />
                        <span className="text-sm">교시부터 (0.5일)</span>
                      </>
                    )}
                  </div>
                )}

                {/* <div className="flex items-center">
                  <input
                    id="endAt"
                    type="date"
                    value={endAt.substring(0, 10)}
                    className="h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:border-brand-1 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    onChange={(e) => {
                      setEndAt(e.target.value);
                    }}
                  />
                  <span className="ml-3 flex-shrink-0">까지</span>
                </div> */}
                <div className="flex flex-row items-center">
                  <FieldtripDatePicker
                    disabled={!startAtDate}
                    selectedDate={endAtDate}
                    minDate={startAtDate}
                    excludeDates={excludeDates}
                    //maxDate={maxDate}
                    hasSaturdayClass
                    placeholderText={!startAtDate ? '시작 날짜를 먼저 선택해주세요' : '종료 날짜'}
                    onChange={(selectedDate) => {
                      if (!selectedDate) {
                        return
                      }
                      if (startAtDate && selectedDate < startAtDate) {
                        setStartAtDate(selectedDate)
                      }
                      setEndAtDate(selectedDate)
                    }}
                  />
                  <span>까지</span>
                </div>
                {type === 'SUBURBS' && (
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center py-2" onClick={() => setInfoHalfDayModalopen(true)}>
                      반일 신청 <Icon.Info className="ml-2 h-7 w-7" />
                    </span>
                    <ToggleSwitch
                      checked={endHalf}
                      onChange={() => {
                        setEndHalf(!endHalf)
                      }}
                    />
                    {/* {!endHalf && <span className="my-4">종일 결석합니다.</span>} */}

                    {endHalf && (
                      <>
                        <SelectValues
                          placeholder="선택"
                          selectValues={['1', '2', '3', '4', '5', '6', '7', '8', '9']}
                          value={endPeriodE}
                          onChange={(etime: string) => {
                            setEndPeriodE(Number(etime))
                          }}
                          className={endPeriodE !== 0 ? 'border border-gray-300 py-1' : 'border-2 border-red-700 py-1'}
                        />
                        <span className="text-sm">교시까지 (0.5일)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-4 text-sm text-gray-500">
                {sHalfUsedDayCnt > 0 && (
                  <div>
                    반일기준 : {sHalfDate} ({sHalfUsedDayCnt}일)
                  </div>
                )}
                {wholeUsedDayCnt > 0 && (
                  <div className="text-sm whitespace-pre-line">
                    1일 기준 : {wholeDayPeriod} ({wholeUsedDayCnt}일)
                  </div>
                )}
                {eHalfUsedDayCnt > 0 && (
                  <div className="text-sm whitespace-pre-line">
                    반일기준 : {eHalfDate} ({eHalfUsedDayCnt}일)
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* )} */}
          {type === 'SUBURBS' && (
            <Label.col>
              <Label.Text children="*목적지" />
              <TextInput
                placeholder="목적지를 입력해주세요."
                value={destination}
                disabled={type !== 'SUBURBS'}
                onChange={(e) => setDestination(e.target.value)}
                className={destination ? 'border-gray-300' : 'border-red-700'}
              />
              <div className="flex items-center space-x-2">
                <span>{t(getCustomString(me?.school?.id, 'oversea'), '해외')} 여부</span>
                <ToggleSwitch
                  checked={overseas}
                  onChange={() => {
                    setOverseas(!overseas)
                  }}
                />
                <span>
                  {overseas
                    ? `(${t(getCustomString(me?.school?.id, 'oversea'), '해외')})`
                    : `(${t(getCustomString(me?.school?.id, 'domestic'), '도내')})`}
                </span>
              </div>
            </Label.col>
          )}
          {type === 'SUBURBS' && (
            <Label.col>
              <Label.Text children="*목적" />
              <Textarea
                maxLength={75}
                placeholder="할아버지 칠순 잔치 참석 겸 대구에 살고 있는 조부모와 친척들을 만나 가족 간 화합과 우애를 다지는 기회를 얻고자 함."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={purpose ? 'border-gray-300' : 'border-red-700'}
              />
            </Label.col>
          )}
          {type === 'SUBURBS' && (
            <>
              <Label.col>
                <Label.Text children="*숙박장소(숙박일정이 있는 경우)" />
                <TextInput
                  placeholder="숙박장소를 입력해주세요."
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                  className={accommodation ? 'border-gray-300' : 'border-red-700'}
                />
              </Label.col>
              <Label.col>
                <Label.Text children="*인솔자명" />
                <TextInput
                  placeholder="보호자 이름을 입력해주세요."
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  className={guideName ? 'border-gray-300' : 'border-red-700'}
                />
              </Label.col>

              <div className="w-full">
                <SelectValues
                  label="*관계"
                  selectValues={relationshipType}
                  placeholder="기타"
                  value={relationship !== '부' && relationship !== '모' ? '기타' : relationship}
                  onChange={(g) => {
                    setRelationship(g)
                    if (g === '부' || g === '모') {
                      setRelationshipText(g)
                    } else {
                      setRelationshipText('')
                    }
                  }}
                  className={relationship ? 'border-gray-300' : 'border-red-700'}
                />
                {relationship !== '부' && relationship !== '모' && (
                  <TextInput
                    placeholder="인솔자와의 관계를 입력해 주세요."
                    value={relationshipText}
                    onChange={(g) => setRelationshipText(g.target.value)}
                  />
                )}
              </div>

              <Label.col>
                <Label.Text children="*인솔자 연락처" />
                <TextInput
                  placeholder="보호자 연락처를 입력해주세요."
                  value={guidePhone}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                    setGuidePhone(e.target.value)
                  }}
                  className={guidePhone ? 'border-gray-300' : 'border-red-700'}
                />
              </Label.col>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-800">
                  *현장학습 계획 작성 <span className="text-sm font-normal text-red-600">{count}자</span>
                </div>
              </div>
              <Textarea
                placeholder={
                  '경주 역사 유적을 둘러보며 신라의 역사와 불교문화에 대해 알아봄. \n- 교외 체험학습 계획\n4월 03일(월) : (오전) 짐 싸기, (오후) 대구로 이동\n4월 04일(화) : (오전/오후) 할아버지 칠순 잔치 준비(요리 돕기), (저녁) 할아버지 칠순 잔치\n4월 05일(수) : (오후) 대구 친척들과 만남, (저녁) 경주로 이동 \n4월 06일(목) : (오전/오후) 집으로 이동, (저녁) 짐 풀기 및 휴식'
                }
                rows={11}
                value={content}
                onChange={(e) => {
                  const maxLength = 500
                  if (e.target.value.length > maxLength) {
                    e.target.value = e.target.value.slice(0, maxLength)
                  }
                  setContent(e.target.value)
                  setCount(e.target.value.length)
                }}
                className="h-auto border"
              />
            </>
          )}
          {type === 'HOME' && (
            <>
              {fieldtrip?.type === 'HOME' && fieldtrip?.usedDays > 1 && homePlan?.length === 1 && (
                <div className="mx-5 mt-2 text-red-500">
                  ※ 전 일정 동일한 계획으로 가정학습을 신청합니다.
                  <br /> {'  '} 일차별 학습 계획 필요시, 반려 후 학생이 수정해야 합니다.
                </div>
              )}
              {/* <div className="flex justify-between items-center">
                <div className="font-bold text-gray-800 text-lg">*가정학습 계획 작성</div>
              </div> */}

              <div className="flex w-full items-center justify-center space-x-2 py-4">
                <Badge
                  children="교시기준 작성"
                  onClick={() => {
                    clearHomePlane()
                    setDayHomePlan(false)
                  }}
                  className={clsx('py-1.5 text-lg', dayHomePlan ? 'bg-white text-black' : 'bg-brand-1 text-white')}
                />
                <Badge
                  children="일차기준 작성"
                  onClick={() => {
                    clearHomePlane()
                    setDayHomePlan(true)
                  }}
                  className={clsx('py-1.5 text-lg', dayHomePlan ? 'bg-brand-1 text-white' : 'bg-white text-black')}
                />
              </div>

              {homePlan.map((plan: any, i: number) => (
                <div key={i} className="space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="pb-4 text-center text-lg font-bold text-gray-800">{i + 1}일차</div>
                  {dayHomePlan ? (
                    <Label.col>
                      <Label.Text children="*학습할 내용" />
                      <Textarea
                        placeholder="일차별 학습내용을 입력합니다."
                        rows={5}
                        value={plan['content'] || ''}
                        onChange={(e) => {
                          const maxLength = 130
                          if (e.target.value.length > maxLength) {
                            e.target.value = e.target.value.slice(0, maxLength)
                          }
                          const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                          newHomePlan[i]['day'] = i + 1
                          newHomePlan[i]['content'] = e.target.value
                          setHomePlan(newHomePlan)
                        }}
                        className={clsx(
                          'h-auto border',
                          content ? 'border border-gray-300' : 'border-2 border-red-700',
                        )}
                      />
                    </Label.col>
                  ) : (
                    <>
                      <Label.col>
                        <Label.Text children="*1교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject1'] || ''}
                          className={plan['subject1'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject1'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content1'] || ''}
                          className={plan['content1'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content1'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*2교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject2'] || ''}
                          className={plan['subject2'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject2'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content2'] || ''}
                          className={plan['content2'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content2'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*3교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject3'] || ''}
                          className={plan['subject3'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject3'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content3'] || ''}
                          className={plan['content3'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content3'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*4교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject4'] || ''}
                          className={plan['subject4'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject4'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content4'] || ''}
                          className={plan['content4'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content4'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*5교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject5'] || ''}
                          className={plan['subject5'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject5'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content5'] || ''}
                          className={plan['content5'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content5'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*6교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject6'] || ''}
                          className={plan['subject6'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject6'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content6'] || ''}
                          className={plan['content6'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content6'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*7교시 교과명" />
                        <TextInput
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject7'] || ''}
                          className={plan['subject7'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject7'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content7'] || ''}
                          className={plan['content7'] ? 'border-gray-300' : 'border-red-700'}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content7'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                        />
                      </Label.col>
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="grid w-full grid-flow-row gap-2">
            {[...imageObjectMap].map(([key, value]) => (
              <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
            ))}
            <ImageUpload
              onChange={(e) => {
                if (!e.target.files?.[0]) return
                if (!e.target.files?.[0]?.type?.includes('image')) return alert('이미지 파일만 업로드 가능합니다.')
                handleImageAdd(e)
              }}
            />
          </div>
        </div>
        <div className="mt-3 flex w-full items-center space-x-2">
          <Button.xl
            children="수정하기"
            disabled={buttonDisabled}
            onClick={() => {
              if (startHalf && !startPeriodS) {
                alert('시작일의 반일신청 교시가 지정되지 않았습니다. ')
                return
              }

              if (endHalf && !endPeriodE) {
                alert('종료일의 반일신청 교시가 지정되지 않았습니다. ')
                return
              }

              if (isConfirmed) {
                setModalOpen(true)
              } else {
                updateFieldtripByTeacher()
              }
            }}
            className="filled-primary w-full"
          />
          <Button.xl children="취소하기" onClick={() => setReadState()} className="filled-gray w-full" />
        </div>

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            이 체험학습 신청서를 수정하시는 이유를 적어주세요.
          </div>
          <Textarea placeholder="수정 이유" value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} />
          <Button.xl children="수정하기" onClick={() => updateFieldtripByTeacher()} className="filled-primary" />
        </Section>
      </SuperModal>
      <SuperModal modalOpen={infoHalfDayModalopen} setModalClose={() => setInfoHalfDayModalopen(false)}>
        <div className="font-smibold text-brand-1 mt-5 text-center text-lg">체험학습 반일 신청 안내</div>
        <div className="mt-6 mr-6 mb-6 ml-6 text-xs whitespace-pre-line">
          {`* 교외체험학습 신청시, 수업중 일부만 출석하고 일부는 결석하는 경우에 반일 신청을 합니다. 
            ex1) 아침에 등교했다가 조퇴하고 할머니댁에 가는 경우
            ex2) 여행을 다녀와서 등교 시각보다 조금 늦게 학교에 가는 경우
                
            * 시작일과 종료일에 반일을 지정할 수 있으며, 반일은 0.5일로 계산합니다. 
            단, 반일 사용 여부는 소속 학교 규정을 따릅니다. 	
            
            * 반일 신청은 하루 동안의 전체 수업 중 절반 이상을 참석해야 합니다. 
             - 5교시 수업일 : 2시간(교시)까지 불참 가능
                - 6교시 수업일 : 3시간(교시)까지 불참 가능
                - 7교시 수업일 : 3시간(교시)까지 불참 가능`}
        </div>

        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            onClick={() => setInfoHalfDayModalopen(false)}
            className="text-littleblack w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold"
          />
        </div>
      </SuperModal>
    </div>
  )
}
