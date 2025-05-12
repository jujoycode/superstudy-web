import { concat } from 'lodash'
import { useState } from 'react'
import type {
  IBInterviewCommonQuestionDto,
  RequestUpdateInterviewDto,
  ResponseInterviewDto,
} from '@/legacy/generated/model'

export function useUpdateInterview(interviewItems: ResponseInterviewDto[]) {
  const [selectedInterviewIndex, setSelectedInterviewIndex] = useState(0)
  const [interviewContents, setInterviewContents] = useState<Record<number, ResponseInterviewDto>>({})
  const [createInterviews, setCreateInterviews] = useState<RequestUpdateInterviewDto[]>(
    interviewItems.length ? [] : [{ title: '인터뷰 1', description: '', commonQuestion: [{ question: '', hint: '' }] }],
  )

  const interviews = concat(
    [] as (RequestUpdateInterviewDto | ResponseInterviewDto)[],
    interviewItems.map((interview) => {
      if (interviewContents[interview.id]) {
        return {
          ...interview,
          ...interviewContents[interview.id],
        }
      }
      return interview
    }),
    createInterviews,
  )

  const selectedInterview: RequestUpdateInterviewDto | ResponseInterviewDto = interviews[selectedInterviewIndex] || {}

  const handleCreateInterview = () => {
    setCreateInterviews(
      createInterviews.concat({
        title: `인터뷰 ${interviews.length + 1}`,
        description: '',
        commonQuestion: [{ question: '', hint: '' }],
      }),
    )
  }
  const handleUpdateInterview = (dto: Partial<RequestUpdateInterviewDto>) => {
    if (interviewItems[selectedInterviewIndex]) {
      setInterviewContents((prev) => {
        const value = structuredClone(prev)
        value[interviewItems[selectedInterviewIndex].id] = {
          ...interviewItems[selectedInterviewIndex],
          ...prev[interviewItems[selectedInterviewIndex].id],
          ...dto,
        }
        return value
      })
    } else {
      setCreateInterviews((prev) => {
        const value = structuredClone(prev)
        value[selectedInterviewIndex - interviewItems.length] = {
          ...prev[selectedInterviewIndex - interviewItems.length],
          ...dto,
        }
        return value
      })
    }
  }

  const handleDeleteInterview = () => {
    if (!interviewItems[selectedInterviewIndex]) return
    setCreateInterviews((prev) => {
      const value = structuredClone(prev)
      value.splice(selectedInterviewIndex - interviewItems.length, 1)
      return value
    })
  }

  const handleCreateQuestion = () => {
    if (interviewItems[selectedInterviewIndex]) {
      setInterviewContents((prev) => {
        const value = structuredClone(prev)
        if (!prev[interviewItems[selectedInterviewIndex].id]) {
          value[interviewItems[selectedInterviewIndex].id] = interviewItems[selectedInterviewIndex]
        }
        value[interviewItems[selectedInterviewIndex].id].commonQuestion.push({ question: '', hint: '' })
        return value
      })
    } else {
      setCreateInterviews((prev) => {
        const value = structuredClone(prev)
        value[selectedInterviewIndex - interviewItems.length].commonQuestion.push({ question: '', hint: '' })
        console.log('value', value)
        return value
      })
    }
  }
  const handleUpdateQuestion = (question: IBInterviewCommonQuestionDto, index: number) => {
    if (interviewItems[selectedInterviewIndex]) {
      setInterviewContents((prev) => {
        const value = structuredClone(prev)
        if (!prev[interviewItems[selectedInterviewIndex].id]) {
          value[interviewItems[selectedInterviewIndex].id] = interviewItems[selectedInterviewIndex]
        }
        value[interviewItems[selectedInterviewIndex].id].commonQuestion[index] = {
          ...value[interviewItems[selectedInterviewIndex].id].commonQuestion[index],
          ...question,
        }
        return value
      })
    } else {
      setCreateInterviews((prev) => {
        const value = structuredClone(prev)
        value[selectedInterviewIndex - interviewItems.length].commonQuestion[index] = {
          ...value[selectedInterviewIndex - interviewItems.length].commonQuestion[index],
          ...question,
        }
        return value
      })
    }
  }

  const handleDeleteQuestion = (index: number) => {
    if (interviewItems[selectedInterviewIndex]) {
      setInterviewContents((prev) => {
        const value = structuredClone(prev)
        if (!prev[interviewItems[selectedInterviewIndex].id]) {
          value[interviewItems[selectedInterviewIndex].id] = interviewItems[selectedInterviewIndex]
        }
        value[interviewItems[selectedInterviewIndex].id].commonQuestion.splice(index, 1)
        return value
      })
    } else {
      setCreateInterviews((prev) => {
        const value = structuredClone(prev)
        value[selectedInterviewIndex - interviewItems.length].commonQuestion.splice(index, 1)
        return value
      })
    }
  }

  const reset = () => {
    setSelectedInterviewIndex(0)
    setInterviewContents([])
    setCreateInterviews([])
  }

  return {
    state: {
      selectedInterviewIndex,
      interviewContents,
      createInterviews,
    },
    setState: {
      setSelectedInterviewIndex,
      setInterviewContents,
      setCreateInterviews,
    },
    interviews,
    selectedInterview,
    handleCreateInterview,
    handleUpdateInterview,
    handleDeleteInterview,
    handleCreateQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    reset,
  }
}
