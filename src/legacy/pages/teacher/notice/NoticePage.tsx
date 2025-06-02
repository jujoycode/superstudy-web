import { useEffect, useState } from 'react'
import { range } from 'lodash'
import { Outlet, replace, useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ScrollArea } from '@/atoms/ScrollArea'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { Tabs } from '@/legacy/components/common/Tabs'
import { NoticeCard } from '@/legacy/components/notice/NoticeCard'
import { useCodeByCategoryName } from '@/legacy/container/category'
import { TeacherNoticeContainer } from '@/legacy/container/teacher-notice'
import { Category, Notice } from '@/legacy/generated/model'
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

  if (isNoticeListLoading) {
    return <Blank reversed />
  }

  if (isNoticeListError) {
    return <ErrorBlank />
  }

  return (
    <>
      <Grid>
        <GridItem colSpan={4}>
          <ResponsiveRenderer
            mobile={
              <>
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
              </>
            }
          />

          <PageHeaderTemplate
            title={t('school_announcements')}
            config={{
              topBtn: [
                {
                  label: '추가',
                  variant: 'solid',
                  color: 'primary',
                  action: () => {
                    if (meRecoil?.canEditNotice) {
                      push('/teacher/notice/add')
                    } else {
                      alert('관리자에게 작성 권한을 요청해 주세요')
                    }
                  },
                },
              ],

              filters: [
                {
                  items: [
                    { label: '전체', value: '전체' },
                    ...(categoryData?.map((el) => ({ label: t(`${el.name}`), value: el.name })) || []),
                  ],
                  filterState: {
                    value: category || '전체',
                    setValue: (v) => setCategory(categoryData?.find((f) => f.name === v)?.name || '전체'),
                  },
                },
                {
                  items: range(thisYear, thisYear - 3, -1).map((year) => ({
                    label: year.toString(),
                    value: year.toString(),
                  })),
                  filterState: {
                    value: year.toString(),
                    setValue: (v) => setYear(Number(v)),
                  },
                },
                {
                  items: [
                    { label: filters[0], value: filters[0] },
                    { label: filters[1], value: filters[1] },
                  ],
                  filterState: {
                    value: filter,
                    setValue: (v) => setFilter(v),
                  },
                },
              ],
              searchBar: {
                placeholder: filter === filters[0] ? `${t('enter_title')}` : `${t('enter_author')}`,
                searchState: {
                  value: filter === filters[0] ? searchTitle : searchWriter,
                  setValue: (v) => (filter === filters[0] ? setSearchTitle(v) : setSearchWriter(v)),
                },
                onSearch: () =>
                  filter === filters[0]
                    ? searchTitle && replace(`/teacher/notice?title=${searchTitle}`)
                    : searchWriter && replace(`/teacher/notice?author=${searchWriter}`),
              },
            }}
          />

          <ScrollArea className="pt-5">
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
          </ScrollArea>
        </GridItem>

        <GridItem colSpan={8} className="bg-gray-50">
          <div
            className={`scroll-box col-span-4 h-screen overflow-y-scroll bg-gray-50 p-0 md:p-6 ${
              isDetail ? 'block' : 'hidden'
            }`}
          >
            <Outlet context={{ categoryData }} />
          </div>
        </GridItem>
      </Grid>
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
