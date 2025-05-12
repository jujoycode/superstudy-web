import { useState } from 'react'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'

import { useRecoilValue } from 'recoil'
import { childState } from '@/stores'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import {
  UploadFileTypeEnum,
  Role,
  type Absent,
  type ResponseGroupDto,
  type StudentGroup,
  type User,
} from '@/legacy/generated/model'
import { UserContainer } from '@/legacy/container/user'
import { GroupContainer } from '@/legacy/container/group'
import { getPeriodNum, getPeriodStr } from '@/legacy/util/status'
import { makeDateToString, makeTimeToString } from '@/legacy/util/time'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { useAbsentsCreate, useAbsentsUpdate, useStudentGroupsFindByGroupId } from '@/legacy/generated/endpoint'
import { AbsentTimeType, type AbsentDescription, type errorType } from '@/legacy/types'
import type { ImageObject } from '@/legacy/types/image-object'

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
    reasonType: ['학교장 출석인정'],
    evidenceFileType: ['증빙서류 없음', '기타'],
  },
  기타: {
    reasonType: ['기타'],
    evidenceFileType: ['기타'],
  },
  미인정: {
    reasonType: ['개인사', '신고사유 없음', '기타'],
    evidenceFileType: ['증빙서류 없음', '기타'],
  },
}

type ImageObjectMapParam = Map<number, ImageObject>

type Props = {
  absentData?: Absent
  returnToDetail?: () => void
}

export function useTeacherAbsentAdd({ absentData, returnToDetail }: Props) {
  const { push } = useHistory()
  const { me } = UserContainer.useContext()
  const child = useRecoilValue(childState)
  const { allKlassGroupsUnique: allKlassGroups } = GroupContainer.useContext()
  const [groupStudentsData] = useState<User[]>([])
  const [selectedGroup, setSelectedGroup] = useState<ResponseGroupDto | null>(allKlassGroups[0] || null)
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])

  const {
    reason: _reasonText = '',
    startAt: _startAt = new Date(),
    endAt: _endAt = new Date(),
    description: _description = '',
    parentComment: _parentComment = '',
    teacherComment: _teacherComment = '',
    reportType: _reportType = '',
    startPeriod: _startPeriod = 0,
    endPeriod: _endPeriod = 0,
  } = absentData || {}

  const [timeType, setTimeType] = useState<AbsentTimeType>(
    absentData === undefined
      ? AbsentTimeType.PERIOD
      : _startPeriod !== 0 || _endPeriod !== 0
        ? AbsentTimeType.PERIOD
        : makeTimeToString(_startAt) !== '00:00' && makeTimeToString(_endAt) !== '00:00'
          ? AbsentTimeType.TIME
          : AbsentTimeType.NONE,
  )

  const _reason = _reasonText ? (reasonType.includes(_reasonText) ? _reasonText : '기타') : ''

  const [reason, setReason] = useState(_reason)
  const [reasonText, setReasonText] = useState(_reasonText)
  const [report, setReport] = useState(_reportType)
  const [evidenceType, setEvidenceType] = useState(
    absentData && desType[_description]?.evidenceFileType.includes(absentData?.evidenceType)
      ? absentData?.evidenceType
      : absentData?.evidenceType.includes('별첨')
        ? '증빙서류 별도첨부'
        : '기타',
  )
  const [evidenceTypeText, setEvidenceTypeText] = useState(
    absentData && desType[_description]?.evidenceFileType.includes(absentData?.evidenceType)
      ? ''
      : absentData?.evidenceType.replace('(별첨)', ''),
  )
  const [isEvidenceFile2, setIsEvidenceFile2] = useState(!!absentData?.evidenceType2 || false)
  const [evidenceType2, setEvidenceType2] = useState(
    absentData && desType[_description]?.evidenceFileType.includes(absentData?.evidenceType2)
      ? absentData?.evidenceType2
      : absentData?.evidenceType2.includes('별첨')
        ? '증빙서류 별도첨부'
        : '기타',
  )
  const [evidenceType2Text, setEvidenceType2Text] = useState(
    absentData && desType[_description]?.evidenceFileType.includes(absentData?.evidenceType2)
      ? ''
      : absentData?.evidenceType2.replace('(별첨)', ''),
  )
  const [parentsName, setParentsName] = useState((me?.role === Role.USER ? me?.nokName : child?.nokName) || '')
  const [parentsPhone, setParentsPhone] = useState((me?.role === Role.USER ? me?.nokPhone : child?.nokPhone) || '')
  const [startAt, setStartAt] = useState(_startAt ? makeDateToString(_startAt) : '')
  const [endAt, setEndAt] = useState(_endAt ? makeDateToString(_endAt) : '')
  const [description, setDescription] = useState(_description || '')
  const [parentComment, setParentComment] = useState(_parentComment || '')
  const [teacherComment, setTeacherComment] = useState(_teacherComment || '')

  const [startHour, setStartHour] = useState(_startAt ? new Date(_startAt).getHours() : 9)
  const [startMinute, setStartMinute] = useState(_startAt ? new Date(_startAt).getMinutes() : 0)
  const [endHour, setEndHour] = useState(_endAt ? new Date(_endAt).getHours() : 16)
  const [endMinute, setEndMinute] = useState(_endAt ? new Date(_endAt).getMinutes() : 40)
  const [startPeriod, setStartPeriod] = useState(getPeriodStr(_startPeriod))
  const [endPeriod, setEndPeriod] = useState(getPeriodStr(_endPeriod))

  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [openSignModal, setSignModal] = useState(false)
  const [willRemoveImages, setWillRemoveImages] = useState<string[]>([])

  const [selectedUsers, setSelectedUsers] = useState<User[]>(groupStudentsData || [])

  const { imageObjectMap, handleImageAdd, toggleImageDelete } = useImageAndDocument({
    images: absentData?.evidenceFiles,
  })
  const { handleUploadFile } = useFileUpload()

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
    if (report !== '결석') {
      startAt && (date = new Date(startAt))
    } else {
      endAt && (date = new Date(endAt))
    }
    const hour = Number(endHour)
    date.setHours(hour, Number(endMinute), 0)
    return makeDateToString(date) + ' ' + makeTimeToString(date)
  }

  const { mutateAsync: createAbsentMutate } = useAbsentsCreate({
    mutation: {
      onSuccess: ({ id }) => {
        setLoading(false)
        setSignModal(false)

        //alert('결석신고서 제출이 완료되었습니다.');
        if (id) {
          push('/teacher/absent/' + id.toString())
        } else {
          push('/teacher/absent')
        }
      },
      onError: (e) => {
        try {
          const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

          alert(errorMsg?.message || '결재자 지정상태를 확인하세요.')
          setLoading(false)
          setSignModal(false)
        } catch { }
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  // 업로드할 이미지가 0개인 경우 체크
  // @example evidenceType이 학부모 확인서가 아닌경우, 이미지를 업로드해야 제출함
  const hasNoImageToUpload = [...imageObjectMap.values()].every((value) => value.isDelete)

  const uploadFiles = async (imageObjectMapParam: ImageObjectMapParam) => {
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

  const createAbsent = async (
    imageObjectMapParam: ImageObjectMapParam,
    image2ObjectMapParam: ImageObjectMapParam,
    userId: number,
  ) => {
    const allImageNames = await uploadFiles(imageObjectMapParam)
    const allImage2Names = await uploadFiles(image2ObjectMapParam)

    return createAbsentMutate({
      data: {
        studentId: userId,
        reportType: report,
        startAt: report !== '결석' && timeType === AbsentTimeType.TIME ? makeStartAt() : startAt,
        endAt: report === '결석' ? endAt : timeType === AbsentTimeType.TIME ? makeEndAt() : startAt,
        startPeriod: report !== '결석' && timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        endPeriod: report !== '결석' && timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        reason: reason,
        studentComment: reasonText,
        teacherComment: teacherComment,
        evidenceType: getEvidenceType(),
        evidenceType2: isEvidenceFile2 ? getEvidenceType2() : '',
        description: description,
        parentsName,
        parentsPhone,
        evidenceFiles: allImageNames,
        evidenceFiles2: isEvidenceFile2 ? allImage2Names : [],
        studentSignature: '',
        parentSignature: '',
        parentComment: me?.role === Role.PARENT ? parentComment : '',
      },
    })
  }

  const { mutateAsync: updateAbsentMutate } = useAbsentsUpdate({
    mutation: {
      onError: (e) => {
        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setLoading(false)
        setErrorMessage(errorMsg?.message || e.message)
      },
      onSuccess: () => {
        alert('정상적으로 수정 되었습니다.')
        setLoading(false)
        setSignModal(false)
        returnToDetail?.()
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const updateAbsent = async (
    imageObjectMapParam: ImageObjectMapParam,
    image2ObjectMapParam: ImageObjectMapParam,
    userId: number,
  ) => {
    if (!absentData) return

    const allImageNames = await uploadFiles(imageObjectMapParam)
    const allImage2Names = await uploadFiles(image2ObjectMapParam)

    return updateAbsentMutate({
      id: absentData.id,
      data: {
        studentId: userId,
        reportType: report,
        startAt: report !== '결석' && timeType === AbsentTimeType.TIME ? makeStartAt() : startAt,
        endAt: report !== '결석' && timeType === AbsentTimeType.TIME ? makeEndAt() : endAt,
        endPeriod: report !== '결석' && timeType === AbsentTimeType.PERIOD ? getPeriodNum(endPeriod) : 0,
        startPeriod: report !== '결석' && timeType === AbsentTimeType.PERIOD ? getPeriodNum(startPeriod) : 0,
        reason: reason,
        studentComment: reasonText,
        teacherComment: teacherComment,
        evidenceType: getEvidenceType(),
        evidenceType2: getEvidenceType2(),
        description: description,
        parentsName,
        parentsPhone,
        studentSignature: '',
        parentSignature: '',
        parentComment: me?.role === Role.PARENT ? parentComment : '',
        evidenceFiles: allImageNames,
        evidenceFiles2: allImage2Names,
      },
    })
  }

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

  return {
    state: {
      reason,
      reasonText,
      report,
      evidenceType,
      evidenceTypeText,
      isEvidenceFile2,
      evidenceType2,
      evidenceType2Text,
      parentsName,
      parentsPhone,
      startAt,
      endAt,
      description,
      parentComment,
      startHour,
      startMinute,
      endHour,
      endMinute,
      errorMessage,
      isLoading,
      openSignModal,
      willRemoveImages,
      timeType,
      startPeriod,
      endPeriod,
      selectedGroup,
      studentGroups,
      groupStudentsData,
      teacherComment,
    },
    setState: {
      setReason,
      setReasonText,
      setReport,
      setEvidenceType,
      setEvidenceTypeText,
      setIsEvidenceFile2,
      setEvidenceType2,
      setEvidenceType2Text,
      setParentsName,
      setParentsPhone,
      setStartAt,
      setEndAt,
      setDescription,
      setParentComment,
      setStartHour,
      setStartMinute,
      setEndHour,
      setEndMinute,
      setErrorMessage,
      setLoading,
      setSignModal,
      setWillRemoveImages,
      setTimeType,
      setStartPeriod,
      setEndPeriod,
      setSelectedGroup,
      setSelectedUsers,
      setTeacherComment,
    },
    selectedUsers,
    allKlassGroups,
    reasonType,
    desType,
    updateAbsent,
    createAbsent,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    hasNoImageToUpload,
  }
}
