import { useEffect, useState } from 'react'

import { useStudentActivityUpdateFeedback } from '@/legacy/generated/endpoint'
import type { StudentActivity } from '@/legacy/generated/model'

type Props = {
  record: StudentActivity
}

export function useTeacherRecordCard({ record }: Props) {
  const [feedback, setFeedback] = useState(record.feedback)
  const [errorText, setErrorText] = useState('')

  const { mutate: updateFeedbackMutate, isLoading } = useStudentActivityUpdateFeedback({
    mutation: {
      onSuccess: () => {},
      onError: (err) => {
        setErrorText(err?.message)
      },
    },
  })

  useEffect(() => {
    if (record?.feedback) {
      setFeedback(record.feedback)
    }
  }, [record])
  const updateFeedback = () => {
    updateFeedbackMutate({ id: record.id, data: { feedback } })
  }
  return {
    errorText,
    feedback,
    setFeedback,
    updateFeedback,
    isLoading,
  }
}
