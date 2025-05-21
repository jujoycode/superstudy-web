import { range } from 'lodash'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Chip, HorizontalScrollView, Select, TopNavbar } from '@/legacy/components/common'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Tabs } from '@/legacy/components/common/Tabs'
import { NoticeCard } from '@/legacy/components/notice/NoticeCard'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { TeacherNoticeContainer } from '@/legacy/container/teacher-notice'
import { Category, Code, Notice } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { TabType } from '@/legacy/types'
import { getThisYear } from '@/legacy/util/time'
import { BoardMobilePage } from '../board/BoardMobilePage'
import { NewsletterMobilePage } from '../newsletter/NewsletterMobilePage'
import { NoticeMobilePage } from './NoticeMobilePage'

function NoticePageView() {
  const { pathname } = useLocation()
  const { push } = useHistory()
  const { t } = useLanguage()
  const { me: meRecoil, setIsUpdateNotice } = useUserStore()

  const filters = [t('title'), t('author')]
  const thisYear = +getThisYear()

  const {
    filteredNoticeList,
    unReadNoticeList,
    category,
    isNoticeListLoading,
    isNoticeListError,
    setCategory,
    year,
    setYear,
  } = TeacherNoticeContainer.useContext()
  const { categoryData } = useCodeByCategoryName(Category.noticetype)

  const [tabType, setTabType] = useState(TabType.NOTICE)
  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')

  const handleFilterChange = (e: any) => {
    setSearchWriter('')
    setSearchTitle('')
    setFilter(e.target.value)
  }

  useEffect(() => {
    const getLocal = localStorage.getItem('tabType')
    if (!getLocal) {
      return
    } else if (getLocal === 'BOARD') {
      setTabType(TabType.BOARD)
    } else if (getLocal === 'NOTICE') {
      setTabType(TabType.NOTICE)
    } else if (getLocal === 'NEWSLETTER') {
      setTabType(TabType.NEWSLETTER)
    }
  }, [tabType])

  const isDetail = !pathname.endsWith('/teacher/notice')

  return (
    <>
      {/* Mobile V */}
      <div className={`md:hidden ${isDetail ? 'hidden' : 'block'}`}>
        <TopNavbar title="공지" left={<BackButton onClick={() => push('/')} />} />
        <Tabs>
          {[
            { name: '공지사항', type: TabType.NOTICE },
            { name: '학급 게시판', type: TabType.BOARD },
            { name: '가정통신문', type: TabType.NEWSLETTER },
          ].map((tab) => (
            <Tabs.Button
              key={tab.name}
              children={tab.name}
              selected={tabType === tab.type}
              onClick={() => {
                setTabType(tab.type)
                localStorage.setItem('tabType', tab.type)
              }}
            />
          ))}
        </Tabs>

        {tabType === TabType.NOTICE && <NoticeMobilePage />}
        {tabType === TabType.NEWSLETTER && <NewsletterMobilePage />}
        {tabType === TabType.BOARD && <BoardMobilePage />}
      </div>

      {/* Desktop V */}
      {isNoticeListLoading && <Blank reversed />}
      {isNoticeListError && <ErrorBlank />}
      <div className="col-span-2 hidden h-screen md:block">
        <div className="flex justify-between px-6 py-6">
          <h1 className="text-2xl font-semibold">{t('school_announcements')}</h1>
          <ButtonV2
            variant="solid"
            color="orange100"
            children={t('add')}
            onClick={() => {
              if (meRecoil?.canEditNotice) {
                push('/teacher/notice/add')
              } else {
                alert('관리자에게 작성 권한을 요청해 주세요')
              }
            }}
          />
        </div>
        <div className="space-y-0h-0.5 w-full bg-gray-100"></div>
        <HorizontalScrollView classNameInner="my-4">
          <Chip
            children={t('all')}
            selected={category === '전체'}
            onClick={() => setCategory('전체')}
            className="min-w-max py-1.5"
          />
          {categoryData?.map((el: Code) => (
            <Chip
              key={el.name}
              children={t(`${el.name}`)}
              selected={el.name === category}
              onClick={() => setCategory(el.name)}
              className="min-w-max py-1.5"
            />
          ))}
        </HorizontalScrollView>
        <div className="flex items-center space-x-2 px-6 pt-3 pb-6">
          <Select.lg value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option defaultChecked hidden>
              {t('year', '년도')}
            </option>
            {range(thisYear, thisYear - 3, -1).map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </Select.lg>
          <Select.lg value={filter} onChange={handleFilterChange}>
            {filters.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Select.lg>
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
          {filteredNoticeList
            ?.filter(
              (notice: Notice) =>
                (searchWriter === '' || notice?.user?.name.includes(searchWriter)) &&
                (searchTitle === '' || notice?.title.includes(searchTitle)),
            )
            .map((notice: Notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                isNew={unReadNoticeList?.includes(notice.id)}
                onClick={() => setIsUpdateNotice(false)}
              />
            ))}
        </div>
      </div>

      <div
        className={`scroll-box col-span-4 h-screen overflow-y-scroll bg-gray-50 p-0 md:p-6 ${
          isDetail ? 'block' : 'hidden'
        }`}
      >
        <Outlet context={{ categoryData }} />
      </div>
    </>
  )
}

export function NoticePage() {
  return (
    <TeacherNoticeContainer.ContextProvider>
      <NoticePageView />
    </TeacherNoticeContainer.ContextProvider>
  )
}
