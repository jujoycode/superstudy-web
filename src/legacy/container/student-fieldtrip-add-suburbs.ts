import { addYears, format } from 'date-fns'
import { useState } from 'react'
import { useRecoilValue } from 'recoil'

import { useFieldtripsCreate, useFieldtripsUpdate, useSchedulesFindRejectSchedule } from '@/legacy/generated/endpoint'
import { Fieldtrip, FieldtripType, Role, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import type { errorType } from '@/legacy/types'
import type { ImageObject } from '@/legacy/types/image-object'
import { usePrevious } from '@/legacy/util/hooks'
import { childState } from '@/stores'

import { UserContainer } from './user'

type Props<T> = {
  startAt: Date | null
  startPeriodS: number | null
  startHalf: boolean | null
  endAt: Date | null
  endPeriodE: number | null
  endHalf: boolean | null
  wholeDayPeriod: string | null
  selectOptions: string[]
  fieldtripData?: Fieldtrip
  returnToDetail?: () => void
  params: T
}

enum ModeState {
  create = 'create',
  update = 'update',
}

export function useStudentFieldtripAddSuburbs<T extends { [key: string]: string }>({
  fieldtripData,
  startAt,
  startPeriodS,
  startHalf,
  endAt,
  endPeriodE,
  endHalf,
  wholeDayPeriod,
  returnToDetail,
  selectOptions,
  params,
}: Props<T>) {
  const matchParamsType = params?.type
  const { me } = UserContainer.useContext()
  const child = useRecoilValue(childState)
  // Form State
  const [success, setSuccess] = useState<number>()
  const [content, setContent] = useState(fieldtripData?.content || '')
  const [accommodation, setAccommodation] = useState(
    matchParamsType?.toUpperCase() === FieldtripType.HOME ? '자택' : fieldtripData?.accommodation || '',
  )
  const [agree, setAgree] = useState(false)
  const [studentSafeAgree, setStudentSafeAgree] = useState(false)
  const [studentSafeText, setStudentSafeText] = useState(me?.school?.studentSafeText)
  const [destination, setDestination] = useState(
    matchParamsType?.toUpperCase() === FieldtripType.HOME ? '자택' : fieldtripData?.destination || '',
  )
  const [overseas, setOverseas] = useState(fieldtripData?.overseas || false)
  const [purpose, setPurpose] = useState(fieldtripData?.purpose || '')
  const [guideName, setGuideName] = useState(fieldtripData?.guideName || '')
  const [guidePhone, setGuidePhone] = useState(fieldtripData?.guidePhone || '')
  const [parentsName, setParentsName] = useState((me?.role === Role.USER ? me?.nokName : child?.nokName) || '')
  const [parentsPhone, setParentsPhone] = useState((me?.role === Role.USER ? me?.nokPhone : child?.nokPhone) || '')
  const [usedDays, setUsedDays] = useState(fieldtripData?.usedDays || 0.0)
  const prevUsedDays = usePrevious(usedDays)
  const [relationship, setRelationship] = useState(fieldtripData?.relationship || '부')
  const [relationshipText, setRelationshipText] = useState(fieldtripData?.relationship || '부')
  const [suburbsModalopen, setSuburbsModalopen] = useState(false)
  const [homeModalopen, setHomeModalopen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [homePlan, setHomePlan] = useState<any>(
    fieldtripData?.type === FieldtripType.HOME ? JSON.parse(fieldtripData?.content || '[]') : [],
  )
  const [selectOption, setSelectOption] = useState(fieldtripData?.form || selectOptions[0])

  const [isOpenSignModal, setIsOpenSignModal] = useState(false)
  const [approverName, setApproverName] = useState<string>()

  const { imageObjectMap, handleImageAdd, toggleImageDelete } = useImageAndDocument({
    images: fieldtripData?.applyFiles,
  })
  const { handleUploadFile } = useFileUpload()

  type ImageObjectMapParam = Map<number, ImageObject>

  const {
    data: cannotSchedules,
    error,
    isLoading: isGetRejectScheduleLoading,
  } = useSchedulesFindRejectSchedule(
    {
      startDate: startAt ? format(startAt, 'yyyy-MM-') + '01' : format(new Date().setDate(1), 'yyyy-MM-dd'),
      endDate: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    },
    {
      request: {
        headers: {
          'child-user-id': child?.id,
        },
      },
    },
  )

  const { mutate: createFieldtripMutate, isLoading: isCreateFieldtripLoading } = useFieldtripsCreate({
    mutation: {
      onSuccess: (data) => {
        hideModal()
        alert('체험학습 신청서가 제출되었습니다.')

        const approver1Title = data?.approver1Title || ''
        const approver2Title = data?.approver2Title || ''
        const approver3Title = data?.approver3Title || ''
        const approver4Title = data?.approver4Title || ''
        const approver5Title = data?.approver5Title || ''

        let approvers =
          (approver1Title ? approver1Title + ', ' : '') +
          (approver2Title ? approver2Title + ', ' : '') +
          (approver3Title ? approver3Title + ', ' : '') +
          (approver4Title ? approver4Title + ', ' : '') +
          (approver5Title ? approver5Title + ', ' : '')

        if (approvers.endsWith(', ')) {
          approvers = approvers.substring(0, approvers.length - 2)
        }

        setApproverName(approvers || '')
        setSuccess(data.id)
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data ? (error?.response?.data as errorType) : undefined

        alert(errorMsg?.message || '결재자 지정상태를 확인하세요.')

        hideModal()
        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const { mutate: updateFieldtripMutate, isLoading: isUpdateFieldtripLoading } = useFieldtripsUpdate({
    mutation: {
      onSuccess: () => {
        hideModal()
        alert('체험학습 신청서를 수정하였습니다.')
        returnToDetail?.()
      },
      onError: (e) => {
        hideModal()

        const errorMsg: errorType | undefined = e?.response?.data ? (e?.response?.data as errorType) : undefined

        setErrorMessage(errorMsg?.message || '일시적 오류 입니다. 잠시 후 다시 시도해주세요.')
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const hideModal = () => {
    setIsOpenSignModal(false)
  }

  const openModal = () => {
    setIsOpenSignModal(true)
  }

  const getTypeFromParams = () => {
    return matchParamsType === FieldtripType.SUBURBS.toLowerCase() ? FieldtripType.SUBURBS : FieldtripType.HOME
  }

  // 신청서 생성
  const createFieldtrip = async (_imageObjectMap: ImageObjectMapParam, signData: string[]) => {
    if (!startAt || !endAt) return

    const imageFiles = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['fieldtrips/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    const allImageNames = [...imageUrlNames, ...imageFileNames]

    createFieldtripMutate({
      data: {
        type: getTypeFromParams(),
        content: matchParamsType?.toUpperCase() === FieldtripType.HOME ? JSON.stringify(homePlan) : content,
        accommodation,
        destination,
        overseas,
        guideName,
        guidePhone,
        parentsName,
        parentsPhone,
        startAt: startAt.toISOString(),
        startPeriodS: startHalf ? startPeriodS || 0 : 0,
        endAt: endAt.toISOString(),
        endPeriodE: endHalf ? endPeriodE || 0 : 0,
        wholeDayPeriod: wholeDayPeriod || '',
        relationship: relationshipText,
        form: selectOption,
        purpose,
        usedDays,
        studentSignature: signData[0],
        parentSignature: me?.role === Role.PARENT ? signData[1] : '',
        applyFiles: allImageNames,
      },
    })
  }

  // 신청서 수정
  const updateFieldtrip = async (_imageObjectMap: ImageObjectMapParam, signData: string[]) => {
    if (!fieldtripData || !startAt || !endAt) return

    const imageFiles = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['fieldtrips/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    const allImageNames = [...imageUrlNames, ...imageFileNames]

    updateFieldtripMutate({
      id: fieldtripData.id,
      data: {
        type: fieldtripData.type,
        content: fieldtripData?.type === FieldtripType.HOME ? JSON.stringify(homePlan) : content,
        accommodation,
        destination,
        overseas,
        guideName,
        guidePhone,
        parentsName,
        parentsPhone,
        startAt: startAt.toISOString(),
        startPeriodS: startHalf ? startPeriodS || 0 : 0,
        endAt: endAt.toISOString(),
        endPeriodE: endHalf ? endPeriodE || 0 : 0,
        wholeDayPeriod: wholeDayPeriod || '',
        relationship: relationshipText === '' ? relationship : relationshipText,
        form: selectOption,
        purpose,
        usedDays,
        studentSignature: signData?.[0] ? signData[0] : '',
        parentSignature: signData?.[1] ? signData[1] : '',
        applyFiles: allImageNames,
      },
    })
  }

  const isHomePlanType = (): boolean => {
    const mode = params.type ? ModeState.create : ModeState.update // mode: 생성하기, 수정하기 모드
    // 생성하기 페이지인 경우 params.type이 home인지 확인
    return mode === ModeState.create ? matchParamsType === 'home' : fieldtripData?.type === FieldtripType.HOME
  }

  const isLoading = isGetRejectScheduleLoading || isCreateFieldtripLoading || isUpdateFieldtripLoading

  return {
    cannotSchedules,
    error,
    isLoading,
    openModal,
    hideModal,
    isOpenSignModal,
    updateFieldtrip,
    createFieldtrip,
    prevUsedDays,
    isHomePlanType,

    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,

    setState: {
      setPurpose,
      setContent,
      setAccommodation,
      setAgree,
      setStudentSafeAgree,
      setDestination,
      setOverseas,
      setGuideName,
      setGuidePhone,
      setParentsName,
      setParentsPhone,
      setUsedDays,
      setRelationship,
      setRelationshipText,
      setSuburbsModalopen,
      setHomeModalopen,
      setHomePlan,
      setSelectOption,
    },
    state: {
      purpose,
      content,
      accommodation,
      agree,
      studentSafeAgree,
      studentSafeText,
      destination,
      overseas,
      guideName,
      guidePhone,
      parentsName,
      parentsPhone,
      usedDays,
      relationship,
      relationshipText,
      suburbsModalopen,
      homeModalopen,
      homePlan,
      success,
      errorMessage,
      approverName,
      selectOption,
    },
  }
}
