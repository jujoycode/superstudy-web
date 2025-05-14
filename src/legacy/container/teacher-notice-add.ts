import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useHistory } from '@/hooks/useHistory'
import { QueryKey } from '@/legacy/constants/query-key'
import { Routes } from '@/legacy/constants/routes'
import { useNoticesCreate, useNoticesUpdate } from '@/legacy/generated/endpoint'
import { Notice, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { DocumentObject } from '@/legacy/types/document-object'
import { ImageObject } from '@/legacy/types/image-object'
import { useUserStore } from '@/stores2/user'

const initialNoticeState: Notice = {
  id: 0,
  createdAt: '',
  updatedAt: '',
  title: '',
  content: '',
  category: '',
  userId: 0,
  images: [],
  files: [],
  user: null as any,
  schoolId: -1,
  toStudent: false,
  toParent: false,
}

export function useTeacherNoticeAdd(noticeData?: Notice) {
  const { push } = useHistory()
  const queryClient = useQueryClient()

  const { setIsUpdateNotice: setIsNoticeUpdate } = useUserStore()

  const [notice, setNotice] = useState<Notice>(noticeData || initialNoticeState)
  const [errorMessage, setErrorMessage] = useState('')
  const [toStudent, setToStudent] = useState(noticeData?.toStudent || false)
  const [toParent, setToParent] = useState(noticeData?.toParent || false)

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
  } = useImageAndDocument({ images: notice?.images, documents: notice?.files })

  const { mutate: createNoticeMutate, isLoading: isCreateNoticeLoading } = useNoticesCreate({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries(QueryKey.teacher.notice)
        queryClient.invalidateQueries(QueryKey.teacher.noticeList)
        push(`${Routes.teacher.notice}/${result.id}`)
      },
      onError: () => {
        setErrorMessage('공지사항 등록에 실패했습니다.')
      },
    },
  })

  const { mutate: updateNoticeMutate, isLoading: isUpdateNoticeLoading } = useNoticesUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.notice)
        queryClient.invalidateQueries(QueryKey.teacher.noticeList)
        setIsNoticeUpdate(false)
      },
      onError: () => {
        setErrorMessage('공지사항 수정에 실패했습니다.')
      },
    },
  })

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const isLoading = isCreateNoticeLoading || isUpdateNoticeLoading || isUploadLoading
  const submitButtonDisabled =
    !notice?.title?.length || !notice?.content?.length || !notice?.category?.length || (!toParent && !toStudent)

  async function handleSubmit({
    notice,
    imageObjectMap: _imageObjectMap,
    documentObjectMap: _documentObjectMap,
  }: {
    notice?: Notice
    imageObjectMap: Map<number, ImageObject>
    documentObjectMap: Map<number, DocumentObject>
  }) {
    try {
      if (!notice) return

      // file image 처리
      const imageFiles = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['notices/images'], imageFiles)

      // url image 처리
      const imageUrlNames = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]

      const allImageNames = [...imageUrlNames, ...imageFileNames]

      // file document 처리
      const documentFiles = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['notices/files'], documentFiles)

      const documentUrlNames = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]

      const allDocumentNames = [...documentUrlNames, ...documentFileNames]

      if (notice.id) {
        const { id, title, content, category } = notice
        updateNoticeMutate({
          id,
          data: {
            title,
            content,
            category,
            images: allImageNames,
            files: allDocumentNames,
            toStudent,
            toParent,
          },
        })
      } else {
        const { title, content, category } = notice
        createNoticeMutate({
          data: {
            title,
            content,
            category,
            images: allImageNames,
            files: allDocumentNames,
            toStudent,
            toParent,
          },
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  return {
    notice,
    imageObjectMap,
    documentObjectMap,
    errorMessage,
    isLoading,
    submitButtonDisabled,
    toStudent,
    toParent,
    setNotice,
    handleImageAdd,
    handleDocumentAdd,
    toggleImageDelete,
    toggleDocumentDelete,
    handleSubmit,
    setToStudent,
    setToParent,
  }
}
