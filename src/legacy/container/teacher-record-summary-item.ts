import { useState } from 'react'
import { useSummariesDelete, useSummariesUpdate } from '@/legacy/generated/endpoint'

type Props = {
  id: number
  recordSummary: string
  recordSubject: string
}

export function useTeacherRecordSummaryItem({ id, recordSummary, recordSubject }: Props) {
  const [errorText, setErrorText] = useState('')

  const { mutate: updateRecordSummaryMutate, isLoading: isUpdateRecordSummaryLoading } = useSummariesUpdate({
    mutation: {
      onSuccess: () => {
        setErrorText('')
      },
      onError: (err) => {
        setErrorText(err.message)
      },
    },
  })

  const updateRecordSummary = () => {
    updateRecordSummaryMutate({
      id,
      data: {
        content: recordSummary,
        subject: recordSubject,
      },
    })
  }

  const { mutate: deleteRecordSummaryMutate, isLoading: isDeleteRecordSummaryLoading } = useSummariesDelete({
    mutation: {
      onSuccess: () => {
        setErrorText('')
      },
      onError: (err) => {
        setErrorText(err.message)
      },
    },
  })

  const deleteRecordSummary = () => {
    deleteRecordSummaryMutate({
      id,
    })
  }

  const isLoading = isUpdateRecordSummaryLoading || isDeleteRecordSummaryLoading

  return { errorText, updateRecordSummary, deleteRecordSummary, isLoading }
}
