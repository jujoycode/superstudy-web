import { chain, map, uniqBy } from 'lodash'
import { FC, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Select } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { useAchievementCriteriaGetAll } from '@/legacy/generated/endpoint'
import { AchievementChapter, AchievementCriteria } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'

import { SuperModal } from '../SuperModal'

interface ActivityCriteriaSelectModalProps {
  modalOpen: boolean
  setModalOpen: (value: boolean) => void
  selectedCriteriaIds: number[]
  setSelectedCriteriaIds: (ids: number[]) => void
  docYear: string
  setDocYear: (docYear: string) => void
  code: string
  setCode: (code: string) => void
  initialAchievementChapters?: AchievementChapter[]
}

export const getCriteriaTitle = (criteria: AchievementCriteria | undefined) => {
  if (!criteria) return ''
  if (criteria.criteriaId) {
    return `[${criteria.criteriaId}] ${criteria.criteria}`
  }
  return criteria.criteria
}

export const ActivityCriteriaSelectModal: FC<ActivityCriteriaSelectModalProps> = ({
  modalOpen: selectCriteriaModalOpen,
  setModalOpen: setSelectCriteriaModalOpen,
  selectedCriteriaIds,
  setSelectedCriteriaIds,
  docYear,
  setDocYear,
  code,
  setCode,
  initialAchievementChapters,
}) => {
  const { t } = useLanguage()
  const [mainSubject, setMainSubject] = useState<string>('')
  const [mainSubjects, setMainSubjects] = useState<string[]>([])
  const [_code, set_code] = useState(code)
  const [tempSelectedCriteriaIds, setTempSelectedCriteriaIds] = useState<number[]>(selectedCriteriaIds)
  const [initialSelectedCriteria, setInitialSelectedCriteria] = useState<boolean>(false)

  useEffect(() => {
    if (selectCriteriaModalOpen) {
      // 선택된 첫 번째 성취기준으로 초기 선택 상태 설정
      if (selectedCriteriaIds.length > 0 && initialAchievementChapters && !initialSelectedCriteria) {
        const firstSelectedId = selectedCriteriaIds[0]
        const firstSelectedCriteria = initialAchievementChapters
          .flatMap((chapter) => chapter.achievementCriterias)
          .find((criteria) => criteria.id === firstSelectedId)

        if (firstSelectedCriteria) {
          const chapter = initialAchievementChapters.find((chapter) =>
            chapter.achievementCriterias.some((criteria) => criteria.id === firstSelectedId),
          )

          if (chapter) {
            setDocYear(chapter.docYear)
            setMainSubject(chapter.mainSubject)
            setSelectedSubjectId(chapter.id)
            setSelectedSubsubject(firstSelectedCriteria.subSubject)
          }
        }
      } else {
        setMainSubject('')
        setSelectedSubjectId(0)
        setSelectedSubsubject('')
      }

      // 현재 개정연도에 해당하는 교과분류 추출
      if (initialAchievementChapters) {
        const _mainSubjects = uniqBy(
          initialAchievementChapters.filter((chapter) => chapter.docYear === docYear),
          'mainSubject',
        )
          .map((el) => el.mainSubject)
          .filter((el) => !!el)
          .sort((a, b) => a.localeCompare(b))
        setMainSubjects(_mainSubjects)
      }

      // 선택된 성취기준 표시 설정
      setInitialSelectedCriteria(true)
      setTempSelectedCriteriaIds(selectedCriteriaIds)
    }
  }, [docYear, selectCriteriaModalOpen, initialAchievementChapters])

  // 개정연도, 교과분류, 코드에 따른 성취기준 데이터 조회
  const { data: achievementChapters, refetch } = useAchievementCriteriaGetAll(
    { docYear, mainSubject, ...(code ? { code } : {}) },
    {
      query: {
        enabled: selectCriteriaModalOpen,
      },
    },
  )

  const [selectedSubjectId, setSelectedSubjectId] = useState(0)
  const [selectedSubsubject, setSelectedSubsubject] = useState('')

  const selectedChapter = achievementChapters?.find((el) => el.id === selectedSubjectId)

  const subSubjects = chain(selectedChapter?.achievementCriterias || [])
    .map((el) => el.subSubject)
    .uniq()
    .value()

  const handleQuestionSend = () => {
    if (!_code) {
      alert('과목코드 내용을 입력해 주세요!')
      return
    }
    setCode(_code)
  }

  const handleClose = () => {
    setSelectCriteriaModalOpen(false)
    setTempSelectedCriteriaIds([])
    setMainSubject('')
    setSelectedSubjectId(0)
    set_code('')
    setCode('')
    setInitialSelectedCriteria(false)
  }

  const handleConfirm = () => {
    setSelectedCriteriaIds(tempSelectedCriteriaIds)
    setSelectCriteriaModalOpen(false)
    setMainSubject('')
    set_code('')
    setCode('')
    setInitialSelectedCriteria(false)
  }

  return (
    <SuperModal
      className="3xl:h-2/3 h-3/4 w-[960px] max-w-7xl"
      modalOpen={selectCriteriaModalOpen}
      setModalClose={handleClose}
    >
      <div className="flex h-full w-full flex-col p-10">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold whitespace-nowrap">성취기준 선택</h1>
            <Select.lg
              value={docYear}
              onChange={(e) => {
                setDocYear(String(e.target.value))
                refetch()
              }}
            >
              <option defaultChecked hidden>
                개정연도
              </option>
              {[2015, 2022].map((year) => (
                <option value={year} key={year}>
                  {year}년도
                </option>
              ))}
            </Select.lg>
            <Select.lg value={mainSubject} onChange={(e) => setMainSubject(String(e.target.value))}>
              <option defaultChecked hidden>
                교과분류 선택
              </option>
              <option value="" className="text-gray-600">
                {t('all', '전체')}
              </option>
              {mainSubjects.map((subject) => (
                <option value={subject} key={subject}>
                  {subject}
                </option>
              ))}
            </Select.lg>
          </div>

          <div className="mx-4 flex items-center space-x-2">
            <SearchInput
              placeholder={'성취기준 코드로 검색해 보세요.'}
              value={_code}
              onChange={(e) => {
                if (e.target.value === '') {
                  setCode('')
                }
                set_code(e.target.value)
              }}
              onSearch={handleQuestionSend}
              className="bg-gray-50 pr-4 text-sm"
            />
            <Icon.Search className="cursor-pointer" onClick={handleQuestionSend} />
          </div>
        </div>

        {/* 성취기준 박스 */}
        <div className="flex h-full w-full gap-2 overflow-hidden pt-4">
          <div className="flex w-full flex-row rounded-sm border border-[#CCCCCC]">
            {/* 과목 선택 박스 */}
            <div className="w-[300px] overflow-y-auto border-r border-[#CCCCCC] p-1">
              {map(
                achievementChapters?.sort((a, b) => a.subject.localeCompare(b.subject)),
                (ac) => (
                  <div
                    className={twMerge(
                      'text-14 flex cursor-pointer items-center justify-between space-x-4 rounded-sm p-2',
                      selectedSubjectId === ac.id && 'bg-orange-500 font-bold text-white',
                    )}
                    onClick={() => {
                      setSelectedSubjectId(ac.id)
                      const firstSubSubject = achievementChapters?.find((el) => el.id === ac.id)
                        ?.achievementCriterias[0].subSubject
                      firstSubSubject && setSelectedSubsubject(firstSubSubject)
                    }}
                  >
                    <div>{ac.subject}</div>
                    <Icon.ChevronRight stroke={selectedSubjectId === ac.id ? '#FFF' : '#333D4B'} />
                  </div>
                ),
              )}
            </div>
            {/* 하위 과목 선택 박스 */}
            <div className="w-[300px] overflow-y-auto border-r border-[#CCCCCC] p-1">
              {subSubjects?.map((subsubject) => (
                <div
                  key={subsubject}
                  className={twMerge(
                    'text-14 flex cursor-pointer items-center justify-between space-x-4 rounded-sm p-2',
                    selectedSubsubject === subsubject && 'bg-orange-500 font-bold text-white',
                  )}
                  onClick={() => setSelectedSubsubject(subsubject)}
                >
                  <div>{subsubject}</div>
                  <Icon.ChevronRight stroke={selectedSubsubject === subsubject ? '#FFF' : '#333D4B'} />
                </div>
              ))}
            </div>

            {/* 성취기준 선택 박스 */}
            <div className="flex w-full flex-col space-y-2 overflow-y-auto p-4">
              {(code ? achievementChapters : [selectedChapter])
                ?.filter((chapter) => !selectedSubjectId || chapter?.id === selectedSubjectId)
                ?.flatMap((chapter) => chapter?.achievementCriterias || [])
                ?.filter((el) => !selectedSubsubject || el.subSubject === selectedSubsubject)
                ?.map((criteria) => (
                  <label
                    key={criteria.id}
                    htmlFor={String(criteria.id)}
                    className={twMerge(
                      'col-span-2 flex w-full items-start justify-start space-x-2 rounded-sm border border-[#DDDDDD] p-2 text-sm',
                      tempSelectedCriteriaIds.includes(criteria.id) && 'border-primary-800 bg-light_orange',
                    )}
                    onClick={() =>
                      tempSelectedCriteriaIds.includes(criteria.id)
                        ? setTempSelectedCriteriaIds(tempSelectedCriteriaIds.filter((el) => el !== criteria.id))
                        : setTempSelectedCriteriaIds(tempSelectedCriteriaIds.concat(criteria.id))
                    }
                  >
                    <Checkbox
                      id={String(criteria.id)}
                      checked={tempSelectedCriteriaIds.includes(criteria.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        tempSelectedCriteriaIds.includes(criteria.id)
                          ? setTempSelectedCriteriaIds(tempSelectedCriteriaIds.filter((el) => el !== criteria.id))
                          : setTempSelectedCriteriaIds(tempSelectedCriteriaIds.concat(criteria.id))
                      }}
                    />
                    <div className="font-semibold whitespace-pre-line">{getCriteriaTitle(criteria)}</div>
                  </label>
                ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button
            className="h-12 w-28 rounded-lg border border-neutral-500 bg-white text-lg font-semibold"
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            className="h-12 w-28 rounded-lg bg-orange-500 text-lg font-semibold text-white disabled:bg-gray-500"
            disabled={!tempSelectedCriteriaIds.length}
            onClick={handleConfirm}
          >
            확인
          </Button>
        </div>
      </div>
    </SuperModal>
  )
}
