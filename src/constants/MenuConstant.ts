import type { NavigationItem } from '@/molecules/navigation/NavigationBarItem'

export class MenuConstant {
  public static readonly MENU_ITEMS: NavigationItem[] = [
    {
      title: '출석',
      items: [
        {
          title: '출석부',
          link: '',
        },
        {
          title: '시간표/출석체크',
          link: '',
        },
        {
          title: '학인증',
          link: '',
        },
        {
          title: '결석신고서',
          items: []
        },
        {
          title: '체험학습',
          items: [
            {
              title: '신청서',
              link: '',
            },
            {
              title: '통보서',
              link: '',
            },
            {
              title: '결과보고서',
              link: '',
            },
          ],
        },
        {
          title: '출결서류관리',
          link: ''
        }
      ],
    },
    {
      title: '정보',
      items: [
        {
          title: '학생정보',
          link: '',
        },
        {
          title: '그룹정보',
          link: '',
        },
      ],
    },
    {
      title: '활동',
      items: [
        {
          title: '활동기록',
          link: '',
        },
        {
          title: '프로젝트',
          link: '',
        },
        {
          title: '과제 활동분석',
          link: '',
        },
      ],
    },
    {
      title: '일정',
      items: [
        {
          title: '캘린더',
          link: '',
        },
        {
          title: '급식표',
          link: '',
        },
      ],
    },
    {
      title: '신청',
      items: [
        {
          title: '상담신청',
          link: '',
        },
        {
          title: '수강신청',
          link: '',
        },
        {
          title: '야자신청',
          link: '',
        },
      ],
    },
    {
      title: '공지',
      items: [
        {
          title: '공지사항',
          link: '',
        },
        {
          title: '학급게시판',
          link: '',
        },
        {
          title: '가정통신문',
          link: '',
        },
        {
          title: '메시지',
          link: '',
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
        {
          title: '슈퍼스쿨 사용안내',
          items: [
            {
              title: 'child1',
              link: '',
            },
            {
              title: 'child2',
              link: '',
            },
            {
              title: 'child3',
              link: '',
            },
          ]
        },
        {
          title: '슈퍼스쿨 공지사항',
          link: '',
        }
      ],
    }
  ]
}
