import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { SubjectEnum, SubjectGroups } from 'src/constants/score.enum';
import { roundToFirstDecimal } from 'src/util/string';
import { Typography } from '../common/Typography';

const MockScoreTable: React.FC<{ scores: any[] }> = ({ scores }) => {
  const rawScores = useMemo(() => (scores ? scores.flatMap((score: any) => score.scores) : []), [scores]);

  const getSubjectName = useCallback((score: any) => {
    if (['탐구영역1', '탐구영역2', '탐구선택1', '탐구선택2', '선택1', '선택2'].includes(score.subject)) {
      return score.sub_subject || score.optional_subject;
    }
    if (score.sub_subject === '한국사') {
      return '한국사';
    }
    if (SubjectGroups[SubjectEnum.사회].includes(score.subject)) {
      return score.subject;
    }
    if (SubjectGroups[SubjectEnum.과학].includes(score.subject)) {
      return score.subject;
    }
    return score.subject;
  }, []);

  const SubjectScore = useMemo(() => _.groupBy(rawScores, getSubjectName), [rawScores, getSubjectName]);

  const calculateSubjectAverages = useCallback((scores: any[]) => {
    const totalScores = scores.reduce(
      (acc, score) => {
        acc.standard_score += score.standard_score || 0;
        acc.rank += score.rank || 0;
        acc.percentile += score.percentile || 0;
        return acc;
      },
      { standard_score: 0, rank: 0, percentile: 0 },
    );

    return {
      standard_score: totalScores.standard_score,
      rank: totalScores.rank,
      percentile: totalScores.percentile,
    };
  }, []);

  const calculateGroupAverages = useCallback((scores: any[], subjects: string[]) => {
    const totalScores = scores.reduce(
      (acc, score) => {
        if (subjects.includes(score.subject)) {
          if (score.subject !== '영어') {
            acc.standard_score += score.standard_score || 0;
            acc.percentile += score.percentile || 0;
            acc.count += 1;
          }
          acc.rank += score.rank || 0;
        }
        return acc;
      },
      { standard_score: 0, rank: 0, percentile: 0, count: 0 },
    );

    const count = totalScores.count;
    return {
      standard_score: count ? totalScores.standard_score / count : '-',
      rank: count ? totalScores.rank / subjects.length : '-',
      percentile: count ? totalScores.percentile / count : '-',
    };
  }, []);

  const groupScoresByExamAndMonth = useCallback((scores: any[]) => {
    return _.groupBy(
      scores.flatMap((exam) => exam.scores),
      (score: any) => {
        const exam = scores.find((e) => e.scores.includes(score));
        return `${exam.insertion_year}년 ${exam.grade}학년 ${score.month}월`;
      },
    );
  }, []);

  const groupedScores = useMemo(
    () => (scores ? groupScoresByExamAndMonth(scores) : {}),
    [scores, groupScoresByExamAndMonth],
  );

  const subjectAveragesByPeriod = useMemo(() => {
    return Object.entries(groupedScores).reduce(
      (acc, [period, periodScores]) => {
        const periodSubjectScores = _.groupBy(periodScores, getSubjectName);
        Object.entries(periodSubjectScores).forEach(([subject, scores]) => {
          if (!acc[subject]) {
            acc[subject] = [];
          }
          acc[subject].push({
            period,
            averages: calculateSubjectAverages(scores),
          });
        });

        const groupDefinitions = {
          국영수사과: { subjects: ['국어', '영어', '수학', SubjectEnum.사회, SubjectEnum.과학] },
          국영수: { subjects: ['국어', '영어', '수학'] },
          국영수사: { subjects: ['국어', '영어', '수학', SubjectEnum.사회] },
          국영수과: { subjects: ['국어', '영어', '수학', SubjectEnum.과학] },
        };

        Object.entries(groupDefinitions).forEach(([groupName, { subjects }]) => {
          const groupAverages = calculateGroupAverages(periodScores, subjects);
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push({
            period,
            averages: groupAverages,
          });
        });
        return acc;
      },
      {} as Record<string, { period: string; averages: any }[]>,
    );
  }, [groupedScores, getSubjectName, calculateSubjectAverages, calculateGroupAverages]);

  const subjectGroups = useMemo(
    () => [
      '국어',
      '수학',
      '영어',
      '한국사',
      ...SubjectGroups[SubjectEnum.사회].filter((subject) => SubjectScore[subject]),
      ...SubjectGroups[SubjectEnum.과학].filter((subject) => SubjectScore[subject]),
      '국영수사과',
      '국영수사',
      '국영수과',
      '국영수',
    ],
    [SubjectScore],
  );

  return (
    <main className="flex flex-col gap-6">
      <nav className="flex flex-row items-center justify-between gap-4">
        <Typography variant="title1">모의고사 점수</Typography>
      </nav>
      <div className="scrollable-wide w-full">
        <table className="table-auto border-collapse">
          <thead className="text-center text-13 font-normal text-primary-gray-600">
            <tr>
              <td className="min-w-[120px] bg-primary-gray-50 p-2" rowSpan={2}>
                구분
              </td>
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                국어영역
              </td>
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                수학영역
              </td>
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                영어영역
              </td>
              <td colSpan={3} className="border-l border-gray-200 bg-primary-gray-50 p-2">
                한국사
              </td>
              {SubjectGroups[SubjectEnum.사회]
                .filter((subject) => SubjectScore[subject])
                .map((subject) => (
                  <td key={subject} colSpan={3} className="border-x border-b border-gray-200 bg-primary-gray-50 p-2">
                    {subject}
                  </td>
                ))}
              {SubjectGroups[SubjectEnum.과학]
                .filter((subject) => SubjectScore[subject])
                .map((subject) => (
                  <td key={subject} colSpan={3} className="border-x border-b border-gray-200 bg-primary-gray-50 p-2">
                    {subject}
                  </td>
                ))}
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                국영수사과
              </td>
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                국영수사
              </td>
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                국영수과
              </td>
              <td colSpan={3} className="border-x border-gray-200 bg-primary-gray-50 p-2">
                국영수
              </td>
            </tr>
            <tr>
              {subjectGroups.map((subject, index) => (
                <>
                  <td
                    key={`${subject}-표점`}
                    className="whitespace-nowrap border border-gray-200 bg-primary-gray-50 p-2"
                  >
                    표점
                  </td>
                  <td
                    key={`${subject}-등급`}
                    className="whitespace-nowrap border border-gray-200 bg-primary-gray-50 p-2"
                  >
                    등급
                  </td>
                  <td
                    key={`${subject}-백분`}
                    className={`whitespace-nowrap border-gray-200 bg-primary-gray-50 p-2 ${
                      index === subjectGroups.length - 1 ? 'border-y border-l' : 'border'
                    }`}
                  >
                    백분
                  </td>
                </>
              ))}
            </tr>
          </thead>
          <tbody className="text-center text-13 text-primary-gray-900">
            {Object.entries(groupedScores).map(([period, periodScores]) => (
              <tr key={period}>
                <td className="border-r border-t border-r-gray-100 border-t-primary-gray-200 p-2">{period}</td>
                {subjectGroups.map((subject, index) => {
                  const subjectData = subjectAveragesByPeriod[subject]?.find((entry) => entry.period === period);
                  return (
                    <>
                      <td className="border border-gray-100 p-2">
                        {subjectData ? roundToFirstDecimal(subjectData.averages.standard_score) : '-'}
                      </td>
                      <td className="border border-gray-100 p-2">
                        {subjectData ? roundToFirstDecimal(subjectData.averages.rank) : '-'}
                      </td>
                      <td
                        className={`border-gray-100 p-2 ${
                          index === subjectGroups.length - 1 ? 'border-y border-l' : 'border'
                        }`}
                      >
                        {subjectData ? roundToFirstDecimal(subjectData.averages.percentile) : '-'}
                      </td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default MockScoreTable;
