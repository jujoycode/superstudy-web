import { useState } from 'react'

import type {
  RequestEEEvaluationDto,
  RequestUpdateEEEvaluationCriteriaWithIdDto,
  RequestUpdateEEEvaluationItemWithIdDto,
  RequestUpdateEEEvaluationLevelWithIdDto,
} from '@/legacy/generated/model'

export function useCreateEvaluation() {
  const [selectedCriteriaIndex, setSelectedCriteriaIndex] = useState<number>(0)

  const [evaluation, setEvaluation] = useState<RequestEEEvaluationDto>({
    location: 'ESSAY',
    criterias: [
      {
        area: '',
        factor: '',
        score: 0,
        levels: [
          {
            name: '',
            description: '',
            minScore: 0,
            maxScore: 0,
            items: [{ name: '' }],
          },
        ],
      },
    ],
  })

  const selectedCriteria = evaluation.criterias?.[selectedCriteriaIndex]

  const handleCreateCriteria = () => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      cur.criterias?.push({
        area: '',
        factor: '',
        score: 0,
        levels: [
          {
            name: '',
            description: '',
            minScore: 0,
            maxScore: 0,
            items: [{ name: '' }],
          },
        ],
      })
      return cur
    })
  }

  const handleUpdateCriteria = (criteriaDto: RequestUpdateEEEvaluationCriteriaWithIdDto) => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      if (cur.criterias && prev.criterias) {
        cur.criterias[selectedCriteriaIndex] = {
          ...prev.criterias[selectedCriteriaIndex],
          ...criteriaDto,
        }
      }
      return cur
    })
  }

  const handleDeleteCriteria = () => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      cur.criterias?.splice(selectedCriteriaIndex, 1)
      return cur
    })
  }

  const handleCreateLevel = () => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      cur.criterias?.[selectedCriteriaIndex]?.levels?.push({
        name: '',
        description: '',
        minScore: 0,
        maxScore: 0,
        items: [{ name: '' }],
      })
      return cur
    })
  }

  const handleUpdateLevel = (levelDto: RequestUpdateEEEvaluationLevelWithIdDto, levelIndex: number) => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      if (cur.criterias?.[selectedCriteriaIndex]?.levels?.[levelIndex]) {
        //@ts-ignore
        cur.criterias[selectedCriteriaIndex].levels[levelIndex] = {
          //@ts-ignore
          ...prev.criterias[selectedCriteriaIndex].levels[levelIndex],
          ...levelDto,
        }
      }

      return cur
    })
  }

  const handleDeleteLevel = (levelIndex: number) => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      cur.criterias?.[selectedCriteriaIndex]?.levels?.splice(levelIndex, 1)
      return cur
    })
  }

  const handleCreateItem = (levelIndex: number) => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      cur.criterias?.[selectedCriteriaIndex]?.levels?.[levelIndex]?.items?.push({ name: '' })
      return cur
    })
  }

  const handleUpdateItem = (itemDto: RequestUpdateEEEvaluationItemWithIdDto, levelIndex: number, itemIndex: number) => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      if (cur.criterias?.[selectedCriteriaIndex]?.levels?.[levelIndex]?.items?.[itemIndex]) {
        //@ts-ignore
        cur.criterias[selectedCriteriaIndex].levels[levelIndex].items[itemIndex] = {
          //@ts-ignore
          ...prev.criterias[selectedCriteriaIndex].levels[levelIndex].items[itemIndex],
          ...itemDto,
        }
      }
      return cur
    })
  }

  const handleDeleteItem = (levelIndex: number, itemIndex: number) => {
    setEvaluation((prev) => {
      const cur = structuredClone(prev)
      cur.criterias?.[selectedCriteriaIndex]?.levels?.[levelIndex]?.items?.splice(itemIndex, 1)
      return cur
    })
  }

  const reset = () => {
    setSelectedCriteriaIndex(0)
    setEvaluation({
      location: 'ESSAY',
      criterias: [
        {
          area: '',
          factor: '',
          score: 0,
          levels: [
            {
              name: '',
              description: '',
              minScore: 0,
              maxScore: 0,
              items: [{ name: '' }],
            },
          ],
        },
      ],
    })
  }

  return {
    evaluation,
    selectedCriteria,
    selectedCriteriaIndex,
    setSelectedCriteriaIndex,
    handleCreateCriteria,
    handleUpdateCriteria,
    handleDeleteCriteria,
    handleCreateLevel,
    handleUpdateLevel,
    handleDeleteLevel,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    reset,
  }
}
