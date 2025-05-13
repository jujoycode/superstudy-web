import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { Routes } from '@/legacy/constants/routes'
import { QueryKey } from '@/legacy/constants/query-key'
import { useNewsLettersCreate, useNewsLettersPublish, useNewsLettersUpdate } from '@/legacy/generated/endpoint'
import { NewsletterCategoryEnum, NewsletterType, ResponseGroupDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { DocumentObject } from '@/legacy/types/document-object'
import { ImageObject } from '@/legacy/types/image-object'
import { UserDatas } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { isPdfFile } from '@/legacy/util/file'
import { getErrorMsg } from '@/legacy/util/status'
import { GroupContainer } from './group'
import { MergedGroupType } from './teacher-chat-user-list'
import { TeacharAllGroup, useTeacherAllGroup } from './teacher-group-all'
import { useTeacherNewsletterDetail } from './teacher-newsletter-detail'

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
  toPerson: boolean
  recvuserIds: number[]
}

const initNewsletter: NewsletterCore = {
  id: 0,
  title: '',
  content: '',
  surveyContent: '',
  category: NewsletterCategoryEnum['교무'],
  images: [],
  files: [],
  klasses: [],
  type: NewsletterType.NOTICE,
  endAt: null,
  isPublished: false,
  toPerson: false,
  recvuserIds: [],
}

export function useTeacherNewsletterAdd(id: string) {
  const { push } = useHistory()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const { newsletter: editData } = useTeacherNewsletterDetail({ id: +id })

  const [newsletter, setNewsletter] = useState<NewsletterCore>(editData || initNewsletter)
  const [surveyContent, setSurveyContent] = useState<any[]>(JSON.parse(editData?.surveyContent || '[]'))
  const [errorMessage, setErrorMessage] = useState('')
  const [category, setCategory] = useState<NewsletterCategoryEnum>()
  const [endAt, setEndAt] = useState(
    editData?.endAt ? DateUtil.formatDate(editData.endAt, DateFormat['YYYY-MM-DD HH:mm']) : null,
  )
  const [preview] = useState(false)
  const [endDateOff, setEndDateOff] = useState(editData?.endAt === null || editData?.endAt === undefined ? false : true)
  const [, setIsPublishModalOpen] = useState(false)
  const [isPublish, setIsPublish] = useState(false)
  const [publishedId, setPublishedId] = useState(0)
  const [toStudent, setToStudent] = useState(editData?.toStudent || false)
  const [toParent, setToParent] = useState(editData?.toParent || false)
  const [toPerson, setToPerson] = useState(editData?.toPerson || false)
  const [toPersonalSection, setToPersonalSection] = useState(editData?.toPerson ? true : false)
  const { allGroups: teacherAllGroups } = useTeacherAllGroup()
  const [selectedUserType, setSelectedUserType] = useState(editData?.toPerson ? 2 : editData?.toParent ? 1 : 0 || 0) // 0 학생, 1 보호자, 2 선생님
  const [selectedUserDatas] = useState<UserDatas[]>([]) // 0 학생, 1 보호자, 2 선생님
  const [selectedUsers, setSelectedUsers] = useState(editData?.userInfo || [])
  const [selectedGroup, setSelectedGroup] = useState<MergedGroupType | null>(null)

  const { pathname } = useLocation()

  const images = editData?.images.filter((image) => !isPdfFile(image)) || []
  const documents = editData?.files || []

  const { allKlassGroups } = GroupContainer.useContext()
  function mergeGroups(allKlassGroups: ResponseGroupDto[], teacherAllGroups: TeacharAllGroup[]): MergedGroupType[] {
    const mergedGroups: MergedGroupType[] = []

    const gradeRegex = /(\d{1,2})학년/
    let preGrade = ''
    for (const klassGroup of allKlassGroups) {
      const match = klassGroup.name?.match(gradeRegex)

      if (match) {
        const grade = match[1]

        if (preGrade !== grade) {
          mergedGroups.push({
            id: Number('-' + grade + '00'),
            name: grade.toString() + '학년 전체',
            type: 'KLASS',
          })

          preGrade = grade
        }
      }

      mergedGroups.push({
        id: klassGroup.id,
        name: klassGroup.name || '',
        type: klassGroup.type,
      })
    }

    for (const teacherGroup of teacherAllGroups) {
      const existingGroupIndex = mergedGroups.findIndex((group) => group.id === teacherGroup.id)
      if (existingGroupIndex === -1) {
        mergedGroups.push({
          id: teacherGroup.id,
          name: teacherGroup.name,
          type: teacherGroup.type === 'FIX' ? 'KLASS' : 'KLUB',
        })
      }
    }

    return mergedGroups
  }

  const allGroups = mergeGroups(allKlassGroups, teacherAllGroups)

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
  } = useImageAndDocument({ images: editData?.images, documents: editData?.files })

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const { mutate: createNewsletterMutate, isLoading: isCreateNewsletterLoading } = useNewsLettersCreate({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries(QueryKey.teacher.newsletterList)
        setPublishedId(data.id)
        setLoading(false)
        if (!isPublish) {
          push(`${Routes.teacher.newsletter}/${data.id}`)
          console.log('useTeacherNewsletterAdd - createNewsletterMutate - onSuccess', data)
        }
      },
      onError: () => {
        setLoading(false)
        setErrorMessage('가정통신문 생성에 실패했습니다.')
      },
    },
  })

  const { mutate: updateNewsletterMutate, isLoading: isUpdateNewsletterLoading } = useNewsLettersUpdate({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries(QueryKey.teacher.newsletterList)
        setPublishedId(newsletter.id)
        setLoading(false)
        if (!isPublish) {
          push(`${Routes.teacher.newsletter}/${newsletter.id}`)
          console.log('useTeacherNewsletterAdd - updateNewsletterMutate - onSuccess', data)
        }
      },
      onError: () => {
        setLoading(false)
        setErrorMessage('가정통신문 생성에 실패했습니다.')
      },
    },
  })

  useNewsLettersPublish(publishedId, {
    query: {
      enabled: !!publishedId && isPublish,
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.newsletterList)
        push(`${Routes.teacher.newsletter}/${publishedId}`)
        console.log('useTeacherNewsletterAdd - useNewsLettersPublish - onSuccess')
      },
      onError: (err) => {
        setErrorMessage(getErrorMsg(err))
      },
    },
  })

  let buttonDisabled =
    !newsletter?.title?.length ||
    !newsletter?.content?.length ||
    !newsletter?.type?.length ||
    !newsletter?.category?.length ||
    (!toStudent && !toParent && !toPerson) ||
    (toStudent && !newsletter?.klasses?.length) ||
    (toParent && !newsletter?.klasses?.length) ||
    (toPerson && !selectedUsers.length) ||
    (endDateOff && !endAt?.length)

  // if (newsletter?.type !== NewsletterType.NOTICE) {
  //   buttonDisabled = endDateOff && !endAt?.length;
  // }
  const isLoading = isCreateNewsletterLoading || isUpdateNewsletterLoading || isUploadLoading

  const handleCheckboxToggle = (gradeNum: number) => {
    const grade = gradeNum.toString()

    if (newsletter.klasses.includes(grade.toString())) {
      setNewsletter((prevState) => ({
        ...prevState,
        klasses: prevState.klasses.filter((el) => el !== grade),
      }))
    } else {
      setNewsletter((prevState) => ({ ...prevState, klasses: [...prevState.klasses, grade] }))
    }
  }

  const handleNewsletterPublish = () => {
    setIsPublishModalOpen(false)
    setIsPublish(true)
  }

  async function handleSubmit({
    newsletter,
    surveyContent,
    imageObjectMap: _imageObjectMap,
    documentObjectMap: _documentObjectMap,
    isTemp,
    endDateOff,
    recvuserIds,
    toStudent,
    toParent,
    toPerson,
  }: {
    newsletter?: NewsletterCore
    surveyContent: string
    imageObjectMap: Map<number, ImageObject>
    documentObjectMap: Map<number, DocumentObject>
    isTemp: boolean
    endDateOff: boolean
    recvuserIds: number[]
    toStudent: boolean
    toParent: boolean
    toPerson: boolean
  }) {
    try {
      if (!newsletter) return

      // 설문 내용 id 재정렬
      let orderedSurveyContent = surveyContent
      if (typeof surveyContent === 'string') {
        const parsed = JSON.parse(surveyContent)
        orderedSurveyContent = JSON.stringify(
          parsed.map((item: any, index: number) => ({
            ...item,
            id: index + 1,
          })),
        )
      }

      const klassesmap = Array.from(
        new Set(
          selectedUsers.map((el: any) => {
            const klass = el.klass ? el.klass : el.children[0].klass
            return parseInt(klass.match(/\d+/)[0])
          }),
        ),
      ).map(String)
      // file image 처리
      const imageFiles = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['newsletters/images'], imageFiles)

      // url image 처리
      const imageUrlNames = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]

      const allImageNames = [...imageUrlNames, ...imageFileNames]

      // file document 처리
      const documentFiles = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['newsletters/files'], documentFiles)

      const documentUrlNames = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]

      const allDocumentNames = [...documentUrlNames, ...documentFileNames]

      if (newsletter.id) {
        const { id, title, content, category, klasses, type, isPublished } = newsletter

        if (!pathname.endsWith('reuse')) {
          updateNewsletterMutate({
            id,
            //@ts-ignore
            data: {
              ...newsletter,
              title,
              content,
              surveyContent: orderedSurveyContent,
              category,
              images: allImageNames,
              files: allDocumentNames,
              klasses: toPerson ? klassesmap : klasses,
              type,
              endAt: endDateOff ? endAt : null,
              isTemp: isTemp,
              isPublished,
              toStudent,
              toParent,
              toPerson,
              recvuserIds: !toPerson ? [] : recvuserIds,
            },
          })
        } else {
          createNewsletterMutate({
            //@ts-ignore
            data: {
              //...newsletter,
              title,
              content,
              surveyContent: orderedSurveyContent,
              category,
              images: allImageNames,
              files: allDocumentNames,
              klasses: toPerson ? klassesmap : klasses,
              type,
              endAt: endDateOff ? endAt : null,
              isTemp: isTemp,
              isPublished: false,
              toStudent,
              toParent,
              toPerson,
              recvuserIds: !toPerson ? [] : recvuserIds,
            },
          })
        }
      } else {
        const { title, content, category, klasses, type } = newsletter
        createNewsletterMutate({
          data: {
            ...newsletter,
            title,
            content,
            surveyContent: orderedSurveyContent,
            category,
            images: allImageNames,
            files: allDocumentNames,
            klasses: toPerson ? klassesmap : klasses,
            type,
            endAt: endDateOff ? endAt : null,
            isTemp: isTemp,
            isPublished: false,
            toStudent,
            toParent,
            toPerson,
            recvuserIds: !toPerson ? [] : recvuserIds,
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
    surveyContent,
    imageObjectMap,
    documentObjectMap,
    buttonDisabled,
    isLoading,
    errorMessage,
    endAt,
    preview,
    endDateOff,
    toStudent,
    toParent,
    toPerson,
    toPersonalSection,
    images,
    documents,
    setNewsletter,
    setCategory,
    setSurveyContent,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    handleCheckboxToggle,
    handleSubmit,
    setEndAt,
    setEndDateOff,
    setIsPublishModalOpen,
    setToStudent,
    setToParent,
    setToPerson,
    setToPersonalSection,
    selectedGroup,
    setSelectedGroup,
    selectedUserDatas,
    selectedUserType,
    setSelectedUserType,
    selectedUsers,
    allGroups,
    setSelectedUsers,
    handleNewsletterPublish,
    loading,
    setLoading,
  }
}
