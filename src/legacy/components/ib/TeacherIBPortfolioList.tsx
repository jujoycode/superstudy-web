import clsx from 'clsx'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'
import NODATA from 'src/assets/images/no-data.png'
import { useGetIBPortfolio } from '@/legacy/container/ib-portfolio-get-filter'
import { useGroupsFindAllKlassBySchool } from '@/legacy/generated/endpoint'
import { meState } from '@/stores'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { Input } from '@/legacy/components/common/Input'
import SelectBar from '@/legacy/components/common/SelectBar'
import { Typography } from '@/legacy/components/common/Typography'
import PortfolioCard from './cas/PortfolioCard'
import QueryString from 'qs'
import { useHistory } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useQueryParams } from '@/legacy/hooks/useQueryParams'

interface FilterOption {
  grade: number
  klass: number
  checked: boolean
  studentName: string
}

export default function TeacherIBPortfolioList() {
  const me = useRecoilValue(meState)
  const location = useLocation()
  const history = useHistory()
  const { setQueryParamsWithStorage } = useQueryParams()

  const { data: klassGroups, isLoading: isKlassGroupsLoading } = useGroupsFindAllKlassBySchool()
  const { data, getIBPortfolio, isLoading } = useGetIBPortfolio()

  const defaultOptions: FilterOption = {
    grade: 0,
    klass: 0,
    checked: true,
    studentName: '',
  }

  const parseQueryParams = (): FilterOption => {
    const params = QueryString.parse(location.search, { ignoreQueryPrefix: true })

    return {
      grade: Number(params.grade) || defaultOptions.grade,
      klass: Number(params.klass) || defaultOptions.klass,
      checked: params.checked !== undefined ? params.checked === 'true' : defaultOptions.checked,
      studentName: (params.studentName as string) || defaultOptions.studentName,
    }
  }

  const [selectedOptions, setSelectedOptions] = useState<FilterOption>(parseQueryParams)

  const handleOptionChange = (optionType: keyof FilterOption, value: any) => {
    let updatedOptions = { ...selectedOptions }

    if (optionType === 'grade') {
      updatedOptions = {
        grade: value,
        klass: 0,
        checked: selectedOptions.checked,
        studentName: selectedOptions.studentName,
      }
    } else {
      updatedOptions = {
        ...updatedOptions,
        [optionType]: value,
      }
    }

    setSelectedOptions(updatedOptions)
    updateSearchParams(updatedOptions)
  }

  const updateSearchParams = (updatedOptions: FilterOption) => {
    const params = {
      grade: updatedOptions.grade !== defaultOptions.grade ? updatedOptions.grade : undefined,
      klass: updatedOptions.klass !== defaultOptions.klass ? updatedOptions.klass : undefined,
      studentName: updatedOptions.studentName !== defaultOptions.studentName ? updatedOptions.studentName : undefined,
      checked: updatedOptions.checked !== defaultOptions.checked ? updatedOptions.checked : undefined,
    }
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined),
    ) as Record<string, string>
    setQueryParamsWithStorage(filteredParams)
    history.replace({ search: QueryString.stringify(filteredParams, { addQueryPrefix: true }) })
  }

  const grades = [
    { id: 0, value: 0, text: '학년 전체' },
    { id: 1, value: 2, text: '2학년' },
    { id: 2, value: 3, text: '3학년' },
  ]

  const klasses = _(klassGroups)
    .filter((group) => group.grade === selectedOptions.grade)
    .map('klass')
    .uniq()
    .map((klass, index) => ({ id: index + 1, value: klass, text: `${klass}반` }))
    .concat([{ id: 0, value: 0, text: '반 전체' }])
    .orderBy('value')
    .value()

  const handleSearch = () => {
    if (!selectedOptions.studentName) {
      alert('텍스트 내용을 입력해주세요.')
    } else {
      handleOptionChange('studentName', selectedOptions.studentName)
    }
  }

  const filteredData = useMemo(() => {
    if (!selectedOptions.studentName) return data?.items || []
    return data?.items.filter((item) => item.user.name.includes(selectedOptions.studentName)) || []
  }, [data, selectedOptions.studentName])

  useEffect(() => {
    getIBPortfolio({
      grade: selectedOptions.grade === 0 ? undefined : selectedOptions.grade,
      klass: selectedOptions.klass === 0 ? undefined : selectedOptions.klass,
      mentorId: selectedOptions.checked ? me?.id : undefined,
      isOnlyProgress: 'true',
    })
  }, [selectedOptions, me])

  if (!me) {
    return <IBBlank />
  }

  if (isKlassGroupsLoading) {
    return <IBBlank />
  }

  return (
    <main className="w-full">
      <header className="flex flex-row items-center gap-3 py-5">
        <div className="flex w-full justify-between">
          <div className="flex flex-row items-center gap-3">
            <div className="flex flex-row items-center gap-2">
              <SelectBar
                options={grades}
                value={selectedOptions.grade}
                onChange={(value: number) => handleOptionChange('grade', value)}
                placeholder="학년 선택"
                size={40}
                containerWidth="w-30"
                dropdownWidth="w-40"
                priorityFontClass="text-primary-gray-900"
              />
              <SelectBar
                disabled={!selectedOptions.grade}
                options={klasses}
                value={selectedOptions.klass}
                onChange={(value: number) => handleOptionChange('klass', value)}
                placeholder="반 선택"
                size={40}
                containerWidth="w-30"
                dropdownWidth="w-40"
                className={clsx({ 'cursor-not-allowed': !selectedOptions.grade })}
                priorityFontClass={clsx({ 'text-primary-gray-900': selectedOptions.grade })}
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-3">
            <label className="flex cursor-pointer flex-row items-center gap-2">
              <Check.Basic
                checked={selectedOptions.checked}
                onChange={() => handleOptionChange('checked', !selectedOptions.checked)}
                size={20}
              />
              <Typography variant="body3" className="text-primary-gray-700 font-medium">
                담당학생만 보기
              </Typography>
            </label>
            <Input.Basic
              size={40}
              placeholder="이름 검색"
              type="text"
              value={selectedOptions.studentName}
              className="w-[160px]"
              isSearch
              onSearch={handleSearch}
              onChange={(e) => handleOptionChange('studentName', e.target.value)}
            />
          </div>
        </div>
      </header>
      <section className="flex flex-col">
        {selectedOptions.studentName && (
          <div className="flex items-center gap-4 py-4">
            <hr className="flex-1" />
            <Typography variant="body3" className="font-medium">
              {selectedOptions.studentName} <span className="text-primary-gray-700 font-normal">검색결과</span>{' '}
              <span className="text-primary-orange-800">{filteredData.length}</span>
            </Typography>
            <hr className="flex-1" />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: Math.max(8, data?.items.length || 0) }).map((_, index) => (
              <DummyCard key={index} />
            ))}
          </div>
        ) : filteredData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-40">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span>
              <Typography
                variant="body2"
                className="text-center"
              >{`학생들이 프로필을 작성하지 않아 포트폴리오가 생성되지 않았습니다.`}</Typography>
              <Typography
                variant="body2"
                className="text-center"
              >{`학생들이 프로필을 작성할 수 있도록 지도해주세요`}</Typography>
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredData.map((project) => (
              <PortfolioCard data={project} key={project.id} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const DummyCard = () => (
  <div
    className={`border-primary-gray-200 box-border flex h-[380px] w-[308px] animate-pulse cursor-pointer flex-col rounded-xl border bg-white shadow`}
  >
    <div className="border-b-primary-gray-100 box-border flex flex-row items-center border-b px-5 py-3">
      <div className="h-4 flex-1 rounded bg-slate-200"></div>
    </div>
    <div className="flex w-[308px] flex-1 flex-col justify-between px-5 pt-5">
      <div>
        <nav className="box-border flex w-full flex-row items-center justify-between">
          <span className="bg-primary-gray-100 h-6 w-10 rounded"></span>
          <span className="bg-primary-gray-100 h-6 w-20 rounded"></span>
        </nav>
        <main className="box-border flex flex-col gap-3 py-6">
          <span className="bg-primary-gray-100 h-6 w-40 rounded"></span>
          <div className="flex w-full flex-col gap-2">
            <span className="flex flex-row gap-2">
              <span className="bg-primary-gray-100 h-6 w-14 rounded"></span>
              <span className="bg-primary-gray-100 h-6 w-30 rounded"></span>
            </span>

            <span className="flex flex-row gap-2">
              <span className="bg-primary-gray-100 h-6 w-14 rounded"></span>
              <span className="bg-primary-gray-100 h-6 w-30 rounded"></span>
            </span>
            <span className="flex flex-row gap-2">
              <span className="bg-primary-gray-100 h-6 w-14 rounded"></span>
              <span className="bg-primary-gray-100 h-6 w-30 rounded"></span>
            </span>
          </div>
        </main>
      </div>
    </div>
    <div className="mt-auto flex flex-col gap-2 px-5 pb-5">
      <span className="flex flex-row items-center justify-between gap-2">
        <span className="bg-primary-gray-100 h-6 w-14 rounded"></span>
        <span className="bg-primary-gray-100 h-6 w-full rounded"></span>
      </span>
      <span className="flex flex-row items-center justify-between gap-2">
        <span className="bg-primary-gray-100 h-6 w-14 rounded"></span>
        <span className="bg-primary-gray-100 h-6 w-full rounded"></span>
      </span>
    </div>
  </div>
)
