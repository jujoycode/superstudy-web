import { useHistory } from '@/hooks/useHistory'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Icon } from '@/legacy/components/common/icons'
import { NotificationSettingPage } from '@/legacy/components/notificationSettings/NotificationSettingPage'
import { useDashboardGetStudentNotificationData } from '@/legacy/generated/endpoint'

export function NotificationSettingsPage() {
  const { push } = useHistory()
  const { data: dashboardItem } = useDashboardGetStudentNotificationData()

  const hasConfirmedAll =
    !dashboardItem?.unreadActivityNotice?.length &&
    !dashboardItem?.unreadBoard?.length &&
    !dashboardItem?.unreadNewsletterNotice?.length &&
    !dashboardItem?.unreadChatMessageCount &&
    !dashboardItem?.unreadNotice?.length &&
    !dashboardItem?.requestConfirmAbsents?.length &&
    !dashboardItem?.requestConfirmFieldTripResults?.length

  return (
    <>
      <TopNavbar
        title="알림설정"
        left={<BackButton />}
        right={
          <div className="relative h-6 w-6" onClick={() => push('/student/notification')}>
            <Icon.Bell />
            {!hasConfirmedAll && <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}{' '}
          </div>
        }
      />

      <NotificationSettingPage />
    </>
  )
}
