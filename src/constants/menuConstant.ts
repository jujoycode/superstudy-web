import { NavigationItemProps } from '@/molecules/navigation/NavigationItem'

export class MenuConstant {
  public static readonly TEACHER_MENU = [
    {
      name: '출석',
      children: [
        {
          name: '출석부',
          to: '/attendance',
        },
        {
          name: '시간표/출석체크',
          to: '/timetable',
        },
        {
          name: '확인증',
          to: '/outing',
        },
        {
          name: '결석신고서',
          to: '/absent',
        },
        {
          name: '체험학습',
          children: [
            {
              name: '신청서',
              to: '/fieldtrip',
            },
            {
              name: '통보서',
              to: '/fieldtrip/notice',
            },
            {
              name: '결과보고서',
              to: '/fieldtrip/result',
            },
          ],
        },
        {
          name: '출결서류관리',
          to: '/history',
        },
      ],
    },
    {
      name: '정보',
      children: [
        {
          name: '학생정보',
          to: '/studentcard',
        },
        {
          name: '그룹정보',
          to: '/groups',
        },
      ],
    },
    {
      name: '활동',
      children: [
        {
          name: '활동기록',
          to: '/activityv3',
        },
        {
          name: '프로젝트',
          to: '/project',
        },
        {
          name: '과제 활동분석',
          to: '/activityv3/analyze',
        },
      ],
    },
    {
      name: '일정',
      children: [
        {
          name: '캘린더',
          to: '/calendar',
        },
        {
          name: '급식표',
          to: '/canteen',
        },
      ],
    },
    // # 추후 추가 예정
    // {
    //   name: '신청',
    //   children: [
    //     {
    //       name: '상담신청',
    //       to: '',
    //       external: true,
    //     },
    //     {
    //       name: '수강신청',
    //       to: '',
    //       external: true,
    //     },
    //     {
    //       name: '야자신청',
    //       to: '',
    //       external: true,
    //     },
    //   ],
    // },
    {
      name: '공지',
      children: [
        {
          name: '공지사항',
          to: '/notice',
        },
        {
          name: '학급게시판',
          to: '/board',
        },
        {
          name: '가정통신문',
          to: '/newsletter',
        },
        {
          name: '메시지',
          to: '/chat',
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
              to: 'https://web.superschool.to/AboutSuperSchool',
              external: true,
            },
          ],
        },
        {
          name: '슈퍼스쿨 공지사항',
          to: '/announcement',
        },
      ],
    },
  ] as NavigationItemProps[]
}
