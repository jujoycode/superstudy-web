import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import AnnouncementBadge from '@/legacy/components/announcement/AnnouncementBadge'
import { BackButton, Blank, Chip, HorizontalScrollView, List, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { NoItem } from '@/legacy/components/common/NoItem'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { useAnnouncementByCategory } from '@/legacy/container/announcement-category'
import { Announcement } from '@/legacy/generated/model'

import AnnouncementDetailPage from './AnnouncementDetailPage'

export default function AnnouncementPage() {
  const { push } = useHistory()
  const { pathname } = useLocation()
  const [searchTitle, setSearchTitle] = useState('')
  const { announcements, category, setCategory, isLoading } = useAnnouncementByCategory()
  const isDetail = !pathname.endsWith('/student/announcement')
  if (isLoading) return <Blank reversed />
  return (
    <>
      <div className={`${isDetail ? 'hidden' : 'block'}`}>
        <TopNavbar title="슈퍼스쿨 공지사항" left={<BackButton onClick={() => push('/')} />} />
        <div className="w-full flex-col">
          <div className="bg-primary-800 flex h-20 flex-col items-center justify-center text-white">
            <p>
              <b>슈퍼스쿨</b>의 업데이트 정보 등 다양한 소식을 알려드립니다.
            </p>
          </div>
          <HorizontalScrollView classNameInner="mt-4">
            <Chip
              children="전체"
              selected={category === undefined}
              onClick={() => setCategory(undefined)}
              className="min-w-max py-1.5"
            />
            <Chip
              children="업데이트"
              selected={category === 'UPDATE'}
              onClick={() => setCategory('UPDATE')}
              className="min-w-max py-1.5"
            />
            <Chip
              children="서비스"
              selected={category === 'SERVICE'}
              onClick={() => setCategory('SERVICE')}
              className="min-w-max py-1.5"
            />
            <Chip
              children="작업"
              selected={category === 'WORK'}
              onClick={() => setCategory('WORK')}
              className="min-w-max py-1.5"
            />
          </HorizontalScrollView>
          <div className="flex items-center space-x-2 px-6 pt-4 pb-4">
            <div className="flex w-full items-center space-x-2">
              <SearchInput
                placeholder="제목을 입력해주세요."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full"
              />
              <Icon.Search />
            </div>
          </div>
          <div className="scroll-box h-0.5 bg-gray-100"></div>
          <div className="scroll-box h-screen-20 w-full flex-col space-y-2 overflow-y-auto">
            <div className="whitespace-pre-line">
              <List>
                {announcements?.length === 0 && <NoItem />}
                {announcements
                  ?.filter(
                    (announcement: Announcement) => searchTitle === '' || announcement.title.includes(searchTitle),
                  )
                  .map((announcement: Announcement) => {
                    return <AnnouncementBadge news={announcement} type="student" key={announcement.id} />
                  })}
              </List>
            </div>
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/student/announcement/:id" Component={() => <AnnouncementDetailPage />} />
      </Routes>
    </>
  )
}
