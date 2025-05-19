import { useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'

import { useHistory } from '@/hooks/useHistory'
import { Divider } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { TeacharAllGroup, useTeacherAllGroup } from '@/legacy/container/teacher-group-all'
import { useLanguage } from '@/legacy/hooks/useLanguage'

import { GroupAddPage } from './GroupAddPage'
import { GroupDetailPage } from './GroupDetailPage'

export function GroupPage() {
  const { push } = useHistory()
  const { t, currentLang } = useLanguage()
  const { pathname } = useLocation()
  const id = pathname.replace('/teacher/groups', '').replace('/', '')

  const [frontSortType, setFrontSortType] = useState('name')

  const { allGroups } = useTeacherAllGroup()

  const getTextColor = (origin: string) => {
    return origin === 'TIMETABLE' ? 'text-lavender_blue' : origin === 'KLASS' ? 'text-mint_green' : 'text-brand-1'
  }

  const getBorderColor = (origin: string) => {
    return origin === 'TIMETABLE' ? 'border-lavender_blue' : origin === 'KLASS' ? 'border-mint_green' : 'border-brand-1'
  }

  return (
    <div className="col-span-7 grid grid-cols-7">
      <div className="col-span-4 hidden h-screen md:block">
        <div className="px-6 py-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-semibold">{t('group_information', '그룹정보')}</h1>
            <Link
              children={t('add', '추가하기')}
              to="/teacher/groups/add"
              className="bg-light_orange text-brand-1 hover:bg-brand-1 hover:text-light_orange rounded-md px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-3 bg-gray-100 max-md:hidden">
          <button onClick={() => setFrontSortType('name')} className="flex items-center justify-center">
            <span>{t('by_name', '이름순')}</span>
            {frontSortType === 'name' && <Icon.ChevronDown />}
          </button>
          <button onClick={() => setFrontSortType('subject')} className="flex items-center justify-center">
            <span>{t('by_subject', '과목순')}</span>
            {frontSortType === 'subject' && <Icon.ChevronDown />}
          </button>
          <button onClick={() => setFrontSortType('origin')} className="flex items-center justify-center">
            <span>{t('by_type', '종류별')}</span>
            {frontSortType === 'origin' && <Icon.ChevronDown />}
          </button>
        </div>
        <Divider />
        <div className="scroll-box h-screen-6 w-full overflow-y-auto">
          <div className="grid w-full grid-flow-row grid-cols-2 gap-2 pr-4 lg:grid-cols-3 xl:grid-cols-4">
            {allGroups
              .sort((a, b) => {
                if (frontSortType === 'subject') {
                  if (a.subject && b.subject) {
                    if (a.subject < b.subject) return -1
                    if (a.subject > b.subject) return 1
                  } else {
                    if (!a.subject && b.subject) return -1
                    if (a.subject && !b.subject) return 1
                  }
                } else if (frontSortType === 'origin') {
                  if (a.origin && b.origin) {
                    if (a.origin < b.origin) return -1
                    if (a.origin > b.origin) return 1
                  } else {
                    if (!a.origin && b.origin) return -1
                    if (a.origin && !b.origin) return 1
                  }
                }

                // 기본은 이름순
                if (a.name < b.name) return -1
                if (a.name > b.name) return 1

                return 0
              })
              .map((group: TeacharAllGroup) => (
                <div
                  key={group.id}
                  className={`m-1 w-full cursor-pointer rounded-lg border-2 ${getBorderColor(group.origin)} ${
                    group.id === +id ? 'bg-gray-100' : ''
                  } p-1`}
                  onClick={() => push(`/teacher/groups/${group.id}`)}
                >
                  <div className="w-full overflow-hidden font-semibold whitespace-pre"> {group.name}</div>
                  <div className="text-gray-3 w-full overflow-hidden pl-3 text-sm whitespace-pre">
                    {t('subject', '과목')} : {group.subject}
                  </div>
                  <div className="text-gray-3 w-full overflow-hidden pl-3 text-sm whitespace-pre">
                    {t('classroom', '교실')} : {group.room}
                  </div>

                  {/* <div className="font-base pl-3 text-sm text-gray-3">
                  {group.studentCount ? <span>({group.studentCount}명)</span> : ''}
                </div> */}

                  <div className={`mt-2 w-full text-right text-xs ${getTextColor(group.origin)}`}>
                    {currentLang === 'ko' ? group.originKor : group.origin}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="scroll-box col-span-3 bg-gray-50">
        <Routes>
          <Route path="/teacher/groups/add" Component={() => <GroupAddPage />} />
          <Route
            path="/teacher/groups/:id"
            Component={() => <GroupDetailPage selectedGroup={allGroups.find((g) => g.id === +id)} />}
          />
        </Routes>
      </div>
    </div>
  )
}
