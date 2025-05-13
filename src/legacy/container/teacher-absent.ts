import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

import {
  useAbsentsApprove,
  useAbsentsGetAbsentsByTeacher,
  useAbsentsNiceSubmitted,
  useAbsentsSubmitted,
  useUserMe,
} from '@/legacy/generated/endpoint'
import { Role, type Absent } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignature } from '@/legacy/hooks/useSignature'
import { useStamp } from '@/legacy/hooks/useStamp'
import { DateUtil } from '@/legacy/util/date'

export function useTeacherAbsent() {
  const { search } = useLocation()
  const { t } = useLanguage()

  const filters = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('pending_approval', '승인 전'), value: 'BEFORE_APPROVAL' },
    { id: 3, name: t('approved', '승인 완료'), value: 'PROCESSED' },
    { id: 4, name: t('rejected', '반려됨'), value: 'RETURNED' },
    { id: 5, name: t('external_documents_not_submitted', '외부서류 미제출'), value: 'UNSUBMITTED' },
    { id: 6, name: t('external_documents_submitted', '외부서류 제출'), value: 'SUBMITTED' },
  ]

  const filtersMobile = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('pending_approval', '승인 전'), value: 'BEFORE_APPROVAL' },
    { id: 3, name: t('approved', '승인 완료'), value: 'PROCESSED' },
    { id: 4, name: t('rejected', '반려됨'), value: 'RETURNED' },
  ]

  const reportType = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('absence', '결석'), value: '결석' },
    { id: 3, name: t('tardiness', '지각'), value: '지각' },
    { id: 4, name: t('leave', '조퇴'), value: '조퇴' },
    { id: 5, name: t('class_absence', '결과'), value: '결과' },
  ]

  const descriptionType = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('recognized', '인정'), value: '인정' },
    { id: 3, name: t('illness', '질병'), value: '질병' },
    { id: 4, name: t('other', '기타'), value: '기타' },
    { id: 5, name: t('unrecognized', '미인정'), value: '미인정' },
  ]

  const { stamp, stampImgUrl, stampMode, setStampMode, updateStamp, isUploadStampLoading } = useStamp()
  const { sigPadData, clearSignature, canvasRef } = useSignature()
  const signature = stampMode ? stamp : sigPadData
  const params = useMemo(() => new URLSearchParams(search), [search])

  const [startDate, setStartDate] = useState(DateUtil.getAMonthAgo(new Date()))
  const [endDate, setEndDate] = useState(DateUtil.formatDate(new Date()))
  const [filter, setFilter] = useState<any>(filters[1])
  const [selectedGroup, setSelectedGroup] = useState<any>()
  const [sortNice, setSortNice] = useState<'DESC' | 'ASC' | ''>('')
  const [sortApproval, setSortApproval] = useState<'DESC' | 'ASC' | ''>('')
  const [sortSubmit, setSortSubmit] = useState<'DESC' | 'ASC' | ''>('')
  const [page, setPage] = useState(Number(params.get('page') ?? '1'))
  const limit = Number(params.get('limit') ?? '999') || 999
  const username = params.get('username') || ''
  const [absentId, setAbsentId] = useState(0)

  const [isCsvData, setCsvData] = useState(false)

  const [open, setOpen] = useState(false)
  const [report, setReport] = useState<any>(reportType[0])
  const [description, setDescription] = useState<any>(descriptionType[0])

  // Query용 공통 파라미터
  const getDefaultParams = () => {
    return {
      startDate: DateUtil.getStartDate(startDate),
      endDate: DateUtil.getEndDate(endDate),
      absentStatus: filter?.value === filters[0].value ? undefined : filter.value,
      reportType: report?.value === reportType[0].value ? undefined : report.value,
      description: description?.value === descriptionType[0].value ? undefined : description.value,
      NICE: sortNice || undefined,
      SUBMIT: sortSubmit || undefined,
      APPROVAL: sortApproval || undefined,
    }
  }

  /*************************** Query ********************************/
  const {
    error,
    data: absents,
    isLoading: isAbsentsLoading,
    refetch,
  } = useAbsentsGetAbsentsByTeacher({
    ...getDefaultParams(),
    selectedGroupId: selectedGroup?.id,
    ...(username ? { username } : {}),
    page,
    limit,
  })

  /*************************** Mutation ********************************/
  const { mutateAsync: approveAbsentsMutate, isLoading: isApproveAbsentsLoading } = useAbsentsApprove({
    mutation: {
      onSuccess: () => {
        setOpen(false)
        clearSignature()
      },
    },
  })

  const approveAbsents = () => {
    absents?.items.forEach(({ id }) => {
      approveAbsentsMutate({ id, data: { signature } }).catch((e) => console.error(e))
    })
  }

  const approveAbsent = () => {
    approveAbsentsMutate({ id: absentId, data: { signature } }).catch((e) => console.error(e))
  }

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
    }) // @example 체크박스 해제와 같�� 함수 실행
  }

  const { mutateAsync: submitNiceAbsentMutate, isLoading: isSubmitNiceAbsentLoading } = useAbsentsNiceSubmitted()

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

  useEffect(() => {
    setPage(Number(params.get('page') ?? '1'))
  }, [params])

  const searchAlert = () => {
    const confirmed = window.confirm(
      '승인 전 상태의 내용만 일괄 승인이 가능합니다. \n승인 전 상태인 건들을 조회하시겠습니까?',
    )
    if (confirmed) {
      setFilter(filters[1])
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
  //let isApprovalAuth = teacherData ? approvalLine?.includes(teacherData.role) : false;

  // if (isApprovalAuth === true && teacherData?.role === Role.TEACHER) {
  //   isApprovalAuth = teacherData?.klassGroupId !== undefined ? true : false;
  // }

  const isLoading = isAbsentsLoading || isApproveAbsentsLoading || isSubmitAbsentLoading || isSubmitNiceAbsentLoading

  return {
    absents,
    isLoading,
    error,
    filters,
    filtersMobile,
    state: {
      startDate,
      endDate,
      filter,
      selectedGroup,
      page,
      absentId,
      isCsvData,
      open,
      limit,
      report,
      reportType,
      description,
      descriptionType,
    },
    setState: {
      setStartDate,
      setEndDate,
      setFilter,
      setSelectedGroup,
      setPage,
      setAbsentId,
      setCsvData,
      setOpen,
      searchAlert,
      setReport,
      setDescription,
    },
    sign: {
      sigPadData,
      clearSignature,
      canvasRef,
    },
    stamp: {
      stamp,
      stampImgUrl,
      stampMode,
      setStampMode,
      updateStamp,
      isUploadStampLoading,
    },
    approveAbsents,
    approveAbsent,
    submitAbsent,
    submitNiceAbsent,
    refetch,
    sortApproval,
    setSortApproval,
    sortNice,
    setSortNice,
    sortSubmit,
    setSortSubmit,
    isApprovalAuth,
    isViewAuth,
  }
}
