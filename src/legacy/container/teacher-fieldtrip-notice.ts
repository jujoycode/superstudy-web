import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { MonthAgo, getEndDate, getStartDate, makeDateToString } from '@/legacy/util/time'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { useFieldtripsGetFieldtripsByTeacher, useUserMe } from '@/legacy/generated/endpoint'

export function useTeacherFieldtripNotice() {
  const { search } = useLocation()
  const { addQueryParams } = useQueryParams()
  const params = useMemo(() => new URLSearchParams(search), [search])

  const [_studentName, set_studentName] = useState('')
  const [page, setPage] = useState(Number(params.get('page') ?? '1'))
  const [endDate, setEndDate] = useState(makeDateToString(new Date()))
  const [startDate, setStartDate] = useState(makeDateToString(MonthAgo(new Date())))

  const studentName = params.get('username') || ''
  const limit = Number(params.get('limit') ?? '1000') || 1000

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const startDateParam = queryParams.get('startDate')
    startDateParam && startDateParam !== startDate && setStartDate(startDateParam)
    const endDateParam = queryParams.get('endDate')
    endDateParam && endDateParam !== endDate && setEndDate(endDateParam)
    const usernameParam = queryParams.get('username')
    usernameParam && usernameParam !== _studentName && set_studentName(usernameParam)
  }, [])

  useEffect(() => {
    addQueryParams({ startDate, endDate })
  }, [startDate, endDate])

  const { data, error } = useFieldtripsGetFieldtripsByTeacher({
    page,
    limit,
    fieldtripStatus: FieldtripStatus.PROCESSED,
    ...(studentName && { username: studentName }),
    startDate: getStartDate(startDate),
    endDate: getEndDate(endDate),
  })

  useEffect(() => {
    setPage(Number(params.get('page') ?? '1'))
  }, [params])

  // 조회 권한 여부
  const { data: teacherData } = useUserMe({})

  let isViewAuth = true
  if (teacherData?.role === Role.SECURITY) {
    isViewAuth = false
  }

  // 승인 권한 여부
  const isApprovalAuth = true
  // let isApprovalAuth = teacherData ? approvalLine?.includes(teacherData.role) : false;

  // if (isApprovalAuth === true && teacherData?.role === Role.TEACHER) {
  //   isApprovalAuth = teacherData?.klassGroupId !== undefined ? true : false;
  // }

  return {
    error,
    params,
    startDate,
    endDate,
    data,
    limit,
    page,
    isViewAuth,
    isApprovalAuth,
    _studentName,
    set_studentName,
    setPage,
    setStartDate,
    setEndDate,
  }
}
