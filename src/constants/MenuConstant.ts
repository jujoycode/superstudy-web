import type { NavigationBarItemProps } from '@/molecules/navigation/NavigationBarItem'
import { title } from 'process'

export class MenuConstant {
  public static readonly MENU_ITEMS: NavigationBarItemProps = [
    {
      title: '출석',
      items: [
        {
          title: '출석부',
          link: '/attendance/register',
        },
        {
          title: '시간표/출석체크',
          link: '/attendance/timetable',
        },
        {
          title: '학인증',
          link: '/attendance/certificate',
        },
        {
          title: '결석신고서',
          link: '/attendance/absence',
        },
        {
          title: '재입학층',
          items: [
            {
              title: '신청서',
              link: '/attendance/readmission/application',
            },
            {
              title: '등본서',
              link: '/attendance/readmission/certificate',
            },
            {
              title: '결과보고서',
              link: '/attendance/readmission/report',
            },
            {
              title: '출결재관리',
              link: '/attendance/readmission/management',
            },
          ],
        },
      ],
    },
    {
      title: '정보',
      items: [
        {
          title: '학생정보',
          link: '/info/student',
        },
        {
          title: '그룹정보',
          link: '/info/group',
        },
      ],
    },
    {
      title: '활동',
      items: [
        {
          title: '활동기록',
          link: '/activity/records',
        },
        {
          title: '프로젝트',
          link: '/activity/projects',
        },
        {
          title: '과제 활동목적',
          link: '/activity/assignments',
        },
      ],
    },
    {
      title: '일정',
      items: [
        {
          title: '캘린더',
          link: '/schedule/calendar',
        },
        {
          title: '급식표',
          link: '/schedule/meal',
        },
      ],
    },
    {
      title: '더보기',
      items: [
        {
          title: '문의하기',
          external: 'https://www.google.com',
        },
      ],
    }
  ]
}
