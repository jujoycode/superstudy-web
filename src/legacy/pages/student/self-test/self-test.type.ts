interface SelfTestType {
  id: number
  name: string
  values: {
    id: number
    name: string
    values: string[] | { id: number; name: string; values: string[] }[]
  }[]
}

export const SELF_TEST_TYPES: SelfTestType[] = [
  {
    id: 1,
    name: '학업 역량',
    values: [
      {
        id: 1,
        name: '학습능력',
        values: [
          '학습 능력이 뛰어난',
          '빠르게 배우는',
          '지식이 풍부한',
          '자기 개발에 열정적인',
          '이해력이 빠른',
          '다방면에 관심이 많은',
          '지적 호기심이 강한',
          '논리적인',
          '영리한',
          '발전가능성이 뛰어난',
          '지식활용 능력이 뛰어난',
        ],
      },
      {
        id: 2,
        name: '탐구력',
        values: [
          '탐구적인',
          '지적 호기심이 많은',
          '연구적인',
          '질문하는',
          '분석적인',
          '진리 탐구에 열정적인',
          '세심한',
          '철저한',
          '치밀한',
          '창의융합성이 높은',
        ],
      },
      {
        id: 3,
        name: '문제해결능력',
        values: [
          '분석적인',
          '논리적인',
          '문제 해결 능력이 뛰어난',
          '창의적인',
          '전략적인',
          '계획적인',
          '체계적인',
          '혁신적인',
          '상황 적응력이 뛰어난',
          '위기대응능력이 뛰어난',
          '융합적 문제 해결력이 높은',
        ],
      },
      {
        id: 4,
        name: '성취도 및 지속성',
        values: [
          '높은 성취를 이루는',
          '목표 지향적인',
          '결과를 중시하는',
          '학업 성취도가 높은',
          '목표를 이루는',
          '성과가 높은',
          '노력하는',
          '꾸준한',
          '지속적인',
          '인내심 있는',
          '끈기 있는',
          '끊임없이 노력하는',
          '포기하지 않는',
          '참을성 있는',
        ],
      },
      {
        id: 5,
        name: '창의성 및 도전정신',
        values: [
          '창의적인',
          '혁신적인',
          '독창적인',
          '상상력이 풍부한',
          '기발한',
          '새로운 아이디어를 가진',
          '유연한',
          '다각적으로 생각하는',
          '도전적인',
          '새로운 것을 시도하는',
          '모험을 즐기는',
          '적극적인',
          '용기 있는',
          '결단력 있는',
          '실패를 두려워하지 않는',
          '자유로운',
        ],
      },
    ],
  },
  {
    id: 2,
    name: '진로 역량',
    values: [
      {
        id: 1,
        name: '미래지향적',
        values: [
          '미래를 생각하는',
          '목표 지향적인',
          '비전을 가진',
          '꿈이 큰',
          '장기적인 계획을 가진',
          '계획적인',
          '미래를 설계하는',
          '발전적인',
          '꿈이 있는',
          '성장 잠재력이 높은',
        ],
      },
      {
        id: 2,
        name: '자기계발',
        values: [
          '자기 개발에 열정적인',
          '계속 성장하는',
          '새로운 것을 배우는',
          '자기 계발을 중시하는',
          '자아 성찰을 하는',
          '자기 발전을 추구하는',
          '자기 향상을 위한 노력하는',
          '지속적으로 학습하는',
          '자기 관리 능력이 뛰어난',
          '자기주도 역량이 높은',
          '다재다능한',
        ],
      },
    ],
  },
  {
    id: 3,
    name: '공동체 역량',
    values: [
      {
        id: 1,
        name: '성격 및 태도',
        values: [
          {
            id: 1,
            name: '긍정적',
            values: [
              '적극적인',
              '낙관적인',
              '자신감 있는',
              '긍정적인',
              '활기찬',
              '명랑한',
              '쾌활한',
              '희망적인',
              '센스있는',
              '세밀한',
              '영리한',
              '순발력 있는',
              '유머있는',
              '합리적인',
              '침착한',
              '차분한',
              '소탈한',
              '재치있는',
            ],
          },
          {
            id: 2,
            name: '열정적',
            values: [
              '열정적인',
              '열의 있는',
              '헌신적인',
              '주도적인',
              '동기부여가 강한',
              '열렬한',
              '열망하는',
              '몰두하는',
              '패기있는',
              '활발한',
              '소신있는',
              '의욕적인',
              '활동적인',
            ],
          },
          {
            id: 3,
            name: '친화적',
            values: [
              '사교적인',
              '친절한',
              '배려하는',
              '공감 능력이 뛰어난',
              '따뜻한',
              '마음이 넓은',
              '이해심 있는',
              '인간미 있는',
              '사려깊은',
              '대인관계가 원만한',
            ],
          },
          {
            id: 4,
            name: '결단력',
            values: [
              '결단력 있는',
              '목표를 설정하고 이루는',
              '성취 지향적인',
              '추진력 있는',
              '강한 의지를 가진',
              '단호한',
              '끈기 있는',
              '목표를 이루기 위해 노력하는',
              '의사결정이 빠른',
              '현실적인',
            ],
          },
        ],
      },
      {
        id: 2,
        name: '협업과 소통능력',
        values: [
          {
            id: 1,
            name: '의사소통 능력',
            values: [
              '소통이 원활한',
              '경청하는',
              '설득력 있는',
              '대인관계가 좋은',
              '표현력이 뛰어난',
              '상호작용이 원활한',
              '의견을 잘 조율하는',
              '상호 이해하는',
            ],
          },
          {
            id: 2,
            name: '협력정신',
            values: [
              '협력적인',
              '팀워크를 중시하는',
              '함께 일하는',
              '협동심 있는',
              '동료애가 강한',
              '협조적인',
              '조화를 이루는',
              '단합하는',
              '수용적인',
              '역할에 충실한',
              '조화로운',
              '너그러운',
              '다정다감한',
              '부드러운',
            ],
          },
          {
            id: 3,
            name: '친절함',
            values: ['친절한', '배려심 있는', '공감하는', '예의 바른', '온화한', '다정한', '상냥한', '정중한'],
          },
        ],
      },
      {
        id: 3,
        name: '나눔과 배려',
        values: [
          {
            id: 1,
            name: '봉사정신',
            values: [
              '봉사적인',
              '타인을 돕는',
              '사회에 기여하는',
              '헌신적인',
              '사회적 책임을 느끼는',
              '다른 사람을 배려하는',
              '동료의 성장을 돕는',
              '이타적인',
            ],
          },
          {
            id: 2,
            name: '양보와 배려',
            values: [
              '헌신적인',
              '배려심 있는',
              '다른 사람을 돕는',
              '사회적 책임을 느끼는',
              '희생적인',
              '주위 사람을 돕는',
              '봉사에 열정적인',
              '공동의 이익을 위해 손해를 감수하는',
            ],
          },
          {
            id: 3,
            name: '상호 존중',
            values: ['상대의 처지를 이해하는', '존중하는', '배려하는', '함께 노력하는', '포용력 있는', '원만한'],
          },
        ],
      },
      {
        id: 4,
        name: '성실성과 규칙준수',
        values: [
          {
            id: 1,
            name: '성실함',
            values: [
              '성실한',
              '최선을 다하는',
              '신뢰할 수 있는',
              '꾸준한',
              '진지한',
              '정직한',
              '헌신적인',
              '열심히 노력하는',
              '믿을 수 있는',
            ],
          },
          {
            id: 2,
            name: '책임감',
            values: [
              '책임감 있는',
              '신뢰할 수 있는',
              '문제를 해결하는',
              '맡은 일을 끝까지 해내는',
              '믿음직한',
              '의무를 다하는',
              '의지를 가진',
              '결과를 중시하는',
            ],
          },
          {
            id: 3,
            name: '참여도',
            values: [
              '적극적인 참여자',
              '활동적인',
              '자발적인',
              '헌신적인',
              '주도적인',
              '능동적인',
              '열심히 참여하는',
              '열의 있는',
              '솔선수범하는',
            ],
          },
        ],
      },
      {
        id: 5,
        name: '리더십',
        values: [
          {
            id: 1,
            name: '리더십',
            values: [
              '리더십 있는',
              '지도력이 있는',
              '결단력이 있는',
              '반장/동아리 회장을 맡은',
              '이끄는',
              '책임감 있는',
              '주도적인',
              '팀을 이끄는',
              '실행을 주도하는',
              '조율하는',
              '솔선수범하는',
              '자신감 있는',
              '자상한',
            ],
          },
          {
            id: 2,
            name: '동기부여',
            values: [
              '동기부여를 잘하는',
              '격려하는',
              '팀을 이끄는',
              '목표 설정을 잘하는',
              '영감을 주는',
              '긍정적인 영향을 주는',
              '자극을 주는',
              '힘을 북돋는',
            ],
          },
        ],
      },
    ],
  },
]
