import { ChangeEventHandler, useState } from 'react'
import { Outlet, replace, useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ScrollArea } from '@/atoms/ScrollArea'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { BoardCard } from '@/legacy/components/board/BoardCard'
import { Blank } from '@/legacy/components/common'
import { useTeacherBoard } from '@/legacy/container/teacher-board'
import { useTeacherKlassGroup } from '@/legacy/container/teacher-klass-groups'
import { Board, BoardCategoryEnum } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

export function BoardsPage() {
  const { t } = useLanguage()
  const { push } = useHistory()
  const location = useLocation()
  const filters = [t('title'), t('author')]
  const { groups, selectedGroup, homeKlass, setSelectedGroup } = useTeacherKlassGroup()
  const { boards, selectedCategory, isLoading, setSelectedCategory, unReadBoardList } = useTeacherBoard(
    selectedGroup?.id,
  )
  const [filter, setFilter] = useState(filters[0])
  const [searchWriter, setSearchWriter] = useState('')
  const [searchTitle, setSearchTitle] = useState('')

  const getKeyFromPath = () => {
    if (location.pathname.includes('/add')) return 'add'
    if (location.pathname.includes('/edit')) return 'edit'
    return 'view'
  }

  if (isLoading) {
    return <Blank reversed />
  }
  return (
    <Grid>
      <GridItem colSpan={4}>
        <PageHeaderTemplate
          title={t('class_bulletin_board')}
          config={{
            topBtn: [
              {
                label: '추가',
                variant: 'solid',
                color: 'primary',
                action: () => {
                  push('/teacher/board/add')
                },
              },
            ],
            filters: [
              {
                items:
                  groups?.map((group) => ({
                    label: group.name || '',
                    value: group.id.toString(),
                  })) || [],
                filterState: {
                  value: selectedGroup?.id.toString() || '',
                  setValue: (value: string | ((prev: string) => string)) => {
                    const actualValue = typeof value === 'function' ? value(selectedGroup?.id.toString() || '') : value
                    const foundGroup = groups?.find((group) => group.id.toString() === actualValue)
                    setSelectedGroup(foundGroup)
                  },
                },
              },
              {
                items: [
                  { label: `${t('all')}`, value: `${t('all')}` },
                  ...Object.values(BoardCategoryEnum).map((category) => ({
                    label: t(category),
                    value: category,
                  })),
                ],
                filterState: {
                  value: selectedCategory || `${t('all')}`,
                  setValue: (value: string | ((prev: string) => string)) => {
                    const actualValue = typeof value === 'function' ? value(selectedCategory || `${t('all')}`) : value
                    if (actualValue === `${t('all')}`) {
                      setSelectedCategory(undefined)
                    } else {
                      setSelectedCategory(actualValue as BoardCategoryEnum)
                    }
                  },
                },
              },
              {
                items: [
                  { label: filters[0], value: filters[0] },
                  { label: filters[1], value: filters[1] },
                ],
                filterState: {
                  value: filter,
                  setValue: (value: string | ((prev: string) => string)) => setFilter(value),
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
                  ? searchTitle && replace(`/teacher/board?title=${searchTitle}`)
                  : searchWriter && replace(`/teacher/board?author=${searchWriter}`),
            },
          }}
        />
        <div className="col-span-2 hidden h-screen md:block">
          <ScrollArea className="pt-5">
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
          </ScrollArea>
        </div>
      </GridItem>

      <GridItem colSpan={8}>
        <div className="scroll-box col-span-4 h-screen bg-gray-50 p-0 md:overflow-y-scroll md:p-6">
          <Outlet context={{ homeKlass, groups, key: getKeyFromPath(), page: 1, limit: 1 }} />
        </div>
      </GridItem>
    </Grid>
  )
}
