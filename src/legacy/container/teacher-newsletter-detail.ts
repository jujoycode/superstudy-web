import { useState } from 'react'
import { useQueryClient } from 'react-query'

// ! 로직 개선
import { Routes } from '@/legacy/constants/routes'

import {
  useNewsLettersDelete,
  useNewsLettersFindOne,
  useNewsLettersPublish,
  useNewsLettersUpdate,
} from '@/legacy/generated/endpoint'
import { Constants } from '@/legacy/constants'
import { QueryKey } from '@/legacy/constants/query-key'
import { isPdfFile } from '@/legacy/util/file'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { NewsletterCategoryEnum, NewsletterType, UploadFileTypeEnum } from '@/legacy/generated/model'
import type { DocumentObject } from '@/legacy/types/document-object'
import type { ImageObject } from '@/legacy/types/image-object'
import type { ImageDecorator } from 'react-viewer/lib/ViewerProps'

interface NewsletterCore {
  id: number
  title: string
  content: string
  surveyContent: string
  category: NewsletterCategoryEnum
  images: string[]
  files: string[]
  klasses: string[]
  type: NewsletterType
  endAt: string | null
  isPublished: boolean
  recvuserIds: number[]
  toStudent: boolean
  toParent: boolean
  toPerson: boolean
}

export function useTeacherNewsletterDetail({ id }: { id?: number }) {
  const queryClient = useQueryClient()
  const { push } = useHistory()

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isPublish, setIsPublish] = useState(false)
  const [category, setCategory] = useState<NewsletterCategoryEnum | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState('')

  const { data: newsletter, isLoading: isNewsletterLoading } = useNewsLettersFindOne(id as number, {
    query: {
      enabled: !!id,
      onError: () => {
        setErrorMessage('이미 삭제되었거나 더 이상 유효하지 않습니다.')
      },
    },
  })

  const [endAt, setEndAt] = useState(
    newsletter?.endAt ? DateUtil.formatDate(newsletter.endAt, DateFormat['YYYY-MM-DD HH:mm']) : null,
  )
  const [endDateOff, setEndDateOff] = useState(newsletter?.endAt === null ? false : true)

  const { mutate: deleteNewsletterMutate, isLoading: isDeleteNewsletterMutate } = useNewsLettersDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.newsletterList)
        push(Routes.teacher.newsletter)
      },
    },
  })

  const { mutate: updateNewsletterMutate } = useNewsLettersUpdate({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries(QueryKey.teacher.newsletterList)
        push(`${Routes.teacher.newsletter}/${data.id}`)
        console.log('useTeacherNewsletterAdd - updateNewsletterMutate - onSuccess', data)
      },
      onError: () => {
        setErrorMessage('가정통신문 생성에 실패했습니다.')
      },
    },
  })

  const { handleUploadFile } = useFileUpload()

  useNewsLettersPublish(id as number, {
    query: {
      enabled: !!id && isPublish,
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.newsletterList)
      },
      onError: () => {
        setErrorMessage('발행에 실패했습니다.')
      },
    },
  })

  const isLoading = isNewsletterLoading || isDeleteNewsletterMutate

  const images = newsletter?.images.filter((image) => !isPdfFile(image)) || []
  const Pdfs = newsletter?.images.filter((image) => isPdfFile(image)) || []
  const documents = newsletter?.files || []
  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  const handleNewsletterDelete = (id: number) => {
    deleteNewsletterMutate({ id })
  }

  const handleNewsletterPublish = () => {
    setIsPublishModalOpen(false)
    setIsPublish(true)
  }

  const { imageObjectMap, documentObjectMap } = useImageAndDocument({
    images: newsletter?.images,
    documents: newsletter?.files,
  })

  const handleSubmit = async ({
    newsletter,
    surveyContent,
    imageObjectMapParam,
    documentObjectMapParam,
    isTemp,
    endDateOff,
    recvuserIds,
  }: {
    newsletter?: NewsletterCore
    surveyContent: string
    imageObjectMapParam: Map<number, ImageObject>
    documentObjectMapParam: Map<number, DocumentObject>
    isTemp: boolean
    endDateOff: boolean
    recvuserIds: number[]
  }) => {
    try {
      if (!newsletter) {
        return
      }
      // file image 처리
      const imageFiles = [...imageObjectMapParam.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['newsletters/images'], imageFiles)

      // url image 처리
      const imageUrlNames = [...imageObjectMapParam.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]

      const allImageNames = [...imageUrlNames, ...imageFileNames]

      // file document 처리
      const documentFiles = [...documentObjectMapParam.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['newsletters/files'], documentFiles)

      const documentUrlNames = [...documentObjectMapParam.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]

      const allDocumentNames = [...documentUrlNames, ...documentFileNames]

      if (newsletter.id) {
        const { id, title, content, category, klasses, endAt, isPublished, toStudent, toParent, toPerson } = newsletter
        updateNewsletterMutate({
          id,
          //@ts-ignore
          data: {
            title,
            content,
            surveyContent: surveyContent,
            category,
            images: allImageNames,
            files: allDocumentNames,
            klasses,
            endAt: endDateOff ? endAt : null,
            isTemp: isTemp,
            type: newsletter.type,
            isPublished,
            toStudent,
            toParent,
            //toTeacher,
            toPerson,
            recvuserIds,
          },
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  return {
    newsletter,
    category,
    isLoading,
    images,
    Pdfs,
    documents,
    viewerImages,
    isPublishModalOpen,
    errorMessage,
    documentObjectMap,
    imageObjectMap,
    endAt,
    endDateOff,
    setCategory,
    setIsPublishModalOpen,
    handleNewsletterDelete,
    handleNewsletterPublish,
    handleSubmit,
    setEndAt,
    setEndDateOff,
  }
}
