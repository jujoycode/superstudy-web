import clsx from 'clsx'
import { addDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { chain, concat, every, findIndex, flatten, get, last } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank, SelectValues, SuperModal } from '@/legacy/components'
import {
  BackButton,
  Badge,
  Blank,
  Label,
  PhoneNumberField,
  Section,
  Textarea,
  TopNavbar,
} from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Icon } from '@/legacy/components/common/icons'
import { MobileImageUpload } from '@/legacy/components/common/MobileImageUpload'
import { SignDataCheck, SignPad, ToSign } from '@/legacy/components/common/SignPad'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { WarningBlank } from '@/legacy/components/common/WarningBlank'
import { FieldtripDatePicker } from '@/legacy/components/fieldtrip/FieldtripDatePicker'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useStudentFieldtripAddSuburbs } from '@/legacy/container/student-fieldtrip-add-suburbs'
import { UserContainer } from '@/legacy/container/user'
import { Fieldtrip, Role } from '@/legacy/generated/model'
import { getCustomString } from '@/legacy/util/string'
import { differenceWithSchedulesWithHalfDay, isWeekendDay } from '@/legacy/util/time'
import { childState } from '@/stores'

const relationshipType = ['부', '모', '기타']
const selectOptions = ['가족동반여행', '친·인척 방문', '답사∙견학 활동', '체험활동']

enum RejectScheduleType {
  HOLIDAY = '공휴일',
  NOT_SELECTABLE = '체험학습지정불가',
}

type MatchParams = {
  type?: string // 체험학습 신청서 생성하는 경우
  id?: string // 체험학습 신청서 수정하는 경우
}

interface FieldtripAddPageProps {
  fieldtripData?: Fieldtrip
  returnToDetail?: () => void
}

export function FieldtripAddPage({ fieldtripData, returnToDetail }: FieldtripAddPageProps) {
  const params = useParams<MatchParams>()
  const [matchParamsType, setMatchParamsType] = useState<string | undefined>(undefined)

  const { me } = UserContainer.useContext()
  let hasSaturdayClass = me?.school.hasSaturdayClass || false
  const myChild = useRecoilValue(childState)
  if (me?.role === Role.PARENT) {
    hasSaturdayClass = myChild?.school.hasSaturdayClass || false
  }

  const { t } = useTranslation()

  useEffect(() => {
    if (params.type) {
      //matchParamsType = params.type;
      setMatchParamsType(params.type)
    } else if (fieldtripData?.type) {
      //matchParamsType = fieldtripData?.type;
      setMatchParamsType(fieldtripData?.type)
    }
  }, [fieldtripData, params])

  const [startAt, setStartAt] = useState<Date | null>(
    fieldtripData?.startAt ? new Date(fieldtripData.startAt) : new Date(),
  )
  const [startHalf, setStartHalf] = useState(
    fieldtripData?.startPeriodS && fieldtripData?.startPeriodS > 0 ? true : false,
  )
  const [startPeriodS, setStartPeriodS] = useState(fieldtripData?.startPeriodS || 0)
  const [endAt, setEndAt] = useState<Date | null>(fieldtripData?.endAt ? new Date(fieldtripData.endAt) : new Date())
  const [endHalf, setEndHalf] = useState(fieldtripData?.endPeriodE && fieldtripData?.endPeriodE > 0 ? true : false)
  const [endPeriodE, setEndPeriodE] = useState(fieldtripData?.endPeriodE || 0)
  const [wholeDayPeriod, setWholeDayPeriod] = useState(fieldtripData?.wholeDayPeriod || '')
  const [maxDate, setMaxDate] = useState<Date | null>(null)
  const [holidays, setHolidays] = useState<Date[]>([])
  const [notSelectableDates, setNotSelectableDates] = useState<Date[]>([])
  const [excludeDates, setExcludeDates] = useState<Date[]>([])
  const [count, setCount] = useState(0)

  const [sHalfUsedDayCnt, setSHalfUsedDayCnt] = useState(0.0) // 시작반일 사용시 0.5 fix
  const [wholeUsedDayCnt, setWholeUsedDayCnt] = useState(1.0) // 반일 외 사용일수
  const [eHalfUsedDayCnt, setEHalfUsedDayCnt] = useState(0.0) // 종료반일 사용시 0.5 fix
  const [sHalfDate, setSHalfDate] = useState('')
  const [eHalfDate, setEHalfDate] = useState('')

  const [dayHomePlan, setDayHomePlan] = useState(false)

  const [infoHalfDayModalopen, setInfoHalfDayModalopen] = useState(false)

  const {
    cannotSchedules,
    error,
    openModal,
    hideModal,
    isLoading,
    isOpenSignModal,
    updateFieldtrip,
    createFieldtrip,
    prevUsedDays,
    isHomePlanType,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    setState: {
      setPurpose,
      setContent,
      setAccommodation,
      setAgree,
      setStudentSafeAgree,
      setDestination,
      setOverseas,
      setGuideName,
      setGuidePhone,
      setParentsName,
      setParentsPhone,
      setUsedDays,
      setRelationship,
      setRelationshipText,
      setSuburbsModalopen,
      setHomeModalopen,
      setHomePlan,
      setSelectOption,
    },
    state: {
      purpose,
      content,
      accommodation,
      agree,
      studentSafeAgree,
      fieldtripSafety,
      destination,
      overseas,
      guideName,
      guidePhone,
      parentsName,
      parentsPhone,
      usedDays,
      relationship,
      relationshipText,
      suburbsModalopen,
      homeModalopen,
      homePlan,
      success,
      errorMessage,
      approverName,
      selectOption,
    },
  } = useStudentFieldtripAddSuburbs<MatchParams>({
    fieldtripData,
    startAt,
    startPeriodS,
    startHalf,
    endAt,
    endPeriodE,
    endHalf,
    wholeDayPeriod,
    returnToDetail,
    selectOptions,
    params,
  })

  const { push } = useHistory()

  const _uniqDate = (date: Date, i: number, self: Date[]) => {
    return self.findIndex((d) => d.getTime() === date.getTime()) === i
  }

  useEffect(() => {
    if (homePlan[0] && homePlan[0].day) {
      setDayHomePlan(true)
    } else {
      setDayHomePlan(false)
    }
  }, [fieldtripData, homePlan])

  const clearHomePlane = () => {
    const _homePlan = (n: number) => {
      return new Array(n).fill(0).map(() => {
        return {}
      })
    }
    setHomePlan(_homePlan(usedDays))
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

  const handleInputChange = (text: string) => {
    const count = (text.match(/\n/g) || []).length
    return count
  }

  useEffect(() => {
    if (startAt && isWeekendDay(startAt, hasSaturdayClass)) {
      setStartAt(null)
      return
    }

    if (endAt && isWeekendDay(endAt, hasSaturdayClass)) {
      setEndAt(null)
      return
    }
    if (startAt && endAt) {
      //const _usedDays = differenceWithSchedules(startAt, endAt, cannotSchedules);
      const {
        totalUsedDayCnt: _totalUsedDayCnt,
        sHalfUsedDayCnt: _sHalfUsedDayCnt,
        wholeUsedDayCnt: _wholeUsedDayCnt,
        eHalfUsedDayCnt: _eHalfUsedDayCnt,
        sHalfDate: _sHalfDate,
        wholeStartDate: _wholeStartDate,
        wholeEndDate: _wholeEndDate,
        eHalfDate: _eHalfDate,
      } = differenceWithSchedulesWithHalfDay(startAt, endAt, startHalf, endHalf, cannotSchedules, hasSaturdayClass)

      setUsedDays(_totalUsedDayCnt)
      setSHalfUsedDayCnt(_sHalfUsedDayCnt)
      setWholeUsedDayCnt(_wholeUsedDayCnt)
      setEHalfUsedDayCnt(_eHalfUsedDayCnt)
      setSHalfDate(_sHalfDate)
      setWholeDayPeriod(_wholeStartDate + '~' + _wholeEndDate)
      setEHalfDate(_eHalfDate)
    }
  }, [startAt, endAt, startHalf, endHalf, hasSaturdayClass, cannotSchedules, setUsedDays])

  useEffect(() => {
    if (!startAt || !me) {
      return
    }
    let maxDay = 0
    const checkDays = eachDayOfInterval({
      start: startAt,
      end: addDays(startAt, me.remainDaysOfFieldtrip - 1 < 0 ? 0 : me.remainDaysOfFieldtrip - 1),
    })
    while (checkDays.length) {
      const lastCheckDay = last(checkDays)
      const day = checkDays.shift()
      if (!day) {
        continue
      }
      const findExcludeIndex = findIndex(notSelectableDates, (excludeDate) => {
        return isSameDay(day, excludeDate)
      })

      const findHolidayIndex = findIndex(holidays, (holiday) => {
        return isSameDay(day, holiday)
      })

      if (isWeekendDay(day) || findHolidayIndex !== -1) {
        checkDays.push(addDays(lastCheckDay as Date, 1))
      }
      if (findExcludeIndex !== -1) {
        setMaxDate(notSelectableDates[findExcludeIndex])
        return
      }
      maxDay++
    }
    setMaxDate(addDays(startAt, maxDay - 1))
  }, [startAt, me, notSelectableDates, holidays])

  useEffect(() => {
    if (!parentsName || !parentsPhone) {
      if (me?.role === Role.PARENT) {
        setParentsName(me.name)
        setParentsPhone(me.phone)
      } else if (me?.nokName && me?.nokPhone) {
        setParentsName(me.nokName)
        setParentsPhone(me.nokPhone)
      }
    }
  }, [me, parentsName, parentsPhone, setParentsName, setParentsPhone])

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

  useEffect(() => {
    if (isHomePlanType()) {
      const _homePlan = (n: number) => {
        return new Array(n).fill(0).map(() => {
          return {}
        })
      }

      const _prevUsedDays = homePlan.length
      const _usedDays = usedDays

      if (!_prevUsedDays) {
        if (!homePlan.length) {
          setHomePlan(_homePlan(_usedDays))
        }
        return
      }

      if (_prevUsedDays < _usedDays) {
        const diffDays = _usedDays - _prevUsedDays
        setHomePlan(concat(homePlan, _homePlan(diffDays)))
        return
      }

      if (_prevUsedDays > _usedDays) {
        const diffDays = _usedDays - _prevUsedDays
        const _homePlan = homePlan.slice(0, diffDays)
        setHomePlan(_homePlan)
        return
      }
    }
  }, [usedDays, prevUsedDays, isHomePlanType, homePlan, setHomePlan])

  const name = isHomePlanType() ? '가정' : '교외 체험'

  const buttonDisabled = isHomePlanType()
    ? !startAt ||
      !endAt ||
      !destination ||
      !_checkFillHomePlanContent() ||
      (me?.role === Role.USER && !parentsName) ||
      (me?.role === Role.USER && !parentsPhone) ||
      !agree ||
      !studentSafeAgree
    : !content ||
      !agree ||
      !studentSafeAgree ||
      !destination ||
      !guideName ||
      !guidePhone ||
      (me?.role === Role.USER && !parentsName) ||
      (me?.role === Role.USER && !parentsPhone) ||
      !startAt ||
      !endAt ||
      !relationship ||
      !relationshipText
  if (success) {
    return (
      <>
        <TopNavbar
          title="체험학습 신청서"
          left={
            <div className="h-15">
              <BackButton className="h-15" />
            </div>
          }
        />
        <div className="h-screen-15 flex w-full flex-col items-center justify-center text-center">
          <div className="text-xl font-bold text-gray-600">체험학습 신청서 제출 완료</div>
          <div className="mt-4 text-gray-400">
            체험학습 신청서 제출이 완료되었습니다. <br />
            {me?.role === Role.USER && '보호자, '}
            {approverName}의 서명 후<br />
            신청서 승인이 완료됩니다.
          </div>
        </div>
        <div className="px-2">
          <Button.lg
            children="신청서 확인하기"
            onClick={() => push(`/student/fieldtrip/${success}`)}
            className="filled-primary w-full"
          />
          <Button.lg
            children="목록으로 가기"
            onClick={() => push(`/student/fieldtrip`)}
            className="outlined-primary mt-4 w-full"
          />
        </div>
      </>
    )
  }

  return (
    <>
      {isLoading && <WarningBlank />}
      {error && <ErrorBlank />}
      <TopNavbar title="체험학습 신청서" left={<BackButton />} />
      <Section className="bg-[#F7F7F7]">
        <h1 className="text-xl font-semibold"> {name}학습 신청서</h1>

        {me?.role === Role.PARENT && (
          <>
            <Label.col>
              <Label.Text children="학생 이름" />
              <TextInput value={myChild?.name} disabled />
            </Label.col>
            <Label.col>
              <Label.Text children="학생 학년/반/번호" />
              <TextInput value={myChild?.klassGroupName + ' ' + myChild?.studentNumber + '번'} disabled />
            </Label.col>
          </>
        )}

        <label className="mb-1 text-sm text-gray-800">*기간</label>
        <div className="space-y-3 pb-6">
          <div>
            <div className="flex flex-row items-center">
              <FieldtripDatePicker
                selectedDate={startAt}
                excludeDates={excludeDates}
                hasSaturdayClass
                placeholderText="시작 날짜"
                onChange={(selectedDate) => {
                  if (!selectedDate) {
                    return
                  }
                  if (!endAt || selectedDate > endAt) {
                    setEndAt(selectedDate)
                  }
                  setStartAt(selectedDate)
                }}
              />
              <span>부터</span>
            </div>
            {isHomePlanType() === false && (
              <div className="flex items-center space-x-2">
                <span className="flex items-center py-2" onClick={() => setInfoHalfDayModalopen(true)}>
                  반일 신청{' '}
                  <div className="ml-2 h-7 w-7">
                    <Icon.Info />
                  </div>
                </span>
                <ToggleSwitch
                  checked={startHalf}
                  onChange={() => {
                    setStartHalf(!startHalf)
                  }}
                />
                {startHalf && (
                  <>
                    <SelectValues
                      placeholder="선택"
                      selectValues={['1', '2', '3', '4', '5', '6', '7', '8']}
                      value={startPeriodS.toString()}
                      onChange={(stime: string) => {
                        setStartPeriodS(Number(stime))
                      }}
                      className={startPeriodS !== 0 ? 'border border-gray-300 py-1' : 'border-2 border-red-700 py-1'}
                    />
                    <span className="text-sm">교시부터 (0.5일)</span>
                  </>
                )}
              </div>
            )}
            <div className="flex flex-row items-center">
              <FieldtripDatePicker
                disabled={!startAt}
                selectedDate={endAt}
                minDate={startAt}
                excludeDates={excludeDates}
                maxDate={maxDate}
                hasSaturdayClass
                placeholderText={!startAt ? '시작 날짜를 먼저 선택해주세요' : '종료 날짜'}
                onChange={(selectedDate) => {
                  if (!selectedDate) {
                    return
                  }
                  if (startAt && selectedDate < startAt) {
                    setStartAt(selectedDate)
                  }
                  setEndAt(selectedDate)
                }}
              />
              <span>까지</span>
            </div>

            {isHomePlanType() === false && (
              <div className="flex items-center space-x-2">
                <span className="flex items-center py-2" onClick={() => setInfoHalfDayModalopen(true)}>
                  반일 신청{' '}
                  <div className="ml-2 h-7 w-7">
                    <Icon.Info />
                  </div>
                </span>
                <ToggleSwitch
                  checked={endHalf}
                  onChange={() => {
                    setEndHalf(!endHalf)
                  }}
                />

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

          <div>
            <div className="text-lg whitespace-pre-line">
              남은 일수&nbsp;
              <span className="text-brand-1 underline">
                {fieldtripData
                  ? fieldtripData.currentRemainDays
                  : me?.role === Role.USER
                    ? me?.remainDaysOfFieldtrip
                    : myChild?.remainDaysOfFieldtrip}
                일 중 {usedDays}일을 신청
              </span>
              합니다.
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

          <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
            ※<span className="font-bold">토,일, 개교기념일 등 학교 휴업일</span>은 체험학습 신청 일수에 넣지 않음.
          </div>
          <div className="flex">
            <div className="text-lg font-bold text-gray-800">*{name}학습 계획 작성</div>
          </div>
          {isHomePlanType() === false && (
            <div className="w-full">
              <SelectValues
                selectValues={selectOptions}
                label="*체험학습 형태"
                value={selectOption}
                onChange={(f) => setSelectOption(f)}
              />
            </div>
          )}

          <Label.col>
            <Label.Text children="*목적지" />
            <TextInput
              maxLength={20}
              placeholder="목적지를 입력해주세요."
              value={destination}
              disabled={matchParamsType === 'home'}
              onChange={(e) => setDestination(e.target.value)}
              className={clsx(destination ? 'border border-gray-300' : 'border-2 border-red-700')}
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

          <Label.col>
            <Label.Text children="*목적" />
            <Textarea
              maxLength={75}
              rows={3}
              placeholder="할아버지 칠순 잔치 참석 겸 대구에 살고 있는 조부모와 친척들을 만나 가족 간 화합과 우애를 다지는 기회를 얻고자 함."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className={clsx('h-auto border', purpose ? 'border border-gray-300' : 'border-2 border-red-700')}
            />
          </Label.col>

          {isHomePlanType() === false && (
            <>
              <Label.col>
                <Label.Text children="*숙박장소(숙박일정이 있는 경우)" />
                <TextInput
                  maxLength={10}
                  placeholder="숙박장소를 입력해주세요."
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                  className={clsx(accommodation ? 'border border-gray-300' : 'border-2 border-red-700')}
                />
              </Label.col>
              <Label.col>
                <Label.Text children="*인솔자명" />
                <TextInput
                  maxLength={10}
                  placeholder="인솔자 이름을 입력해주세요."
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  className={clsx(guideName ? 'border border-gray-300' : 'border-2 border-red-700')}
                />
              </Label.col>

              <div className="w-full">
                <SelectValues
                  label="*관계"
                  selectValues={relationshipType}
                  placeholder="선택"
                  value={relationship !== '부' && relationship !== '모' ? '기타' : relationship}
                  onChange={(g) => {
                    setRelationship(g)
                    if (g === '부' || g === '모') {
                      setRelationshipText(g)
                    } else {
                      setRelationshipText('')
                    }
                  }}
                  className={
                    relationshipType.includes(relationship) ? 'border border-gray-300' : 'border-2 border-red-700'
                  }
                />
                {/* <div className="text-red-600 text-sm whitespace-pre-line mb-2">
                  *인솔자가 직계가족이 아닌 경우 현장체험학습을 불허합니다.
                </div> */}
                {relationship !== '부' && relationship !== '모' && (
                  <TextInput
                    maxLength={10}
                    placeholder="인솔자와의 관계를 입력해 주세요."
                    value={relationshipText}
                    onChange={(g) => setRelationshipText(g.target.value)}
                    className={clsx('mt-1', relationshipText ? 'border border-gray-300' : 'border-2 border-red-700')}
                  />
                )}
              </div>

              <Label.col>
                <Label.Text children="*인솔자 연락처" />
                <TextInput
                  maxLength={11}
                  placeholder="인솔자 연락처를 입력해주세요."
                  value={guidePhone}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                    setGuidePhone(e.target.value)
                  }}
                  className={clsx(guidePhone ? 'border border-gray-300' : 'border-2 border-red-700')}
                />
              </Label.col>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-800">
                  *현장학습 계획 작성{' '}
                  <span className="text-sm font-normal text-red-600">(15줄, 500자 이내) {count} / 500</span>
                </div>
                <Button.lg
                  children="예시보기"
                  onClick={() => setSuburbsModalopen(true)}
                  className="filled-primary w-24"
                />
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
                  const maxLine = 15
                  if (handleInputChange(e.target.value) < maxLine) {
                    setContent(e.target.value)
                    setCount(e.target.value.length)
                  }
                }}
                className={clsx('h-auto border', content ? 'border border-gray-300' : 'border-2 border-red-700')}
              />
            </>
          )}
          {isHomePlanType() && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-800">*학습 계획</div>
                <Button.lg children="예시보기" onClick={() => setHomeModalopen(true)} className="filled-primary w-24" />
              </div>

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
              {dayHomePlan && (
                <div className="px-3 text-red-500">
                  <p>※ 일차기준 작성 선택 가능 여부를 반드시 담임선생님께 문의 바랍니다.</p>
                  <p>※ 학교에 따라 ‘일차 기준 작성’ 선택이 불가능 할 수 있습니다.</p>
                </div>
              )}

              {homePlan.map((plan: any, i: number) => (
                <div key={i} className="space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="text-center text-lg font-bold text-gray-800">{i + 1}일차</div>
                  {dayHomePlan ? (
                    <Label.col>
                      <Label.Text
                        children={`*학습할 내용 (${
                          JSON.parse(JSON.stringify(homePlan))[i]['content']?.length || 0
                        }/140자)`}
                      />
                      <Textarea
                        placeholder="일차별 학습내용을 입력합니다."
                        rows={5}
                        value={plan['content'] || ''}
                        onChange={(e) => {
                          const maxLength = 140
                          if (e.target.value.length > maxLength) {
                            e.target.value = e.target.value.slice(0, maxLength)
                          }
                          const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                          newHomePlan[i]['day'] = i + 1
                          newHomePlan[i]['content'] = e.target.value.replace(/\n/g, ' ')
                          setHomePlan(newHomePlan)
                        }}
                        className={clsx(
                          'h-auto border',
                          plan['content'] ? 'border border-gray-300' : 'border-2 border-red-700',
                        )}
                      />
                    </Label.col>
                  ) : (
                    <>
                      <Label.col>
                        <Label.Text children="*1교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject1'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject1'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject1'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content1'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content1'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content1'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*2교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject2'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject2'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject2'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content2'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content2'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content2'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*3교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject3'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject3'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject3'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content3'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content3'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content3'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*4교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject4'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject4'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject4'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content4'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content4'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content4'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*5교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject5'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject5'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject5'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content5'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content5'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content5'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*6교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject6'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject6'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject6'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content6'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content6'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content6'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*7교시 교과명" />
                        <TextInput
                          maxLength={10}
                          placeholder="예시) 국어,영어,수학 등"
                          value={plan['subject7'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['subject7'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['subject7'] ? 'border border-gray-300' : 'border-2 border-red-700')}
                        />
                      </Label.col>
                      <Label.col>
                        <Label.Text children="*학습할 내용" />
                        <TextInput
                          maxLength={40}
                          placeholder="예시) 3-1 훈민정음"
                          value={plan['content7'] || ''}
                          onChange={(e) => {
                            const newHomePlan = JSON.parse(JSON.stringify(homePlan))
                            newHomePlan[i]['content7'] = e.target.value
                            setHomePlan(newHomePlan)
                          }}
                          className={clsx(plan['content7'] ? 'border border-gray-300' : 'border-2 border-red-700')}
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
            <MobileImageUpload
              onChange={(e) => {
                if (!e.target.files?.[0]) return
                if (!e.target.files?.[0]?.type?.includes('image')) return alert('이미지 파일만 업로드 가능합니다.')
                handleImageAdd(e)
              }}
            />
          </div>

          <Label.col>
            <Label.Text children="*학생안전" />
            <div className="text-left text-xs whitespace-pre-wrap">{fieldtripSafety}</div>
          </Label.col>
          <div className="float-right">
            <Label.row>
              <Checkbox
                checked={studentSafeAgree}
                onChange={() => setStudentSafeAgree(!studentSafeAgree)}
                className={clsx(
                  studentSafeAgree
                    ? 'disabled: border border-gray-300 bg-gray-100'
                    : 'disabled border-2 border-red-700 bg-gray-100',
                )}
              />
              <p className="text-lg font-semibold">동의함</p>
            </Label.row>
          </div>
        </div>
        {me?.role === Role.USER && (
          <>
            <Label.col>
              <Label.Text children="보호자 이름" />
              <TextInput
                maxLength={10}
                placeholder="보호자 이름을 입력해주세요."
                value={parentsName}
                disabled
                onChange={(e) => setParentsName(e.target.value)}
                className={clsx(parentsName ? 'border border-gray-300' : 'border-2 border-red-700')}
              />
            </Label.col>
            <Label.col>
              <Label.Text children="보호자 연락처" />
              <PhoneNumberField
                value={parentsPhone || '010'}
                disabled={
                  parentsPhone !== undefined &&
                  parentsPhone !== '' &&
                  parentsPhone !== '010' &&
                  parentsPhone.length >= 10
                    ? true
                    : false
                }
                onChange={(e) => setParentsPhone(e.target.value)}
                style={{
                  borderWidth: parentsPhone ? 'border' : 'border-2',
                  borderColor: !parentsPhone ? 'rgba(185, 28, 28)' : '',
                }}
              />
              <div className="mt-2 mb-2 text-xs whitespace-pre-line text-gray-600">
                * {t('parent_info_edit_my_page', '보호자 정보 수정은 보호자의 MY페이지에서만 가능합니다.')}
              </div>
            </Label.col>
          </>
        )}
        <Label.row>
          <Checkbox checked={agree} onChange={() => setAgree(!agree)} />
          <p className="text-lg font-semibold">아래 내용을 체크하셨습니까?</p>
        </Label.row>
        <p className="mt-1 rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line">
          {me?.role === Role.USER ? '-신고자는 학생 본인입니다.' : '-보호자의 지도 하에 학생과 함께 신청합니다.'}
        </p>
        <Button.lg
          children="제출하기"
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

            if (startHalf && endHalf && startAt === endAt) {
              alert('같은 날 반일신청 시작과 종료를 지정할 수 없습니다.')
              return
            }

            const regExp = /^010(?:\d{4})\d{4}$/
            if (parentsPhone && !regExp.test(parentsPhone.replace(/-/g, ''))) {
              alert('보호자 연락처를 확인해 주세요.')
              return
            }
            if (guidePhone && !regExp.test(guidePhone)) {
              alert('인솔자 연락처를 확인해 주세요.')
              return
            }

            // if (fieldtripData && fieldtripData.fieldtripStatus !== FieldtripStatus.RETURNED) {
            //   updateFieldtrip([]);
            // } else {
            openModal()
            //}
          }}
          className="filled-primary"
        />

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
      <SuperModal modalOpen={suburbsModalopen} setModalClose={() => setSuburbsModalopen(false)}>
        <div className="font-smibold text-brand-1 mt-5 text-center text-lg">현장 학습 계획 예시</div>
        <div className="mt-6 mr-6 mb-6 ml-6 text-sm whitespace-pre-line">
          {`1.할머니 칠순맞이 가족과 국내 장거리 여행
            숙박, 식사 등 활동으로 친척과의 관계를 배울 수 있다.
            칠순, 고희에 대해 배울 수 있다.

            2.통영 케이블카 탑승
            케이블카 체험을 하고 한려해상국립공원의 아름다운 자연을 배울 수 있다.

            3.식사
            남해안과 경상도 지역의 식재료 및 음식을 알 수 있다.`}
        </div>

        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            onClick={() => setSuburbsModalopen(false)}
            className="text-littleblack w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold"
          />
        </div>
      </SuperModal>
      <SuperModal modalOpen={homeModalopen} setModalClose={() => setHomeModalopen(false)}>
        <div className="font-smibold text-brand-1 mt-5 text-center text-lg">가정 학습 계획 예시</div>
        {dayHomePlan ? (
          <>
            <div className="mt-6 mr-6 mb-6 ml-6 text-sm">
              신청 일차별 학습할 내용을 입력합니다.
              <br />
              1일 1건을 작성해야 합니다.
            </div>
            <div className="mt-4 mr-7 mb-7 ml-7 space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-xl">
              <div className="text-center text-lg font-bold text-gray-800">1일차</div>
              <Label.col>
                <Label.Text children="*학습할 내용" />
                <Textarea
                  id="reason"
                  placeholder="생활 속 테셀레이션 원리 찾기를 위해 , tess 프로그램의 사용법과 사례를 분석하고 거실 벽지의 규칙성을 찾아 테셀레이션을 탐구함. "
                  className="h-40"
                />
              </Label.col>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 mr-6 mb-6 ml-6 text-sm">
              작성 시 개인 시간표와 같게 작성해야 합니다.
              <br />
              1일 1장을 작성해야 합니다.
            </div>
            <div className="mt-4 mr-7 mb-7 ml-7 space-y-4 rounded-md border border-gray-100 bg-white p-4 shadow-xl">
              <div className="pt-10 pb-4 text-center text-lg font-bold text-gray-800">1일차</div>
              <Label.col>
                <Label.Text children="*1교시 교과명" />
                <TextInput id="reason" placeholder="국어" />
              </Label.col>
              <Label.col>
                <Label.Text children="*학습할 내용" />
                <TextInput id="reason" placeholder="3-1 훈민정음" />
              </Label.col>
            </div>
          </>
        )}

        <div className="my-2 mb-5 flex w-full items-center justify-center">
          <button
            children="닫기"
            onClick={() => setHomeModalopen(false)}
            className="text-littleblack w-4/5 rounded-lg border border-gray-100 bg-gray-100 py-2 font-bold"
          />
        </div>
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
      <div className={isOpenSignModal ? '' : 'hidden'}>
        <Blank text="" />
        <SignPad
          ToSigns={me?.role === Role.USER ? [ToSign.STUDENT] : [ToSign.STUDENT, ToSign.PARENT]}
          onClose={() => hideModal()}
          onComplete={(signData: string[]) => {
            hideModal()

            if (SignDataCheck(me?.role, signData)) {
              fieldtripData ? updateFieldtrip(imageObjectMap, signData) : createFieldtrip(imageObjectMap, signData)
            }
          }}
        ></SignPad>
      </div>
    </>
  )
}
