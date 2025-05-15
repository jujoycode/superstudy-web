import { useEffect, useState } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { useOutingsCreate, useOutingsUpdate } from '@/legacy/generated/endpoint'
import { Category, Outing, OutingStatus, OutingTypeEnum, Role } from '@/legacy/generated/model'
import { AbsentTimeType, errorType } from '@/legacy/types'
import { getPeriodNum, getPeriodStr } from '@/legacy/util/status'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'
import { useCodeByCategoryName } from './category'
import { UserContainer } from './user'
import { useUserStore } from '@/stores/user'

const getMeridiemHours = (date?: string) => {
  if (!date) return 0
  return new Date(date).getHours()
}

export function useStudentOutingAdd(outingData?: Outing, goDetail?: () => void) {
  const { push } = useHistory()
  const { me } = UserContainer.useContext()
  const { child } = useUserStore()
  const [errorMessage, setErrorMessage] = useState('')
  const [successId, setSuccessId] = useState<number>()
  const [approverName, setApproverName] = useState<string>()
  const [startAt, setStartAt] = useState<Date>(outingData ? new Date(outingData.startAt) : new Date())
  const [startHour, setStartHour] = useState(outingData ? getMeridiemHours(outingData.startAt) : 9)
  const [startMinute, setStartMinute] = useState(outingData?.startAt ? new Date(outingData.startAt).getMinutes() : 0)
  const [endAt, setEndAt] = useState<Date>(outingData ? new Date(outingData.endAt) : new Date())
  const [endHour, setEndHour] = useState(outingData ? getMeridiemHours(outingData.endAt) : 16)
  const [endMinute, setEndMinute] = useState(outingData?.endAt ? new Date(outingData.endAt).getMinutes() : 40)
  const [startPeriod, setStartPeriod] = useState(getPeriodStr(outingData?.startPeriod || 0))
  const [endPeriod, setEndPeriod] = useState(getPeriodStr(outingData?.endPeriod || 0))

  const [report, setReport] = useState<OutingTypeEnum>(outingData ? outingData.type : OutingTypeEnum.외출)
  const [reason, setReason] = useState(outingData ? outingData.reason : '')

  const [outingValue, setOutingValue] = useState<string[]>([])
  const [outingValueSel, setOutingValueSel] = useState(outingData ? outingData.type2 : '')

  const [useParentApprove, setUseParentApprove] = useState(
    outingData ? outingData?.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL : false,
  )

  const makeStartAt = () => {
    let date = new Date()
    if (startAt) {
      date = startAt
    }
    const hour = Number(startHour)
    date.setHours(hour, Number(startMinute), 0)
    return makeDateToString(date) + ' ' + makeTimeToString(date)
  }

  const makeEndAt = () => {
    let date = new Date()
    if (startAt) {
      date = startAt
    }
    if (report === OutingTypeEnum.확인) {
      date = endAt
    }
    const hour = Number(endHour)
    date.setHours(hour, Number(endMinute), 0)
    return makeDateToString(date) + ' ' + makeTimeToString(date)
  }

  const { categoryData: OutingTypeStates } = useCodeByCategoryName(Category.outingtype)

  const [timeType, setTimeType] = useState<AbsentTimeType>(
    outingData === undefined
      ? AbsentTimeType.PERIOD
      : outingData.startPeriod !== 0 || outingData.endPeriod !== 0
        ? AbsentTimeType.PERIOD
        : makeTimeToString(outingData.startAt) !== '00:00' && makeTimeToString(outingData.endAt) !== '00:00'
          ? AbsentTimeType.TIME
          : AbsentTimeType.NONE,
  )

  useEffect(() => {
    if (OutingTypeStates) {
      const namesArray = OutingTypeStates.map((item) => item.name)
      setOutingValue(namesArray)
    }
  }, [OutingTypeStates])

  const { mutate: createOutingMutate, isLoading: isCreateOutingLoading } = useOutingsCreate({
    mutation: {
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data ? (error?.response?.data as errorType) : undefined

        alert(errorMsg?.message || '결재자 지정상태를 확인하세요.')

        setErrorMessage(errorMsg?.message || '결재자 지정상태를 확인하세요.')
      },
      onSuccess: (res) => {
        if (res?.id) {
          const approver1Title = res?.approver1Title || ''
          const approver2Title = res?.approver2Title || ''
          const approver3Title = res?.approver3Title || ''
          const approver4Title = res?.approver4Title || ''
          const approver5Title = res?.approver5Title || ''
          const approver1Name = res?.approver1Name || ''
          const approver2Name = res?.approver2Name || ''
          const approver3Name = res?.approver3Name || ''
          const approver4Name = res?.approver4Name || ''
          const approver5Name = res?.approver5Name || ''

          let approvers =
            (approver1Title ? approver1Title + '(' + approver1Name + '), ' : '') +
            (approver2Title ? approver2Title + '(' + approver2Name + '), ' : '') +
            (approver3Title ? approver3Title + '(' + approver3Name + '), ' : '') +
            (approver4Title ? approver4Title + '(' + approver4Name + '), ' : '') +
            (approver5Title ? approver5Title + '(' + approver5Name + '), ' : '')

          if (approvers.endsWith(', ')) {
            approvers = approvers.substring(0, approvers.length - 2)
          }

          setApproverName(approvers || '담임')
          setSuccessId(res?.id)
        } else {
          push('/student/outing')
        }
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const createOuting = () => {
    createOutingMutate({
      data: {
        studentId: me?.role === Role.USER ? me?.id : child?.id || -1,
        type: report,
        type2: outingValueSel,
        startAt: makeStartAt(),
        endAt: makeEndAt(),
        startPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason,
        useParentApprove,
      },
    })
  }
  const { mutate: updateOutingMutate, isLoading: isUpdateOutingLoading } = useOutingsUpdate({
    mutation: {
      onSuccess: () => {
        if (goDetail) {
          goDetail()
        }
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data ? (error?.response?.data as errorType) : undefined

        alert(errorMsg?.message || '결재자 지정상태를 확인하세요.')

        setErrorMessage(errorMsg?.message || '결재자 지정상태를 확인하세요.')
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const updateOuting = () => {
    if (!outingData) return
    updateOutingMutate({
      id: outingData.id,
      data: {
        studentId: me?.role === Role.USER ? me?.id : child?.id || -1,
        type: report,
        type2: outingValueSel,
        startAt: makeStartAt(),
        endAt: makeEndAt(),
        startPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason,
        useParentApprove,
      },
    })
  }
  const isLoading = isCreateOutingLoading || isUpdateOutingLoading
  return {
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
  }
}
