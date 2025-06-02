import { useEffect, useMemo, useState } from 'react'
import { chain, filter, some, uniqBy } from 'lodash'
import { Outlet, useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { SortState } from '@/constants/enumConstant'
import { useUserStore } from '@/stores/user'
import { Divider } from '@/atoms/Divider'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { StudentItem } from '@/legacy/components/studentCard/StudentItem'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherSearchUser } from '@/legacy/container/teacher-search-user'
import { useGroupsFindLectureGroupsByTeacher } from '@/legacy/generated/endpoint'
import { Group, GroupType, Role } from '@/legacy/generated/model'
import { compareUsers } from '@/legacy/util/document'
import { getNickName } from '@/legacy/util/status'

export function StudentCardPage() {
  const { pathname } = useLocation()
  const { push, replace } = useHistory()
  const { me } = useUserStore()

  // Get path param
  const groupIdMatch = pathname.match(/\/teacher\/studentcard\/(\d+)/)
  const groupId = groupIdMatch?.[1] ? Number(groupIdMatch[1]) : 0
  const cardTypeMatch = pathname.match(/\/teacher\/studentcard\/\d+\/\d+\/([^/]+)/)
  const cardType = cardTypeMatch ? cardTypeMatch[1] : 'default'

  // Define state
  const [frontSortType, setFrontSortType] = useState('num')
  const [sortOrder, setSortOrder] = useState<SortState>(SortState.ASC)
  const [username, setUsername] = useState<string>('')
  const [groupType, setGroupType] = useState<'ALL' | GroupType | 'LECTURE'>('ALL')

  // Fetching User Data
  const { userDatas, setSearchName } = useTeacherSearchUser(groupId)

  const sortedUsers = useMemo(() => {
    if (sortOrder === 'default') {
      return userDatas
    }
    return userDatas?.sort((a, b) => compareUsers(a, b, frontSortType, sortOrder.toUpperCase() as 'ASC' | 'DESC'))
  }, [userDatas, frontSortType, sortOrder])

  // Fetching Group Data
  const { allTeacherGroups, teacherKlubGroups, teacherKlassGroups, allKlassGroups } = GroupContainer.useContext()
  const { data: lectureGroups } = useGroupsFindLectureGroupsByTeacher()

  const allGroups = chain(allTeacherGroups as Group[])
    .concat(lectureGroups || [])
    .sortBy(['grade', 'klass'])
    .value()

  const selectedGroup = allGroups.find((item) => item.id === groupId)

  const groups = useMemo(() => {
    switch (groupType) {
      case GroupType.KLASS:
        if (
          me?.role === Role.PRE_HEAD ||
          me?.role === Role.HEAD ||
          me?.role === Role.PRE_PRINCIPAL ||
          me?.role === Role.PRINCIPAL ||
          me?.role === Role.VICE_PRINCIPAL ||
          me?.role === Role.HEAD_PRINCIPAL ||
          me?.role === Role.SECURITY ||
          me?.role === Role.ADMIN
        ) {
          return chain(allKlassGroups).uniqBy('name').sortBy(['grade', 'klass']).value()
        } else {
          return chain(teacherKlassGroups).uniqBy('name').sortBy(['grade', 'klass']).value()
        }
      case 'LECTURE':
        return chain(lectureGroups || [])
          .uniqBy('name')
          .sortBy(['grade', 'klass'])
          .value()
      case GroupType.KLUB:
        return filter(teacherKlubGroups, (tg) => !some(lectureGroups, (lg) => lg.id === tg.id))
      default:
        return uniqBy(allGroups, 'name')
    }
  }, [groupType])

  // 담임 교사일 경우 첫 로딩 시에 담당 반이 보이도록 설정
  useEffect(() => {
    if (!groupIdMatch && me?.klassGroupId) {
      replace(`/teacher/studentcard/${me.klassGroupId}`)
      setGroupType(selectedGroup?.type || 'ALL')
    }
  }, [])

  return (
    <Grid>
      <GridItem colSpan={3}>
        <ResponsiveRenderer mobile={<TopNavbar title="확인증" left={<BackButton />} />} />

        <PageHeaderTemplate
          title="학생정보"
          description="학생의 학적생활 정보를 볼 수 있어요"
          config={{
            filters: [
              {
                items: [
                  {
                    value: 'ALL',
                    label: '전체 그룹',
                  },
                  {
                    value: GroupType.KLASS,
                    label: '학급소속 그룹',
                  },
                  {
                    value: 'LECTURE',
                    label: '강의 시간표 그룹',
                  },
                  {
                    value: GroupType.KLUB,
                    label: '사용자 정의 그룹',
                  },
                ],
                filterState: {
                  value: groupType,
                  setValue: (v) => setGroupType(v as 'ALL' | GroupType | 'LECTURE'),
                },
              },
              {
                items: groups.map((g) => ({ value: String(g.id), label: g.name || '' })),
                filterState: {
                  value: String(groupId),
                  setValue: (v) => replace(v ? `/teacher/studentcard/${v}` : `/teacher/studentcard`),
                },
              },
            ],
            searchBar: {
              placeholder: '이름 검색',
              searchState: {
                value: username,
                setValue: (v) => {
                  setUsername(v)
                  if (v === '') setSearchName('')
                },
              },
              onSearch: () => username && setSearchName(username),
            },
            sort: {
              mode: 'client',
              items: [
                { label: '학번순', value: 'num' },
                { label: '이름순', value: 'name' },
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

        <div className="overflow-y-auto">
          {sortedUsers?.map((student) => {
            const klassText = student?.klass
              ? typeof student.klass === 'string'
                ? student.klass
                : `${student.grade}학년 ${student.klass}반`
              : ''

            return (
              <StudentItem
                key={student.id}
                studentid={student.id}
                studentname={student.name + getNickName(student?.nickName)}
                groupId={groupId}
                klass={klassText}
                klassnum={`${student?.studentNumber}번`}
                onClick={() => push(`/teacher/studentcard/${groupId}/${student.id}/${cardType}`)}
              />
            )
          })}
        </div>
      </GridItem>
      <GridItem colSpan={9} className="bg-gray-50">
        <Outlet />
      </GridItem>
    </Grid>
  )
}
