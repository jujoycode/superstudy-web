import { useNewsLettersFindOne, useStudentNewsletterFindUnreadUsersByNewsletterId } from '@/legacy/generated/endpoint'

export function useTeacherNewsletterCheckDetail(id: number, snid: number) {
  const { data: studentNewsletter, isLoading: isStudentNewsletterLoading } =
    useStudentNewsletterFindUnreadUsersByNewsletterId(snid, {
      query: {
        enabled: !!snid,
      },
    })

  const { data: newsletter, isLoading: isNewsletterLoading } = useNewsLettersFindOne(id, {
    query: {
      enabled: !!id,
    },
  })

  const isLoading = isStudentNewsletterLoading || isNewsletterLoading

  return { studentNewsletter, newsletter, isLoading }
}
