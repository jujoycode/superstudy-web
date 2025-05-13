import { useQueryClient } from 'react-query'
import { Routes, useParams } from 'react-router'
import { Route } from 'react-router-dom'
import { useRecoilState } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { NewsletterCheckerItem } from '@/legacy/components/newsletter/NewsletterCheckerItem'
import { useTeacherNewsletterCheck } from '@/legacy/container/teacher-newsletter-check'
import { ResponseChatAttendeeDto, ResponseGroupDto, StudentGroup } from '@/legacy/generated/model'
import { newsletterOpenedGroupState } from '@/stores'

import { NewsletterCheckDetailPage } from './NewsletterCheckDetailPage'

export function NewsletterCheckPage() {
  const { push } = useHistory()
  const { id = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [newsletterOpenedGroup, setNewsletterOpenedGroup] = useRecoilState(newsletterOpenedGroupState)
  const { result, newsletter, studentsCount, unCheckCount, unCheckPerson, totalPerson, selectKlassGroup } =
    useTeacherNewsletterCheck(Number(id))

  const handleSelectKlassGroup = (klassGroup: ResponseGroupDto) => {
    newsletterOpenedGroup.includes(klassGroup.name as string)
      ? setNewsletterOpenedGroup(newsletterOpenedGroup.filter((el) => el !== klassGroup.name))
      : setNewsletterOpenedGroup((prevState) => [...prevState, klassGroup.name as string])

    selectKlassGroup(klassGroup.id)
    push(`/teacher/newsletter/check/${id}`)
  }

  const handleNewsletterCheckerItemClick = (
    studentGroup: StudentGroup,
    studentNewsletters?: ResponseChatAttendeeDto[],
  ) => {
    if (!studentNewsletters || !studentNewsletters.length) {
      return
    }
    const studentNewsletter = studentNewsletters.filter(
      (sn: ResponseChatAttendeeDto) => sn?.id === studentGroup.user?.id,
    )[0]

    if (studentNewsletter) {
      push(`/teacher/newsletter/check/${id}/${studentNewsletter}`)
    } else {
      push(`/teacher/newsletter/check/${id}`)
    }
  }

  return (
    <div className="ml-0.5 grid h-screen grid-cols-7 bg-white">
      <div className="col-span-4">
        <div className="flex w-full items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg">미확인자 리스트</h3>
            {/* <div className="text-sm text-gray-500">
              미확인 {unCheckCount}명 / 총 {studentsCount}명
            </div> */}
            <div className="text-sm text-gray-500">
              미확인 {unCheckCount}명 / 총 {newsletter?.toPerson ? totalPerson.length : studentsCount}명
            </div>
          </div>
          <div className="text-brand-1 cursor-pointer" onClick={() => queryClient.refetchQueries({ active: true })}>
            새로고침
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
        <div className="h-screen-8 overflow-y-scroll p-4">
          {result?.map((group) => (
            <div key={group.id} className="my-5">
              <div
                className="flex w-full cursor-pointer items-center justify-between border-t border-gray-600"
                onClick={() => handleSelectKlassGroup(group)}
              >
                <div className="text-lg font-bold">{group.name}</div>
                <div className="text-sm text-gray-500">
                  {`미확인 ${unCheckPerson?.filter((person) => person?.klass === group.name).length}명 / 총 ${
                    newsletter?.toPerson
                      ? totalPerson?.filter((person) => person?.klass === group.name).length
                      : group.studentCount || 0
                  }명`}
                </div>
              </div>
              {newsletterOpenedGroup.includes(group.name as string) &&
                group.studentGroups?.length > 0 &&
                group.studentGroups
                  .sort((a, b) => a.studentNumber - b.studentNumber)
                  .map((studentGroup, index) => (
                    <NewsletterCheckerItem
                      key={index}
                      filter={2}
                      studentGroup={studentGroup}
                      studentNewsletter={unCheckPerson?.find(
                        (studentNewsletter) => studentNewsletter?.id === studentGroup.user?.id,
                      )}
                      onClick={() => handleNewsletterCheckerItemClick(studentGroup, unCheckPerson)}
                      id={id}
                    />
                  ))}
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-3">
        <Routes>
          <Route path={`/teacher/newsletter/check/:id/:snid`} Component={() => <NewsletterCheckDetailPage />} />
        </Routes>
      </div>
    </div>
  )
}
