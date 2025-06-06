import { useEffect, useState } from 'react'
import { useNewsLettersFindOne, useStudentNewsletterFindOneByStudent } from '@/legacy/generated/endpoint'
import { useUserStore } from '@/stores/user'

export function useStudentNewsletterDetail(id?: number) {
  const [errorMessage, setErrorMessage] = useState('')
  const { me: meRecoil, child } = useUserStore()
  const {
    data: newsletter,
    isLoading: isNewsletterLoading,
    refetch: refetchNewsletter,
  } = useNewsLettersFindOne(id!, {
    query: {
      queryKey: ['newsletter', id],
      enabled: !!id && !!meRecoil && (meRecoil.role === 'USER' || !!child),
      onError: () => {
        setErrorMessage('이미 삭제되었거나 더 이상 유효하지 않습니다.')
      },
    },
    request: {
      headers: { 'child-user-id': child?.id },
    },
  })

  const {
    data: studentNewsletter,
    isLoading: isStudentNewsletterLoading,
    refetch,
  } = useStudentNewsletterFindOneByStudent(id as number, {
    query: {
      queryKey: ['studentNewsletter', id],
      enabled: !!id && !!meRecoil && (meRecoil.role === 'USER' || !!child),
    },
    request: {
      headers: { 'child-user-id': child?.id },
    },
  })

  useEffect(() => {
    if (!!child) {
      refetchNewsletter()
      refetch()
    }
  }, [child])

  const isLoading = isNewsletterLoading || isStudentNewsletterLoading

  return { newsletter, studentNewsletter, isLoading, refetch, errorMessage }
}
