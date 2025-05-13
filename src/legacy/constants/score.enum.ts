export enum SubjectEnum {
  사회 = '사회',
  과학 = '과학',
}

export enum SubjectOrder {
  국어 = 0,
  수학 = 1,
  영어 = 2,
  한국사 = 3,
  사회 = 4,
  과학 = 5,
  기타 = 6,
}

export const SubjectGroups = {
  [SubjectEnum.사회]: [
    '통합사회',
    '생활과 윤리',
    '윤리와 사상',
    '생활과윤리',
    '윤리와사상',
    '한국지리',
    '세계지리',
    '동아시아사',
    '세계사',
    '경제',
    '정치와 법',
    '정치와법',
    '사회·문화',
    '사회문화',
    '사회탐구',
  ],
  [SubjectEnum.과학]: [
    '통합과학',
    '과학탐구',
    '물리학1',
    '물리학I',
    '물리학II',
    '물리학Ⅰ',
    '물리학2',
    '물리학Ⅱ',
    '화학1',
    '화학Ⅰ',
    '화학2',
    '화학Ⅱ',
    '화학I',
    '화학II',
    '생명과학1',
    '생명과학Ⅰ',
    '생명과학2',
    '생명과학Ⅱ',
    '생명과학I',
    '생명과학II',
    '지구과학1',
    '지구과학2',
    '지구과학Ⅰ',
    '지구과학Ⅱ',
    '지구과학I',
    '지구과학II',
  ],
}

export const SubjectMapping: { [key: string]: SubjectOrder } = {
  국어: SubjectOrder.국어,
  문학: SubjectOrder.국어,
  독서: SubjectOrder.국어,
  화법과작문: SubjectOrder.국어,
  언어와매체: SubjectOrder.국어,
  수학: SubjectOrder.수학,
  수학Ⅰ: SubjectOrder.수학,
  수학Ⅱ: SubjectOrder.수학,
  수학1: SubjectOrder.수학,
  수학2: SubjectOrder.수학,
  확률과통계: SubjectOrder.수학,
  '확률과 통계': SubjectOrder.수학,
  기하: SubjectOrder.수학,
  미적분: SubjectOrder.수학,
  영어: SubjectOrder.영어,
  영어Ⅰ: SubjectOrder.영어,
  영어Ⅱ: SubjectOrder.영어,
  영어1: SubjectOrder.영어,
  영어2: SubjectOrder.영어,
  한국사: SubjectOrder.한국사,
  ...SubjectGroups[SubjectEnum.사회].reduce(
    (acc, subject) => {
      acc[subject] = SubjectOrder.사회
      return acc
    },
    {} as { [key: string]: SubjectOrder },
  ),
  // 과학 과목 추가
  ...SubjectGroups[SubjectEnum.과학].reduce(
    (acc, subject) => {
      acc[subject] = SubjectOrder.과학
      return acc
    },
    {} as { [key: string]: SubjectOrder },
  ),
  중국어Ⅰ: SubjectOrder.기타,
  일본어Ⅰ: SubjectOrder.기타,
  스페인어Ⅰ: SubjectOrder.기타,
  독일어Ⅰ: SubjectOrder.기타,
  프랑스어Ⅰ: SubjectOrder.기타,
  아랍어Ⅰ: SubjectOrder.기타,
  러시아어Ⅰ: SubjectOrder.기타,
  한문: SubjectOrder.기타,
  베트남어Ⅰ: SubjectOrder.기타,
}
