import { useState } from 'react'
import { QueryKey } from '@/legacy/constants/query-key'
import { useNewsLettersFindAll } from '@/legacy/generated/endpoint'
import { Newsletter, NewsletterCategoryEnum } from '@/legacy/generated/model'

export function useTeacherNewsletter() {
  const [pageIngo] = useState({ page: 1, limit: 500 })
  const [category, setCategory] = useState<NewsletterCategoryEnum | 'ALL'>('ALL')

  const { data: newsletterList, isLoading } = useNewsLettersFindAll(
    { ...pageIngo, userKlass: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    {
      query: {
        queryKey: [...QueryKey.teacher.newsletterList],
      },
    },
  )

  const newsletters =
    category !== 'ALL'
      ? newsletterList?.items.filter((newsletter: Newsletter) => newsletter.category === category)
      : newsletterList?.items

  const unReadnewslettersList = newsletterList?.unreadIdList

  return { newsletters, category, isLoading, unReadnewslettersList, setCategory }
}
