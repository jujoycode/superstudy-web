import { useStudentActivityUpdate } from '@/legacy/generated/endpoint'
import { RequestUpdateStudentActivityDto, StudentActivity, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'

export function useStudentActivityDetailSubmit(
  studentActivity: StudentActivity,
  setReadState: () => void,
  setLoading: (state: boolean) => void,
) {
  const { mutate: updateStudentActivity } = useStudentActivityUpdate({
    mutation: {
      onSuccess: () => {
        setLoading(false)
        alert('활동 내용이 정상적으로 제출되었습니다.')
        setReadState()
      },
    },
  })

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
  } = useImageAndDocument({ images: studentActivity.images, documents: studentActivity.files })

  const { handleUploadFile } = useFileUpload()

  /**
   * studentActivityId 가 0 이면 새로 생성
   * @param studentActivityId
   * @param data
   */
  const handleStudentActivityUpdate = async (studentActivityId: number, data: RequestUpdateStudentActivityDto) => {
    setLoading(true)

    // file image 처리
    const imageFiles = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['test/studentactivities/images'], imageFiles)

    // url image 처리
    const imageUrlNames = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]

    const allImageNames = [...imageUrlNames, ...imageFileNames]

    // file document 처리
    const documentFiles = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && value.document instanceof File)
      .map((value) => value.document) as File[]
    const documentFileNames = await handleUploadFile(UploadFileTypeEnum['test/studentactivities/files'], documentFiles)

    const documentUrlNames = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.document === 'string')
      .map((value) => value.document) as string[]

    const allDocumentNames = [...documentUrlNames, ...documentFileNames]

    updateStudentActivity({
      id: studentActivityId,
      data: {
        ...data,
        images: allImageNames,
        files: allDocumentNames,
      },
    })
  }

  // test/studentactivities/files
  const uploadFiles = async (files: File[]) => {
    return await handleUploadFile(UploadFileTypeEnum['test/studentactivities/files'], files)
  }

  return {
    imageObjectMap,
    documentObjectMap,
    handleStudentActivityUpdate,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    uploadFiles,
  }
}
