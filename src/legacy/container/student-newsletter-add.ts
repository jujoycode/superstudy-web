import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useSetRecoilState } from 'recoil'
import { useStudentNewsletterUpsert } from '@/legacy/generated/endpoint'
import { RequestUpsertStudentNewsletterDto } from '@/legacy/generated/model'
import { useNotificationStore } from '@/stores2/notification'
import { useUserStore } from '@/stores2/user'

export function useStudentNewsletterAdd(id?: number) {
  const { child } = useUserStore()
  const queryClient = useQueryClient()
  const { setToast: setToastMsg } = useNotificationStore()
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
