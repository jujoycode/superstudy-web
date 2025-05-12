import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'
import { GroupContainer } from '@/legacy/container/group'
import { MonthAgo, getEndDate, getStartDate, makeDateToString } from '@/legacy/util/time'
import { Role, type ResponsePaginatedFieldtripDto } from '@/legacy/generated/model'
import {
  useFieldtripResultApproveResult,
  useFieldtripsGetResultsByTeacher,
  useUserMe,
} from '@/legacy/generated/endpoint'
import type { errorType } from '@/legacy/types'

type UseTeacherFieldTripProps = {
  clearSignature: () => void
  sigPadData: string
  stampMode: boolean
  stamp?: string
}

const groups = [
  { id: 1, name: '모두', value: 'ALL' },
  { id: 2, name: '승인 전', value: 'BEFORE_APPROVAL' },
  { id: 3, name: '승인 완료', value: 'PROCESSED' },
  { id: 4, name: '반려됨', value: 'RETURNED' },
]

export function useTeacherFieldtripResult({ clearSignature, sigPadData, stampMode, stamp }: UseTeacherFieldTripProps) {
  const { search } = useLocation()
  const { addQueryParams } = useQueryParams()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const [startDate, setStartDate] = useState(makeDateToString(MonthAgo(new Date())))
  const [endDate, setEndDate] = useState(makeDateToString(new Date()))
  const [isLoading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [agreeAll, setAgreeAll] = useState(false)
  const [fieldtripId, setFieldtripId] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [filter, setFilter] = useState<any>(groups[1])
  const [page, setPage] = useState(Number(params.get('page') ?? '1'))
  const [_studentName, set_studentName] = useState('')
  const limit = Number(params.get('limit') ?? '1000') || 1000
  const studentName = params.get('username') || ''
  const [data, setData] = useState<ResponsePaginatedFieldtripDto>()
  const [selectedGroup, setSelectedGroup] = useState<any>()

  const { allKlassGroups: classGroups } = GroupContainer.useContext()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const startDateParam = queryParams.get('startDate')
    startDateParam && startDateParam !== startDate && setStartDate(startDateParam)
    const endDateParam = queryParams.get('endDate')
    endDateParam && endDateParam !== endDate && setEndDate(endDateParam)
    const statusParam = queryParams.get('status')
    statusParam && Number(statusParam) !== filter.id && setFilter(groups.find((el) => String(el.id) === statusParam))
    const classParam = queryParams.get('classId')
    classParam &&
      classParam !== String(selectedGroup?.id) &&
      setSelectedGroup(classGroups?.find((el) => String(el.id) === classParam))
    const usernameParam = queryParams.get('username')
    usernameParam && usernameParam !== _studentName && set_studentName(usernameParam)
  }, [])

  useEffect(() => {
    addQueryParams({ startDate, endDate, status: filter.id, classId: selectedGroup?.id })
  }, [startDate, endDate, filter, selectedGroup])

  const { error } = useFieldtripsGetResultsByTeacher(
    {
      page,
      limit,
      fieldtripStatus: filter?.value === 'ALL' ? undefined : filter.value,
      ...(studentName && { username: studentName }),
      selectedGroupId: selectedGroup?.id,
      startDate: getStartDate(startDate),
      endDate: getEndDate(endDate),
    },
    {
      query: {
        onSuccess: (res) => {
          const sorted = res?.items
          // 정렬은 백엔드에 맡김.
          // const sorted = res?.items
          //   ?.slice()
          //   .sort(
          //     (a, b) =>
          //       (a.fieldtripResultStatus === 'BEFORE_PARENT_CONFIRM' ||
          //       a?.fieldtripResultStatus === 'BEFORE_TEACHER_APPROVAL'
          //         ? -1
          //         : 0) -
          //       (b.fieldtripResultStatus === 'BEFORE_PARENT_CONFIRM' ||
          //       b?.fieldtripResultStatus === 'BEFORE_TEACHER_APPROVAL'
          //         ? -1
          //         : 0),
          //   )
          //   .sort(
          //     (a, b) =>
          //       (a.fieldtripResultStatus === 'RETURNED' ? -1 : 0) - (b.fieldtripResultStatus === 'RETURNED' ? -1 : 0),
          //   );
          setData({
            items: sorted,
            total: res.total,
          })
        },
      },
    },
  )

  const { mutate, mutateAsync } = useFieldtripResultApproveResult({
    mutation: {
      onSuccess: () => {
        setOpen(false)
        clearSignature()
        setLoading(false)
        setErrorMessage('')
      },
      onError: (e) => {
        setOpen(false)
        clearSignature()
        setLoading(false)
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined
        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const approveFieldtripResult = () => {
    mutate({
      id: fieldtripId,
      data: {
        signature: stampMode ? stamp : sigPadData,
      },
    })
  }

  // 일괄 승인하기 버튼
  const approveFieldtripResults = async () => {
    if (!data?.items.length) return

    const approvePromiseList = data?.items.map(({ id }) => {
      return mutateAsync({
        id,
        data: {
          signature: stampMode ? stamp : sigPadData,
        },
      })
    })
    const result = await Promise.allSettled(approvePromiseList)
    result.forEach((settlement) => {
      // 승인 실패하는 경우 Error 번호 Alert으로 표시
      if (settlement.status === 'rejected') {
        const pathElements = settlement.reason.config.url.split('/') ?? [] // url 예시: fieldtrips/approve/22
        const id = pathElements[pathElements.length - 1]
        alert(`ID ${id}번의 승인을 실패하였습니다.\n(${settlement.reason.response.data.message})`)
      }
    })
  }

  const searchAlert = () => {
    const confirmed = window.confirm(
      '승인 전 상태의 내용만 일괄 승인이 가능합니다. \n승인 전 상태인 건들을 조회하시겠습니까?',
    )
    if (confirmed) {
      setFilter(groups[1])
    }
  }

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
    classGroups,
    params,
    error,
    errorMessage,
    isLoading,
    setLoading,
    setPage,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setFilter,
    setOpen,
    setAgreeAll,
    filter,
    set_studentName,
    _studentName,
    data,
    limit,
    page,
    setFieldtripId,
    agreeAll,
    open,
    selectedGroup,
    setSelectedGroup,
    approveFieldtripResult,
    approveFieldtripResults,
    searchAlert,
    isViewAuth,
    isApprovalAuth,
  }
}
