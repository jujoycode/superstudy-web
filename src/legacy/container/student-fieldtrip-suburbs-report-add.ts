import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useFieldtripResultUpdateResult, useFieldtripsFindOne } from '@/legacy/generated/endpoint'
import { Role, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { childState } from '@/stores'
import { ImageObject } from '@/legacy/types/image-object'
import { errorType } from '@/legacy/types'
import { UserContainer } from './user'

type Props = {
  id: number
}

type Images = Array<{
  file: File | null
  url: string | null
}>

export function useStudentFieldtripSuburbsReportAdd({ id }: Props) {
  const { me } = UserContainer.useContext()
  const child = useRecoilValue(childState)

  const [errorMessage, setErrorMessage] = useState('')
  const [parentsName, setParentsName] = useState(me?.nokName || '')
  const [parentsPhone, setParentsPhone] = useState(me?.nokPhone)
  const [destination, setDestination] = useState('')
  const [overseas, setOverseas] = useState(false)
  const [resultText, setResultText] = useState('')
  const [resultTitle, setResultTitle] = useState('')
  const [images, setImages] = useState<Images>([{ file: null, url: null }])
  const [approverName, setApproverName] = useState<string>()

  const {
    data: fieldtrip,
    isLoading: isGetFieldtripLoading,
    error,
  } = useFieldtripsFindOne(id, {
    query: {
      onSuccess: ({ destination, overseas, resultTitle, resultText }) => {
        setDestination(destination)
        setOverseas(overseas)
        setResultTitle(resultTitle)
        setResultText(resultText)
      },
    },
    request: {
      headers: {
        'child-user-id': child?.id,
      },
    },
  })

  const { imageObjectMap, handleImageAdd, toggleImageDelete } = useImageAndDocument({
    images: fieldtrip?.resultFiles,
  })
  const { handleUploadFile } = useFileUpload()

  const {
    mutateAsync: updateFieldtripResultMutate,
    isLoading: isUpdateFieldtripLoading,
    isSuccess: isUpdateFieldtripSuccess,
  } = useFieldtripResultUpdateResult({
    mutation: {
      onSuccess: (data) => {
        if (!data) return

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
      },
      onError: (e) => {
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

  type ImageObjectMapParam = Map<number, ImageObject>

  const updateFieldtripResult = async (_imageObjectMap: ImageObjectMapParam, signData: string[]) => {
    if (!fieldtrip) return

    const imageFiles = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['fieldtrips/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [..._imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    const allImageNames = [...imageUrlNames, ...imageFileNames]

    const { id, type } = fieldtrip
    updateFieldtripResultMutate({
      id,
      data: {
        type,
        resultText,
        destination,
        overseas,
        resultFiles: allImageNames, // getResultImages(),
        studentResultSignature: signData[0],
        parentResultSignature: me?.role === Role.PARENT ? signData[1] : '',
        resultTitle,
      },
    }).catch((e) => console.error(e))
  }

  useEffect(() => {
    if (!parentsName && me?.nokName) {
      setParentsName(me.nokName)
    }
    if (me?.nokPhone) {
      setParentsPhone(me.nokPhone)
    }
    if (fieldtrip && !destination) {
      setDestination(fieldtrip?.destination)
    }
  }, [fieldtrip])

  const isLoading = isGetFieldtripLoading || isUpdateFieldtripLoading

  return {
    fieldtrip,
    isLoading,
    error,
    errorMessage,
    updateFieldtripResult,
    isUpdateFieldtripSuccess,
    parentsPhone,
    parentsName,
    destination,
    overseas,
    resultText,
    resultTitle,
    images,

    setParentsPhone,
    setParentsName,
    setDestination,
    setOverseas,
    setResultText,
    setResultTitle,
    setImages,

    me,
    approverName,

    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
  }
}
