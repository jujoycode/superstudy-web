import type { NavigationItem } from '@/molecules/navigation/navigation-items/NavigationItem'

export class MenuConstant {
  public static readonly MENU_ITEMS: NavigationItem[] = [
    {
      title: '출석',
      items: [
        {
          title: '출석부',
          link: '/attendance',
        },
        {
          title: '시간표/출석체크',
          link: '/timetable',
        },
        {
          title: '확인증',
          link: '/outing',
        },
        {
          title: '결석신고서',
          link: '/absent',
        },
        {
          title: '체험학습',
          items: [
            {
              title: '신청서',
              link: '/fieldtrip',
            },
            {
              title: '통보서',
              link: '/fieldtrip/notice',
            },
            {
              title: '결과보고서',
              link: '/fieldtrip/result',
            },
          ],
        },
        {
          title: '출결서류관리',
          link: '/history',
        },
      ],
    },
    {
      title: '정보',
      items: [
        {
          title: '학생정보',
          link: '/studentcard',
        },
        {
          title: '그룹정보',
          link: '/groups',
        },
      ],
    },
    {
      title: '활동',
      items: [
        {
          title: '활동기록',
          link: '/activityv3',
        },
        {
          title: '프로젝트',
          link: '/project',
        },
        {
          title: '과제 활동분석',
          link: '/activityv3/analyze',
        },
      ],
    },
    {
      title: '일정',
      items: [
        {
          title: '캘린더',
          link: '/calendar',
        },
        {
          title: '급식표',
          link: '/canteen',
        },
      ],
    },
    // {
    //   title: '신청',
    //   items: [
    //     {
    //       title: '상담신청',
    //       link: '',
    //     },
    //     {
    //       title: '수강신청',
    //       link: '',
    //     },
    //     {
    //       title: '야자신청',
    //       link: '',
    //     },
    //   ],
    // },
    {
      title: '공지',
      items: [
        {
          title: '공지사항',
          link: '/notice',
        },
        {
          title: '학급게시판',
          link: '/board',
        },
        {
          title: '가정통신문',
          link: '/newsletter',
        },
        {
          title: '메시지',
          link: '/chat',
        },
      ],
    },
    {
      title: '더보기',
      items: [
        {
          title: '문의하기',
          external: 'http://superstudy.channel.io/',
        },
        {
          title: '슈퍼스쿨 사용안내',
          items: [
            {
              title: '교사 사용안내',
              link: 'https://superschoolofficial.notion.site/f9bae37feef94ee7b9f886b5e074fdac',
            },
            {
              title: '학생 사용안내',
              link: 'https://superschoolofficial.notion.site/e8ebd5829e2846ab8e97417c7ab589f7',
            },
            {
              title: '학부모 사용안내',
              link: 'https://superschoolofficial.notion.site/70491392ea96454f8688cffee395c1c7',
            },
            {
              title: '사용안내 동영상',
              link: 'https://web.superschool.link/AboutSuperSchool',
            },
          ],
        },
        {
          title: '슈퍼스쿨 공지사항',
          link: '/announcement',
        },
      ],
    },
  ]
}
