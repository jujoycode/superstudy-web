import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useStudentNewsletterUpsert } from '@/legacy/generated/endpoint'
import { RequestUpsertStudentNewsletterDto } from '@/legacy/generated/model'
import { childState, toastState } from '@/stores'

export function useStudentNewsletterAdd(id?: number) {
  const child = useRecoilValue(childState)
  const queryClient = useQueryClient()

  const setToastMsg = useSetRecoilState(toastState)
  const [errorMessage, setErrorMessage] = useState('')

  const { mutate: upsertStudentNewsletterMutate, isLoading } = useStudentNewsletterUpsert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(['newsletter', id])
        queryClient.invalidateQueries(['studentNewsletter', id])

        setToastMsg('가정통신문을 제출했습니다.')
      },
      onError: () => {
        setErrorMessage('제출을 실패했습니다.')
      },
    },
    request: {
      headers: { 'child-user-id': child?.id },
    },
  })

  const upsertStudentNewsletter = (data: RequestUpsertStudentNewsletterDto) => {
    upsertStudentNewsletterMutate({ data })
  }

  return { upsertStudentNewsletter, isLoading, errorMessage }
}
