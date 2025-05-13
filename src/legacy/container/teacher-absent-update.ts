import { useState } from 'react'
import { useAbsentsUpdateByTeacher } from '@/legacy/generated/endpoint'
import { Absent, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { ImageObject } from '@/legacy/types/image-object'
import { AbsentDescription, AbsentTimeType } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getPeriodNum, getPeriodStr } from '@/legacy/util/status'
import { makeTimeToString } from '@/legacy/util/time'

type Props = {
  absentData?: Absent
  setChangeMode: (b: boolean) => void
}

const getMeridiemHours = (date?: string) => {
  if (!date) return 0
  return new Date(date).getHours()
}

export function useTeacherAbsentUpdate({ absentData, setChangeMode }: Props) {
  const reportType = ['결석', '지각', '조퇴', '결과']
  const descriptionType =
    !absentData?.parentSignature && absentData?.nextApprover
      ? ['인정', '기타', '미인정']
      : ['인정', '질병', '기타', '미인정']

  const reasonType = [
    '상고',
    '코로나 19 관련',
    '법정전염병',
    '생리',
    '학교장 출석인정',
    '병원진료',
    '가정에서의 안정',
    '보건실 방문',
    '기타',
    '개인사',
    '신고사유 없음',
  ]

  const desType: AbsentDescription = {
    인정: {
      reasonType:
        !absentData?.parentSignature && absentData?.nextApprover
          ? ['학교장 출석인정']
          : ['상고', '코로나 19 관련', '법정전염병', '생리', '학교장 출석인정'],
      evidenceFileType:
        !absentData?.parentSignature && absentData?.nextApprover
          ? ['기타']
          : ['담임교사 확인서', '학부모 확인서', '기타'],
    },
    질병: {
      reasonType: ['병원진료', '가정에서의 안정', '보건실 방문'],
      evidenceFileType: [
        '진료확인서류(진료확인서, 진단서, 의사소견서, 처방전, 약봉투 등)',
        '학부모 확인서',
        '담임교사 확인서',
        '보건교사 확인서',
        '기타',
      ],
    },
    기타: {
      reasonType: ['기타'],
      evidenceFileType: !absentData?.parentSignature && absentData?.nextApprover ? ['기타'] : ['학부모 확인서', '기타'],
    },
    미인정: {
      reasonType: ['개인사', '신고사유 없음', '기타'],
      evidenceFileType:
        !absentData?.parentSignature && absentData?.nextApprover
          ? ['증빙서류 없음', '기타']
          : ['학부모 확인서', '증빙서류 없음', '기타'],
    },
  }

  const [updateReason, setUpdateReason] = useState('')
  const [reason, setReason] = useState(
    absentData ? (reasonType.includes(absentData?.reason) ? absentData?.reason : '기타') : '',
  )
  const [reasonText, setReasonText] = useState(absentData?.studentComment || '')
  const [report, setReport] = useState(absentData?.reportType || '')
  const [startAt, setStartAt] = useState(
    absentData?.startAt ? DateUtil.formatDate(absentData.startAt, DateFormat['YYYY-MM-DD HH:mm']) : '',
  )
  const [endAt, setEndAt] = useState(
    absentData?.endAt ? DateUtil.formatDate(absentData.endAt, DateFormat['YYYY-MM-DD HH:mm']) : '',
  )
  const [reportedAt, setReportedAt] = useState(absentData?.reportedAt)
  // 시작시간 끝시간 모두 00:00 인지 판단하여 시간 입력칸 활성화/비활성화 함. 00:00이 아니면 시간 입력 활성화.
  const [dateOff, setDateOff] = useState(
    absentData?.startAt && absentData?.endAt
      ? DateUtil.getTime(absentData?.startAt) === '00:00' && DateUtil.getTime(absentData?.endAt) === '00:00'
        ? true
        : false
      : false,
  )
  const [description, setDescription] = useState(absentData?.description || '')

  const [evidenceType, setEvidenceType] = useState(
    absentData && desType[description]?.evidenceFileType.includes(absentData?.evidenceType)
      ? absentData?.evidenceType
      : // : absentData?.evidenceType.includes('별첨')
        // ? '증빙서류 별도첨부'
        '기타',
  )
  const [evidenceTypeText, setEvidenceTypeText] = useState(
    absentData && desType[description]?.evidenceFileType.includes(absentData?.evidenceType)
      ? ''
      : absentData?.evidenceType.replace('(별첨)', ''),
  )
  const [isEvidenceFile2, setIsEvidenceFile2] = useState(!!absentData?.evidenceType2 || false)
  const [evidenceType2, setEvidenceType2] = useState(
    absentData && desType[description]?.evidenceFileType.includes(absentData?.evidenceType2)
      ? absentData?.evidenceType2
      : absentData?.evidenceType2.includes('별첨')
        ? '증빙서류 별도첨부'
        : '기타',
  )
  const [evidenceType2Text, setEvidenceType2Text] = useState(
    absentData && desType[description]?.evidenceFileType.includes(absentData?.evidenceType2)
      ? ''
      : absentData?.evidenceType2.replace('(별첨)', ''),
  )

  const getEvidenceType = () => {
    return evidenceType === '기타'
      ? evidenceTypeText || evidenceType
      : evidenceType === '증빙서류 별도첨부'
        ? '(별첨)' + evidenceTypeText || evidenceType
        : evidenceType
  }

  const getEvidenceType2 = () => {
    return evidenceType2 === '기타'
      ? evidenceType2Text || evidenceType2
      : evidenceType2 === '증빙서류 별도첨부'
        ? '(별첨)' + evidenceType2Text || evidenceType2
        : evidenceType2
  }

  const [startHour, setStartHour] = useState(absentData ? getMeridiemHours(absentData.startAt) : 9)
  const [startMinute, setStartMinute] = useState(absentData?.startAt ? new Date(absentData.startAt).getMinutes() : 0)
  const [endHour, setEndHour] = useState(absentData ? getMeridiemHours(absentData.endAt) : 16)
  const [endMinute, setEndMinute] = useState(absentData?.endAt ? new Date(absentData.endAt).getMinutes() : 40)
  const [startPeriod, setStartPeriod] = useState(getPeriodStr(absentData?.startPeriod))
  const [endPeriod, setEndPeriod] = useState(getPeriodStr(absentData?.endPeriod))
  const [teacherComment, setTeacherComment] = useState(absentData?.teacherComment || '')

  const [timeType, setTimeType] = useState(
    absentData === undefined
      ? AbsentTimeType.PERIOD
      : absentData.startPeriod !== 0 || absentData.endPeriod !== 0
        ? AbsentTimeType.PERIOD
        : makeTimeToString(absentData.startAt) !== '00:00' && makeTimeToString(absentData.endAt) !== '00:00'
          ? AbsentTimeType.TIME
          : AbsentTimeType.NONE,
  )

  const { handleUploadFile } = useFileUpload()

  const makeStartAt = (useTime: boolean) => {
    let date = new Date()
    if (startAt) {
      date = new Date(startAt) // 발생일
    }

    if (useTime) {
      date.setHours(Number(startHour), Number(startMinute))
    } else {
      date.setHours(0, 0)
    }

    return DateUtil.formatDate(date, DateFormat['YYYY-MM-DD HH:mm'])
  }
  const makeEndAt = (useTime: boolean) => {
    let date = new Date()
    if (report !== '결석') {
      startAt && (date = new Date(startAt))

      if (useTime) {
        date.setHours(Number(endHour), Number(endMinute))
      } else {
        date.setHours(0, 0)
      }
    } else {
      endAt && (date = new Date(endAt))

      date.setHours(0, 0)
    }

    return DateUtil.formatDate(date, DateFormat['YYYY-MM-DD HH:mm'])
  }

  const { imageObjectMap, handleImageAdd, toggleImageDelete } = useImageAndDocument({
    images: absentData?.evidenceFiles,
  })

  const { mutate: absentUpdateMutate, isLoading } = useAbsentsUpdateByTeacher({
    mutation: {
      onSuccess: async () => {
        await setChangeMode(false)
      },
    },
  })

  const uploadFiles = async (imageObjectMapParam: Map<number, ImageObject>) => {
    // file image 처리
    const imageFiles = [...imageObjectMapParam.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['absents/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [...imageObjectMapParam.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    return [...imageUrlNames, ...imageFileNames]
  }

  async function updateAbsent(_imageObjectMap: Map<number, ImageObject>, _image2ObjectMap: Map<number, ImageObject>) {
    if (!absentData?.id) return

    const allImageNames = await uploadFiles(_imageObjectMap)
    const allImage2Names = await uploadFiles(_image2ObjectMap)

    absentUpdateMutate({
      id: absentData?.id,
      data: {
        reportType: report,
        reportedAt: reportedAt || absentData?.reportedAt,
        startAt: report !== '결석' && timeType === AbsentTimeType.TIME ? makeStartAt(true) : makeStartAt(false),
        endAt: makeEndAt(timeType === AbsentTimeType.TIME),
        startPeriod: report !== '결석' && timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: report !== '결석' && timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason: reason, // === '학교장 출석인정' || reason === '기타' ? reasonText : reason,
        studentComment: reasonText,
        teacherComment: teacherComment,
        description: description,
        evidenceType: getEvidenceType(),
        evidenceType2: isEvidenceFile2 ? getEvidenceType2() : '',
        evidenceFiles: allImageNames,
        evidenceFiles2: isEvidenceFile2 ? allImage2Names : [],
        updateReason,
      },
    })
  }

  return {
    updateReason,
    setUpdateReason,
    reason,
    setReason,
    reasonText,
    setReasonText,
    report,
    setReport,
    reportedAt,
    setReportedAt,
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    description,
    setDescription,
    evidenceTypeText,
    setEvidenceTypeText,
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
    endHour,
    setEndHour,
    endMinute,
    setEndMinute,
    evidenceType,
    setEvidenceType,
    isEvidenceFile2,
    setIsEvidenceFile2,
    evidenceType2,
    setEvidenceType2,
    evidenceType2Text,
    setEvidenceType2Text,
    isLoading,
    updateAbsent,
    dateOff,
    setDateOff,
    imageObjectMap,
    timeType,
    setTimeType,
    startPeriod,
    setStartPeriod,
    endPeriod,
    setEndPeriod,
    handleImageAdd,
    toggleImageDelete,
    reportType,
    desType,
    descriptionType,
    teacherComment,
    setTeacherComment,
  }
}
