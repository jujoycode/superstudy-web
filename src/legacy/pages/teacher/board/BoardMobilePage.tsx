import { ChangeEventHandler, useState } from 'react'
import { Link } from 'react-router-dom'

import { SelectMenus } from '@/legacy/components'
import { Blank, List, Select } from '@/legacy/components/common'
import { FeedsItem } from '@/legacy/components/common/FeedsItem'
import { Icon } from '@/legacy/components/common/icons'
import { NoItem } from '@/legacy/components/common/NoItem'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { useTeacherBoard } from '@/legacy/container/teacher-board'
import { useTeacherKlassGroup } from '@/legacy/container/teacher-klass-groups'
import { Board, Group } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

const filters = ['제목', '작성자']

export function BoardMobilePage() {
  const { groups, selectedGroup, setSelectedGroup } = useTeacherKlassGroup()
  const { boards, isLoading } = useTeacherBoard(selectedGroup?.id)
  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')

  const handleFilterChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSearchWriter('')
    setSearchTitle('')
    setFilter(e.target.value)
  }

  return (
    <>
      {isLoading && <Blank reversed />}
      <div className="w-full flex-col">
        <div className="flex items-center justify-between space-x-2 px-6 pt-3 pb-3">
          <div className="cursor-pointer">
            <SelectMenus items={groups} value={selectedGroup} onChange={(value: Group) => setSelectedGroup(value)} />
          </div>
          <Link
            children="추가"
            to="/teacher/board/add"
            className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-4 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex w-full items-center space-x-2 px-6 pb-6">
          <div className="cursor-pointer">
            <Select.lg value={filter} onChange={handleFilterChange}>
              {filters.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Select.lg>
          </div>
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
        <div className="scroll-box h-0.5 bg-gray-100"></div>
        <div className="scroll-box h-screen-18 w-full flex-col space-y-2 overflow-y-auto">
          <div className="whitespace-pre-line">
            <List>
              {boards?.length === 0 && <NoItem />}
              {boards
                ?.filter(
                  (board: Board) =>
                    (searchWriter === '' ||
                      (board && board.writer && board.writer.name && board.writer.name.includes(searchWriter))) &&
                    (searchTitle === '' || (board && board.title && board.title.includes(searchTitle))),
                )
                .map((board: Board) => (
                  <FeedsItem
                    to={'teacher'}
                    pageType={'board'}
                    key={board.id}
                    id={board.id}
                    category1={board.category}
                    category1Color="mint_green"
                    title={board.title}
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
      </div>
    </>
  )
}
