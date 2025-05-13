import { useState } from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import { SelectMenus } from '@/legacy/components'
import { BoardCard } from '@/legacy/components/board/BoardCard'
import { Blank, Select } from '@/legacy/components/common'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Icon } from '@/legacy/components/common/icons'
import { useTeacherBoard } from '@/legacy/container/teacher-board'
import { useTeacherKlassGroup } from '@/legacy/container/teacher-klass-groups'
import { Board, BoardCategoryEnum, Group } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { BoardAddPage } from './BoardAddPage'
import { BoardDetailPage } from './BoardDetailPage'

export function BoardsPage() {
  const { t } = useLanguage()
  const filters = [t('title'), t('author')]
  const { groups, selectedGroup, homeKlass, setSelectedGroup } = useTeacherKlassGroup()
  const { boards, selectedCategory, isLoading, setSelectedCategory, unReadBoardList } = useTeacherBoard(
    selectedGroup?.id,
  )
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
      {isLoading && <Blank reversed />}
      <div className="col-span-2 hidden h-screen md:block">
        <div className="flex place-items-center justify-between px-6 pt-6 pb-3">
          <h1 className="text-2xl font-semibold">{t('class_bulletin_board')}</h1>
          <Link
            children={t('add')}
            to="/teacher/board/add"
            className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-4 py-2 text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 px-6 pt-3 pb-2">
          <div className="w-32 cursor-pointer">
            <SelectMenus items={groups} value={selectedGroup} onChange={(value: Group) => setSelectedGroup(value)} />
          </div>
          <div className="w-28 cursor-pointer">
            <SelectMenus
              items={Object.values(BoardCategoryEnum)}
              value={selectedCategory as string}
              allText={`${t('all')}`}
              onChange={(group) => setSelectedCategory(group as BoardCategoryEnum)}
              allTextVisible
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 px-6 pt-0 pb-6">
          <div className="cursor-pointer">
            <Select.lg value={filter} onChange={handleFilterChange}>
              {filters.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Select.lg>
          </div>
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
        <div className="scroll-box h-0.5 bg-gray-100"></div>
        <div className="h-screen-14 overflow-y-auto">
          {boards
            ?.filter(
              (board: Board) =>
                (searchWriter === '' ||
                  (board && board.writer && board.writer.name && board.writer.name.includes(searchWriter))) &&
                (searchTitle === '' || (board && board.title && board.title.includes(searchTitle))),
            )
            .map((board: Board) => (
              <BoardCard key={board.id} board={board} isNew={unReadBoardList?.includes(board.id)} />
            ))}

          {/* TODO Pagination 필요 */}
        </div>
      </div>

      <div className="scroll-box col-span-4 h-screen bg-gray-50 p-0 md:overflow-y-scroll md:p-6">
        <Switch>
          <Route
            path="/teacher/board/add"
            render={() => <BoardAddPage key={'add'} homeKlass={homeKlass} groups={groups} />}
          />
          <Route
            path="/teacher/board/:id/edit"
            render={() => <BoardAddPage key={'edit'} homeKlass={homeKlass} groups={groups} />}
          />
          <Route path="/teacher/board/:id" render={() => <BoardDetailPage page={1} limit={1} />} />
        </Switch>
      </div>
    </>
  )
}
