import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { Blank, List, Select, TopNavbar } from '@/legacy/components/common'
import { FeedsItem } from '@/legacy/components/common/FeedsItem'
import { NoItem } from '@/legacy/components/common/NoItem'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Tabs } from '@/legacy/components/common/Tabs'
import { Icon } from '@/legacy/components/common/icons'
import { useStudentNotice } from '@/legacy/container/student-notice'
import { Board, Newsletter, NewsletterType, Notice } from '@/legacy/generated/model'
import { meState } from '@/legacy/store'
import { TabType } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { weekAfter } from '@/legacy/util/time'

const filters = ['제목', '작성자']

// COMPLETE
export function NoticePage() {
  const { pathname } = useLocation()
  const meRecoil = useRecoilValue(meState)

  const [blankOpen, setBlankOpen] = useState(false)

  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')

  const handleFilterChange = (e: any) => {
    setSearchWriter('')
    setSearchTitle('')
    setFilter(e.target.value)
  }

  const tabType = useMemo(() => {
    if (pathname.startsWith('/student/notice')) return TabType.NOTICE
    if (pathname.startsWith('/student/board')) return TabType.BOARD
    if (pathname.startsWith('/student/newsletter')) return TabType.NEWSLETTER
    return TabType.NOTICE
  }, [pathname])

  const { noticeList, newsLetterList, boardList, isLoading } = useStudentNotice(tabType)

  const checkImportanceNewsletter = (a: any) => {
    if (a.type === NewsletterType.NOTICE) {
      return !!newsLetterList?.unreadIdList?.includes(a.id) && weekAfter(new Date(a.createdAt)) >= new Date()
    } else {
      const dueDate = new Date(
        DateUtil.formatDate(a.endAt || weekAfter(new Date(a.createdAt)), DateFormat['YYYY.MM.DD HH:mm']),
      )

      return !!newsLetterList?.unsubmittedIdList?.includes(a.id) && dueDate >= new Date()
    }
  }

  const checkImportanceNotice = (a: any) => {
    return noticeList?.unreadIdList?.includes(a.id) && weekAfter(new Date(a.createdAt)) >= new Date()
  }

  const checkImportanceBoard = (a: any) => {
    return boardList?.unreadIdList?.includes(a.id) && weekAfter(new Date(a.createdAt)) >= new Date()
  }

  return (
    <>
      {isLoading && <Blank />}
      {blankOpen && <Blank />}

      <TopNavbar
        title="공지"
        left={<div className="h-15 w-10" />}
        right={
          <button
            children="새로고침"
            onClick={() => {
              setBlankOpen(true)
              window?.location?.reload()
            }}
            className="text-brand-1"
          />
        }
      />

      <Tabs>
        {[
          { name: '공지사항', type: TabType.NOTICE, path: '/student/notice' },
          { name: '학급 게시판', type: TabType.BOARD, path: '/student/board' },
          { name: '가정통신문', type: TabType.NEWSLETTER, path: '/student/newsletter' },
        ].map((tab) => (
          <Tabs.Link key={tab.name} children={tab.name} to={tab.path} selected={tabType === tab.type} />
        ))}
      </Tabs>

      <div className="flex items-center space-x-2 px-6 pt-3 pb-2">
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
          {filter === '제목' ? (
            <SearchInput
              placeholder="제목을 입력해주세요."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full"
            />
          ) : (
            <SearchInput
              placeholder="작성자를 입력해주세요."
              value={searchWriter}
              onChange={(e) => setSearchWriter(e.target.value)}
              className="w-full"
            />
          )}
          <Icon.Search />
        </div>
      </div>
      <div className="w-full flex-col">
        {tabType === TabType.NOTICE && (
          <div className="scroll-box h-screen-14 w-full flex-col space-y-2 overflow-y-auto">
            <div className="whitespace-pre-line">
              <List>
                {noticeList?.items.length === 0 && <NoItem />}
                {noticeList?.items
                  ?.filter(
                    (notice: Notice) =>
                      (searchWriter === '' || notice?.user?.name.includes(searchWriter)) &&
                      (searchTitle === '' || notice?.title.includes(searchTitle)),
                  )
                  ?.sort((a: any, b: any) => {
                    if (checkImportanceNotice(a) && !checkImportanceNotice(b)) {
                      return -1 // a가 중요 b가 아닌 경우, a를 먼저 배치
                    } else {
                      return 0 // 그 외의 경우에는 순서 변경 없음
                    }
                  })
                  .map((notice: Notice) => (
                    <FeedsItem
                      key={notice.id}
                      id={notice.id}
                      to={'student'}
                      pageType={'notice'}
                      category1={notice.category}
                      category1Color="peach_orange"
                      title={notice.title}
                      //newYN={meRecoil?.role === Role.USER && noticeList?.unreadIdList?.includes(notice.id)}
                      newYN={noticeList?.unreadIdList?.includes(notice.id)}
                      contentText={notice.content}
                      contentImages={notice.images}
                      contentFiles={notice.files}
                      writer={notice.user?.name || ''}
                      createAt={DateUtil.formatDate(notice.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                    />
                  ))}
              </List>
            </div>
          </div>
        )}

        {tabType === TabType.NEWSLETTER && (
          <div className="scroll-box h-screen-14 w-full flex-col space-y-2 overflow-y-auto">
            <div className="whitespace-pre-line">
              <List>
                {newsLetterList?.items.length === 0 && <NoItem />}
                {newsLetterList?.items
                  ?.filter(
                    (newsletter: Newsletter) =>
                      (searchWriter === '' ||
                        (newsletter &&
                          newsletter.writer &&
                          newsletter.writer.name &&
                          newsletter.writer.name.includes(searchWriter))) &&
                      (searchTitle === '' ||
                        (newsletter && newsletter.title && newsletter.title.includes(searchTitle))),
                  )
                  ?.sort((a: any, b: any) => {
                    if (checkImportanceNewsletter(a) && !checkImportanceNewsletter(b)) {
                      return -1 // a가 중요 b가 아닌 경우, a를 먼저 배치
                    } else {
                      return 0 // 그 외의 경우에는 순서 변경 없음
                    }
                  })
                  .map((newsletter: Newsletter) => (
                    <FeedsItem
                      key={newsletter.id}
                      id={newsletter.id}
                      to={'student'}
                      pageType={'newsletter'}
                      category1={newsletter.category || '가정통신문'}
                      category1Color="light_golden"
                      category2={newsletter.type === NewsletterType.NOTICE ? '공지' : '설문'}
                      category2Color="lavender_blue"
                      useSubmit={newsletter?.type !== NewsletterType.NOTICE}
                      submitDate={DateUtil.formatDate(newsletter.endAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                      submitYN={
                        newsletter.type !== NewsletterType.NOTICE &&
                        newsLetterList?.unsubmittedIdList?.includes(newsletter.id)
                          ? false
                          : true
                      }
                      title={newsletter.title}
                      //newYN={meRecoil?.role === Role.USER && newsLetterList?.unreadIdList?.includes(newsletter.id)}
                      newYN={newsLetterList?.unreadIdList?.includes(newsletter.id)}
                      contentText={newsletter.content}
                      contentImages={newsletter.images}
                      contentFiles={newsletter.files}
                      writer={newsletter.writer?.name}
                      createAt={DateUtil.formatDate(newsletter.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                    />
                  ))}
              </List>
            </div>
          </div>
        )}

        {tabType === TabType.BOARD && (
          <div className="scroll-box h-screen-14 w-full flex-col space-y-2 overflow-y-auto">
            <div className="whitespace-pre-line">
              <List>
                {boardList?.items.length === 0 && <NoItem />}
                {boardList?.items
                  ?.filter(
                    (board: Board) =>
                      (searchWriter === '' ||
                        (board && board.writer && board.writer.name && board.writer.name.includes(searchWriter))) &&
                      (searchTitle === '' || (board && board.title && board.title.includes(searchTitle))),
                  )
                  ?.sort((a: any, b: any) => {
                    if (checkImportanceBoard(a) && !checkImportanceBoard(b)) {
                      return -1 // a가 중요 b가 아닌 경우, a를 먼저 배치
                    } else {
                      return 0 // 그 외의 경우에는 순서 변경 없음
                    }
                  })
                  .map((board: Board) => (
                    <FeedsItem
                      key={board.id}
                      id={board.id}
                      to={'student'}
                      pageType={'board'}
                      category1={board.category}
                      category1Color="mint_green"
                      title={board.title}
                      //newYN={meRecoil?.role === Role.USER && boardList?.unreadIdList?.includes(board.id)}
                      newYN={boardList?.unreadIdList?.includes(board.id)}
                      contentText={board.content}
                      contentImages={board.images}
                      contentFiles={board.files}
                      writer={board.writer?.name}
                      createAt={DateUtil.formatDate(board.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                    />
                  ))}
              </List>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
