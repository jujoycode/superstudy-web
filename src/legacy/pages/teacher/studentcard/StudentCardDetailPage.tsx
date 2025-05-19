import { Outlet, useLocation, useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { BackButton, Blank, List, TopNavbar } from '@/legacy/components/common'
import Counselingv3Card from '@/legacy/components/studentCard/Counselingv3Card'
import { StudyInfoCard2 } from '@/legacy/components/studentCard/StudyInfoCard2'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'
import { ScoreUse } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { cn } from '@/legacy/lib/tailwind-merge'
import { ActivityV3Page } from './ActivityV3Page'
import { AllCardPage } from './AllCardPage'
import { GeneralCardPage } from './GeneralCardPage'
import { PointLogsPage } from './PointLogsPage'
import { ScoreCardPage } from './ScoreCardPage'

export function StudentCardDetailPage() {
  const { me: meRecoil } = useUserStore()
  const { t, currentLang } = useLanguage()

  const { id, cardType, groupId } = useParams<{ id: string; cardType: string; groupId: string }>()
  const { replace } = useHistory()
  const { search } = useLocation()
  const { isForbidden, isLoading } = useTeacherStudentCard(Number(id))
  const searchParams = new URLSearchParams(search)

  if (isLoading) return <Blank />

  const handleReplace = (path: string) => {
    replace({
      pathname: path,
      search: searchParams.toString(),
    })
  }

  const studentCardDatas = [
    {
      id: 1,
      type: 'default',
      name: t('basic_card', '기본카드'),
      url: `/teacher/studentcard/${groupId}/${id}/default`,
      hidden: isForbidden,
    },
    {
      id: 2,
      type: 'score',
      name: t('grade_card', '성적카드'),
      url: `/teacher/studentcard/${groupId}/${id}/score`,
      hidden: isForbidden || meRecoil?.school.schoolType !== 'HS' || meRecoil?.school.isScoreActive === ScoreUse.NONE,
    },
    {
      id: 3,
      type: 'activityv3',
      name: t('activity_card', '활동카드'),
      url: `/teacher/studentcard/${groupId}/${id}/activityv3`,
    },
    {
      id: 4,
      type: 'general',
      name: t('general_opinion', '종합의견'),
      url: `/teacher/studentcard/${groupId}/${id}/general`,
      hidden: isForbidden,
    },
    {
      id: 5,
      type: 'default',
      name: t('comprehensive_card', '종합카드'),
      url: `/teacher/studentcard/${groupId}/${id}/default`,
    },
    {
      id: 6,
      type: 'counseling',
      name: t('counseling_card', '상담카드'),
      url: `/teacher/studentcard/${groupId}/${id}/counseling`,
    },
    {
      id: 7,
      type: 'pointlogs',
      name: t('pointlogs', '상벌점기록'),
      url: `/teacher/studentcard/${groupId}/${id}/pointlogs`,
    },
  ]

  return (
    <>
      <div className="block md:hidden">
        <TopNavbar title={t('student_information', '학생정보')} left={<BackButton />} />
      </div>
      <div className="h-screen-4 col-span-6 md:col-span-6 md:h-screen 2xl:col-span-4">
        <div className="relative h-full bg-gray-50">
          <div className="bg-gray relative h-full w-auto p-4">
            <div className={`flex text-sm md:m-0 md:${currentLang === 'ko' ? 'text-xl' : 'text-12'}`}>
              {studentCardDatas.map(
                ({ id, type, name, url, hidden = false }) =>
                  !hidden && (
                    <button
                      key={id}
                      className={cn(
                        'cursor-pointer rounded-md px-1 py-1 md:h-10 md:px-4',
                        cardType === type ? 'bg-orange-400 text-white' : 'hover:font-bold',
                      )}
                      onClick={() => handleReplace(url)}
                    >
                      {name}
                    </button>
                  ),
              )}
            </div>
            <div>
              <Outlet context={{ studentId: Number(id), groupId: Number(groupId), isCard: true }} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
