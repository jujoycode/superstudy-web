import { Checkbox } from '@mui/material'
import clsx from 'clsx'
import { useState } from 'react'

import { SelectValues, SuperModal } from '@/legacy/components'
import { Badge, Blank, Label, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useTeacherOutingUpdate } from '@/legacy/container/teacher-outing-update'
import { UserContainer } from '@/legacy/container/user'
import { OutingTypeEnum, OutingUse, ResponseCreateOutingDto } from '@/legacy/generated/model'
import { AbsentTimeType, periodArray } from '@/legacy/types'

interface OutingUpdatePageProps {
  outingData: ResponseCreateOutingDto
  setChangeMode: (b: boolean) => void
  isConfirmed: boolean
}

export function OutingUpdatePage({ outingData, setChangeMode }: OutingUpdatePageProps) {
  const { me } = UserContainer.useContext()

  const [modalOpen, setModalOpen] = useState(false)
  const {
    updateReason,
    setUpdateReason,
    reportedAt,
    setReportedAt,
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
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
    reason,
    setReason,
    setErrorMessage,
    errorMessage,
    isLoading,
    updateOuting,
    outingValueSel,
    useParentApprove,
    setUseParentApprove,
  } = useTeacherOutingUpdate({ outingData, setChangeMode })

  const makeDate = (day: string, hour: number, min: number) => {
    const date = new Date(day)
    date.setHours(hour, min, 0)
    return date
  }

  const checkInput = () => {
    if (makeDate(startAt, startHour, startMinute) > makeDate(endAt, endHour, endMinute)) {
      setErrorMessage('시작 시각이 종료 시작보다 클 수 없습니다.')
      return false
    } else {
      setErrorMessage('')
      return true
    }
  }

  return (
    <>
      {isLoading && <Blank />}
      <Section>
        <Label.col>
          <Label.Text children="학생 이름(본인)" />
          <TextInput value={outingData?.studentName || ''} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="학생 학년/반/번호" />
          <TextInput value={`${outingData?.studentGradeKlass} ${outingData?.studentNumber}번`} disabled />
        </Label.col>
        <Label.col>
          <Label.Text children="*유형" />
          <TextInput value={report} disabled />
          {report === OutingTypeEnum.확인 && <TextInput value={outingValueSel} disabled />}
        </Label.col>
        <Label.col>
          <Label.Text children="*사유" />
          <TextInput
            placeholder="조퇴/외출/확인 사유를 자세하게 입력해주세요"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Label.col>
        <div className="w-full">
          <label className="mb-1 text-sm text-gray-800">*신고일 : </label>
          <div>
            <input
              type="date"
              value={reportedAt}
              onChange={(e) => setReportedAt(e.target.value)}
              className="focus:border-brand-1 h-12 w-full rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
            />
          </div>
        </div>
        <div className="w-full pb-6">
          <label className="mb-1 text-sm text-gray-800">*기간 : </label>
          <Badge
            children="교시설정"
            onClick={() => setTimeType(AbsentTimeType.PERIOD)}
            className={clsx(
              'py-1.5',
              timeType === AbsentTimeType.PERIOD ? 'bg-brand-1 text-white' : 'bg-white text-black',
            )}
          />
          <Badge
            children="시간설정"
            onClick={() => setTimeType(AbsentTimeType.TIME)}
            className={clsx(
              'py-1.5',
              timeType === AbsentTimeType.TIME ? 'bg-brand-1 text-white' : 'bg-white text-black',
            )}
          />
          <div className="space-y-3 pb-6">
            <div>
              <input
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="focus:border-brand-1 h-12 w-full rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
              />
            </div>
            {timeType === AbsentTimeType.TIME && (
              <div className="flex items-center space-x-2">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                >
                  {new Array(24).fill(null).map((item, num: number) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span>시</span>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(Number(e.target.value))}
                  className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
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
                  className={startPeriod !== '0' ? 'w-16 border border-gray-300' : 'w-16 border-2 border-red-700'}
                />
                <span className="text-sm"> 교시부터 </span>
              </div>
            )}
            {report === '확인' && (
              <div>
                <input
                  type="date"
                  lang="ko-KR"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="focus:border-brand-1 h-12 w-full rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                />
              </div>
            )}
            {timeType === AbsentTimeType.TIME && (
              <div className="flex items-center space-x-2">
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                >
                  {new Array(24).fill(null).map((item, num: number) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span>시</span>
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(Number(e.target.value))}
                  className="focus:border-brand-1 h-12 w-16 min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
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
                  className={endPeriod !== '0' ? 'w-16 border border-gray-300' : 'w-16 border-2 border-red-700'}
                />
                <span className="text-sm"> 교시까지 </span>
              </div>
            )}
          </div>

          {me?.school.isOutingActive === OutingUse.USE_PARENT_APPROVE && !outingData.parentSignature && (
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
        </div>

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
        <div className="mt-3 flex w-full items-center space-x-2">
          <Button.xl
            children="수정하기"
            disabled={!(reason && report)}
            onClick={() => {
              if (checkInput()) {
                setModalOpen(true)
              }
            }}
            className="filled-primary w-full"
          />
          <Button.xl children="취소하기" onClick={() => setChangeMode(false)} className="filled-gray w-full" />
        </div>
      </Section>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            이 확인증을 수정하시는 이유를 적어주세요.
          </div>
          <Textarea placeholder="수정 이유" value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} />
          <Button.xl
            children="수정하기"
            disabled={!updateReason}
            onClick={() => {
              setModalOpen(false)
              updateOuting(outingData.studentId)
            }}
            className="filled-red"
          />
        </Section>
      </SuperModal>
    </>
  )
}
