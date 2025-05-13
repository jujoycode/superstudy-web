import { useEffect, useState } from 'react'
import { useOutingsUpdateByTeacher } from '@/legacy/generated/endpoint'
import { Category, OutingStatus } from '@/legacy/generated/model'
import { AbsentTimeType, errorType } from '@/legacy/types'
import { getPeriodNum, getPeriodStr } from '@/legacy/util/status'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'
import { useCodeByCategoryName } from './category'

type Props = {
  outingData: any
  setChangeMode: (b: boolean) => void
}

const getMeridiemHours = (date?: string) => {
  if (!date) return 0
  return new Date(date).getHours()
}

export function useTeacherOutingUpdate({ outingData, setChangeMode }: Props) {
  const [updateReason, setUpdateReason] = useState('')
  const [reportedAt, setReportedAt] = useState(
    outingData?.reportedAt ? makeDateToString(new Date(outingData.reportedAt)) : '',
  )
  const [startAt, setStartAt] = useState(outingData?.startAt ? makeDateToString(new Date(outingData.startAt)) : '')
  const [endAt, setEndAt] = useState(outingData?.endAt ? makeDateToString(new Date(outingData.endAt)) : '')
  const [startHour, setStartHour] = useState(outingData ? getMeridiemHours(outingData.startAt) : 9)
  const [startMinute, setStartMinute] = useState(outingData?.startAt ? new Date(outingData.startAt).getMinutes() : 0)
  const [endHour, setEndHour] = useState(outingData ? getMeridiemHours(outingData.endAt) : 16)
  const [endMinute, setEndMinute] = useState(outingData?.endAt ? new Date(outingData.endAt).getMinutes() : 40)
  const [startPeriod, setStartPeriod] = useState(getPeriodStr(outingData?.startPeriod || 99))
  const [endPeriod, setEndPeriod] = useState(getPeriodStr(outingData?.endPeriod || 100))

  const [report, setReport] = useState(outingData?.type || '')
  const [reason, setReason] = useState(outingData?.reason || '')
  const [errorMessage, setErrorMessage] = useState('')

  const [outingValue, setOutingValue] = useState<string[]>([])
  const [outingValueSel, setOutingValueSel] = useState(outingData?.type2 || '')

  const [useParentApprove, setUseParentApprove] = useState(
    outingData ? outingData.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL || outingData.parentSignature : false,
  )

  const makeStartAt = () => {
    let date = new Date()
    if (startAt) {
      date = new Date(startAt)
    }
    const hour = Number(startHour)
    date.setHours(hour, Number(startMinute), 0)
    return makeDateToString(date) + ' ' + makeTimeToString(date)
  }
  const makeEndAt = () => {
    let date = new Date()
    if (startAt) {
      date = new Date(startAt)
    }
    if (report === '확인') {
      date = new Date(endAt)
    }
    const hour = Number(endHour)
    date.setHours(hour, Number(endMinute), 0)
    return makeDateToString(date) + ' ' + makeTimeToString(date)
  }

  const [timeType, setTimeType] = useState<AbsentTimeType>(
    outingData === undefined
      ? AbsentTimeType.PERIOD
      : outingData.startPeriod !== 0 || outingData.endPeriod !== 0
        ? AbsentTimeType.PERIOD
        : makeTimeToString(outingData.startAt) !== '00:00' && makeTimeToString(outingData.endAt) !== '00:00'
          ? AbsentTimeType.TIME
          : AbsentTimeType.NONE,
  )

  const { categoryData: OutingTypeStates } = useCodeByCategoryName(Category.outingtype)

  useEffect(() => {
    if (OutingTypeStates) {
      const namesArray = OutingTypeStates.map((item) => item.name)
      setOutingValue(namesArray)
    }
  }, [OutingTypeStates])

  const { mutate: updateOutingMutate, isLoading } = useOutingsUpdateByTeacher({
    mutation: {
      onSuccess: () => {
        setChangeMode(false)
      },
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined
        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const updateOuting = (userId: number) => {
    updateOutingMutate({
      id: outingData.id,
      data: {
        type: report,
        type2: outingValueSel,
        reportedAt,
        startAt: makeStartAt(),
        endAt: makeEndAt(),
        startPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason,
        updateReason,
        studentId: userId,
        useParentApprove: useParentApprove || false,
      },
    })
  }

  return {
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
    setReport,
    reason,
    setReason,
    errorMessage,
    setErrorMessage,
    isLoading,
    updateOuting,
    outingValueSel,
    setOutingValueSel,
    outingValue,
    useParentApprove,
    setUseParentApprove,
  }
}
