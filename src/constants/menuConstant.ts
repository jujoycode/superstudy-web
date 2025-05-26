import { NavigationItemProps } from '@/molecules/navigation/NavigationItem'

export class MenuConstant {
  public static readonly TEACHER_MENU: NavigationItemProps[] = [
    {
      title: '출석',
      child: [
        {
          title: '출석부',
          icon: 'BookUser',
          to: '/teacher/attendance',
        },
        {
          title: '시간표/출석체크',
          icon: 'ChartPie',
          to: '/teacher/timetable',
        },
        {
          title: '확인증',
          icon: 'ShieldCheck',
          to: '/teacher/outing',
        },
        {
          title: '결석신고서',
          icon: 'ShieldAlert',
          to: '/teacher/absent',
        },
        {
          title: '체험학습',
          icon: 'Tent',
          child: [
            {
              title: '신청서',
              to: '/teacher/fieldtrip',
            },
            {
              title: '통보서',
              to: '/teacher/fieldtrip/notice',
            },
            {
              title: '결과보고서',
              to: '/teacher/fieldtrip/result',
            },
          ],
        },
        {
          title: '출결서류관리',
          icon: 'Archive',
          to: '/teacher/history',
        },
      ],
    },
    {
      title: '정보',
      child: [
        {
          title: '학생정보',
          icon: 'GraduationCap',
          to: '/teacher/studentcard',
        },
        {
          title: '그룹정보',
          icon: 'Users',
          to: '/teacher/groups',
        },
      ],
    },
    {
      title: '활동',
      child: [
        {
          title: '활동기록',
          icon: 'NotebookPen',
          to: '/teacher/activityv3',
        },
        {
          title: '프로젝트',
          icon: 'Presentation',
          to: '/teacher/project',
        },
        {
          title: '과제 활동분석',
          icon: 'Database',
          to: '/teacher/activityv3/analyze',
        },
      ],
    },
    {
      title: '일정',
      child: [
        {
          title: '캘린더',
          icon: 'CalendarDays',
          to: '/teacher/calendar',
        },
        {
          title: '급식표',
          icon: 'Hamburger',
          to: '/teacher/canteen',
        },
      ],
    },
    {
      title: '소통',
      child: [
        {
          title: '공지사항',
          icon: 'Megaphone',
          to: '/teacher/notice',
        },
        {
          title: '학급게시판',
          icon: 'List',
          to: '/teacher/board',
        },
        {
          title: '가정통신문',
          icon: 'ScrollText',
          to: '/teacher/newsletter',
        },
        {
          title: '메시지',
          icon: 'MessageSquareMore',
          to: '/teacher/chat',
        },
      ],
    },
    {
      title: '더보기',
      child: [
        {
          title: '문의하기',
          external: true,
          to: 'http://superstudy.channel.io/',
        },
        {
          title: '슈퍼스쿨 사용안내',
          child: [
            {
              title: '교사 사용안내',
              external: true,
              to: 'https://superschoolofficial.notion.site/f9bae37feef94ee7b9f886b5e074fdac',
            },
            {
              title: '학생 사용안내',
              external: true,
              to: 'https://superschoolofficial.notion.site/e8ebd5829e2846ab8e97417c7ab589f7',
            },
            {
              title: '학부모 사용안내',
              external: true,
              to: 'https://superschoolofficial.notion.site/70491392ea96454f8688cffee395c1c7',
            },
            {
              title: '사용안내 동영상',
              external: true,
              to: 'https://web.superschool.to//AbteacheroutSuperSchool',
            },
          ],
        },
        {
          title: '슈퍼스쿨 공지사항',
          to: '/teacher/announcement',
        },
      ],
    },
  ]
}
