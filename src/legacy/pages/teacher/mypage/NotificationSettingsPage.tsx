import { useHistory } from 'react-router-dom';
import { BackButton, TopNavbar } from 'src/components/common';
import { Icon } from 'src/components/common/icons';
import { NotificationSettingPage } from 'src/components/notificationSettings/NotificationSettingPage';
import { useDashboardGetStudentNotificationData } from 'src/generated/endpoint';

export function NotificationSettingsPage() {
  const { push } = useHistory();
  const { data: dashboardItem } = useDashboardGetStudentNotificationData();

  const hasConfirmedAll =
    !dashboardItem?.unreadActivityNotice?.length &&
    !dashboardItem?.unreadBoard?.length &&
    !dashboardItem?.unreadNewsletterNotice?.length &&
    !dashboardItem?.unreadChatMessageCount &&
    !dashboardItem?.unreadNotice?.length &&
    !dashboardItem?.requestConfirmAbsents?.length &&
    !dashboardItem?.requestConfirmFieldTripResults?.length;

  return (
    <>
      <TopNavbar
        title="알림설정"
        left={<BackButton />}
        right={
          <div className="relative h-6 w-6">
            <Icon.Bell className="h-6 w-6" onClick={() => push('/student/notification')} />
            {!hasConfirmedAll && <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />}{' '}
          </div>
        }
      />

      <NotificationSettingPage />
    </>
  );
}
