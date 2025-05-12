import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  useAbsentsGetAbsentsHistory,
  useAbsentsNiceSubmitted,
  useAbsentsSubmitted,
  useFieldtripsGetFieldtripsHistory,
  useOutingsFindHistory,
  useUserMe,
} from '@/legacy/generated/endpoint'
import { Role, type Absent } from '@/legacy/generated/model'
import type { UserDatas } from '@/legacy/types'

export function useTeacherHistory() {
  const { search } = useLocation()
  const [selectedUsers] = useState<UserDatas[]>([])
  const [selectedDocType, setSelectedDocType] = useState(-1)
  const [selectedGroup, setSelectedGroup] = useState<any | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedYear, setSelectedYear] = useState(-1)
  const [selectedMonth, setSelectedMonth] = useState(-1)
  const params = useMemo(() => new URLSearchParams(search), [search])

  const [sortNice, setSortNice] = useState<'DESC' | 'ASC' | ''>('')
  const [sortApproval, setSortApproval] = useState<'DESC' | 'ASC' | ''>('')
  const [sortSubmit, setSortSubmit] = useState<'DESC' | 'ASC' | ''>('')
  const [page, setPage] = useState(Number(params.get('page') ?? '1'))
  const limit = Number(params.get('limit') ?? '999') || 999
  const username = params.get('username') || ''
  const [isCsvData, setCsvData] = useState(false)

  const [open, setOpen] = useState(false)

  const [frontSortType] = useState('')

  // 조회 권한 여부
  const { data: teacherData } = useUserMe({})

  let isViewAuth = true
  if (teacherData?.role === Role.SECURITY) {
    isViewAuth = false
  }

  // Query용 공통 파라미터
  const getDefaultParams = () => {
    return {
      startDate: startDate,
      endDate: endDate,
      selectedGroupId: selectedGroup?.id,
      page,
      limit,
      ...(username ? { username } : {}),
    }
  }

  const {
    data: outings,
    isLoading: isOutingsLoading,
    error: outingsError,
  } = useOutingsFindHistory(
    {
      ...getDefaultParams(),
      //outingStatus: 'PROCESSED',
    },
    {
      query: {
        enabled: selectedDocType === 0 && !!startDate && !!endDate,
      },
    },
  )

  const {
    error,
    data: absents,
    isLoading: isAbsentsLoading,
  } = useAbsentsGetAbsentsHistory(
    {
      ...getDefaultParams(),
      //absentStatus: 'PROCESSED',
    },
    {
      query: {
        enabled: selectedDocType === 1 && !!startDate && !!endDate,
      },
    },
  )

  const {
    data: fieldtrips,
    isLoading: isFieldtripsLoading,
    error: fieldtripsError,
  } = useFieldtripsGetFieldtripsHistory(
    {
      ...getDefaultParams(),
      //fieldtripStatus: 'PROCESSED',
    },
    {
      query: {
        enabled: selectedDocType === 2 && !!startDate && !!endDate,
      },
    },
  )

  const { mutateAsync: submitAbsentMutate, isLoading: isSubmitAbsentLoading } = useAbsentsSubmitted()

  // 출결 신고서 - 증빙서류 Checkbox
  const submitAbsent = ({
    id,
    submitted,
    callback,
  }: {
    id: Absent['id']
    submitted: boolean
    callback: () => void
  }) => {
    submitAbsentMutate({ id, data: { submitted } }).then(() => {
      callback()
    })
  }

  const { mutateAsync: submitNiceAbsentMutate } = useAbsentsNiceSubmitted()

  // 출결 신고서 - 나이스 Checkbox
  const submitNiceAbsent = ({
    id,
    submitted,
    callback,
  }: {
    id: Absent['id']
    submitted: boolean
    callback: () => void
  }) => {
    submitNiceAbsentMutate({ id, data: { submitted } }).then(() => {
      callback()
    })
  }

  const isLoading = isAbsentsLoading || isSubmitAbsentLoading || isFieldtripsLoading || isOutingsLoading
  return {
    outings,
    absents,
    fieldtrips,
    isLoading,
    outingsError,
    fieldtripsError,
    error,
    sortNice,
    isViewAuth,
    state: {
      startDate,
      endDate,
      selectedYear,
      selectedMonth,
      selectedGroup,
      page,
      limit,
      selectedUsers,
      selectedDocType,
      sortApproval,
      open,
      sortSubmit,
      isCsvData,
      frontSortType,
    },

    setState: {
      setStartDate,
      setEndDate,
      setSelectedYear,
      setSelectedMonth,
      setSelectedDocType,
      setSelectedGroup,
      setSortApproval,
      setSortNice,
      setSortSubmit,
      setPage,
      setCsvData,
      setOpen,
    },
    submitAbsent,
    submitNiceAbsent,
  }
}
