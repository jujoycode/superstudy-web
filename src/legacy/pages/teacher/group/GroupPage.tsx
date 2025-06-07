import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useHistory } from '@/hooks/useHistory'
import { SortState } from '@/constants/enumConstant'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { useTeacherAllGroup } from '@/legacy/container/teacher-group-all'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { compareGroups } from '@/legacy/util/document'

export function GroupPage() {
  const { push, replace } = useHistory()
  const { t, currentLang } = useLanguage()
  const { pathname } = useLocation()
  const id = pathname.replace('/teacher/groups', '').replace('/', '')

  const [frontSortType, setFrontSortType] = useState('name')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.DEFAULT)

  const { allGroups } = useTeacherAllGroup()

  const sortedGroups = useMemo(() => {
    if (sortOrder === 'default') {
      return allGroups
    }
    return allGroups?.sort((a, b) => compareGroups(a, b, frontSortType, sortOrder.toUpperCase() as 'ASC' | 'DESC'))
  }, [allGroups, frontSortType, sortOrder])

  return (
    <Grid>
      <GridItem colSpan={6}>
        <ResponsiveRenderer mobile={<TopNavbar title="그룹정보" left={<BackButton />} />} />

        <PageHeaderTemplate
          title="그룹정보"
          description="선생님에게 할당된 그룹 정보를 열람할 수 있어요"
          config={{
            topBtn: [
              {
                label: '그룹 추가하기',
                variant: 'solid',
                color: 'primary',
                action: () => replace('/teacher/groups/add'),
              },
            ],
            sort: {
              mode: 'client',
              items: [
                { label: '이름순', value: 'name' },
                { label: '과목순', value: 'subject' },
                { label: '종류별', value: 'type' },
              ],
              itemState: {
                value: frontSortType,
                setValue: (v) => setFrontSortType(v),
              },
              sortState: {
                value: sortOrder,
                setValue: (v) => setSortOrder(v),
              },
            },
          }}
        />

        <Divider height="0.5" color="bg-gray-100" />
        <div className="grid grid-cols-2 gap-2 overflow-y-auto p-2">
          {sortedGroups.map((group) => (
            <div
              key={group.id}
              className="w-full cursor-pointer rounded-lg border-2 p-2"
              onClick={() => push(`/teacher/groups/${group.id}`)}
            >
              <div className="overflow-hidden font-semibold whitespace-pre"> {group.name}</div>
              <div className="overflow-hidden pl-3 text-sm whitespace-pre text-gray-500">
                {t('subject', '과목')} : {group.subject}
              </div>
              <div className="overflow-hidden pl-3 text-sm whitespace-pre text-gray-500">
                {t('classroom', '교실')} : {group.room}
              </div>

              <div className="text-right text-xs">{currentLang === 'ko' ? group.originKor : group.origin}</div>
            </div>
          ))}
        </div>
      </GridItem>
      <GridItem colSpan={6}>
        <Outlet context={{ selectedGroup: allGroups.find((g) => g.id === +id) }} />
      </GridItem>
    </Grid>
  )
}
