import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useParams } from 'react-router'
import { Route, Routes } from 'react-router'
import { useRecoilState } from 'recoil'
import { useHistory } from '@/hooks/useHistory'
import RightArrow from '@/legacy/assets/svg/mypage-right-arrow.svg'
import { SuperModal, Tab } from '@/legacy/components'
import { Blank } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { NewsletterSubmitterItem } from '@/legacy/components/newsletter/NewsletterSubmitterItem'
import { useTeacherNewsletterSubmit } from '@/legacy/container/teacher-newsletter-submit'
import { ResponseGroupDto, StudentGroup, StudentNewsletter } from '@/legacy/generated/model'
import { newsletterOpenedGroupState } from '@/stores'
import { NewsletterSubmitDetailPage } from './NewsletterSubmitDetailPage'

export function NewsletterSubmitPage() {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const [newsletterOpenedGroup, setNewsletterOpenedGroup] = useRecoilState(newsletterOpenedGroupState)

  const {
    result,
    studentNewsletters,
    newsletter,
    studentsCount,
    unSubmitCount,
    submitCount,
    totalPerson,
    studentPerson,
    submitPerson,
    selectKlassGroup,
    handleRePush,
    submiterLoding,
  } = useTeacherNewsletterSubmit(Number(id))

  const selectedFilter = Number(localStorage.getItem('selectedFilter'))

  const [filter, setFilter] = useState(selectedFilter || 0)

  const handleSelectKlassGroup = (klassGroup: ResponseGroupDto) => {
    newsletterOpenedGroup.includes(klassGroup.name as string)
      ? setNewsletterOpenedGroup(newsletterOpenedGroup.filter((el) => el !== klassGroup.name))
      : setNewsletterOpenedGroup((prevState) => [...prevState, klassGroup.name as string])
    selectKlassGroup(klassGroup.id)
    push(`/teacher/newsletter/submit/${id}`)
  }

  const handleNewsletterSubmitterItemClick = (studentGroup: StudentGroup, studentNewsletters?: StudentNewsletter[]) => {
    if (!studentNewsletters || !studentNewsletters.length) {
      return
    }

    const studentNewsletter = studentNewsletters.filter(
      (sn: StudentNewsletter) => sn.student?.id === studentGroup.user?.id,
    )[0]

    if (studentNewsletter) {
      push(`/teacher/newsletter/submit/${id}/${studentNewsletter.id}`)
    } else {
      push(`/teacher/newsletter/submit/${id}`)
    }
  }

  return (
    <div className="ml-0.5 grid h-screen grid-cols-7 bg-white">
      {submiterLoding && <Blank reversed />}
      <div className="col-span-4">
        <div className="flex w-full items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg">제출자 리스트</h3>
            <div className="text-sm text-gray-500">
              {filter === 2
                ? `미제출 ${newsletter?.toPerson ? totalPerson.length - submitPerson.length : unSubmitCount}명`
                : `제출 ${newsletter?.toPerson ? submitPerson.length : submitCount}명`}{' '}
              / 총{newsletter?.toPerson ? studentPerson.length : studentsCount}명
            </div>
          </div>
          <div className="text-brand-1 cursor-pointer" onClick={() => queryClient.refetchQueries({ active: true })}>
            새로고침
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
        <div className="flex justify-between">
          <div>
            <Tab
              type="submit"
              filter={filter}
              setFilter={(n: number) => {
                localStorage.setItem('selectedFilter', n.toString())
                setFilter(n)
              }}
            />
          </div>

          {(newsletter?.endAt === null ||
            (newsletter?.endAt && new Date(newsletter.endAt).getTime() > new Date().getTime())) && (
            <Button
              children="미제출자 재알림"
              title="미제출 학생(보호자)에게 다시 알림을 보냅니다."
              onClick={() => setModalOpen(true)}
              className="filled-primary mt-5 mr-5"
            />
          )}
        </div>
        <div className="h-screen-8 overflow-y-scroll p-4">
          {result?.map((group) => {
            const totalCount =
              (newsletter?.toPerson
                ? totalPerson?.filter((person) => person?.student?.klass === group.name)?.length
                : group.studentCount) || 0
            const submittedCount =
              submitPerson?.filter((person) => person?.studentGradeKlass === group.name)?.length || 0
            const unSubmittedCount = Math.max(totalCount - submittedCount, 0)
            return (
              <div key={group.id} className="my-5">
                <div
                  className="flex w-full cursor-pointer items-center justify-between border-t border-gray-600"
                  onClick={() => handleSelectKlassGroup(group)}
                >
                  <div className="text-lg font-bold">{group.name}</div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500">
                      {filter === 2 ? `미제출 ${unSubmittedCount}명` : `제출 ${submittedCount}명`} / 총{totalCount}명
                    </div>
                    <div className="w-8">
                      {(group.studentCount || 0).toString() != '0' &&
                        (newsletterOpenedGroup.includes(group.name as string) ? <Icon.ChevronDown /> : <RightArrow />)}
                    </div>
                  </div>
                </div>
                {newsletterOpenedGroup.includes(group.name as string) &&
                  group.studentGroups?.length > 0 &&
                  group.studentGroups
                    .sort((a, b) => a.studentNumber - b.studentNumber)
                    .map((studentGroup, index) => (
                      <NewsletterSubmitterItem
                        key={index}
                        filter={filter}
                        studentGroup={studentGroup}
                        studentNewsletter={
                          newsletter?.toPerson
                            ? submitPerson?.find((submitInfo) => submitInfo.studentId === studentGroup.user?.id)
                            : studentNewsletters?.find(
                                (studentNewsletter) => studentNewsletter.student?.id === studentGroup.user?.id,
                              )
                        }
                        onClick={() =>
                          newsletter?.toPerson
                            ? handleNewsletterSubmitterItemClick(studentGroup, submitPerson)
                            : handleNewsletterSubmitterItemClick(studentGroup, studentNewsletters)
                        }
                        id={id || ''}
                      />
                    ))}
              </div>
            )
          })}
        </div>
      </div>
      <div className="col-span-3">
        <Routes>
          <Route path={`/teacher/newsletter/submit/:id/:snid`} Component={() => <NewsletterSubmitDetailPage />} />
        </Routes>
      </div>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            해당 가정통신문의 미제출자에게 재알림을 보내시겠습니까?
          </div>
          <Button.lg
            children="재알림하기"
            onClick={async () => {
              await handleRePush(Number(id))
              await setModalOpen(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>
    </div>
  )
}
