import { ChangeEventHandler, useState } from 'react'

import { List, Select } from '@/legacy/components/common'
import { FeedsItem } from '@/legacy/components/common/FeedsItem'
import { Icon } from '@/legacy/components/common/icons'
import { NoItem } from '@/legacy/components/common/NoItem'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { TeacherNoticeContainer } from '@/legacy/container/teacher-notice'
import { Notice } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

const filters = ['제목', '작성자']

export function NoticeMobilePage() {
  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const handleFilterChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSearchWriter('')
    setSearchTitle('')
    setFilter(e.target.value)
  }

  const { filteredNoticeList } = TeacherNoticeContainer.useContext()

  return (
    <>
      <div className="w-full flex-col">
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

        <div className="scroll-box h-0.5 bg-gray-100"></div>
        <div className="scroll-box h-screen-14 w-full flex-col space-y-2 overflow-y-auto">
          <div className="whitespace-pre-line">
            <List>
              {filteredNoticeList?.length === 0 && <NoItem />}
              {filteredNoticeList
                ?.filter(
                  (notice: Notice) =>
                    (searchWriter === '' || notice?.user?.name.includes(searchWriter)) &&
                    (searchTitle === '' || notice?.title.includes(searchTitle)),
                )
                .map((notice: Notice) => (
                  <FeedsItem
                    to={'teacher'}
                    pageType={'notice'}
                    key={notice.id}
                    id={notice.id}
                    category1={notice.category}
                    category1Color="orange-200"
                    title={notice.title}
                    contentText={notice.content}
                    contentImages={notice.images}
                    contentFiles={notice.files}
                    writer={notice?.user?.name}
                    createAt={DateUtil.formatDate(notice.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                  />
                ))}
            </List>
          </div>
        </div>
      </div>
    </>
  )
}
