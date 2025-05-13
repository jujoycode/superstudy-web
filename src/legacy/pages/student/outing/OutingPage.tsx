import RightArrow from '@/assets/svg/mypage-right-arrow.svg'
import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { useStudentOuting } from '@/legacy/container/student-outing'
import { UserContainer } from '@/legacy/container/user'
import { OutingStatus, Role } from '@/legacy/generated/model'
import { makeDateToString } from '@/legacy/util/time'

function getDate(stromg: string) {
  const week = ['일', '월', '화', '수', '목', '금', '토']
  const dayOfWeek = week[new Date(stromg).getDay()]
  return dayOfWeek + '요일'
}

export function OutingPage() {
  const { me } = UserContainer.useContext()
  const { push } = useHistory()
  const { outings, error, isLoading } = useStudentOuting()

  const isNotParent = me?.role !== 'PARENT'

  if (error) {
    return <ErrorBlank />
  }

  return (
    <div>
      <TopNavbar
        title="확인증"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {isLoading && <Blank />}
      {error && <ErrorBlank />}

      <div className="scroll-box h-screen-12 overflow-y-auto">
        <Section>
          <div className="space-y-4 pb-12">
            {outings?.map((outing) => {
              return (
                <div
                  key={outing.id}
                  className="border-grey-9 flex cursor-pointer items-center justify-between border-b pb-4"
                  onClick={() => push(`/student/outing/${outing?.id}`)}
                >
                  <div>
                    <div className="font-bold text-gray-800">
                      [{outing?.type}] {outing?.startAt && makeDateToString(new Date(outing.startAt))}
                      {makeDateToString(new Date(outing.startAt)) === makeDateToString(new Date(outing.endAt))
                        ? ' ' + getDate(outing?.startAt)
                        : ' ~ ' + makeDateToString(new Date(outing.endAt))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {outing?.reportedAt}{' '}
                      {outing?.outingStatus === OutingStatus.PROCESSED ? (
                        '승인 완료'
                      ) : outing?.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL ? (
                        <span
                          className={` ${
                            me?.role === Role.PARENT ? 'text-brand-1 font-bold' : 'font-bold text-blue-600'
                          } `}
                        >
                          보호자 승인 대기
                        </span>
                      ) : outing?.outingStatus === OutingStatus.PROCESSING ||
                        outing?.outingStatus === OutingStatus.BEFORE_TEACHER_APPROVAL ? (
                        <span className="font-bold text-blue-600">학교 승인 대기</span>
                      ) : outing?.outingStatus === OutingStatus.DELETE_APPEAL ? (
                        <span className="font-bold text-red-500">삭제 요청</span>
                      ) : outing?.outingStatus === OutingStatus.RETURNED ? (
                        <span className="text-brand-1 font-bold">반려됨</span>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div className="flex">
                    {outing?.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL && me?.role === Role.PARENT && (
                      <span className="text-brand-1 pt-1 text-sm font-bold">승인해주세요.</span>
                    )}
                    <RightArrow />
                  </div>
                </div>
              )
            })}
            {!outings?.length && (
              <div className="h-screen-10 flex w-full flex-col items-center justify-center text-center">
                <div className="text-gray-600">아직 조퇴/외출/확인증 리스트가 없습니다.</div>
                {isNotParent && <div className="text-gray-600">아래 버튼을 눌러 신청해주세요.</div>}
              </div>
            )}
          </div>
        </Section>
      </div>

      {isNotParent && (
        <div className="w-full px-4">
          <button
            children="확인증 신청하기"
            onClick={() => push('/student/outing/add')}
            className="bg-brand-1 h-14 w-full rounded-lg px-4 text-white"
          />
        </div>
      )}
    </div>
  )
}
