import { NavigationItemProps } from '@/molecules/navigation/NavigationItem'

export class MenuConstant {
  public static readonly TEACHER_MENU = [
    {
      name: '출석',
      children: [
        {
          name: '출석부',
          to: '/teacher/attendance',
        },
        {
          name: '시간표/출석체크',
          to: '/teacher/timetable',
        },
        {
          name: '확인증',
          to: '/teacher/outing',
        },
        {
          name: '결석신고서',
          to: '/teacher/absent',
        },
        {
          name: '체험학습',
          children: [
            {
              name: '신청서',
              to: '/teacher/fieldtrip',
            },
            {
              name: '통보서',
              to: '/teacher/fieldtrip/notice',
            },
            {
              name: '결과보고서',
              to: '/teacher/fieldtrip/result',
            },
          ],
        },
        {
          name: '출결서류관리',
          to: '/teacher/history',
        },
      ],
    },
    {
      name: '정보',
      children: [
        {
          name: '학생정보',
          to: '/teacher/studentcard',
        },
        {
          name: '그룹정보',
          to: '/teacher/groups',
        },
      ],
    },
    {
      name: '활동',
      children: [
        {
          name: '활동기록',
          to: '/teacher/activityv3',
        },
        {
          name: '프로젝트',
          to: '/teacher/project',
        },
        {
          name: '과제 활동분석',
          to: '/teacher/activityv3/analyze',
        },
      ],
    },
    {
      name: '일정',
      children: [
        {
          name: '캘린더',
          to: '/teacher/calendar',
        },
        {
          name: '급식표',
          to: '/teacher/canteen',
        },
      ],
    },
    // # 추후 추가 예정
    // {
    //   name: '신청',
    //   children: [
    //     {
    //       name: '상담신청',
    //       to: '/teacher',
    //       external: true,
    //     },
    //     {
    //       name: '수강신청',
    //       to: '/teacher',
    //       external: true,
    //     },
    //     {
    //       name: '야자신청',
    //       to: '/teacher',
    //       external: true,
    //     },
    //   ],
    // },
    {
      name: '공지',
      children: [
        {
          name: '공지사항',
          to: '/teacher/notice',
        },
        {
          name: '학급게시판',
          to: '/teacher/board',
        },
        {
          name: '가정통신문',
          to: '/teacher/newsletter',
        },
        {
          name: '메시지',
          to: '/teacher/chat',
        },
      ],
    },
    {
      name: '더보기',
      children: [
        {
          name: '문의하기',
          to: 'http://superstudy.channel.io/',
          external: true,
        },
        {
          name: '슈퍼스쿨 사용안내',
          children: [
            {
              name: '교사 사용안내',
              to: 'https://superschoolofficial.notion.site/f9bae37feef94ee7b9f886b5e074fdac',
              external: true,
            },
            {
              name: '학생 사용안내',
              to: 'https://superschoolofficial.notion.site/e8ebd5829e2846ab8e97417c7ab589f7',
              external: true,
            },
            {
              name: '학부모 사용안내',
              to: 'https://superschoolofficial.notion.site/70491392ea96454f8688cffee395c1c7',
              external: true,
            },
            {
              name: '사용안내 동영상',
              to: 'https://web.superschool.to//AbteacheroutSuperSchool',
              external: true,
            },
          ],
        },
        {
          name: '슈퍼스쿨 공지사항',
          to: '/teacher/announcement',
        },
      ],
    },
  ] as NavigationItemProps[]
}
