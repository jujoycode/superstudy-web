import _ from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'

import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import { SubjectEnum, SubjectGroups } from '@/legacy/constants/score.enum'

import SolidSVGIcon from '../icon/SolidSVGIcon'
import { PopupModal } from '../PopupModal'

import { MockExamScoreModal } from './ScoreAnalysis'

const MockRankTable: React.FC<{ scores: any[]; isLoading: boolean }> = ({ scores, isLoading }) => {
  const [openModal, setOpenModal] = useState(false)

  const rawScores = useMemo(() => (scores ? scores.flatMap((score: any) => score.scores) : []), [scores])

  const getLatestExamInfo = useCallback((examScores: any[]): any => {
    const latestExam = _.maxBy(examScores, 'insertion_year')
    if (!latestExam) return null
    const { insertion_year, grade, scores } = latestExam

    const latestMonth = _.maxBy(scores as any[], 'month')?.month
    if (!latestMonth) return null

    return {
      insertion_year,
      grade,
      month: latestMonth,
    }
  }, [])

  const latestExamInfo = useMemo(() => (scores ? getLatestExamInfo(scores) : null), [scores, getLatestExamInfo])

  const getExamDates = useCallback((examScores: any[]): string[] => {
    if (!examScores?.length) return []

    // 모든 시험 날짜를 YYYY-MM 형식으로 추출
    const dates = examScores
      .map((exam) => {
        const { insertion_year, scores } = exam
        return scores.map((score: any) => {
          const month = String(score.month).padStart(2, '0')
          return `${insertion_year}-${month}`
        })
      })
      .flat()

    // 중복 제거 및 정렬
    return _.uniq(dates).sort()
  }, [])

  const examDates = useMemo(() => (scores ? getExamDates(scores) : []), [scores, getExamDates])

  const getSubjectName = useCallback((score: any) => {
    if (['탐구영역1', '탐구영역2', '탐구선택1', '탐구선택2', '선택1', '선택2'].includes(score.subject)) {
      return score.sub_subject || score.optional_subject
    }
    if (score.sub_subject === '한국사') {
      return '한국사'
    }

    if (SubjectGroups[SubjectEnum.사회].includes(score.subject)) {
      return score.subject
    }
    if (SubjectGroups[SubjectEnum.과학].includes(score.subject)) {
      return score.subject
    }
    return score.subject
  }, [])

  const SubjectScore = useMemo(() => _.groupBy(rawScores, getSubjectName), [rawScores, getSubjectName])

  const calculateRankSummary = useCallback((scores: any[]) => {
    const ranks = scores.map((score) => score.rank).filter((rank) => rank !== undefined)
    if (ranks.length === 0) {
      return { maxRank: '-', minRank: '-', avgRank: '-' }
    }
    return {
      maxRank: Math.max(...ranks),
      minRank: Math.min(...ranks),
      avgRank: _.mean(ranks),
    }
  }, [])

  useMemo(() => {
    Object.keys(SubjectScore).forEach((subject) => {
      SubjectScore[subject] = [calculateRankSummary(SubjectScore[subject])]
    })
  }, [SubjectScore, calculateRankSummary])

  const combinedSubjects = useMemo(
    () => ({
      국영수: ['국어', '수학', '영어'],
      국영수사: ['국어', '수학', '영어', SubjectEnum.사회],
      국영수과: ['국어', '수학', '영어', SubjectEnum.과학],
      국영수사과: ['국어', '수학', '영어', SubjectEnum.사회, SubjectEnum.과학],
    }),
    [],
  )

  const calculateCombinedSubjects = useCallback(
    (combinedSubjects: Record<string, string[]>) => {
      Object.entries(combinedSubjects).forEach(([newSubject, subjects]) => {
        const combinedScores = subjects.flatMap((subject) => {
          if (SubjectGroups[subject as SubjectEnum]) {
            return SubjectGroups[subject as SubjectEnum].flatMap((sub) => SubjectScore[sub] || [])
          }
          return SubjectScore[subject] || []
        })
        const maxRanks = combinedScores.map((score) => score.maxRank).filter((rank) => rank !== undefined)
        const minRanks = combinedScores.map((score) => score.minRank).filter((rank) => rank !== undefined)
        const avgRanks = combinedScores.map((score) => score.avgRank).filter((rank) => rank !== undefined)

        if (maxRanks.length > 0 && minRanks.length > 0 && avgRanks.length > 0) {
          SubjectScore[newSubject] = [
            {
              maxRank: _.mean(maxRanks),
              minRank: _.mean(minRanks),
              avgRank: _.mean(avgRanks),
            },
          ]
        } else {
          SubjectScore[newSubject] = [
            {
              maxRank: '-',
              minRank: '-',
              avgRank: '-',
            },
          ]
        }
      })
    },
    [SubjectScore],
  )

  useMemo(() => calculateCombinedSubjects(combinedSubjects), [combinedSubjects, calculateCombinedSubjects])
  return (
    <main className="flex flex-col gap-6 2xl:justify-center">
      <nav className="flex flex-col items-center justify-between gap-4 2xl:flex-row">
        <Typography variant="title1">모의고사 최고/최저 등급 비교</Typography>
        <div className="flex flex-col items-center gap-4 2xl:flex-row">
          {latestExamInfo && (
            <span className="flex flex-row items-center gap-1">
              <SolidSVGIcon.Info color="gray400" size={16} />
              <div className="flex flex-row items-center">
                <Typography variant="caption2" className="text-primary-gray-500">
                  현재 보여지는 성적은
                </Typography>
                <Typography variant="caption2" className="text-primary-800">
                  {latestExamInfo &&
                    ` ${latestExamInfo.insertion_year}학년도 ${latestExamInfo.grade}학년 ${latestExamInfo.month}월 `}
                </Typography>
                <Typography variant="caption2" className="text-primary-gray-500">
                  기준입니다.
                </Typography>
              </div>
            </span>
          )}
          <ButtonV2 variant="outline" size={32} color="gray400" disabled={isLoading} onClick={() => setOpenModal(true)}>
            그래프 보기
          </ButtonV2>
        </div>
      </nav>
      <div className="scrollable-wide w-full">
        <table className="w-full table-auto border-collapse">
          <thead className="text-13 text-primary-gray-600 text-center font-normal">
            <tr>
              <td className="bg-primary-gray-50 min-w-[80px] p-2">과목</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">국어영역</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">수학영역</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">영어영역</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">한국사</td>
              {SubjectGroups[SubjectEnum.사회]
                .filter((subject) => SubjectScore[subject])
                .map((subject) => (
                  <td key={subject} className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">
                    {subject}
                  </td>
                ))}
              {SubjectGroups[SubjectEnum.과학]
                .filter((subject) => SubjectScore[subject])
                .map((subject) => (
                  <td key={subject} className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">
                    {subject}
                  </td>
                ))}
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">국영수사과</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">국영수사</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-x border-b border-gray-200 p-2">국영수과</td>
              <td className="bg-primary-gray-50 min-w-[100px] border-b border-l border-gray-200 p-2">국영수</td>
            </tr>
          </thead>
          <tbody className="text-13 text-primary-gray-900 text-center">
            <tr>
              <td className="border-t-primary-gray-200 border-t border-r border-r-gray-100 p-2">최고등급</td>
              {[
                '국어',
                '수학',
                '영어',
                '한국사',
                ...SubjectGroups[SubjectEnum.사회],
                ...SubjectGroups[SubjectEnum.과학],
                '국영수사과',
                '국영수사',
                '국영수과',
                '국영수',
              ]
                .filter((subject) => SubjectScore[subject])
                .map((subject, index) => (
                  <td
                    key={subject}
                    className={`border-gray-100 p-2 ${
                      index === Object.keys(SubjectScore).length - 1 ? 'border-y border-l' : 'border'
                    }`}
                  >
                    {SubjectScore[subject]?.[0]?.minRank !== undefined && SubjectScore[subject][0].minRank !== null
                      ? SubjectScore[subject][0].minRank.toFixed(1)
                      : '-'}
                  </td>
                ))}
            </tr>
            <tr>
              <td className="border-y border-r border-gray-100 p-2">평균등급</td>
              {[
                '국어',
                '수학',
                '영어',
                '한국사',
                ...SubjectGroups[SubjectEnum.사회],
                ...SubjectGroups[SubjectEnum.과학],
                '국영수사과',
                '국영수사',
                '국영수과',
                '국영수',
              ]
                .filter((subject) => SubjectScore[subject])
                .map((subject, index) => (
                  <td
                    key={subject}
                    className={`border-gray-100 p-2 ${
                      index === Object.keys(SubjectScore).length - 1 ? 'border-y border-l' : 'border'
                    }`}
                  >
                    {SubjectScore[subject]?.[0]?.avgRank !== undefined && SubjectScore[subject][0].avgRank !== null
                      ? SubjectScore[subject][0].avgRank.toFixed(1)
                      : '-'}
                  </td>
                ))}
            </tr>
            <tr>
              <td className="border-r border-b border-gray-100 p-2">최저등급</td>
              {[
                '국어',
                '수학',
                '영어',
                '한국사',
                ...SubjectGroups[SubjectEnum.사회],
                ...SubjectGroups[SubjectEnum.과학],
                '국영수사과',
                '국영수사',
                '국영수과',
                '국영수',
              ]
                .filter((subject) => SubjectScore[subject])
                .map((subject, index) => (
                  <td
                    key={subject}
                    className={`border-gray-100 p-2 ${
                      index === Object.keys(SubjectScore).length - 1 ? 'border-y border-l' : 'border'
                    }`}
                  >
                    {SubjectScore[subject]?.[0]?.maxRank !== undefined && SubjectScore[subject][0].maxRank !== null
                      ? SubjectScore[subject][0].maxRank.toFixed(1)
                      : '-'}
                  </td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>
      {openModal && (
        <PopupModal
          modalOpen={openModal}
          setModalClose={() => setOpenModal(false)}
          size="large"
          title="모의고사"
          bottomBorder={false}
        >
          <MockExamScoreModal data={SubjectScore} examDates={examDates} />
        </PopupModal>
      )}
    </main>
  )
}

export default MockRankTable
