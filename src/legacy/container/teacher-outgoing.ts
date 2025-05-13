import { useMemo, useState } from 'react'
import { useLocation } from 'react-router'

import { useOutingsApprove, useOutingsFindAllByTeacher } from '@/legacy/generated/endpoint'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignature } from '@/legacy/hooks/useSignature'
import { useStamp } from '@/legacy/hooks/useStamp'
import { DateUtil } from '@/legacy/util/date'

export function useTeacherOutgoing() {
  const { search } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const limit = Number(params.get('limit') ?? '999')
  const { t } = useLanguage()

  const filters = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('pending_approval', '승인 전'), value: 'BEFORE_APPROVAL' },
    { id: 3, name: t('approved', '승인 완료'), value: 'PROCESSED' },
    { id: 4, name: t('rejected', '반려됨'), value: 'RETURNED' },
  ]

  const outingTypes = [
    { id: 1, name: t('show_all', '전체보기'), value: 'ALL' },
    { id: 2, name: t('leave', '조퇴'), value: '조퇴' },
    { id: 3, name: t('outpass', '외출'), value: '외출' },
    { id: 4, name: t('confirm', '확인'), value: '확인' },
  ]

  const { canvasRef, sigPadData, clearSignature } = useSignature()
  const { stamp, stampMode, stampImgUrl, updateStamp, setStampMode, isUploadStampLoading } = useStamp()

  const [studentName, setStudentName] = useState('')
  const [startDate, setStartDate] = useState(DateUtil.getAMonthAgo(new Date()))
  const [endDate, setEndDate] = useState(DateUtil.formatDate(new Date()))
  const [page, setPage] = useState(Number(params.get('page') ?? '1'))
  // TODO filter 타입 지정 필요
  const [filter, setFilter] = useState<any>(filters[1])
  const [type, setType] = useState<any>(outingTypes[0])
  const [outingId, setOutingId] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>()

  const signature = stampMode ? stamp : sigPadData
  const username = params.get('username') || ''

  const { data: outings, error } = useOutingsFindAllByTeacher({
    startDate: DateUtil.getStartDate(startDate),
    endDate: DateUtil.getEndDate(endDate),
    outingStatus: filter?.value === filters[0].value ? undefined : filter.value,
    type: type?.value === outingTypes[0].value ? undefined : type.value,
    selectedGroupId: selectedGroup?.id,
    ...(username ? { username } : {}),
    limit,
  })

  const { mutate: approveOutingMutate } = useOutingsApprove({
    mutation: {
      onSuccess: () => {
        setOpen(false)
        clearSignature()
      },
    },
  })

  const approveOuting = () => {
    approveOutingMutate({
      id: outingId,
      data: {
        signature,
      },
    })
  }

  const approveOutings = () => {
    outings?.items
      // @ts-ignore 기존 에러임
      // ? 다같이 해결해야함
      ?.filter((o) => !o.teacherSignature)
      .map((o) => {
        approveOutingMutate({
          id: o.id,
          data: { signature },
        })
      })
  }

  const isLoading = false
  return {
    signature: { canvasRef, sigPadData, clearSignature },
    stamp: { stamp, stampMode, stampImgUrl, updateStamp, setStampMode, isUploadStampLoading },
    filters,
    filter,
    setFilter,
    outingTypes,
    type,
    setType,
    studentName,
    setStudentName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    limit,
    open,
    setOpen,
    setOutingId,
    isLoading,
    outings,
    error,
    approveOuting,
    approveOutings,
    selectedGroup,
    setSelectedGroup,
  }
}
