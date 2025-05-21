import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'

import AnnouncementBadge from '@/legacy/components/announcement/AnnouncementBadge'
import { BackButton, Blank, Chip, HorizontalScrollView, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { useAnnouncementByCategory } from '@/legacy/container/announcement-category'
import { Announcement } from '@/legacy/generated/model/announcement'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import AnnouncementMobilePage from './AnnouncementMobilePage'

export default function AnnouncementPage() {
  const { pathname } = useLocation()
  const isDetail = !pathname.endsWith('/teacher/announcement')
  const { t } = useLanguage()
  const { push } = useHistory()
  const [searchTitle, setSearchTitle] = useState('')
  const { announcements, category, setCategory, isLoading } = useAnnouncementByCategory()
  return (
    <>
      {/* Mobile V */}
      <div className={`md:hidden ${isDetail ? 'hidden' : 'block'}`}>
        <TopNavbar title={`${t('superschool_announcement')}`} left={<BackButton onClick={() => push('/')} />} />
        <AnnouncementMobilePage />
      </div>

      {/* Desktop V */}
      {isLoading && <Blank reversed />}
      <div className="col-span-2 hidden h-screen md:block">
        <div className="flex place-items-center justify-between px-6 pt-6 pb-3">
          <h1 className="text-2xl font-semibold">{t('superschool_announcement')}</h1>
        </div>
        <div className="scroll-box h-0.5 bg-gray-100"></div>
        <HorizontalScrollView classNameInner="mt-4">
          <Chip
            children={t('all')}
            selected={category === undefined}
            onClick={() => setCategory(undefined)}
            className="min-w-max py-1.5"
          />
          <Chip
            children={t('update')}
            selected={category === 'UPDATE'}
            onClick={() => setCategory('UPDATE')}
            className="min-w-max py-1.5"
          />
          <Chip
            children={t('service')}
            selected={category === 'SERVICE'}
            onClick={() => setCategory('SERVICE')}
            className="min-w-max py-1.5"
          />
          <Chip
            children={t('work')}
            selected={category === 'WORK'}
            onClick={() => setCategory('WORK')}
            className="min-w-max py-1.5"
          />
        </HorizontalScrollView>
        <div className="flex items-center space-x-2 px-6 pt-4 pb-4">
          <div className="flex w-full items-center space-x-2">
            <SearchInput
              placeholder={`${t('enter_title')}`}
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full"
            />
            <Icon.Search />
          </div>
        </div>
        <div className="h-screen-14 flex-1 overflow-y-scroll">
          {announcements
            ?.filter((announcement) => searchTitle === '' || announcement.title.includes(searchTitle))
            .map((item: Announcement) => <AnnouncementBadge news={item} key={item.id} type="teacher" />)}
        </div>
      </div>

      <div
        className={`scroll-box col-span-4 h-screen overflow-y-scroll bg-gray-50 p-0 md:p-6 ${
          isDetail ? 'block' : 'hidden'
        }`}
      >
        <Outlet />
      </div>
    </>
  )
}
