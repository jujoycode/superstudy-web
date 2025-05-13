import { useState } from 'react'
import { Route, Routes } from 'react-router'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { Blank, Chip, HorizontalScrollView, Select } from '@/legacy/components/common'
import { useHistory } from '@/hooks/useHistory'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Icon } from '@/legacy/components/common/icons'
import { NewsletterCard } from '@/legacy/components/newsletter/NewsletterCard'
import { useTeacherNewsletter } from '@/legacy/container/teacher-newsletter'
import { Newsletter, NewsletterCategoryEnum } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState, newsletterOpenedGroupState } from '@/stores'
import { NewsletterAddPage } from './NewsletterAddPage'
import { NewsletterCheckDownloadPage } from './NewsletterCheckDownloadPage'
import { NewsletterCheckPage } from './NewsletterCheckPage'
import { NewsletterDetailPage } from './NewsletterDetailPage'
import { NewsletterDownloadPage } from './NewsletterDownloadPage'
import { NewsletterSubmitPage } from './NewsletterSubmitPage'

export function NewsletterPage() {
  const me = useRecoilValue(meState)
  const { t } = useLanguage()
  const history = useHistory()
  const filters = [t('title'), t('author')]
  const setNewsletterOpenedGroup = useSetRecoilState(newsletterOpenedGroupState)
  const { newsletters, unReadnewslettersList, category, isLoading, setCategory } = useTeacherNewsletter()

  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const handleFilterChange = (e: any) => {
    setSearchWriter('')
    setSearchTitle('')
    setFilter(e.target.value)
  }

  return (
    <>
      {/* Desktop V */}
      {isLoading && <Blank reversed />}
      {/*{error && <ErrorBlank />}*/}
      <div className="col-span-2 hidden h-screen md:block">
        <div className="flex justify-between px-6 py-6">
          <h1 className="text-2xl font-semibold">{t('parent_letters')}</h1>
          <ButtonV2
            children={t('add')}
            variant="solid"
            color="orange100"
            onClick={() => {
              if (me?.canEditNewsletter) {
                history.push('/teacher/newsletter/add')
              } else {
                alert('관리자에게 작성 권한을 요청해 주세요')
              }
            }}
          />
        </div>
        <div className="scroll-box h-0.5 bg-gray-100"></div>
        <HorizontalScrollView classNameInner="my-4">
          <Chip
            children={t('all')}
            selected={!category}
            onClick={() => setCategory(undefined)}
            className="min-w-max py-1.5"
          />
          {Object.keys(NewsletterCategoryEnum).map((newsletterCategory) => (
            <Chip
              key={newsletterCategory}
              children={t(`${newsletterCategory}`)}
              selected={newsletterCategory === category}
              onClick={() => setCategory(newsletterCategory as NewsletterCategoryEnum)}
              className="min-w-max py-1.5"
            />
          ))}
        </HorizontalScrollView>
        <div className="flex items-center space-x-2 px-6 pt-3 pb-6">
          <div className="cursor-pointer">
            <Select.lg value={filter} onChange={handleFilterChange}>
              {filters.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Select.lg>
          </div>
          <div className="flex w-full items-center space-x-2">
            {filter === t('title') ? (
              <SearchInput
                placeholder={`${t('enter_title')}`}
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full"
              />
            ) : (
              <SearchInput
                placeholder={`${t('enter_author')}`}
                value={searchWriter}
                onChange={(e) => setSearchWriter(e.target.value)}
                className="w-full"
              />
            )}
            <Icon.Search />
          </div>
        </div>
        <div className="h-screen-16 overflow-y-auto">
          {newsletters
            ?.filter(
              (newsletter: Newsletter) =>
                (searchWriter === '' ||
                  (newsletter &&
                    newsletter.writer &&
                    newsletter.writer.name &&
                    newsletter.writer.name.includes(searchWriter))) &&
                (searchTitle === '' || (newsletter && newsletter.title && newsletter.title.includes(searchTitle))),
            )
            .map((newsletter: Newsletter) => (
              <NewsletterCard
                key={newsletter.id}
                newsletter={newsletter}
                isNew={unReadnewslettersList?.includes(newsletter.id)}
                onClick={() => setNewsletterOpenedGroup([])}
              />
            ))}
        </div>
      </div>

      {/* Desktop V */}
      <div className="bg-gray-50 md:col-span-4 md:overflow-y-auto md:p-6">
        <Routes>
          <Route path="/teacher/newsletter/add" Component={NewsletterAddPage} />
          <Route path="/teacher/newsletter/:id/edit" Component={NewsletterAddPage} />
          <Route path="/teacher/newsletter/submit/:id" Component={NewsletterSubmitPage} />
          <Route path="/teacher/newsletter/check/:id" Component={NewsletterCheckPage} />
          <Route path="/teacher/newsletter/download/:id" Component={NewsletterDownloadPage} />
          <Route path="/teacher/newsletter/unread-student-download/:id" Component={NewsletterCheckDownloadPage} />
          <Route path="/teacher/newsletter/:id" Component={() => <NewsletterDetailPage />} />
        </Routes>
      </div>
    </>
  )
}
