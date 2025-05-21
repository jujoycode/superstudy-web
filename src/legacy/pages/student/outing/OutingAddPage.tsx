import { cn } from '@/utils/commonUtil'
import { t } from 'i18next'
import { useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { ErrorBlank, SelectValues } from '@/legacy/components'
import { BackButton, Badge, Blank, BottomFixed, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'
import { FieldtripDatePicker } from '@/legacy/components/fieldtrip/FieldtripDatePicker'
import { useCommonGetHolidays } from '@/legacy/container/common-get-holidays'
import { useStudentOutingAdd } from '@/legacy/container/student-outing-add'
import { UserContainer } from '@/legacy/container/user'
import { OutingTypeEnum, OutingUse, ResponseCreateOutingDto, Role } from '@/legacy/generated/model'
import { AbsentTimeType, periodArray } from '@/legacy/types'

const reportType = [OutingTypeEnum.조퇴, OutingTypeEnum.외출, OutingTypeEnum.확인]

interface OutingAddPageProps {
  outingData?: ResponseCreateOutingDto
  goDetail?: () => void
}

export function OutingAddPage({ outingData, goDetail }: OutingAddPageProps) {
  const { push } = useHistory()
  const { me, errorMessage: meErrorMessage } = UserContainer.useContext()
  const { child: myChild } = useUserStore()

  if (me?.role === Role.PARENT && !myChild?.name) {
    alert('자녀가 선택되지 않았습니다.')
    push('/student/mypage')
  }

  const { holidays } = useCommonGetHolidays()

  const [agree, setAgree] = useState(outingData ? true : false)
  const {
    errorMessage,
    successId,
    startAt,
    setStartAt,
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
    endAt,
    setEndAt,
    endHour,
    setEndHour,
    endMinute,
    setEndMinute,
    timeType,
    setTimeType,
    startPeriod,
    endPeriod,
    setStartPeriod,
    setEndPeriod,
    report,
    setReport,
    reason,
    setReason,
    isLoading,
    updateOuting,
    createOuting,
    outingValueSel,
    setOutingValueSel,
    outingValue,
    approverName,
    useParentApprove,
    setUseParentApprove,
  } = useStudentOutingAdd(outingData, goDetail)

  const startDateTime = new Date()
  startDateTime.setHours(startHour)
  startDateTime.setMinutes(startMinute)
  startDateTime.setSeconds(0)

  const endDateTime = new Date()
  endDateTime.setHours(endHour)
  endDateTime.setMinutes(endMinute)
  endDateTime.setSeconds(0)

  if (successId) {
    return (
      <>
        <TopNavbar title="확인증 작성" left={<BackButton />} />
        <div className="flex h-screen w-full flex-col items-center justify-center text-center">
          <div className="text-xl font-bold text-gray-600">확인증 제출 완료</div>
          <div className="mx-8 mt-4 text-gray-400">
            확인증 제출이 완료되었습니다. <br />
            <br />
            {me?.school.isOutingActive === OutingUse.USE_PARENT_APPROVE && (
              <>
                {`보호자에게 ${t(`certificate`, '확인증')} 승인을 위한 메세지가 전달되었습니다.`}
                <br />
                <br />
                보호자 서명 후,
                <br />
              </>
            )}
            <span className="text-lg font-bold text-blue-500">{approverName}</span> <br />
            선생님의 서명 후 승인이 완료됩니다.
          </div>
          <BottomFixed className="bottom-16 px-5">
            <Button.lg
              children="신청서 확인하기"
              onClick={() => push(`/student/outing/${successId}`)}
              className="filled-primary w-full"
            />
            <Button.lg
              children="목록으로 가기"
              onClick={() => push(`/student/outing`)}
              className="outlined-primary mt-4 w-full"
            />
          </BottomFixed>
        </div>
      </>
    )
  }

  return (
    <>
      {isLoading && <Blank />}
      {meErrorMessage && <ErrorBlank />}
      <TopNavbar
        title="확인증 신청"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section>
        {me?.role === Role.PARENT ? (
          <>
            <Label.col>
              <Label.Text children="학생 이름(자녀)" />
              <TextInput value={myChild?.name} disabled />
            </Label.col>
            <Label.col>
              <Label.Text children="학생 학년/반/번호" />
              <TextInput value={`${myChild?.klassGroupName ?? ''} ${myChild?.studentNumber ?? ''}번`} disabled />
            </Label.col>
          </>
        ) : (
          <>
            <Label.col>
              <Label.Text children="학생 이름(본인)" />
              <TextInput value={me?.name} disabled />
            </Label.col>
            <Label.col>
              <Label.Text children="학생 학년/반/번호" />
              <TextInput value={`${me?.klassGroupName ?? ''} ${me?.studentNumber ?? ''}번`} disabled />
            </Label.col>
          </>
        )}
        <div className="w-full">
          <SelectValues
            label="*유형"
            placeholder="선택"
            selectValues={reportType}
            value={report}
            onChange={(group) => {
              setReport(group)
              if (group === OutingTypeEnum.외출) {
                if (timeType === AbsentTimeType.TIME && !outingData) {
                  setStartHour(12)
                  setStartMinute(50)
                  setEndHour(13)
                  setEndMinute(50)
                }
              }
            }}
            className={reportType.includes(report) ? 'border border-gray-300' : 'border-2 border-red-700'}
          />
          {report === OutingTypeEnum.확인 && (
            <SelectValues
              placeholder="확인증 용도를 선택해주세요."
              selectValues={outingValue}
              value={outingValueSel}
              onChange={(type) => setOutingValueSel(type)}
              className={outingValue.includes(outingValueSel) ? 'border border-gray-300' : 'border-2 border-red-700'}
            />
          )}
        </div>
        <div className="w-full pb-6">
          <label className="mr-3 mb-1 text-sm text-gray-800">*기간 : </label>
          <Badge
            children="교시설정"
            onClick={() => setTimeType(AbsentTimeType.PERIOD)}
            className={cn(
              'py-1.5',
              timeType === AbsentTimeType.PERIOD ? 'bg-primary-800 text-white' : 'bg-white text-black',
            )}
          />
          <Badge
            children="시간설정"
            onClick={() => setTimeType(AbsentTimeType.TIME)}
            className={cn(
              'py-1.5',
              timeType === AbsentTimeType.TIME ? 'bg-primary-800 text-white' : 'bg-white text-black',
            )}
          />
          <div className="space-y-3 pb-6">
            <FieldtripDatePicker
              selectedDate={startAt}
              excludeDates={holidays}
              hasSaturdayClass
              placeholderText="시작 날짜"
              onChange={(selectedDate) => {
                if (!selectedDate) {
                  return
                }
                const _startAt = selectedDate
                if (selectedDate > endAt) {
                  setEndAt(_startAt)
                } else if (selectedDate === endAt) {
                  if (startHour > endHour) {
                    setEndHour(startHour)
                    if (startMinute > endMinute) {
                      setEndMinute(startMinute)
                    }
                  }
                  if (startHour === endHour && startMinute > endMinute) {
                    setEndMinute(startMinute)
                  }
                }
                setStartAt(selectedDate)
              }}
            />
            {timeType === AbsentTimeType.TIME && (
              <div className="flex items-center space-x-2">
                <select
                  value={startHour}
                  onChange={(e) => {
                    const _startHour = Number(e.target.value)
                    if (_startHour > endHour) {
                      setEndHour(_startHour)
                    }
                    if (_startHour === endHour && startMinute > endMinute) {
                      setEndMinute(startMinute)
                    }
                    setStartHour(_startHour)
                  }}
                  className="focus:border-primary-800 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                >
                  {new Array(24).fill(null).map((_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
                <span>시</span>
                <select
                  className="focus:border-primary-800 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  onChange={(e) => {
                    const _startMinute = Number(e.target.value)
                    if (startHour === endHour && _startMinute > endMinute) {
                      setEndMinute(_startMinute)
                    }
                    setStartMinute(_startMinute)
                  }}
                  value={startMinute}
                >
                  <option value={0}>0</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                  <option value={35}>35</option>
                  <option value={40}>40</option>
                  <option value={45}>45</option>
                  <option value={50}>50</option>
                  <option value={55}>55</option>
                </select>
                <span>분 부터</span>
              </div>
            )}
            {timeType === AbsentTimeType.PERIOD && (
              <div className="flex items-center space-x-2">
                <SelectValues
                  placeholder="선택"
                  selectValues={periodArray}
                  value={startPeriod}
                  onChange={(stime: string) => {
                    if (periodArray.indexOf(stime) > periodArray.indexOf(endPeriod)) {
                      setEndPeriod(stime)
                    }
                    setStartPeriod(stime)
                  }}
                  className={startPeriod !== '0' ? 'w-20 border border-gray-300' : 'w-20 border-2 border-red-700'}
                />
                <span className="text-sm"> 교시부터 </span>
              </div>
            )}
            {report === OutingTypeEnum.확인 && (
              <FieldtripDatePicker
                selectedDate={endAt}
                excludeDates={holidays}
                hasSaturdayClass
                placeholderText="종료 날짜"
                onChange={(selectedDate) => {
                  if (!selectedDate) {
                    return
                  }
                  if (startAt > selectedDate) {
                    setStartAt(selectedDate)
                  } else if (selectedDate === startAt) {
                    if (startHour > endHour) {
                      setStartHour(endHour)
                      if (startMinute > endMinute) {
                        setStartMinute(endMinute)
                      }
                    }
                    if (startHour === endHour && startMinute > endMinute) {
                      setStartMinute(endMinute)
                    }
                  }
                  setEndAt(selectedDate)
                }}
              />
            )}
            {timeType === AbsentTimeType.TIME && (
              <div className="flex items-center space-x-2">
                <select
                  value={endHour}
                  onChange={(e) => {
                    const _endHour = Number(e.target.value)
                    if (startHour > _endHour) {
                      setStartHour(_endHour)
                    }
                    if (startHour === _endHour && startMinute > endMinute) {
                      setEndMinute(startMinute)
                    }
                    setEndHour(_endHour)
                  }}
                  className="focus:border-primary-800 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                >
                  {new Array(24).fill(null).map((_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
                <span>시</span>
                <select
                  className="focus:border-primary-800 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  onChange={(e) => {
                    const _endMinute = Number(e.target.value)
                    if (startHour === endHour && startMinute > _endMinute) {
                      setStartMinute(_endMinute)
                    }
                    setEndMinute(_endMinute)
                  }}
                  value={endMinute}
                >
                  <option value={0}>0</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                  <option value={35}>35</option>
                  <option value={40}>40</option>
                  <option value={45}>45</option>
                  <option value={50}>50</option>
                  <option value={55}>55</option>
                </select>
                <span>분 까지</span>
              </div>
            )}
            {timeType === AbsentTimeType.PERIOD && (
              <div className="flex items-center space-x-2">
                <SelectValues
                  placeholder="선택"
                  selectValues={periodArray}
                  value={endPeriod}
                  onChange={(etime: string) => {
                    if (periodArray.indexOf(startPeriod) > periodArray.indexOf(etime)) {
                      setStartPeriod(etime)
                    }
                    setEndPeriod(etime)
                  }}
                  className={endPeriod !== '0' ? 'w-20 border border-gray-300' : 'w-20 border-2 border-red-700'}
                />
                <span className="text-sm"> 교시까지 </span>
              </div>
            )}
          </div>
          <Label.col>
            <Label.Text children="*사유" />
            <TextInput
              placeholder="조퇴/외출/확인 사유를 자세하게 입력해주세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={cn(reason ? 'border border-gray-300' : 'border-2 border-red-700')}
            />
          </Label.col>
        </div>
        <div>
          <div className="mb-2 text-sm whitespace-pre-line text-red-600">*민감정보의 수집/이용/제3자 제공에 동의</div>
          <div className="rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line">
            진료 확인서 등 건강 관련 민감 정보는 소속 학교에 제공되어 출결 관리 목적으로만 사용됩니다.
            <Label.row className="justify-end">
              <Checkbox checked={agree} onChange={() => setAgree(!agree)} />
              <p className="text-base font-semibold">동의하기</p>
            </Label.row>
          </div>
        </div>

        {me?.school.isOutingActive === OutingUse.USE_PARENT_APPROVE && (
          <Label.col>
            <Label.row>
              <Checkbox checked={useParentApprove} onChange={() => setUseParentApprove(!useParentApprove)} />
              <p className="text-base font-semibold">보호자 승인 요청</p>
            </Label.row>
            <div className="mb-2 text-sm whitespace-pre-line text-red-600">
              * 보호자 승인 필요 여부는 학교 교칙을 확인하세요.
            </div>
          </Label.col>
        )}

        <Button.lg
          children="제출하기"
          disabled={
            !reason ||
            !report ||
            !startAt ||
            !agree ||
            (timeType === AbsentTimeType.PERIOD && startPeriod === '0') ||
            (timeType === AbsentTimeType.PERIOD && startDateTime > endDateTime) ||
            (report === OutingTypeEnum.확인 && !outingValueSel)
          }
          onClick={() => (outingData ? updateOuting() : createOuting())}
          className="filled-primary"
        />

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
    </>
  )
}
