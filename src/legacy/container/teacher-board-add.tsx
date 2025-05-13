import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useHistory } from '@/hooks/useHistory'
import { QueryKey } from '@/legacy/constants/query-key'
import { useBoardCreate, useBoardUpdate } from '@/legacy/generated/endpoint'
import { BoardCategoryEnum, Group, RequestCreateBoardDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
// ! 지훈쌤 개선안 적용
import { Routes } from 'src/routes'
import { DocumentObject } from '@/legacy/types/document-object'
import { ImageObject } from '@/legacy/types/image-object'
import { useTeacherBoardDetail } from './teacher-board-detail'

export function useTeacherBoardAdd({
  homeKlass,
  groups,
  boardId,
}: {
  homeKlass?: Group
  groups?: Group[]
  boardId?: number
}) {
  const { push } = useHistory()
  const queryClient = useQueryClient()

  const [errorMessage, setErrorMessage] = useState('')
  const { board } = useTeacherBoardDetail(boardId)

  const [title, setTitle] = useState(board?.title || '')
  const [content, setContent] = useState(board?.content || '')
  const [selectedCategory, setSelectedCategory] = useState<BoardCategoryEnum | undefined>(board?.category)

  const [toStudent, setToStudent] = useState(board?.toStudent || false)
  const [toParent, setToParent] = useState(board?.toParent || false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
  } = useImageAndDocument({ images: board?.images, documents: board?.files })

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const { mutate: createBoardMutate, isLoading: isCreateBoardMutate } = useBoardCreate({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries(QueryKey.teacher.boardList)
        queryClient.invalidateQueries(QueryKey.teacher.board)
        push(`${Routes.teacher.board}/${result.id}`)
      },
      onError: () => {
        setErrorMessage('학급게시판 등록에 실패했습니다.')
      },
    },
  })

  const { mutate: updateBoardMutate, isLoading: isUpdateBoardMutate } = useBoardUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKey.teacher.boardList)
        queryClient.invalidateQueries(QueryKey.teacher.board)
        push(`${Routes.teacher.board}/${board?.id}`)
      },
      onError: () => {
        setErrorMessage('학급게시판 수정에 실패했습니다.')
      },
    },
  })

  const firstGroup: Group[] = []
  const secondGroup: Group[] = []
  const thirdGroup: Group[] = []
  const fourthGroup: Group[] = []
  const fifthGroup: Group[] = []
  const sixthGroup: Group[] = []
  const restGroup: Group[] = []

  const groupList: Group[] | undefined = board
    ? ((
        board?.groupBoards as unknown as {
          id: number
          group: { id: number; name: string }
        }[]
      ).map((groupBoard) => groupBoard.group) as Group[])
    : undefined
  const [selectedGroups, setSelectedGroups] = useState<Group[]>(groupList ? groupList : homeKlass ? [homeKlass] : [])

  groups
    ?.reduce((acc: any[], current: any) => {
      if (!acc.find((item) => item.id === current.id)) {
        acc.push(current)
      }
      return acc
    }, [])
    .map((group) => {
      if (group.name?.startsWith('1학년')) {
        firstGroup.push(group)
      } else if (group.name?.startsWith('2학년')) {
        secondGroup.push(group)
      } else if (group.name?.startsWith('3학년')) {
        thirdGroup.push(group)
      } else if (group.name?.startsWith('4학년')) {
        fourthGroup.push(group)
      } else if (group.name?.startsWith('5학년')) {
        fifthGroup.push(group)
      } else if (group.name?.startsWith('6학년')) {
        sixthGroup.push(group)
      } else {
        restGroup.push(group)
      }
      return group
    })

  const selectedGroupIds = selectedGroups?.map((el) => el.id) || []
  const isLoading = isUploadLoading || isCreateBoardMutate || isUpdateBoardMutate
  const buttonDisabled = !title || !content || !selectedCategory || !selectedGroups.length || (!toParent && !toStudent)

  async function handleSubmit({
    boardPayload,
    imageObjectMap: _imageObjectMap,
    documentObjectMap: _documentObjectMap,
  }: {
    boardPayload?: RequestCreateBoardDto
    imageObjectMap: Map<number, ImageObject>
    documentObjectMap: Map<number, DocumentObject>
  }) {
    try {
      if (!boardPayload) return
      setIsSubmitLoading(true)
      // file image 처리
      const imageFiles = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[]
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['board/images'], imageFiles)

      // url image 처리
      const imageUrlNames = [..._imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[]

      const allImageNames = [...imageUrlNames, ...imageFileNames]

      // file document 처리
      const documentFiles = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[]
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['board/files'], documentFiles)

      const documentUrlNames = [..._documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[]

      const allDocumentNames = [...documentUrlNames, ...documentFileNames]

      const { title, content, category, targetGroupIds } = boardPayload
      if (board?.id) {
        updateBoardMutate({
          id: board.id,
          data: {
            title,
            content,
            category,
            images: allImageNames,
            files: allDocumentNames,
            targetGroupIds,
            toStudent,
            toParent,
          },
        })
      } else {
        createBoardMutate({
          data: {
            title,
            content,
            category,
            images: allImageNames,
            files: allDocumentNames,
            targetGroupIds,
            toStudent,
            toParent,
          },
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitLoading(false)
    }
  }

  return {
    title,
    content,
    selectedGroups,
    selectedCategory,
    firstGroup,
    secondGroup,
    thirdGroup,
    fourthGroup,
    fifthGroup,
    sixthGroup,
    restGroup,
    selectedGroupIds,
    imageObjectMap,
    documentObjectMap,
    buttonDisabled,
    errorMessage,
    isLoading,
    toStudent,
    toParent,
    setTitle,
    setContent,
    setSelectedGroups,
    setSelectedCategory,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    handleSubmit,
    setToStudent,
    setToParent,
    isSubmitLoading,
  }
}
