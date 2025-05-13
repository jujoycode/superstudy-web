import { useEffect, useState } from 'react'
import {
  useCounselingCreate,
  useCounselingDelete,
  useCounselingFindByStudentId,
  useCounselingUpdate,
} from '@/legacy/generated/endpoint'
import { ResponseCounselingDetailDto } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function useTeacherCounseling(studentId?: number) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editId, setEditId] = useState<number | undefined>()
  const [isAddMode, setIsAddMode] = useState(false)
  const [content, setContent] = useState('')
  const [counselingAt, setCounselingAt] = useState(DateUtil.formatDate(new Date(), DateFormat['YYYY-MM-DD']))
  const [category, setCategory] = useState('')
  const [counselorName, setCoulselorName] = useState('')
  const [accessLevel, setAccessLevel] = useState(0)
  const [userId, setUserId] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsEditMode(false)
    setIsAddMode(false)
    setUserId(studentId || 0)
  }, [studentId])

  useEffect(() => {
    if (!isEditMode || (isEditMode && !isAddMode)) {
      setIsEditMode(false)
      setEditId(undefined)
    }
  }, [isEditMode, isAddMode])

  const { data: counselingData, refetch } = useCounselingFindByStudentId<ResponseCounselingDetailDto[]>(
    studentId || 0,
    {
      query: {
        enabled: !!studentId,
      },
    },
  )

  const { mutate: createCounselingMutate } = useCounselingCreate({
    mutation: {
      onMutate: () => {
        setIsLoading(true) // 로딩 시작
      },
      onSuccess: () => {
        refetch()
          .then(() => {
            setIsAddMode(false)
            alert('상담이 추가 되었습니다.')
          })
          .finally(() => {
            setIsLoading(false) // 로딩 종료
          })
      },
      onError: () => {
        setIsLoading(false) // 실패 시 로딩 종료
        alert('상담 생성에 실패했습니다. 다시 시도해 주세요.')
      },
    },
  })

  const createCounseling = (uploadedFileNames: string[] = []) => {
    if (studentId) {
      createCounselingMutate({
        data: {
          content,
          voiceFiles: uploadedFileNames,
          counselingAt,
          category,
          counselorName,
          userId,
          accessLevel,
        },
      })
    }
  }

  const { mutate: updateCounselingMutate } = useCounselingUpdate({
    mutation: {
      onMutate: () => {
        setIsLoading(true) // 로딩 시작
      },
      onSuccess: () => {
        refetch()
          .then(() => {
            alert('수정되었습니다.')
          })
          .finally(() => {
            setIsLoading(false) // 로딩 종료
          })
      },
      onError: () => {
        setIsLoading(false) // 실패 시 로딩 종료
        alert('상담 수정에 실패했습니다. 다시 시도해 주세요.')
      },
    },
  })

  const updateCounseling = (id: number) => {
    updateCounselingMutate({
      id,
      data: {
        content,
        voiceFiles: [],
        counselingAt,
        category,
        counselorName,
        userId,
        accessLevel,
      },
    })
  }

  const { mutate: deleteCounselingMutate } = useCounselingDelete({
    mutation: {
      onMutate: () => {
        setIsLoading(true) // 로딩 시작
      },
      onSuccess: () => {
        refetch()
          .then(() => {
            alert('삭제되었습니다.')
          })
          .finally(() => {
            setIsLoading(false) // 로딩 종료
          })
      },
      onError: () => {
        setIsLoading(false) // 실패 시 로딩 종료
        alert('상담 삭제에 실패했습니다. 다시 시도해 주세요.')
      },
    },
  })

  const deleteCounseling = (id: number) => {
    deleteCounselingMutate({ id })
  }

  return {
    isEditMode,
    setIsEditMode,
    editId,
    setEditId,
    isAddMode,
    setIsAddMode,
    content,
    setContent,
    counselingAt,
    setCounselingAt,
    category,
    setCategory,
    counselorName,
    setCoulselorName,
    userId,
    setUserId,
    accessLevel,
    setAccessLevel,
    counselingData,
    createCounseling,
    updateCounseling,
    deleteCounseling,
    refetch,
    isLoading,
  }
}
