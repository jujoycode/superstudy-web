import { addYears, format } from 'date-fns'
import { useState } from 'react'

import { useFieldtripsUpdateByTeacher, useSchedulesFindRejectSchedule } from '@/legacy/generated/endpoint'
import { FieldtripType, UploadFileTypeEnum, type Fieldtrip } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import type { errorType } from '@/legacy/types'
import { usePrevious } from '@/legacy/util/hooks'

export function useTeacherFieldtripUpdate({
  fieldtrip,
  updateReason,
  setReadState,
  fieldtripType,
  wholeDayPeriod,
  startHalf,
  startPeriodS,
  endHalf,
  endPeriodE,
}: {
  fieldtrip: Fieldtrip
  updateReason: string
  setReadState: () => void
  fieldtripType: string
  wholeDayPeriod: string
  startHalf: boolean
  startPeriodS: number
  endHalf: boolean
  endPeriodE: number
}) {
  const [content, setContent] = useState(fieldtrip?.content || '')
  const [accommodation, setAccommodation] = useState(
    fieldtrip.type === 'HOME' ? '자택' : fieldtrip?.accommodation || '',
  )
  const [overseas, setOverseas] = useState(fieldtrip?.overseas || false)
  const [destination, setDestination] = useState(fieldtrip?.destination)
  const [guideName, setGuideName] = useState(fieldtrip?.guideName || '')
  const [guidePhone, setGuidePhone] = useState(fieldtrip?.guidePhone || '')
  const [reportedAt, setReportedAt] = useState(fieldtrip?.reportedAt)
  const [startAtDate, setStartAtDate] = useState(fieldtrip?.startAt ? new Date(fieldtrip.startAt) : new Date())
  const [endAtDate, setEndAtDate] = useState(fieldtrip?.endAt ? new Date(fieldtrip?.endAt) : new Date())
  const [usedDays, setUsedDays] = useState(fieldtrip?.usedDays || 0)
  const prevUsedDays = usePrevious(usedDays)
  const [relationship, setRelationship] = useState(fieldtrip?.relationship || '')
  const [relationshipText, setRelationshipText] = useState(fieldtrip?.relationship || '')
  const [purpose, setPurpose] = useState(fieldtrip?.purpose)
  const [homePlan, setHomePlan] = useState<any>(
    fieldtrip && fieldtrip?.type === 'HOME' ? JSON.parse(fieldtrip?.content || '[]') : [],
  )
  const [errorMessage, setErrorMessage] = useState('')

  const { imageObjectMap, handleImageAdd, toggleImageDelete } = useImageAndDocument({
    images: fieldtrip?.applyFiles,
  })
  const { handleUploadFile } = useFileUpload()

  const getGrade = (gradeKlass: string | undefined) => {
    if (!gradeKlass) return ''
    return gradeKlass.split('학년')[0]
  }

  const { data: cannotSchedules } = useSchedulesFindRejectSchedule({
    startDate: startAtDate
      ? format(new Date(fieldtrip?.startAt).setDate(1), 'yyyy-MM-dd')
      : format(new Date().setDate(1), 'yyyy-MM-dd'),
    endDate: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    grade: Number(getGrade(fieldtrip?.studentGradeKlass)) || 0,
  })

  const { mutate, isLoading } = useFieldtripsUpdateByTeacher({
    mutation: {
      onSuccess: () => {
        alert('체험학습 신청서를 수정하였습니다.')
        setReadState()
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data ? (error?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
  })

  const updateFieldtripByTeacher = async () => {
    if (!fieldtrip) return

    const imageFiles = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['fieldtrips/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    const allImageNames = [...imageUrlNames, ...imageFileNames]

    mutate({
      id: fieldtrip?.id,
      data: {
        content: fieldtrip.type === FieldtripType.HOME ? JSON.stringify(homePlan) : content,
        reportedAt,
        startAt: startAtDate.toISOString(),
        endAt: endAtDate.toISOString(),
        usedDays,
        wholeDayPeriod,
        startPeriodS: startHalf ? startPeriodS : 0,
        endPeriodE: endHalf ? endPeriodE : 0,
        accommodation,
        destination,
        overseas,
        guideName,
        guidePhone,
        relationship: relationshipText,
        purpose,
        type: fieldtrip.type,
        form: fieldtripType,
        updateReason,
        applyFiles: allImageNames,
      },
    })
  }

  return {
    content,
    purpose,
    accommodation,
    destination,
    guideName,
    guidePhone,
    relationship,
    relationshipText,
    homePlan,
    prevUsedDays,
    usedDays,
    reportedAt,
    overseas,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    setOverseas,
    setReportedAt,
    setContent,
    setDestination,
    setPurpose,
    setAccommodation,
    setGuideName,
    setGuidePhone,
    setRelationship,
    setRelationshipText,
    setHomePlan,
    errorMessage,
    updateFieldtripByTeacher,
    isLoading,
    setUsedDays,
    cannotSchedules,
    startAtDate,
    setStartAtDate,
    endAtDate,
    setEndAtDate,
  }
}
