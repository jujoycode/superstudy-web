import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notification'
import { CanteenCalendarTeacher } from '../calendar/CanteenCalendarCon'
import { Blank, TopNavbar } from '../common'
import { Icon } from '../common/icons'
import { Typography } from '../common/Typography'
import { Dashboard } from '../Dashboard'
import ColorSVGIcon from '../icon/ColorSVGIcon'
import SolidSVGIcon from '../icon/SolidSVGIcon'
import SVGIcon from '../icon/SVGIcon'
import { NotificationModal } from '../notification/NotificationModal'

interface CanteenMobileProps {
  hasConfirmedAll: boolean
}
export function CanteenMobile({ hasConfirmedAll }: CanteenMobileProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [blankOpen, setBlankOpen] = useState(false)
  const { newMsgCnt } = useNotificationStore()
  return (
    <div className="relative block md:hidden">
      {blankOpen && <Blank />}
      <TopNavbar
        title={modalOpen ? '알림' : '일정'}
        left={
          <div className="relative h-6 w-6">
            {modalOpen ? (
              <Icon.Back className="h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)} />
            ) : (
              <Icon.Bell className="h-6 w-6 cursor-pointer" onClick={() => setModalOpen(!modalOpen)} />
            )}
            {!hasConfirmedAll && !modalOpen && (
              <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            )}
          </div>
        }
        right={
          <div
            onClick={() => {
              setBlankOpen(true)
              window?.location?.reload()
            }}
            className="text-brand-1 text-sm"
          >
            새로고침
          </div>
        }
        borderless={true}
      />
      {/* 알림 영역 */}
      {modalOpen && (
        <div className="scroll-box h-screen-7 fixed inset-x-0 top-14 bottom-0 z-50 overflow-x-auto">
          <NotificationModal />
        </div>
      )}

      <main className="relative mb-[108px] flex flex-col">
        <section className="flex flex-col gap-3 pb-10">
          {/* 대시보드 영역 */}
          <Dashboard />

          {/* 메시지 영역 */}
          <div className="flex flex-row items-center gap-3 px-5">
            <Link
              to={'/teacher/chat'}
              className="bg-primary-orange-50 flex h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg px-4"
            >
              <SolidSVGIcon.Talk size={24} color="orange800" weight="bold" />
              <span className="relative">
                <Typography variant="title3" className="font-semibold">
                  메시지
                </Typography>
                {newMsgCnt > 0 && <div className="bg-primary-red-800 absolute top-0 -right-2 h-1 w-1 rounded-full" />}
              </span>
            </Link>
            <Link
              to={'/teacher/timetable'}
              className="bg-primary-orange-50 flex h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg px-4"
            >
              <ColorSVGIcon.CopyCheck size={24} color="orange800" />
              <Typography variant="title3" className="font-semibold">
                시간표
              </Typography>
            </Link>
          </div>
        </section>

        <div className="bg-primary-gray-100 h-2.5 w-full" />
        {/* 일정 영역 */}
        <CanteenCalendarTeacher />
        <div className="fixed right-5 bottom-[80px]">
          <div className="h-12 rounded-full bg-black px-5">
            <Link className="flex h-full w-full flex-row items-center gap-2" to={'/teacher/chat'}>
              <SVGIcon.Plus size={16} color="white" weight="bold" />
              <Typography variant="title3" className="font-semibold text-white">
                신청하기
              </Typography>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
