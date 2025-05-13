import { filter, groupBy, includes, map, mean } from 'lodash'

import { SubjectEnum, SubjectGroups } from '@/legacy/constants/score.enum'

export interface examsScoreFiles {
  file: File
  grade: number
  class_num: number
  cur_year: number
}

export interface mockExamScoreFiles {
  file: File
  grade: number
  classNum: number
  semester: number
  step: number
  insertionYear: number
}

export function validateAndExtract(files: File[], year: number) {
  const validFiles: examsScoreFiles[] = []
  const invalidFiles: string[] = []

  Array.from(files).forEach((file) => {
    const normalizedName = file.name.normalize('NFC')
    const match = normalizedName.match(/^(\d{1,2})-(\d{1,2})-종합\..+$/)
    if (match) {
      const grade = parseInt(match[1], 10) // 학년 추출
      const class_num = parseInt(match[2], 10) // 반 추출
      const cur_year = year // 현재 연도
      validFiles.push({ file, grade, class_num, cur_year })
    } else {
      invalidFiles.push(file.name)
    }
  })

  if (invalidFiles.length > 0) {
    alert(`잘못된 파일 이름: ${invalidFiles.join(', ')}`)
    return []
  }

  return validFiles
}

export function validateAndExtractMock(files: File[], semester: number, step: number, year: number) {
  const validFiles: mockExamScoreFiles[] = []
  const invalidFiles: string[] = []

  Array.from(files).forEach((file) => {
    const normalizedName = file.name.normalize('NFC')
    const match = normalizedName.match(/^(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})\..+$/)
    if (match) {
      const grade = parseInt(match[1], 10) // 학년 추출
      const classNum = parseInt(match[2], 10) // 반 추출
      const insertionYear = year // 현재 연도
      validFiles.push({ file, grade, classNum, insertionYear, semester, step })
    } else {
      invalidFiles.push(file.name)
    }
  })

  if (invalidFiles.length > 0) {
    alert(`잘못된 파일 이름: ${invalidFiles.join(', ')}`)
    return []
  }

  return validFiles
}

const parseRankScore = (rankScore: any): number | null => {
  if (!rankScore || rankScore === '') return null

  const score = Number(rankScore)
  return !isNaN(score) ? score : null
}

export const calculateAverageGrades = (scores: any[]) => {
  const subjectGroups = {
    국영수사과: ['국어', '수학', '영어', SubjectEnum.사회, SubjectEnum.과학],
    국영수사: ['국어', '수학', '영어', SubjectEnum.사회],
    국영수과: ['국어', '수학', '영어', SubjectEnum.과학],
    국영수: ['국어', '수학', '영어'],
  }

  return map(scores, (semesterData) => {
    const groupAverages = map(subjectGroups, (baseSubjects, groupName) => {
      const rankScores = map(
        filter(
          semesterData.scores,
          (score) =>
            includes(baseSubjects, score.subject_group) ||
            (includes(baseSubjects, SubjectEnum.사회) &&
              includes(SubjectGroups[SubjectEnum.사회], score.subject_name)) ||
            (includes(baseSubjects, SubjectEnum.과학) && includes(SubjectGroups[SubjectEnum.과학], score.subject_name)),
        ),
        (score: any) => parseRankScore(score.rank_score),
      ).filter((score) => score !== null)
      return {
        groupName,
        average: rankScores.length ? Math.floor(mean(rankScores) * 10) / 10 : null,
      }
    })

    const formattedSemester = `${semesterData.grade}-${semesterData.semester}`

    return {
      grade: semesterData.grade,
      semester: formattedSemester,
      averages: groupBy(groupAverages, 'groupName'),
    }
  })
}
