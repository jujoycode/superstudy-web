import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Viewer from 'react-viewer'
import { ReactComponent as ChatIcon } from '@/assets/svg/chat.svg'
import { ReactComponent as ClockIcon } from '@/assets/svg/clock.svg'
import { ReactComponent as Refresh } from '@/assets/svg/refresh.svg'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { ErrorBlank } from '@/legacy/components'
import AnnouncementPopup from '@/legacy/components/announcement/Announcement'
import { CanteenCalendar } from '@/legacy/components/CanteenCalendar'
import { Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Icon } from '@/legacy/components/common/icons'
import { Dashboard } from '@/legacy/components/Dashboard'
import { Constants } from '@/legacy/constants'
import { useStudentCanteen } from '@/legacy/container/student-canteen'
import { UserContainer } from '@/legacy/container/user'
import { useNotificationLogFindRecent } from '@/legacy/generated/endpoint'
import { Role } from '@/legacy/generated/model'
import { Schedule } from '@/legacy/types'
import { checkNewVersion } from '@/legacy/util/status'
import { makeDateToString, makeMonthDayToString } from '@/legacy/util/time'

export function CanteenPage() {
  const { push } = useHistory()

  checkNewVersion()

  const { me, isMeLoading, isMeWithChildrenLoading } = UserContainer.useContext()
  const { child: myChild } = useUserStore()
  const { newMsgCnt } = useNotificationStore()

  const {
    daysWithSchedule,
    errorMessage,
    selectedDate,
    setSelectedDate,
    selectedCanteen,
    selectedSchedules,
    isLoading,
  } = useStudentCanteen()

  const { data: notificationLog } = useNotificationLogFindRecent()

  const [blankOpen, setBlankOpen] = useState(false)
  const [isImageModalOpen, setImageModalOpen] = useState(false)

  const conteenRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    if (selectedCanteen) {
      conteenRef.current?.scrollIntoView()
    }
  }, [selectedCanteen])

  if (!me?.id || isLoading) {
    return <Blank />
  }

  const childName =
    (myChild?.name?.length || 0) >= 6 ? myChild?.name?.slice(0, 6) + '... 보호자' : (myChild?.name || '') + ' 보호자'

  const handleChangeChild = (childId: number) => {
    localStorage.setItem('child-user-id', JSON.stringify(childId))
    window?.location?.reload()
  }

  const hasConfirmedAll = !notificationLog

  return (
    <>
      {/* 팝업공지 출력 */}
      <AnnouncementPopup type="student" />
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {blankOpen && <Blank />}
      <TopNavbar
        title={
          me?.role === Role.USER
            ? me.school.name
            : myChild
              ? myChild.school.name + `\r\n` + childName
              : '조회할 자녀를 선택하세요. ( 클릭 → )'
        }
        left={
          <div className="relative h-6 w-6" onClick={() => push('/student/notification')}>
            <Icon.Bell className="h-6 w-6" />
            {!hasConfirmedAll && <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}
          </div>
        }
        leftFlex="flex-none"
        right={
          <div
            onClick={() => {
              setBlankOpen(true)
              window?.location?.reload()
            }}
            className="flex h-15 w-10 items-center"
          >
            <Refresh />
          </div>
        }
        rightFlex="flex-none"
      />

      <Dashboard />
      <div className="px-4 py-4">
        <CanteenCalendar
          value={selectedDate}
          onChange={(value: any) => setSelectedDate(new Date(value))}
          onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setSelectedDate(activeStartDate)}
          tileContent={({ date }) => (
            <div className="absolute inset-x-0 flex justify-center space-x-0.5">
              {daysWithSchedule.includes(makeDateToString(date)) && <div className="h-1 w-1 rounded-full bg-red-500" />}
            </div>
          )}
        />
      </div>
      <div className="h-0.5 w-full bg-gray-50" />
      <div className="px-6 py-4">
        <div className="text-gray-5 pb-3 text-sm">{makeMonthDayToString(selectedDate)}</div>
        <div className="flex flex-col space-y-3" ref={conteenRef}>
          {selectedSchedules?.map((schedule: Schedule) => (
            <div key={schedule.id} className="flex w-full items-center space-x-2">
              <div className="bg-brand-1 h-2 w-2 rounded-full" />
              <div className="font-bold">{schedule.title}</div>
            </div>
          ))}
        </div>
      </div>
      <Section>
        {selectedCanteen?.image && (
          <div onClick={() => setImageModalOpen(true)}>
            <div className="aspect-5/3 rounded-sm bg-gray-50">
              <img
                src={`${Constants.imageUrl}${selectedCanteen.image}`}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
            </div>

            <div className="ml-4 text-sm text-gray-400">이미지를 클릭해서 크게 볼 수 있습니다.</div>
          </div>
        )}
        <div className="absolute">
          {selectedCanteen?.image && (
            <Viewer
              visible={isImageModalOpen}
              rotatable
              noImgDetails
              //drag={false}
              scalable={false}
              //changeable={false}
              //loop={false}
              images={[
                {
                  src: Constants.imageUrl + selectedCanteen.image,
                  alt: '',
                },
              ]}
              onClose={() => setImageModalOpen(false)}
            />
          )}
        </div>
        <div className="bg-brand-1 bg-opacity-20 text-brand-1 -ml-5 w-screen px-5 py-5 font-semibold">
          오늘의 급식표
        </div>
        {selectedCanteen && (
          <div className="flex items-start space-x-2">
            <div className="w-full flex-col space-y-2">
              <div className="text-lg font-bold">중식</div>
              <div className="whitespace-pre-line">{selectedCanteen?.lunch}</div>
            </div>
            <div className="w-full flex-col space-y-2">
              <div className="text-lg font-bold">{selectedCanteen?.dinner ? '석식' : ''}</div>
              <div className="whitespace-pre-line">{selectedCanteen?.dinner}</div>
            </div>
          </div>
        )}
      </Section>
      <Section>
        {/* TODO : 늘봄학교(111) 랑 슈퍼스쿨만 보이게 하드코딩, 나중에는 school 테이블에 속성 추가해서 판단해야 함 */}
        {(me?.role === Role.USER ? me?.school?.isCourseActive : myChild?.school?.isCourseActive) && (
          <div
            onClick={() => {
              push('/student/courseentrance?enter=true')
            }}
            className="border-darkgray flex cursor-pointer items-center justify-between rounded-md border-2 py-3 text-sm font-semibold"
          >
            <div className="flex w-full justify-center">수강신청</div>
          </div>
        )}
      </Section>
      <div className="absolute right-20 bottom-52">
        <div className="fixed">
          <div className="bg-brand-1 bg-opacity-50 relative mb-2 h-16 w-16 rounded-full">
            <Link className="flex h-full w-full flex-col items-center justify-center" to={'/student/chat'}>
              <ChatIcon />
              <div className="text-sm text-white">메시지</div>
            </Link>
            {newMsgCnt > 0 && (
              <small className="absolute top-0 right-0 h-6 w-6 rounded-full bg-red-500 text-center text-xs leading-6 text-white">
                N
              </small>
            )}
          </div>
          <div className="h-16 w-16 rounded-full bg-gray-600">
            <Link className="flex h-full w-full flex-col items-center justify-center" to={'/student/timetable'}>
              <ClockIcon />
              <div className="text-sm text-white">시간표</div>
            </Link>
          </div>
        </div>
      </div>

      {!isMeLoading &&
        !isMeWithChildrenLoading &&
        !myChild &&
        me?.role === Role.PARENT &&
        me?.children &&
        me.children.length > 0 && (
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="bg-littleblack fixed inset-0 z-100 m-0 flex h-screen w-full items-center justify-center"
          >
            <div className="relative rounded-lg bg-white opacity-100 shadow-xs">
              <Section>
                <div className="text-center text-2xl font-bold">자녀 선택 안내</div>
                <div className="text-lg">
                  <span className="font-bold">{me?.children[0].name}</span> 학생의 정보를 조회할 수 있습니다.
                  <br />
                  다자녀이거나 타학교로 전학/진학한 자녀의 보호자께서는 상단의{' '}
                  <span className="filled-primary rounded-md text-sm">자녀 선택</span> 버튼을 클릭하여 조회할 자녀를
                  선택할 수 있습니다.
                </div>
                <div className="h-4"></div>
                <Button.lg
                  children="확인"
                  onClick={() => handleChangeChild(me?.children ? me?.children[0].id : 0)}
                  className="filled-blue"
                />
              </Section>
            </div>
          </div>
        )}
    </>
  )
}
