import { useState } from 'react'

// ! 개선 필요
import { useHistory } from '@/hooks/useHistory'
import { useActivityCreate, useActivityUpdate } from '@/legacy/generated/endpoint'
import { ActivityType, UploadFileTypeEnum, type Group, type RequestCreateActivityDto } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import type { DocumentObject } from '@/legacy/types/document-object'
import type { ImageObject } from '@/legacy/types/image-object'
import { DateFormat, DateUtil } from '@/legacy/util/date'

import { GroupContainer } from './group'
import { useTeacherActivityDetail } from './teacher-activity-detail'

import { Routes } from '@/legacy/routes'

export function useTeacherActivityAdd(activityId?: number) {
  const { push } = useHistory()
  const { teacherSubjects } = GroupContainer.useContext()

  const teacherGroupSubjects: string[] = [...new Set(teacherSubjects.map((item) => item.subject))]

  const [errorMessage, setErrorMessage] = useState('')
  const { activity } = useTeacherActivityDetail(activityId)

  const [title, setTitle] = useState(activity?.title ?? '')
  const [content, setContent] = useState(activity?.content || '')
  const [subject, setSubject] = useState(activity?.subject ?? teacherGroupSubjects?.[0] ?? '')
  const [type, setType] = useState<ActivityType>(activity?.type ?? ActivityType.POST)
  //const [endDate, setEndDate] = useState<string>(activity?.endDate || new Date(DayAfter(new Date())).toISOString());
  const [endDate, setEndDate] = useState(
    activity?.endDate ? DateUtil.formatDate(activity?.endDate, DateFormat['YYYY-MM-DD HH:mm']) : '',
  )
  const [endDateOff, setEndDateOff] = useState(activity?.endDate ? false : true)
  const [isPhrase, setIsPhrase] = useState(activity?.isRecord ?? false)
  const [explainText, setExplainText] = useState(activity?.explainText ?? '')
  const [phrase, setPhrase] = useState(activity?.commonText ?? '')
  const [isImage, setIsImage] = useState(activity?.isImage ?? false)
  const [isFile, setIsFile] = useState(activity?.isFile ?? false)
  const [isContent, setIsContent] = useState(activity?.isContent ?? true)

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
  } = useImageAndDocument({ images: activity?.images, documents: activity?.files })

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const { mutateAsync: createActivityMutate, isLoading: isCreateActivityMutate } = useActivityCreate({
    mutation: {
      onSuccess: (result) => {
        push(`${Routes.teacher.activity.detail.replace(':id', String(result.id))}`)
      },
      onError: () => {
        setErrorMessage('활동 등록에 실패했습니다.')
      },
    },
  })

  const { mutateAsync: updateActivityMutate, isLoading: isUpdateActivityMutate } = useActivityUpdate({
    mutation: {
      onSuccess: (result) => {
        push(`${Routes.teacher.activity.detail.replace(':id', String(result.id))}`)
      },
      onError: () => {
        setErrorMessage('활동 수정에 실패했습니다.')
      },
    },
  })

  const firstGroup: Group[] = []
  const secondGroup: Group[] = []
  const thirdGroup: Group[] = []
  const restGroup: Group[] = []

  const [selectedGroups, setSelectedGroups] = useState<Group[]>(activity?.groupActivities.map((g) => g.group) || [])

  const groups = teacherSubjects
    .filter((tg) => tg?.subject === subject)
    .slice()
    // .filter(
    //   (g: Group, i: number, groups: Group[]) =>
    //     !!g && groups.filter((gp: Group) => !!gp && gp?.name === g?.name)[0].id === g.id,
    // )
    // .filter((g: Group, i: number, groups: Group[]) => !!g && groups.map((el: Group) => el.id).indexOf(g.id) === i)
    .sort((a, b) => {
      if (!a.group.name || !b.group.name) {
        return 0
      }
      const aData = a.group.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')
      const bData = b.group.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')

      if (aData?.[1] === bData?.[1]) {
        return Number(aData?.[2]) - Number(bData?.[2])
      } else {
        return Number(aData?.[1]) - Number(bData?.[1])
      }
    })

  groups?.map((item) => {
    if (item.group.name?.includes('1학년')) {
      firstGroup.push(item.group)
    } else if (item.group.name?.includes('2학년')) {
      secondGroup.push(item.group)
    } else if (item.group.name?.includes('3학년')) {
      thirdGroup.push(item.group)
    } else {
      restGroup.push(item.group)
    }
    return item.group
  })

  const selectedGroupIds = selectedGroups?.map((el) => el.id) || []
  const isLoading = isUploadLoading || isCreateActivityMutate || isUpdateActivityMutate
  const isContainQuestion = true
  // if (type === ActivityType.SURVEY && content) {
  //   const survey = new Survey.Model(JSON.parse(content));
  //   if (survey.getAllQuestions().length > 0) {
  //     isContainQuestion = true;
  //   }
  // }
  const buttonDisabled =
    !title ||
    !content ||
    !subject ||
    !type ||
    !selectedGroups.length ||
    (!endDateOff && !endDate?.length) ||
    (type === ActivityType.SURVEY && !isContainQuestion)

  async function handleSubmit({
    activityPayload,
    imageObjectMap: _imageObjectMap,
    documentObjectMap: _documentObjectMap,
  }: {
    activityPayload?: RequestCreateActivityDto
    imageObjectMap: Map<number, ImageObject>
    documentObjectMap: Map<number, DocumentObject>
  }) {
    try {
      if (!activityPayload) return

      // file image 처리
      const imageFiles = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['activities/images'], imageFiles)

      // url image 처리
      const imageUrlNames = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]

      const allImageNames = [...imageUrlNames, ...imageFileNames]

      // file document 처리
      const documentFiles = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['activities/files'], documentFiles)

      const documentUrlNames = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]

      const allDocumentNames = [...documentUrlNames, ...documentFileNames]

      const payload = activityPayload
      if (activityId) {
        return updateActivityMutate({
          id: activityId,
          data: {
            ...payload,
            images: allImageNames,
            files: allDocumentNames,
          },
        })
      } else {
        return createActivityMutate({
          data: {
            ...payload,
            images: allImageNames,
            files: allDocumentNames,
          },
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return {
    teacherGroupSubjects,
    title,
    subject,
    content,
    type,
    endDate,
    endDateOff,
    isPhrase,
    explainText,
    phrase,
    isImage,
    isFile,
    isContent,
    selectedGroups,
    firstGroup,
    secondGroup,
    thirdGroup,
    restGroup,
    selectedGroupIds,
    imageObjectMap,
    documentObjectMap,
    buttonDisabled,
    errorMessage,
    isLoading,
    setTitle,
    setSubject,
    setContent,
    setType,
    setEndDate,
    setEndDateOff,
    setIsPhrase,
    setExplainText,
    setPhrase,
    setIsImage,
    setIsFile,
    setIsContent,
    setSelectedGroups,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    handleSubmit,
  }
}
