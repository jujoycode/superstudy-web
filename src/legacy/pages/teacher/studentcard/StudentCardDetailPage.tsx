import { Route, Switch, useHistory, useLocation, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { BackButton, Blank, List, TopNavbar } from '@/legacy/components/common'
import Counselingv3Card from '@/legacy/components/studentCard/Counselingv3Card'
import { StudyInfoCard2 } from '@/legacy/components/studentCard/StudyInfoCard2'
import { useTeacherStudentCard } from '@/legacy/container/teacher-studentcard'
import { ScoreUse } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { cn } from '@/legacy/lib/tailwind-merge'
import { meState } from '@/stores'
import { ActivityV3Page } from './ActivityV3Page'
import { AllCardPage } from './AllCardPage'
import { GeneralCardPage } from './GeneralCardPage'
import { PointLogsPage } from './PointLogsPage'
import { ScoreCardPage } from './ScoreCardPage'

export function StudentCardDetailPage() {
  const meRecoil = useRecoilValue(meState)
  const { t, currentLang } = useLanguage()

  const { id, cardType, groupId } = useParams<{ id: string; cardType: string; groupId: string }>()
  const { replace } = useHistory()
  const { search } = useLocation()
  const { studentInfo, isForbidden, isLoading } = useTeacherStudentCard(Number(id))
  const searchParams = new URLSearchParams(search)

  if (isLoading) return <Blank />

  const handleReplace = (path: string) => {
    replace({
      pathname: path,
      search: searchParams.toString(),
    })
  }

  return (
    <>
      <div className="block md:hidden">
        <TopNavbar title={t('student_information', '학생정보')} left={<BackButton />} />
      </div>
      <div className="h-screen-4 col-span-6 md:col-span-6 md:h-screen 2xl:col-span-4">
        {isForbidden ? (
          <div className="relative h-full bg-gray-50">
            <div className="bg-gray relative h-full w-auto p-4">
              <List className={`flex flex-row text-sm md:m-0 md:${currentLang === 'ko' ? 'text-xl' : 'text-12'}`}>
                <button
                  className={`rounded-md px-1 py-1 md:h-10 md:px-4 ${
                    cardType === 'activityv3' ? 'bg-orange-400 text-white' : 'hover:font-bold'
                  }`}
                  onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/activityv3`)}
                >
                  {t('activity_card', '활동카드')}
                </button>
                <button
                  className={`rounded-md px-1 py-1 md:h-10 md:px-4 ${
                    cardType === 'default' ? 'bg-orange-400 text-white' : 'hover:font-bold'
                  }`}
                  onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/default`)}
                >
                  {t('comprehensive_card', '종합카드')}
                </button>
                <button
                  className={`rounded-md px-1 py-1 md:h-10 md:px-4 ${
                    cardType === 'counseling' ? 'bg-orange-400 text-white' : 'hover:font-bold'
                  }`}
                  onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/counseling`)}
                >
                  {t('counseling_card', '상담카드')}
                </button>
                <button
                  className={cn(
                    'rounded-md px-1 py-1 md:h-10 md:px-4',
                    cardType === 'pointlogs' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                  )}
                  onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/pointlogs`)}
                >
                  {t('pointlogs', '상벌점기록')}
                </button>
              </List>
              <div>
                <Switch>
                  <Route
                    exact
                    path={`/teacher/studentcard/:groupId/:id/default`}
                    component={() => <StudyInfoCard2 studentId={Number(id)} isCard={true} isForbidden={isForbidden} />}
                  />
                  <Route path={`/teacher/studentcard/:groupId/:id/activityv3`} component={ActivityV3Page} />
                  <Route
                    path={`/teacher/studentcard/:groupId/:id/counseling`}
                    component={() => <Counselingv3Card studentId={Number(id)} groupId={Number(groupId)} />}
                  />
                  <Route exact path={`/teacher/studentcard/:groupId/:id/pointlogs`} component={PointLogsPage} />
                </Switch>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-full bg-gray-50">
              <div className="bg-gray relative h-full w-auto p-4">
                <List className={`flex flex-row text-sm md:m-0 md:${currentLang === 'ko' ? 'text-xl' : 'text-12'}`}>
                  <button
                    className={cn(
                      'rounded-md px-1 py-1 md:h-10 md:px-4',
                      cardType === 'default' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                    )}
                    onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/default`)}
                  >
                    {t('basic_card', '기본카드')}
                  </button>
                  {meRecoil?.school.schoolType === 'HS' && meRecoil?.school.isScoreActive !== ScoreUse.NONE && (
                    <button
                      className={cn(
                        'hidden rounded-md px-1 py-1 md:block md:h-10 md:px-4',
                        cardType === 'score' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                      )}
                      onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/score`)}
                    >
                      {t('grade_card', '성적카드')}
                    </button>
                  )}
                  <button
                    className={cn(
                      'rounded-md px-1 py-1 md:h-10 md:px-4',
                      cardType === 'activityv3' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                    )}
                    onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/activityv3`)}
                  >
                    {t('activity_card', '활동카드')}
                  </button>
                  <button
                    className={cn(
                      'rounded-md px-1 py-1 md:h-10 md:px-4',
                      cardType === 'general' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                    )}
                    onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/general`)}
                  >
                    {t('general_opinion', '종합의견')}
                  </button>
                  <button
                    className={cn(
                      'rounded-md px-1 py-1 md:h-10 md:px-4',
                      cardType === 'all' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                    )}
                    onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/all`)}
                  >
                    {t('comprehensive_card', '종합카드')}
                  </button>
                  <button
                    className={cn(
                      'rounded-md px-1 py-1 md:h-10 md:px-4',
                      cardType === 'counseling' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                    )}
                    onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/counseling`)}
                  >
                    {t('counseling_card', '상담카드')}
                  </button>
                  <button
                    className={cn(
                      'rounded-md px-1 py-1 md:h-10 md:px-4',
                      cardType === 'pointlogs' ? 'bg-orange-400 text-white' : 'hover:font-bold',
                    )}
                    onClick={() => handleReplace(`/teacher/studentcard/${groupId}/${id}/pointlogs`)}
                  >
                    {t('pointlogs', '상벌점기록')}
                  </button>
                </List>
                <div>
                  <Switch>
                    <Route path={`/teacher/studentcard/:groupId/:id/score`} component={ScoreCardPage} />

                    <Route path={`/teacher/studentcard/:groupId/:id/activityv3`} component={ActivityV3Page} />
                    <Route
                      path={`/teacher/studentcard/:groupId/:id/all`}
                      component={() => (
                        <StudyInfoCard2 studentId={studentInfo?.student.id} isCard={true} isForbidden={isForbidden} />
                      )}
                    />
                    <Route
                      path={`/teacher/studentcard/:groupId/:id/counseling`}
                      component={() => <Counselingv3Card studentId={Number(id)} groupId={Number(groupId)} />}
                    />
                    <Route exact path={`/teacher/studentcard/:groupId/:id/general`} component={GeneralCardPage} />
                    <Route exact path={`/teacher/studentcard/:groupId/:id/default`} component={AllCardPage} />
                    <Route exact path={`/teacher/studentcard/:groupId/:id/pointlogs`} component={PointLogsPage} />
                  </Switch>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
