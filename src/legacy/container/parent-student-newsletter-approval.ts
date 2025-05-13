import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useStudentNewsletterApprove, useStudentNewsletterFindOneByUUID } from '@/legacy/generated/endpoint'
import { RequestApproveStudentNewsletterDto } from '@/legacy/generated/model'

export function useParentStudentNewsletterApproval(uuid: string) {
  const queryClient = useQueryClient()

  const [errorMessage, setErrorMessage] = useState('')

  const { data: studentNewsletter, isLoading: isStudentNewsletterLoading } = useStudentNewsletterFindOneByUUID(uuid, {
    query: {
      queryKey: ['studentNewsletter', uuid],
    },
  })

  const { mutateAsync: approveStudentNewsletterMutateAsync, isLoading: isApproveStudentNewsletterLoading } =
    useStudentNewsletterApprove({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries(['studentNewsletter', uuid])
        },
        onError: () => {
          setErrorMessage('제출을 실패했습니다.')
        },
      },
    })

  const approveStudentNewsletter = ({ uuid, data }: { uuid: string; data: RequestApproveStudentNewsletterDto }) => {
    return approveStudentNewsletterMutateAsync({ uuid, data })
  }

  const isLoading = isStudentNewsletterLoading || isApproveStudentNewsletterLoading

  return { studentNewsletter, approveStudentNewsletter, isLoading, errorMessage }
}
