import { useNewsLettersFindOne, useStudentNewsletterFindOne } from '@/legacy/generated/endpoint'

export function useTeacherNewsletterSubmitDetail(id: number, snid: number) {
  const { data: studentNewsletter, isLoading: isStudentNewsletterLoading } = useStudentNewsletterFindOne(snid, {
    query: { enabled: !!snid },
  })

  const { data: newsletter, isLoading: isNewsletterLoading } = useNewsLettersFindOne(id, {
    query: { enabled: !!id },
  })

  const isLoading = isStudentNewsletterLoading || isNewsletterLoading

  return { studentNewsletter, newsletter, isLoading }
}
