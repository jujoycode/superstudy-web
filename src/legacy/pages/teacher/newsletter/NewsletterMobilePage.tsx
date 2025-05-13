import { ChangeEventHandler, useState } from 'react'

import { List, Select } from '@/legacy/components/common'
import { FeedsItem } from '@/legacy/components/common/FeedsItem'
import { Icon } from '@/legacy/components/common/icons'
import { NoItem } from '@/legacy/components/common/NoItem'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { useTeacherNewsletter } from '@/legacy/container/teacher-newsletter'
import { Newsletter, NewsletterType } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { meState } from '@/stores'

const filters = ['제목', '작성자']

export function NewsletterMobilePage() {
  const { newsletters } = useTeacherNewsletter()
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
              {newsletters?.length === 0 && <NoItem />}
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
                  <FeedsItem
                    to={'teacher'}
                    pageType={'newsletter'}
                    key={newsletter.id}
                    id={newsletter.id}
                    category1={newsletter.category || '가정통신문'}
                    category1Color="light_golden"
                    category2={newsletter.type === NewsletterType.NOTICE ? '공지' : '설문'}
                    category2Color="lavender_blue"
                    submitDate={DateUtil.formatDate(newsletter.endAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                    title={newsletter.title}
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
      </div>
    </>
  )
}
