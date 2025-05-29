import { NavigationItemProps } from '@/molecules/navigation/NavigationItem'

export class MenuConstant {
  public static readonly TEACHER_MENU: NavigationItemProps[] = [
    {
      title: '출석',
      child: [
        {
          title: '출석부',
          to: '/teacher/attendance',
        },
        {
          title: '시간표/출석체크',
          to: '/teacher/timetable',
        },
        {
          title: '확인증',
          to: '/teacher/outing',
          isDynamicRoute: true,
        },
        {
          title: '결석신고서',
          to: '/teacher/absent',
          isDynamicRoute: true,
        },
        {
          title: '체험학습',
          child: [
            {
              title: '신청서',
              to: '/teacher/fieldtrip',
              isDynamicRoute: true,
            },
            {
              title: '통보서',
              to: '/teacher/fieldtrip/notice',
              isDynamicRoute: true,
            },
            {
              title: '결과보고서',
              to: '/teacher/fieldtrip/result',
              isDynamicRoute: true,
            },
          ],
        },
        {
          title: '출결 서류 관리',
          child: [
            {
              title: '이력 관리',
              to: '/teacher/history',
              isDynamicRoute: true,
            },
            {
              title: '나이스 자료 비교',
              to: '/teacher/comparison',
              isDynamicRoute: true,
            },
          ],
        },
      ],
    },
    {
      title: '정보',
      child: [
        {
          title: '학생정보',
          to: '/teacher/studentcard',
          isDynamicRoute: true,
        },
        {
          title: '그룹정보',
          to: '/teacher/groups',
          isDynamicRoute: true,
        },
        {
          title: '상벌점 관리',
          to: '/teacher/pointlogs',
        },
      ],
    },
    {
      title: '활동',
      child: [
        {
          title: '활동기록',
          to: '/teacher/activityv3',
          isDynamicRoute: true,
        },
        {
          title: '프로젝트',
          to: '/teacher/project',
        },
        // {
        //   title: '과제 활동분석',
        //   // to: '/teacher/activityv3/analyze',
        // },
      ],
    },
    {
      title: '일정',
      child: [
        {
          title: '캘린더',
          to: '/teacher/calendar',
        },
        {
          title: '급식표',
          to: '/teacher/canteen',
          isDynamicRoute: true,
        },
      ],
    },
    {
      title: '소통',
      child: [
        {
          title: '공지사항',
          to: '/teacher/notice',
          isDynamicRoute: true,
        },
        {
          title: '학급게시판',
          to: '/teacher/board',
          isDynamicRoute: true,
        },
        {
          title: '가정통신문',
          to: '/teacher/newsletter',
          isDynamicRoute: true,
        },
        {
          title: '메시지',
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
          isDynamicRoute: true,
        },
      ],
    },
  ]
}
