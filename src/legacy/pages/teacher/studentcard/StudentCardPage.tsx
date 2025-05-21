import { chain, filter, some, uniqBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Select, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { StudentItem } from '@/legacy/components/studentCard/StudentItem'
import { GroupContainer } from '@/legacy/container/group'
import { useTeacherSearchUser } from '@/legacy/container/teacher-search-user'
import { useGroupsFindLectureGroupsByTeacher } from '@/legacy/generated/endpoint'
import { Group, GroupType, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'

const GroupTypes: { id: number; type: '' | GroupType | 'LECTURE'; name: string }[] = [
  {
    id: 0,
    type: '',
    name: '전체 그룹',
  },
  {
    id: 1,
    type: GroupType.KLASS,
    name: '학급소속 그룹',
  },
  {
    id: 2,
    type: 'LECTURE',
    name: '강의 시간표 그룹',
  },
  {
    id: 3,
    type: GroupType.KLUB,
    name: '사용자 정의 그룹',
  },
]

export function StudentCardPage() {
  const { pathname } = useLocation()
  const { push, replace } = useHistory()
  const { t } = useLanguage()
  const { me } = useUserStore()

  // Get path param
  const groupIdMatch = pathname.match(/\/teacher\/studentcard\/(\d+)/)
  const groupId = groupIdMatch?.[1] ? Number(groupIdMatch[1]) : 0
  const cardTypeMatch = pathname.match(/\/teacher\/studentcard\/\d+\/\d+\/([^/]+)/)
  const cardType = cardTypeMatch ? cardTypeMatch[1] : 'default'

  // Fetching Group Data
  const { allTeacherGroups, teacherKlubGroups, teacherKlassGroups, isLoadingGroups, allKlassGroups, errorGroups } =
    GroupContainer.useContext()
  const { data: lectureGroups, isLoading: isLoadingLectureGroups } = useGroupsFindLectureGroupsByTeacher()

  const allGroups = chain(allTeacherGroups as Group[])
    .concat(lectureGroups || [])
    .sortBy(['grade', 'klass'])
    .value()

  const selectedGroup = allGroups.find((item) => item.id === groupId)

  const [groupType, setGroupType] = useState<'' | GroupType | 'LECTURE'>('')

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
      setGroupType(selectedGroup?.type || '')
    }
  }, [])

  const isDetail = pathname !== '/teacher/studentcard' && !pathname.endsWith(`/teacher/studentcard/${groupId}`)

  // Fetching User Data
  const { userDatas, isLoading: isLoadingUserData, setSearchName } = useTeacherSearchUser(groupId)

  const [username, setUsername] = useState<string>()

  const isLoading = isLoadingGroups || isLoadingLectureGroups || isLoadingUserData

  return (
    <div className="col-span-6 md:grid md:grid-cols-8 2xl:grid 2xl:grid-cols-5">
      {errorGroups && <ErrorBlank />}

      <div
        className={`col-span-2 h-screen overflow-y-auto ${isDetail && 'hidden'} md:col-span-2 md:block 2xl:col-span-1`}
      >
        <div className="md:hidden">
          <div className="block md:hidden">
            <TopNavbar title="학생정보" left={<BackButton />} />
          </div>
        </div>
        <div>
          <div className="p-4">
            <h1 className="hidden text-lg font-semibold md:block">{t('student_information', '학생정보')}</h1>
            <div className="flex w-full cursor-pointer space-x-2 md:pt-2">
              <Select.lg
                placeholder={t('selection', '반 타입 선택')}
                value={groupType}
                onChange={(e) => setGroupType(e.target.value as '' | GroupType | 'LECTURE')}
                className="min-w-0 flex-1"
              >
                {GroupTypes.map((type) => (
                  <option key={type.id} value={type.type}>
                    {type.name}
                  </option>
                ))}
              </Select.lg>
              <Select.lg
                placeholder={t('selection', '반 선택')}
                value={groupId}
                onChange={(e) => {
                  if (e.target.value === '') {
                    replace(`/teacher/studentcard`)
                  } else {
                    replace(`/teacher/studentcard/${e.target.value}`)
                  }
                }}
                className="w-30 shrink-0"
              >
                <option defaultChecked value="" className="text-gray-600">
                  {t('all', '전체')}
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select.lg>
            </div>

            <div className="mt-2 flex w-full items-center space-x-2">
              <SearchInput
                placeholder={t('search_by_name', '이름 검색')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onSearch={() => setSearchName(username)}
                className="w-full"
              />
              <Icon.Search className="cursor-pointer" onClick={() => setSearchName(username)} />
            </div>
          </div>
          <div className="h-0.5 bg-gray-100"></div>
          <div className="scroll-box h-screen-15 md:h-screen-13 overflow-y-auto pb-20">
            {isLoading && (
              <div className="text-center text-2xl text-gray-600">
                {t('loading_data', '데이터를 불러오는 중입니다...')}
              </div>
            )}
            {!isLoading &&
              (!groupId && (!userDatas || userDatas.length === 0) ? (
                <div className="text-center text-2xl">{t('select_class', '학급을 선택해주세요.')}</div>
              ) : !userDatas?.length ? (
                <div className="text-center text-2xl">
                  {t('no_results_or_no_permission', '검색 결과가 없거나, 권한이 없습니다.')}
                </div>
              ) : (
                userDatas
                  .filter((item) => item.klass && item.studentNumber)
                  .map((student) => (
                    <StudentItem
                      key={student.id}
                      studentid={student.id}
                      studentname={student.name + getNickName(student?.nickName)}
                      groupId={groupId}
                      klass={
                        student?.klass
                          ? typeof student.klass === 'string'
                            ? student.klass
                            : `${student.grade}학년 ${student.klass}반`
                          : ''
                      }
                      klassnum={student?.studentNumber + '번'}
                      onClick={() => push(`/teacher/studentcard/${groupId}/${student.id}/${cardType}`)}
                    />
                  ))
              ))}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
