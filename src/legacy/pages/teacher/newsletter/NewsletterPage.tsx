import { useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { Blank } from '@/legacy/components/common'
import { NewsletterCard } from '@/legacy/components/newsletter/NewsletterCard'
import { useTeacherNewsletter } from '@/legacy/container/teacher-newsletter'
import { Newsletter, NewsletterCategoryEnum } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export function NewsletterPage() {
  const { me } = useUserStore()
  const { t } = useLanguage()
  const { push } = useHistory()
  const filters = [t('title'), t('author')]
  const { setNewsletterOpenedGroup } = useNotificationStore()
  const { newsletters, unReadnewslettersList, category, isLoading, setCategory } = useTeacherNewsletter()
  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')

  const sortedNewsletters = useMemo(() => {
    if (!searchWriter && !searchTitle) return newsletters

    return newsletters?.filter((newsletter: Newsletter) => {
      if (searchWriter && !newsletter.writer.name?.includes(searchWriter)) return false
      if (searchTitle && !newsletter.title.includes(searchTitle)) return false
      return true
    })
  }, [newsletters, searchWriter, searchTitle])

  if (isLoading) {
    return <Blank reversed />
  }

  return (
    <Grid>
      <GridItem colSpan={5}>
        <PageHeaderTemplate
          title={t('parent_letters')}
          description="발송된 학교 가정통신문을 확인할 수 있습니다."
          config={{
            topBtn: [
              {
                label: t('add'),
                variant: 'solid',
                color: 'primary',
                action: () =>
                  me?.canEditNewsletter
                    ? push('/teacher/newsletter/add')
                    : alert('관리자에게 작성 권한을 요청해 주세요'),
              },
            ],
            filters: [
              {
                items: [
                  { label: t('all'), value: 'ALL' },
                  ...Object.keys(NewsletterCategoryEnum).map((category) => ({ label: t(category), value: category })),
                ],
                filterState: {
                  value: category || 'ALL',
                  setValue: (c) => setCategory(c as NewsletterCategoryEnum),
                },
              },
              {
                items: filters.map((f) => ({ label: f, value: f })),
                filterState: {
                  value: filter,
                  setValue: (f) => {
                    setSearchWriter('')
                    setSearchTitle('')
                    setFilter(f)
                  },
                },
              },
            ],
            searchBar: {
              placeholder: filter === t('title') ? t('enter_title') : t('enter_author'),
              searchState: {
                value: filter === t('title') ? searchTitle : searchWriter,
                setValue: (v) => (filter === t('title') ? setSearchTitle(v) : setSearchWriter(v)),
              },
            },
          }}
        />
        <div className="h-screen-16 overflow-y-auto">
          {sortedNewsletters?.map((newsletter: Newsletter) => (
            <NewsletterCard
              key={newsletter.id}
              newsletter={newsletter}
              isNew={unReadnewslettersList?.includes(newsletter.id)}
              onClick={() => setNewsletterOpenedGroup([])}
            />
          ))}
        </div>
      </GridItem>

      <GridItem colSpan={7} className="bg-gray-50 md:overflow-y-auto md:p-6">
        <Outlet />
      </GridItem>
    </Grid>
  )
}
