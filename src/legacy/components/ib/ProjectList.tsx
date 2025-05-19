import React, { useEffect, useState } from 'react'

import { Typography } from '@/legacy/components/common/Typography'
import { useGetIBProject } from '@/legacy/container/ib-project-get-filter'
import {
  IBGetIBBycoordinatorParams,
  ResponseCoordinatorSelfCheckDtoType,
  ResponseUserDto,
} from '@/legacy/generated/model'

import ProjectCard from './ProjectCard'
import SVGIcon from '../icon/SVGIcon'

interface ProjectListProps {
  title: string
  params: IBGetIBBycoordinatorParams
  statuses: string
  user: ResponseUserDto
  setCount?: (count: number) => void
  permission?: ResponseCoordinatorSelfCheckDtoType
  currentPage: number // 추가된 props
  onPageChange: (page: number) => void // 추가된 props
}

const ProjectList: React.FC<ProjectListProps> = ({
  title,
  params,
  statuses,
  user,
  setCount,
  permission,
  currentPage,
  onPageChange,
}) => {
  const { data, getIBProject, isLoading } = useGetIBProject()
  const [isOpen, setIsOpen] = useState(true)
  const itemsPerPage = 12

  useEffect(() => {
    if (isOpen) {
      switch (params.ibTypes) {
        case 'EE':
          break
        case 'CAS':
          params.ibTypes = 'CAS_NORMAL,CAS_PROJECT'
          break
        case 'TOK':
          params.ibTypes = 'TOK_ESSAY,TOK_EXHIBITION'
      }
      getIBProject({ ...params, statuses, page: currentPage })
    }
  }, [isOpen, params, currentPage])

  useEffect(() => {
    if (params.studentName && setCount && data?.total !== undefined) {
      setCount(data.total)
    }
  }, [data])

  // const fetchAdditionalData = (page: number) => {
  //   const startIndex = (page - 1) * itemsPerPage;
  //   if (!data || startIndex >= data.items.length) {
  //     // 새 데이터 요청
  //     getIBProject({ ...params, statuses, page });
  //   }
  // };

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  // const getCurrentPageItems = () => {
  //   const startIndex = (currentPage - 1) * itemsPerPage;
  //   const endIndex = startIndex + itemsPerPage;

  //   let items = data?.items || [];
  //   items = items
  //     .filter((item) => item.leader?.studentGroup) // studentGroup이 있는 항목만 필터링
  //     .sort((a, b) => {
  //       const getStudentNumber = (item: any) => {
  //         const grade = item.leader?.studentGroup?.group?.grade || 0;
  //         const klass = item.leader?.studentGroup?.group?.klass || 0;
  //         const studentNumber = parseInt(item.leader?.studentGroup?.studentNumber || '0', 10);
  //         return grade * 10000 + klass * 100 + studentNumber;
  //       };

  //       return getStudentNumber(a) - getStudentNumber(b);
  //     });

  //   if (data?.total && data.total > items.length && endIndex > items.length) {
  //     fetchAdditionalData(currentPage);
  //   }

  //   return items.slice(startIndex, endIndex);
  // };

  const totalPages = Math.ceil((data?.total || 0) / itemsPerPage)

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-4 ${data?.total !== 0 ? 'cursor-pointer' : ''}`}
        onClick={toggleAccordion}
      >
        <span className="flex flex-row items-center gap-1">
          <Typography variant="title3" className="text-primary-gray-900">
            {title}
          </Typography>
          {isLoading ? (
            <></>
          ) : (
            <Typography variant="title3" className="text-primary-800">
              {data?.total ?? 0}
            </Typography>
          )}
        </span>
        {data?.total !== 0 && (
          <span>
            {isOpen ? (
              <SVGIcon.Arrow color="gray700" rotate={90} size={16} weight="bold" />
            ) : (
              <SVGIcon.Arrow color="gray700" rotate={270} size={16} weight="bold" />
            )}
          </span>
        )}
      </div>

      {/* 하단의 내용 */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4 pt-6">{DummyCard()}</div>
      ) : (
        <>
          {isOpen && data && data.items.length > 0 && (
            <div className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                {data.items.map((item) => (
                  <ProjectCard key={item.id} data={item} user={user} permission={permission} />
                ))}
                {/* {getCurrentPageItems().map((item) => (
                  <ProjectCard key={item.id} data={item} user={user} permission={permission} />
                ))} */}
              </div>
              {totalPages > 1 && (
                <div className="mt-4">
                  <IBPagination
                    totalItems={data?.total || 0}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProjectList

const DummyCard = () => (
  <>
    <div
      className={`border-primary-gray-200 box-border flex h-[223px] w-[308px] animate-pulse cursor-pointer flex-col rounded-xl border bg-white shadow`}
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
            </div>
          </main>
        </div>
      </div>
    </div>
    <div
      className={`border-primary-gray-200 box-border flex h-[223px] w-[308px] animate-pulse cursor-pointer flex-col rounded-xl border bg-white shadow`}
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
            </div>
          </main>
        </div>
      </div>
    </div>
  </>
)

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
}

export const IBPagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        className={`flex h-8 w-8 items-center justify-center ${
          currentPage === 1
            ? 'text-primary-gray-400'
            : 'hover:bg-primary-gray-50 hover:text-primary-gray-700 hover:rounded-md'
        }`}
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <SVGIcon.Arrow weight="bold" color="gray400" size={24} />
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={`text-14 h-8 w-8 font-medium ${
            currentPage === index + 1
              ? 'bg-primary-gray-700 rounded-md text-white'
              : 'text-primary-gray-700 hover:bg-primary-gray-50 hover:text-primary-gray-700' // hover 스타일
          }`}
          onClick={() => handlePageClick(index + 1)}
        >
          {index + 1}
        </button>
      ))}

      <button
        className={`flex h-8 w-8 items-center justify-center ${
          currentPage === totalPages
            ? 'text-primary-gray-400'
            : 'hover:bg-primary-gray-50 hover:text-primary-gray-700 hover:rounded-md'
        }`}
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <SVGIcon.Arrow weight="bold" color="gray400" size={24} rotate={180} />
      </button>
    </div>
  )
}
