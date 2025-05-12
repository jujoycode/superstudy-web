import { useEffect, useState } from 'react'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'

import { useRecoilValue } from 'recoil'
import { childState } from '@/stores'
import { getPeriodNum, getPeriodStr } from '@/legacy/util/status'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'
import { GroupContainer } from '@/legacy/container/group'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { useOutingsCreate, useOutingsUpdate, useStudentGroupsFindByGroupId } from '@/legacy/generated/endpoint'
import {
  Category,
  OutingTypeEnum,
  type Outing,
  type ResponseGroupDto,
  type StudentGroup,
  type User,
} from '@/legacy/generated/model'
import { AbsentTimeType, type errorType } from '@/legacy/types'

const getMeridiemHours = (date?: string) => {
  if (!date) return 0
  return new Date(date).getHours()
}

export function useTeacherOutingAdd(outingData?: Outing) {
  const { push } = useHistory()
  const child = useRecoilValue(childState)
  const [errorMessage, setErrorMessage] = useState('')
  const [approverName] = useState<string>()
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
  const { allKlassGroupsUnique: allKlassGroups } = GroupContainer.useContext()
  const [selectedGroup, setSelectedGroup] = useState<ResponseGroupDto | null>(allKlassGroups[0] || null)
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])
  const [groupStudentsData, setGroupStudentsData] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>(groupStudentsData || [])

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
          push('/teacher/outing/' + res?.id.toString())
        } else {
          push('/teacher/outing')
        }
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const createOuting = async (userId: number) => {
    createOutingMutate({
      // @ts-ignore 기존 소스 에러, 리팩토링 필요
      data: {
        studentId: userId,
        type: report,
        type2: outingValueSel,
        startAt: makeStartAt(),
        endAt: makeEndAt(),
        startPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason,
      },
    })
  }
  const { mutate: updateOutingMutate, isLoading: isUpdateOutingLoading } = useOutingsUpdate({
    mutation: {
      onSuccess: () => { },
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

  const updateOuting = async (userId: number) => {
    updateOutingMutate({
      id: outingData?.id || 0,
      // @ts-ignore 기존 소스 에러, 리팩토링 필요
      data: {
        studentId: userId,
        type: report,
        type2: outingValueSel,
        startAt: makeStartAt(),
        endAt: makeEndAt(),
        startPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason,
      },
    })
  }

  let userIds = selectedUsers.map((el) => el.id)

  useEffect(() => {
    setSelectedUsers(groupStudentsData)
    userIds = groupStudentsData.map((el) => el.id)
  }, [groupStudentsData])

  useStudentGroupsFindByGroupId<StudentGroup[]>(selectedGroup?.id as number, {
    query: {
      enabled: !!selectedGroup?.id,
      onSuccess: (res) => {
        if (!res?.length) {
          setStudentGroups([])
          return
        }

        setStudentGroups(res.sort((a, b) => a.studentNumber - b.studentNumber))
      },
    },
  })

  const isLoading = isCreateOutingLoading || isUpdateOutingLoading

  return {
    errorMessage,
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
    allKlassGroups,
    selectedGroup,
    studentGroups,
    groupStudentsData,
    setSelectedGroup,
    setStudentGroups,
    setGroupStudentsData,
    selectedUsers,
    setSelectedUsers,
    userIds,
  }
}
