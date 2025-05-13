import { Chart as ChartJS, registerables } from 'chart.js'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { Chart } from 'react-chartjs-2'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import {
  useActivityCardGenerateGPTAnalysis,
  useActivityCardGetActivityGPTAnalysis,
  useStudentActivityV3SaveByTeacher,
} from '@/legacy/generated/endpoint'
import { ActivityV3, Record } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState, toastState } from '@/stores'

ChartJS.register(...registerables)

interface ActivityV3CardProps {
  activityv3: ActivityV3
  studentId: number
  openedCardIds: number[]
  setOpenedCardIds: Dispatch<SetStateAction<number[]>>
  checkedCardIds: number[]
  setCheckedCardIds: (cardIds: number[]) => void
  showDisabledActivity?: boolean
}

export const ActivityV3Card: FC<ActivityV3CardProps> = ({
  activityv3,
  studentId,
  openedCardIds,
  setOpenedCardIds,
  checkedCardIds,
  setCheckedCardIds,
  showDisabledActivity = false,
}) => {
  const { t } = useLanguage()
  const me = useRecoilValue(meState)
  const [toastMsg, setToastMsg] = useRecoilState(toastState)

  const sav = activityv3.studentActivityV3s?.[0]
  const [isSubmitSummary, setSubmitSummary] = useState(false)
  const [record, setRecord] = useState('')
  const [summary, setSummary] = useState('')
  const [title, setTitle] = useState('')

  const {
    data,
    isLoading: analysisLoading,
    refetch,
  } = useActivityCardGetActivityGPTAnalysis(studentId, activityv3.id, {
    query: {
      enabled: openedCardIds.includes(activityv3.id) && me?.schoolId === 2,
    },
  })
  const gptContents: any = data

  const { mutate: generateGPTAnalysis, isLoading: generateLoading } = useActivityCardGenerateGPTAnalysis({
    mutation: {
      onSuccess: () => {
        refetch()
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const { mutate: saveStudentActivityV3 } = useStudentActivityV3SaveByTeacher({
    mutation: {
      onSuccess: () => {
        setToastMsg('변경 사항이 저장되었습니다.')
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const options = {
    maintainAspectRatio: false,
    spanGaps: true,
    responsive: true,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(21, 132, 235)',
        padding: 20,
        bodySpacing: 10,
        usePointStyle: false,
        titleFont: {
          size: 16,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 14,
          weight: 'bold' as const,
        },
        filter: (item: any) => item.parsed.y !== null,
        callbacks: {
          title: () => '',
          label: (tooltipItem: any) => {
            return `${tooltipItem.label} : ${tooltipItem.raw}점`
          },
          afterLabel: (tooltipItem: any) => {
            //@ts-ignore
            const reason = Object.values(gptContents.analysis['탐구역량'])?.[tooltipItem.dataIndex]?.['근거']
            console.log(tooltipItem, ' reason ', reason)
            return `${reason.match(/.{1,20}/g).join('\n')}`
          },
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          display: false,
        },
        grid: {
          color: (context: any) => {
            if (context.index === 5) {
              return 'black' // 마지막 기준선은 검은색
            }
            return '#DDDDDD' // 나머지 기준선은 회색
          },
        },
        pointLabels: {
          font: {
            size: 16,
            weight: 'bold' as const,
          },
          padding: 20,
        },
      },
    },
    layout: {
      padding: 0,
    },
  }

  useEffect(() => {
    if (!record) setRecord(sav?.record || '')
    if (!summary) setSummary(sav?.summary || '')
    if (!title) setTitle(sav?.title || activityv3?.title || '')
  }, [sav])

  const getIsSessionSubmitted = () => {
    if (sav?.studentText || sav?.records?.length || sav?.summary) {
      return true
    }
    let isSubmitted = false
    activityv3.activitySessions?.map((session) => {
      if (session?.studentActivitySessions?.[0]?.isSubmitted) {
        isSubmitted = true
      }
    })
    return isSubmitted
  }

  const isLoading = analysisLoading || generateLoading

  if (!showDisabledActivity && !getIsSessionSubmitted()) {
    return <></>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-600">
      <div
        className="flex cursor-pointer items-center justify-between space-x-2 px-4 py-2.5"
        onClick={() =>
          openedCardIds.includes(activityv3.id)
            ? setOpenedCardIds(openedCardIds.filter((id) => activityv3.id !== id))
            : setOpenedCardIds(openedCardIds.concat(activityv3.id))
        }
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={checkedCardIds.includes(activityv3.id)}
            className="disabled:bg-gray-200"
            disabled={!getIsSessionSubmitted()}
            onChange={() =>
              checkedCardIds.includes(activityv3.id)
                ? setCheckedCardIds(checkedCardIds.filter((id) => activityv3.id !== id))
                : setCheckedCardIds(checkedCardIds.concat(activityv3.id))
            }
          />

          <div className="text-15 font-bold">
            <span className="text-brand-1 text-sm">[{activityv3.subject}]</span> {activityv3.title}
          </div>
        </div>
        {openedCardIds.includes(activityv3.id) ? <Icon.ChevronDown /> : <Icon.ChevronUp />}
      </div>

      {openedCardIds.includes(activityv3.id) && (
        <div className="h-full w-full bg-white">
          {/* GPT 분석 내용 */}
          {isLoading ? (
            <div className="text-16 flex w-full justify-center space-x-2 py-4 text-center text-gray-600">
              <span className="h-6 w-6 animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <div> GPT 분석 결과를 불러오는 중입니다...</div>
            </div>
          ) : (
            <>
              {gptContents && (
                <div className="flex w-full flex-col space-y-2 border-b border-gray-300 px-4 py-2">
                  <div className="text-16 mb-1 font-bold">탐구 역량</div>
                  <div className="relative -mt-2 -mb-2 h-[300px] w-full overflow-hidden">
                    <div className="h-[calc(100% + 40px)] absolute -top-2 right-0 -bottom-2 left-0">
                      <Chart
                        type="radar"
                        datasetIdKey="id"
                        options={options}
                        data={{
                          labels: Object.keys(gptContents.analysis['탐구역량']),
                          datasets: [
                            {
                              label: '근거',
                              data: Object.values(gptContents.analysis['탐구역량']).map((el: any) => el['점수']),
                              fill: true,
                              backgroundColor: 'rgba(255, 127, 34, 0.32)',
                              borderColor: '#FF7F22',
                              pointBackgroundColor: '#FF7F22',
                              pointBorderColor: '#FF7F22',
                              pointStyle: 'circle',
                              borderWidth: 2,
                              pointRadius: 8,
                              pointHoverRadius: 10,
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-16 font-bold">인성 역량</div>
                  {gptContents.analysis['인성역량']['인성역량'].map((value: any) => (
                    <div key={value} className="text-16 flex w-max rounded-md border border-gray-500 px-3 py-1">
                      {value}
                    </div>
                  ))}
                  <div className="text-16 font-bold">인성 역량 평가 근거</div>
                  <div className="text-14">{gptContents.analysis['인성역량']['근거']}</div>
                </div>
              )}
            </>
          )}
          {/* 차시 내용 */}
          <div className="w-full border-b border-gray-300 px-4 py-2">
            <h1 className="font-semibold">차시 정보</h1>
            {activityv3.activitySessions?.map((session) => (
              <div className="text-14 flex w-full items-center justify-between py-0.5">
                <p>{session?.title}</p>
                <p>
                  {session?.studentActivitySessions?.[0]?.isSubmitted ? (
                    <span className="text-brand-1">제출</span>
                  ) : (
                    <span className="text-gray-500">미제출</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* 활동 내용 */}
          <div className="w-full border-b border-gray-300 px-4 py-2">
            <h1 className="font-semibold">공통문구</h1>
            <p className="text-13 leading-5">{activityv3.commonText}</p>
          </div>
          <div className="w-full border-b border-gray-300 px-4 py-2">
            <div className="flex w-full items-center justify-between">
              <h1 className="font-semibold">학생 활동 보고서</h1>
              <p className="text-14">
                {sav?.studentText ? (
                  <span className="text-brand-1">제출</span>
                ) : (
                  <span className="text-gray-500">미제출</span>
                )}
              </p>
            </div>
            <p className="text-12 leading-5 text-gray-500">학생이 작성한 내용입니다.</p>
            <p className="text-13 leading-5">{sav?.studentText}</p>
          </div>
          <div className="w-full border-b border-gray-300 px-4 py-2">
            <h1 className="font-semibold">{t('observation_record', '관찰 기록')}</h1>
            <p className="text-12 leading-5 text-gray-500">
              {t('text_activity_memo', '활동기록에서 활동 진행 중 학생에 대한 메모를 하실 수 있습니다.')}
            </p>
            <p className="text-13 leading-5 whitespace-pre-line">
              {sav?.records?.map((record: Record) => (
                <>
                  <span>{record?.content}</span>
                  <br />
                </>
              ))}
            </p>
          </div>
          <div className="w-full border-b border-gray-300 px-4 py-2">
            <h1 className="font-semibold">활동요약</h1>
            <p className="text-12 leading-5 text-gray-500">
              공통문구, 학생 활동 보고서, 관찰 기록을 기반으로 활동요약을 작성합니다.
            </p>
            {isSubmitSummary ? (
              <>
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="활동요약 제목"
                  className="mt-2"
                />
                <Textarea
                  className="text-13 mt-2 rounded-lg border border-gray-300 p-2 leading-5"
                  value={summary}
                  placeholder="활동요약 내용을 작성해주세요."
                  onChange={(e) => setSummary(e.target.value)}
                />
                <div className="mt-2 flex w-full items-center space-x-2">
                  <Button
                    className="w-full border border-gray-800 bg-gray-50 text-gray-800"
                    onClick={() => setSummary(activityv3.commonText + '\n' + sav?.studentText + '\n' + record)}
                  >
                    불러오기
                  </Button>
                  <Button
                    className="border-brand-1 text-brand-1 w-full border"
                    onClick={() =>
                      saveStudentActivityV3({
                        params: { activityv3Id: activityv3.id, userId: studentId },
                        data: { record, summary, title },
                      })
                    }
                  >
                    저장하기
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  {sav?.title && (
                    <p className="text-14 w-full border-b border-gray-300 leading-5 whitespace-pre-line">
                      {sav?.title}
                    </p>
                  )}
                  {sav?.summary && <p className="text-13 leading-5 whitespace-pre-line">{sav.summary}</p>}
                </div>
                {me?.schoolId !== 183 && (
                  <Button
                    className="mt-2 w-full border border-gray-500 disabled:bg-gray-200"
                    disabled={isLoading}
                    onClick={() =>
                      generateGPTAnalysis({
                        studentId,
                        activityId: activityv3.id,
                      })
                    }
                  >
                    {gptContents
                      ? t('update_ai_activity_analysis', '활동 AI 분석 업데이트하기')
                      : t('ai_analyze_activity', '활동 AI 분석하기')}
                  </Button>
                )}
                <Button
                  className="border-brand-1 text-brand-1 mt-1 w-full border"
                  onClick={() => setSubmitSummary(true)}
                >
                  {sav?.summary ? '수정하기' : '작성하기'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
