import { filter, map } from 'lodash'
import { useEffect, useState } from 'react'
import { useEEEvaluationGetEEEvaluation } from '@/legacy/generated/endpoint'
import {
  RequestEEEvaluationCriteriaByLevelsDto,
  RequestEEEvaluationItemWithIdDto,
  RequestEEEvaluationLevelByItemsWithIdDto,
  RequestUpdateEEEvaluationCriteriaWithIdDto,
  RequestUpdateEEEvaluationItemWithIdDto,
  RequestUpdateEEEvaluationLevelWithIdDto,
} from '@/legacy/generated/model'

export function useUpdateEvaluation(evaluationId: number) {
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string | number>(0)

  const [createCriterias, setCreateCriterias] = useState<RequestEEEvaluationCriteriaByLevelsDto[]>([])
  const [updateCriterias, setUpdateCriterias] = useState<RequestUpdateEEEvaluationCriteriaWithIdDto[]>([])
  const [deleteCriteriaIds, setDeleteCriteriaIds] = useState<number[]>([])
  const [createLevels, setCreateLevels] = useState<RequestEEEvaluationLevelByItemsWithIdDto[]>([])
  const [updateLevels, setUpdateLevels] = useState<RequestUpdateEEEvaluationLevelWithIdDto[]>([])
  const [deleteLevelIds, setDeleteLevelIds] = useState<number[]>([])
  const [createItems, setCreateItems] = useState<RequestEEEvaluationItemWithIdDto[]>([])
  const [updateItems, setUpdateItems] = useState<RequestUpdateEEEvaluationItemWithIdDto[]>([])
  const [deleteItemIds, setDeleteItemIds] = useState<number[]>([])

  const { data, isLoading } = useEEEvaluationGetEEEvaluation(evaluationId, {
    query: {
      enabled: !!evaluationId,
    },
  })

  useEffect(() => {
    if (data?.criterias && !selectedCriteriaId) {
      setSelectedCriteriaId(data.criterias[0].id)
    }
  }, [data])

  const checkCriteriaSelected = (criteriaOrIndex: RequestUpdateEEEvaluationCriteriaWithIdDto | number) => {
    if (typeof criteriaOrIndex === 'number') {
      if (typeof selectedCriteriaId === 'number') return false
      return Number(selectedCriteriaId) === criteriaOrIndex
    }
    if (typeof selectedCriteriaId === 'number') {
      return selectedCriteriaId === criteriaOrIndex.id
    }
  }

  const getSelectedCriteria = () => {
    if (typeof selectedCriteriaId === 'string') {
      return createCriterias[Number(selectedCriteriaId) - (data?.criterias?.length || 0)]
    }
    const existCriteria = data?.criterias?.find((el) => el.id === selectedCriteriaId)
    if (!existCriteria) return

    if (map(updateCriterias, 'id').includes(selectedCriteriaId)) {
      const updateCriteria = updateCriterias.find((el) => el.id === selectedCriteriaId)
      return {
        ...existCriteria,
        ...updateCriteria,
      }
    }
    return existCriteria
  }
  const selectedCriteria = getSelectedCriteria()

  const criterias = data?.criterias
    ?.filter((criteria) => !deleteCriteriaIds.includes(criteria.id))
    .map((criteria) => {
      const updatedCriteria = updateCriterias?.find((uc) => uc.id === criteria.id)
      return updatedCriteria || criteria
    })
    .concat(createCriterias)

  const selectedCriteriaIndex =
    typeof selectedCriteriaId === 'string'
      ? Number(selectedCriteriaId)
      : (data?.criterias?.findIndex((el) => el.id === selectedCriteriaId) ?? NaN)

  const handleCreateCriteria = () => {
    setCreateCriterias(
      createCriterias.concat({
        area: '',
        factor: '',
        score: 0,
        levels: [],
      }),
    )
  }

  const handleUpdateCriteria = (criteriaDto: RequestUpdateEEEvaluationCriteriaWithIdDto) => {
    if (typeof selectedCriteriaId === 'string') {
      if (selectedCriteriaIndex === undefined) return
      const _createCriterias = structuredClone(createCriterias)
      const index = selectedCriteriaIndex - (data?.criterias?.length || 0)
      _createCriterias[index] = {
        ...createCriterias[index],
        ...criteriaDto,
      }
      console.log('_createCriterias', _createCriterias)
      setCreateCriterias(_createCriterias)
      return
    }

    if (map(updateCriterias, 'id').includes(selectedCriteriaId)) {
      setUpdateCriterias((prev) => {
        return map(prev, (criteria) =>
          criteria.id === selectedCriteriaId ? { ...criteria, ...criteriaDto } : criteria,
        )
      })
    } else {
      setUpdateCriterias(
        updateCriterias.concat({
          ...selectedCriteria,
          ...criteriaDto,
        }),
      )
    }
  }

  const handleDeleteCriteria = () => {
    if (typeof selectedCriteriaId === 'string') {
      if (selectedCriteriaIndex === undefined) return
      const _createCriterias = structuredClone(createCriterias)
      const index = selectedCriteriaIndex - (data?.criterias?.length || 0)
      if (index < 0) return
      _createCriterias.splice(index, 1)
      setCreateCriterias(_createCriterias)
      return
    }
    if (map(updateCriterias, 'id').includes(selectedCriteriaId)) {
      setUpdateCriterias(filter(updateCriterias, (criteria) => criteria.id !== selectedCriteriaId))
    }
    setDeleteCriteriaIds(deleteCriteriaIds.concat(selectedCriteriaId))
  }

  const handleCreateLevel = () => {
    if (typeof selectedCriteriaId === 'number') {
      setCreateLevels(
        createLevels.concat({
          name: '',
          description: '',
          minScore: 0,
          maxScore: 0,
          items: [
            {
              name: '',
            },
          ],
          criteriaId: selectedCriteriaId,
        }),
      )
      return
    } else {
      setCreateCriterias((prev) => {
        const updatedCriterias = structuredClone(prev)
        const index = selectedCriteriaIndex - (data?.criterias?.length || 0)
        if (updatedCriterias[index]?.levels) {
          updatedCriterias[index].levels?.push({
            name: '',
            description: '',
            minScore: 0,
            maxScore: 0,
            items: [{ name: '' }],
          })
        }
        return updatedCriterias
      })
      return
    }
  }

  const handleUpdateLevel = (levelDto: RequestUpdateEEEvaluationLevelWithIdDto, index?: number) => {
    if (!levelDto.id) {
      if (typeof selectedCriteriaId === 'number') {
        if (index === undefined) return
        setCreateLevels((prev) => {
          const levelIndex = index - (selectedCriteria?.levels?.length || 0)
          let count = 0
          const createLevelIndex = prev.findIndex((el) => {
            //@ts-ignore
            if (el.criteriaId === selectedCriteriaId) {
              if (count === levelIndex) return true
              count++
            }
            return false
          })
          const value = structuredClone(prev)
          value[createLevelIndex] = {
            ...prev[createLevelIndex],
            ...levelDto,
          }
          return value
        })
        return
      }

      setCreateCriterias((prev) => {
        const updatedCriterias = structuredClone(prev)
        const criteriaIndex = selectedCriteriaIndex - (data?.criterias?.length || 0)
        if (
          index !== undefined &&
          updatedCriterias[criteriaIndex]?.levels &&
          updatedCriterias[criteriaIndex].levels?.[index]
        ) {
          //@ts-ignore
          updatedCriterias[criteriaIndex].levels[index] = {
            ...updatedCriterias[criteriaIndex].levels?.[index],
            ...levelDto,
          }
        }
        return updatedCriterias
      })
      return
    }

    setUpdateLevels((prev) => {
      const exists = prev.find((level) => level.id === levelDto.id)
      if (exists) {
        return prev.map((level) => (level.id === levelDto.id ? { ...level, ...levelDto } : level))
      }
      return [...prev, levelDto]
    })
  }

  const handleDeleteLevel = (_: number, levelId?: number) => {
    if (levelId === undefined) {
      const _createCriterias = structuredClone(createCriterias)
      const index = selectedCriteriaIndex - (data?.criterias?.length || 0)
      _createCriterias[index]?.levels?.splice(index, 1)
      setCreateCriterias(_createCriterias)
      return
    } else {
      if (map(updateLevels, 'id').includes(levelId)) {
        setUpdateLevels(filter(updateLevels, (level) => level.id !== levelId))
      }
      setDeleteLevelIds(deleteLevelIds.concat(levelId))
    }
  }

  const handleCreateItem = (levelIndex: number, levelId?: number) => {
    if (typeof selectedCriteriaId === 'number') {
      if (!levelId) {
        setCreateLevels((prev) => {
          const createLevelIndex = levelIndex - (selectedCriteria?.levels?.length || 0)
          let count = 0
          const index = prev.findIndex((el) => {
            //@ts-ignore
            if (el.criteriaId === selectedCriteriaId) {
              if (count === createLevelIndex) return true
              count++
            }
            return false
          })
          const value = structuredClone(prev)
          value[index] = {
            ...prev[index],
            items: (prev[index].items || [])?.concat({
              name: '',
            }),
          }
          return value
        })
        return
      }
      if (createItems.find((el) => el.levelId === levelId && el.name === '')) return
      setCreateItems(
        createItems.concat({
          name: '',
          levelId,
        }),
      )
    } else {
      setCreateCriterias((prev) => {
        const updatedCriterias = structuredClone(prev)
        if (updatedCriterias[selectedCriteriaIndex]?.levels?.[levelIndex]) {
          updatedCriterias[selectedCriteriaIndex].levels?.[levelIndex]?.items?.push({
            name: '',
          })
        }
        return updatedCriterias
      })
    }
  }

  const handleUpdateItem = (
    itemDto: RequestUpdateEEEvaluationItemWithIdDto,
    levelId?: number,
    levelIndex?: number,
    itemIndex?: number,
  ) => {
    if (!itemDto.id) {
      if (typeof selectedCriteriaId === 'number') {
        if (itemIndex === undefined || levelIndex === undefined) return
        if (!levelId) {
          setCreateLevels((prev) => {
            const createLevelIndex = levelIndex - (selectedCriteria?.levels?.length || 0)
            let count = 0
            const index = prev.findIndex((el) => {
              //@ts-ignore
              if (el.criteriaId === selectedCriteriaId) {
                if (count === createLevelIndex) return true
                count++
              }
              return false
            })
            const value = structuredClone(prev)
            const newItems = value[index].items || []
            newItems[itemIndex] = {
              ...prev[index].items?.[itemIndex],
              ...itemDto,
            }
            value[index] = {
              ...prev[index],
              items: newItems,
            }
            return value
          })
          return
        }
        setCreateItems((prev) => {
          const levelItemIndex = itemIndex - (selectedCriteria?.levels?.[levelIndex]?.items?.length || 0)
          let count = 0
          const index = prev.findIndex((el) => {
            //@ts-ignore
            if (el.levelId === levelId) {
              if (count === levelItemIndex) return true
              count++
            }
            return false
          })
          const value = structuredClone(prev)
          value[index] = {
            ...prev[index],
            ...itemDto,
          }
          return value
        })
        return
      }

      setCreateCriterias((prev) => {
        const updatedCriterias = [...prev]
        const index = selectedCriteriaIndex - (data?.criterias?.length || 0)
        if (
          levelIndex !== undefined &&
          itemIndex !== undefined &&
          updatedCriterias[index]?.levels &&
          updatedCriterias[index].levels?.[levelIndex] &&
          updatedCriterias[index].levels?.[levelIndex]?.items
        ) {
          //@ts-ignore
          updatedCriterias[index].levels[levelIndex].items[itemIndex] = {
            ...updatedCriterias[index].levels?.[levelIndex].items?.[itemIndex],
            ...itemDto,
          }
        }
        return updatedCriterias
      })
      return
    }

    setUpdateItems((prev) => {
      //@ts-ignore
      const exists = prev.find((item) => item.id === itemDto.id)
      if (exists) {
        //@ts-ignore
        return prev.map((item) => (item.id === itemDto.id ? { ...item, ...itemDto } : item))
      }
      return [...prev, itemDto]
    })
  }

  const handleDeleteItem = (levelIndex: number, itemIndex: number, levelId?: number, itemId?: number) => {
    if (!levelId) {
      setCreateLevels((prev) => {
        const index = levelIndex - (selectedCriteria?.levels?.length || 0)
        const value = structuredClone(prev)
        value[index].items?.splice(itemIndex, 1)
        return value
      })
      return
    }
    if (itemId === undefined) {
      const _createCriterias = structuredClone(createCriterias)
      _createCriterias[Number(selectedCriteriaId) - (data?.criterias?.length || 0)]?.levels?.[
        levelIndex
      ]?.items?.splice(itemIndex, 1)
      setCreateCriterias(_createCriterias)
      return
    } else {
      if (map(updateItems, 'id').includes(itemId)) {
        setUpdateItems(filter(updateItems, (item) => item.id !== itemId))
      }
      setDeleteItemIds(deleteItemIds.concat(itemId))
    }
  }

  const reset = () => {
    setSelectedCriteriaId(0)
    setCreateCriterias([])
    setUpdateCriterias([])
    setDeleteCriteriaIds([])
    setCreateLevels([])
    setUpdateLevels([])
    setDeleteLevelIds([])
    setCreateItems([])
    setUpdateItems([])
    setDeleteItemIds([])
  }

  return {
    state: {
      selectedCriteriaId,
      createCriterias,
      updateCriterias,
      deleteCriteriaIds,
      createLevels,
      updateLevels,
      deleteLevelIds,
      createItems,
      updateItems,
      deleteItemIds,
    },
    setState: {
      setSelectedCriteriaId,
      setCreateCriterias,
      setUpdateCriterias,
      setDeleteCriteriaIds,
      setCreateLevels,
      setUpdateLevels,
      setDeleteLevelIds,
      setCreateItems,
      setUpdateItems,
      setDeleteItemIds,
    },
    data,
    isLoading,
    checkCriteriaSelected,
    selectedCriteria,
    selectedCriteriaIndex,
    criterias,
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
