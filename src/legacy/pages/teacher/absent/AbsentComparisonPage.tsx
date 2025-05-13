import clsx from 'clsx'
import _, { range } from 'lodash'
import React, { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router'
import { useRecoilValue } from 'recoil'
import * as XLSX from 'xlsx'

import { useHistory } from '@/hooks/useHistory'
import { Label, Select } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Tooltip } from '@/legacy/components/common/Tooltip'
import { TooltipButton } from '@/legacy/components/common/TooltipButton'
import { UserContainer } from '@/legacy/container/user'
import {
  useAbsentsGetAttendeeInfo,
  useGroupsFindAllKlass,
  useGroupsFindComparison,
  useNiceComparisonsCreate,
  useNiceComparisonsDelete,
  useNiceComparisonsFindAll,
  useNiceComparisonsFindOne,
  useNiceComparisonsUpdate,
} from '@/legacy/generated/endpoint'
import { GroupType } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getSearchYearByMonth, getThisYear } from '@/legacy/util/time'
import { tokenState } from '@/stores'

const headers = [
  '번호',
  '성명',
  '수업일수',
  '결석-질병',
  '결석-미인정',
  '결석-기타',
  '결석-인정',
  '지각-질병',
  '지각-미인정',
  '지각-기타',
  '지각-인정',
  '조퇴-질병',
  '조퇴-미인정',
  '조퇴-기타',
  '조퇴-인정',
  '결과-질병',
  '결과-미인정',
  '결과-기타',
  '결과-인정',
  '결석총계',
  '지각총계',
  '조퇴총계',
  '결과총계',
]

const headersWithoutInjung = [
  '번호',
  '성명',
  '수업일수',
  '결석-질병',
  '결석-미인정',
  '결석-기타',
  '지각-질병',
  '지각-미인정',
  '지각-기타',
  '조퇴-질병',
  '조퇴-미인정',
  '조퇴-기타',
  '결과-질병',
  '결과-미인정',
  '결과-기타',
  '결석총계',
  '지각총계',
  '조퇴총계',
  '결과총계',
]

const tableHeaders = [
  '번호',
  '성명',
  '수업일수',
  '질병',
  '미인정',
  '기타',
  '인정',
  '질병',
  '미인정',
  '기타',
  '인정',
  '질병',
  '미인정',
  '기타',
  '인정',
  '질병',
  '미인정',
  '기타',
  '인정',
  '결석총계',
  '지각총계',
  '조퇴총계',
  '결과총계',
]

const AbsentComparisonPage: React.FC = () => {
  const { search } = useLocation()
  const { replace } = useHistory()
  const { me } = UserContainer.useContext()

  const [niceFile, setNiceFile] = useState<File | undefined | null>(null)
  const [niceFileContent, setNiceFileContent] = useState<any[]>([])
  const [niceComparisonContent, setNiceComparisonContent] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [isDragIn, setDragIn] = useState(false)
  const searchParams = new URLSearchParams(search)
  const thisYear = +getThisYear()
  const year = Number(searchParams.get('year') || thisYear)
  const month = Number(searchParams.get('month') || 0)
  const selectedGroupId = Number(searchParams.get('selectedGroupId') || 0)
  const { t } = useLanguage()

  const token = useRecoilValue(tokenState)

  const { data: userGroupsData } = useGroupsFindComparison(
    { type: GroupType.KLASS, year },
    { query: { enabled: !!token } },
  )
  const { data: allGroupData } = useGroupsFindAllKlass({ year })
  const { data: niceComparison, refetch: refetchNiceComparison } = useNiceComparisonsFindOne(
    { year: String(year), month: Number(month), groupId: Number(selectedGroupId) },
    { query: { enabled: !!selectedGroupId && !!year } },
  )

  const { data: niceComparisons, refetch: refetchNiceComparisons } = useNiceComparisonsFindAll()

  const { mutate: createNiceComparison } = useNiceComparisonsCreate()
  const { mutate: updateNiceComparison } = useNiceComparisonsUpdate()
  const { mutate: deleteNiceComparison } = useNiceComparisonsDelete()

  const groups = _.chain((me?.role === 'TEACHER' ? userGroupsData : allGroupData) || [])
    .uniqBy('name')
    .sort((a, b) => {
      if (!a.name || !b.name) {
        return 0
      }
      const aData = a.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')
      const bData = b.name.match('([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반')

      if (aData?.[1] === bData?.[1]) {
        return Number(aData?.[2]) - Number(bData?.[2])
      } else {
        return Number(aData?.[1]) - Number(bData?.[1])
      }
    })
    .filter((el) => el.year === year.toString())
    .filter((el) => {
      if (me?.role === 'TEACHER') {
        return el.teacherGroups?.filter((tg) => tg.subject === '우리반').length > 0
      } else if (me?.role === 'PRE_HEAD' || me?.role === 'HEAD') {
        return el.grade === me?.headNumber
      } else if (
        me?.role === 'ADMIN' ||
        me?.role === 'PRE_PRINCIPAL' ||
        me?.role === 'PRINCIPAL' ||
        me?.role === 'VICE_PRINCIPAL' ||
        me?.role === 'HEAD_PRINCIPAL'
      ) {
        return true
      }
      return false
    })
    .value()

  const selectedGroupName = groups.find((el) => el.id === selectedGroupId)?.name

  const { data: attendeeData } = useAbsentsGetAttendeeInfo(
    {
      startDate: new Date(getSearchYearByMonth(year, month + 1), month, 1).toISOString(),
      endDate: new Date(getSearchYearByMonth(year, month + 1), month + 1, 0).toISOString(),
      selectedGroupId: selectedGroupId,
    },
    {
      query: {
        enabled: !!selectedGroupId && !!year,
      },
    },
  )

  const refetch = () => {
    refetchNiceComparison()
    refetchNiceComparisons()
  }

  const readNiceFile = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      if (!e.target) return
      const wb = XLSX.read(e.target.result)
      const wsname = wb.SheetNames[0]
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname], {
        header: 1,
        defval: '',
      })

      const niceFileContent = getNiceFileContent(data)
      setNiceFileContent(niceFileContent)

      setLoading(false)
    }
    reader.readAsArrayBuffer(file)
  }

  const getNiceFileContent = (data: any[]) => {
    const mergedData: any[] = []

    data.map((row: any) => {
      const filteredArr = Array.from<string>(row).filter((value) => value !== '')
      const obj: { [key: string]: any } = {}

      // 인정 이 빠져있는 파일을 올리는 경우 대응
      const lHeaders = filteredArr.length === headers.length ? headers : headersWithoutInjung

      for (let i = 0; i < lHeaders.length; i++) {
        const key = lHeaders[i]
        const value = filteredArr[i]
        obj[key] = value
      }

      mergedData.push(obj)
    })
    return mergedData
  }

  const getNiceComparisonContent = useCallback(
    (niceFileContent: any[]) => {
      let differenceNS = 0
      let niceEmptyNumber = 0
      let schoolEmptyNumber = 0
      const content = niceFileContent
        .slice(5)
        .filter((row) =>
          attendeeData?.find(
            (attendee) =>
              String(row['성명']).includes(attendee?.studentName) &&
              Number(attendee?.studentNumber) === Number(row['번호']) &&
              attendee?.studentExpired === false,
          ),
        )
        .map((row) => {
          return headers
            .map((header) => {
              if (['번호', '성명', '수업일수', '결석총계', '지각총계', '조퇴총계', '결과총계'].includes(header)) {
                return { [header]: { value: row[header] } }
              }
              const studentInfo = attendeeData?.filter(
                (attendee) =>
                  String(row['성명']).includes(attendee?.studentName) &&
                  Number(attendee?.studentNumber) === Number(row['번호']) &&
                  attendee?.studentExpired === false,
              )?.[0]
              if (!studentInfo) return { [header]: { value: row[header] } }

              const [header1, header2] = header.split('-')
              const schoolRowData = studentInfo[header1]?.[header2] || 0

              if (row[header] !== 0 && schoolRowData !== 0 && row[header] == schoolRowData) {
                return { [header]: { schoolData: schoolRowData, niceData: row[header] } }
              }
              if (schoolRowData !== row[header]) {
                differenceNS++
                if (schoolRowData < row[header]) {
                  schoolEmptyNumber++
                } else if (schoolRowData > row[header]) {
                  niceEmptyNumber++
                }
                return { [header]: { schoolData: schoolRowData, niceData: row[header] } }
              }
            })
            .filter((el) => !!el)
        })
      return {
        differenceNS,
        niceEmptyNumber,
        schoolEmptyNumber,
        content,
      }
    },
    [attendeeData],
  )

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const f = e.dataTransfer.files[0]
    setNiceFile(f)
    readNiceFile(f)
  }

  useEffect(() => {
    if (attendeeData && niceFileContent.length) {
      const niceComparisonContent = getNiceComparisonContent(niceFileContent)
      setNiceComparisonContent(niceComparisonContent)
      if (niceComparisonContent.content?.length) {
        if (!niceComparison) {
          createNiceComparison({
            data: {
              year: String(year),
              month,
              groupId: selectedGroupId,
              ...niceComparisonContent,
              content: `${JSON.stringify(niceComparisonContent.content)}`,
            },
          })
        } else {
          updateNiceComparison({
            id: niceComparison.id,
            data: {
              year: String(year),
              month,
              ...niceComparisonContent,
              content: `${JSON.stringify(niceComparisonContent.content)}`,
            },
          })
        }
      }
    }
  }, [
    niceFileContent,
    attendeeData,
    createNiceComparison,
    getNiceComparisonContent,
    month,
    niceComparison,
    selectedGroupId,
    updateNiceComparison,
    year,
  ])

  useEffect(() => {
    if (!niceComparison) return
    if (niceComparisonContent?.content?.length) return
    const content = JSON.parse(niceComparison.content)
    setNiceComparisonContent({ ...niceComparison, content })
  }, [niceComparison])

  const { niceEmptyNumber, schoolEmptyNumber, content } = niceComparisonContent

  const firstGroups = groups?.filter((el) => el.grade === 1) || []
  const secondGroups = groups?.filter((el) => el.grade === 2) || []
  const thirdGroups = groups?.filter((el) => el.grade === 3) || []

  const setSelectedGroupId = (groupId: number) => {
    setNiceComparisonContent({})
    setNiceFileContent([])
    setNiceFile(null)
    searchParams.set('selectedGroupId', groupId.toString())
    replace(`/teacher/absent/comparison?${searchParams.toString()}`)
  }

  const getTitle = (studNum: number, header: string) => {
    const tData = attendeeData?.find((el) => el.studentNumber === studNum.toString())
    if (tData) {
      const keys = header.split('-')

      const detail = tData[keys[0]] && tData[keys[0]][keys[1]] && tData[keys[0]][keys[1]]['detail']
      return detail || []
    } else {
      return []
    }
  }

  const getDays = (studNum: number, header: string) => {
    const tData = attendeeData?.find((el) => el.studentNumber === studNum.toString())

    if (tData) {
      const keys = header.split('-')
      const keyData = tData[keys[0]] && tData[keys[0]][keys[1]]

      return keyData ? keyData.count : 0
    } else {
      return 0
    }
  }

  const deleteNiceComparisonGroupId = (klassName: string | null, groupId: number) => {
    if (klassName) {
      if (!confirm(`${klassName} 학급의 나이스 비교 정보를 삭제할까요?`)) return

      const item = niceComparisons?.find(
        (nice) => nice.year === String(year) && nice.month === month && nice.groupId === groupId,
      )

      if (item) {
        deleteNiceComparison({ id: item.id })
        setSelectedGroupId(0)
        refetchNiceComparison()
        refetchNiceComparisons()
      }
    }
  }

  return (
    <>
      <div className="col-span-6 h-full w-full overflow-auto bg-white px-6 py-4">
        <div className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">나이스 자료 비교</h1>
            <div className="my-2 text-gray-500">
              나이스의 학급별출결현황 자료를 슈퍼스쿨의 데이터와 비교할 수 있습니다.
            </div>
          </div>
          <a
            href="https://superstudy-image.s3.ap-northeast-2.amazonaws.com/neis_guide.pdf"
            target="_blank"
            download
            className="block rounded-xl border border-gray-300 px-2 py-1 text-red-500"
          >
            NEIS 출결처리 가이드
          </a>
        </div>
        <div className="mt-2 flex items-center space-x-3">
          <Label.col>
            <Label.Text children={'학년도'} />
            <Select.lg
              value={year}
              onChange={(e) => {
                setNiceComparisonContent({})
                setNiceFileContent([])
                setNiceFile(null)
                refetch()
                searchParams.set('year', e.target.value)
                replace(`/teacher/absent/comparison?${searchParams.toString()}`)
              }}
            >
              {range(thisYear + 1, thisYear - 3, -1).map((year) => (
                <option key={year} value={year}>
                  {year}&nbsp;
                  {t('school_year')}
                </option>
              ))}
            </Select.lg>
          </Label.col>
          <Label.col>
            <Label.Text children={'월'} />
            <Select.lg
              value={month}
              onChange={(e) => {
                setNiceComparisonContent({})
                setNiceFileContent([])
                setNiceFile(null)
                refetch()
                searchParams.set('month', e.target.value)
                replace(`/teacher/absent/comparison?${searchParams.toString()}`)
              }}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1].map((month) => (
                <option key={month} value={month}>
                  {month + 1}월
                </option>
              ))}
            </Select.lg>
          </Label.col>
        </div>
        {!!groups?.length && (
          <div className="mt-4 flex w-full items-start rounded-xl border border-gray-300 bg-gray-50 px-2 py-4">
            {[firstGroups, secondGroups, thirdGroups].map((groupData, i) => (
              <div className="flex w-full flex-col space-y-1" key={i}>
                {groupData?.map((el) => (
                  <div className="text-14 flex items-center justify-start space-x-2" key={el.id}>
                    <Checkbox
                      id={'check-' + el.id}
                      checked={selectedGroupId === el.id}
                      onChange={() => {
                        selectedGroupId === el.id ? setSelectedGroupId(0) : setSelectedGroupId(el.id)
                        refetchNiceComparison()
                      }}
                    />
                    <label htmlFor={'check-' + el.id}>{el.name}</label>
                    {!!niceComparisons?.some(
                      (nice) => nice.year === String(year) && nice.month === month && nice.groupId === el.id,
                    ) && (
                      <>
                        <div className="text-sm">나이스 파일 존재</div>
                        <Button.xs
                          children="변경"
                          onClick={() => setSelectedGroupId(el.id)}
                          className="outlined-gray"
                        />
                        <Button.xs
                          children="삭제"
                          onClick={() => deleteNiceComparisonGroupId(el.name, el.id)}
                          className="filled-red"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <label
          htmlFor="nice-file"
          className={clsx(
            'my-6 block w-full rounded-lg border-2 border-dotted py-8 text-center hover:bg-yellow-50',
            isDragIn ? 'border-yellow-600 bg-yellow-50' : 'border-gray-600 bg-slate-50',
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setDragIn(false)
          }}
          onDragEnter={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setDragIn(true)
          }}
        >
          {loading
            ? '업로드 중...'
            : niceFile?.name
              ? niceFile?.name
              : content
                ? '여기에 업로드하여 저장된 파일을 업데이트할 수 있습니다.'
                : selectedGroupName
                  ? '나이스에서 다운로드받은 ' + selectedGroupName + '의 학급별출결현황 파일을 여기에 업로드하세요'
                  : '학급까지 선택 후 나이스에서 다운로드받은 학급별출결현황 파일을 여기에 업로드하세요'}
        </label>

        <input
          id="nice-file"
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setLoading(true)
              setNiceFile(file)
              readNiceFile(file)
            }

            e.target.value = ''
          }}
        />
        {!!content?.length && (
          <>
            <div className="mt-8 mb-1 font-bold">
              슈퍼스쿨로 접수한 출결서류와 NEIS로 정리한 학급별출결현황을 비교한 자료입니다.
              <br />
              NEIS 미작성 <span className="text-red-500">{niceEmptyNumber}</span>건,
              <br /> 슈퍼스쿨 미작성 <span className="text-orange-500">{schoolEmptyNumber}</span>건
              <br />
              <br />
              NEIS 자료에 미작성된 건은 <span className="text-red-500">빨간색</span>으로, 슈퍼스쿨 자료에 미작성된 건은{' '}
              <span className="text-orange-500">주황색</span>
              으로, 둘 모두 정상적으로 일치하는 결석 건은 <span className="text-green-500">초록색</span>으로 표시됩니다.
            </div>

            <table className="w-full border-collapse border border-gray-600">
              <tr className="border border-gray-600">
                {['3span', '4span결석', '4span지각', '4span조퇴', '4span결과', '4span'].map((el, i) => {
                  if (el.includes('span'))
                    return (
                      <th
                        key={String(i) + el}
                        colSpan={Number.isNaN(Number(el.slice(0, 1))) ? 1 : Number(el.slice(0, 1))}
                        className="min-w-10 border border-gray-600"
                      >
                        {el.slice(5)}
                      </th>
                    )
                  return (
                    <th key={String(i) + el} className="min-w-10 border border-gray-600 text-center">
                      {el}
                    </th>
                  )
                })}
              </tr>
              <tr>
                {tableHeaders.map((el, i) => (
                  <th key={String(i) + el} className="min-w-10 border border-gray-600 text-center">
                    {el}
                  </th>
                ))}
              </tr>
              {content
                ?.filter(
                  (el: any) =>
                    attendeeData?.find((ur) => ur.studentNumber === el[0]['번호']['value'].toString())
                      ?.studentExpired === false,
                )
                ?.map((el: any, rowIndex: number) => (
                  <tr key={`row-${rowIndex}`}>
                    {headers.map((header, colIndex) => {
                      const data = el.filter((a: any) => !!a[header])?.[0]?.[header]
                      const superschoolData = getDays(el[0]['번호']['value'], header)
                      if (!data)
                        return (
                          <td
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="min-w-10 border border-gray-600 text-center"
                          >
                            0
                          </td>
                        )
                      if (data.value)
                        return (
                          <td
                            key={`cell-${rowIndex}-${colIndex}-${data.value}`}
                            className="min-w-10 border border-gray-600 px-1 text-center whitespace-pre"
                          >
                            {data.value}
                          </td>
                        )
                      if (superschoolData || data.niceData) {
                        if ((data.niceData || 0) > superschoolData) {
                          return (
                            <td
                              key={`cell-${rowIndex}-${colIndex}`}
                              className={'min-w-10 border border-gray-600 bg-orange-500 text-center text-white'}
                            >
                              <TooltipButton data={getTitle(el[0]['번호']['value'], header)} className="flex flex-col">
                                <Tooltip value={`클릭하여 제출된 서류를 확인하세요.`} showArrow placement="top">
                                  <span className="text-gray-500 line-through">{superschoolData} </span> {data.niceData}
                                </Tooltip>
                              </TooltipButton>
                            </td>
                          )
                        } else if (superschoolData > (data.niceData || 0)) {
                          return (
                            <td
                              key={`cell-${rowIndex}-${colIndex}`}
                              className={'min-w-10 border border-gray-600 bg-red-500 text-center text-white'}
                            >
                              <TooltipButton data={getTitle(el[0]['번호']['value'], header)} className="flex flex-col">
                                <Tooltip value={`클릭하여 제출된 서류를 확인하세요.`} showArrow placement="top">
                                  <span className="cursor-pointer">{superschoolData}</span>
                                  {/* <span className="text-gray-500 line-through">{data.niceData} </span> */}
                                </Tooltip>
                              </TooltipButton>
                            </td>
                          )
                        } else if (superschoolData === (data.niceData || 0)) {
                          return (
                            <td
                              key={`cell-${rowIndex}-${colIndex}`}
                              className={'min-w-10 border border-gray-600 bg-green-500 text-center text-white'}
                            >
                              {superschoolData}
                            </td>
                          )
                        }
                      }
                      return (
                        <td
                          key={`cell-${rowIndex}-${colIndex}`}
                          className="min-w-10 border border-gray-600 text-center"
                        >
                          0
                        </td>
                      )
                    })}
                  </tr>
                ))}
            </table>
          </>
        )}
      </div>
    </>
  )
}

export default AbsentComparisonPage
