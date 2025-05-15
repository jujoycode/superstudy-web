import { useState } from 'react'

import { useStudentActivityFindByUserId, useSummariesCreate } from '@/legacy/generated/endpoint'
import { StudentGroup, Summary } from '@/legacy/generated/model'
import { useUserStore } from '@/stores/user'

type Props = {
  userId: number
  groupId: number
  studentGroups?: StudentGroup[]
}

export function useTeacherRecordDetail({ userId, groupId, studentGroups }: Props) {
  const { me } = useUserStore()
  const [errorText, setErrorText] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [recordSummary, setRecordSummary] = useState('')
  const [summaries] = useState<Summary[]>()
  const selectedStudentGroup = studentGroups?.filter((sg) => sg.user?.id === userId)[0]
  const selectedUser = selectedStudentGroup?.user

  const { data: studentActivities } = useStudentActivityFindByUserId(
    {
      userId,
    },
    {
      query: {
        enabled: !!(userId && groupId),
        keepPreviousData: true,
      },
    },
  )

  const { mutate: createRecordSummaryMutate, isLoading: isCreateSummaryLoading } = useSummariesCreate({
    mutation: {
      onSuccess: (_) => {
        setErrorText('')
      },
      onError: (err) => {
        setErrorText(err.message)
      },
    },
  })

  const createRecordSummary = () => {
    if (!selectedStudentGroup?.id || !me?.id) return

    createRecordSummaryMutate({
      data: {
        content: recordSummary,
        subject: selectedSubject,
        studentGroupId: selectedStudentGroup.id,
      },
    })
  }

  const subjects = [...new Set(studentActivities?.map((sa) => sa?.activity?.subject))]
  const isLoading = isCreateSummaryLoading

  return {
    studentActivities,
    isLoading,
    subjects,
    errorText,
    selectedSubject,
    selectedStudentGroup,
    selectedUser,
    setSelectedSubject,
    recordSummary,
    setRecordSummary,
    createRecordSummary,
    //createOrUpdateRecordSummary,
    summaries,
  }
}
