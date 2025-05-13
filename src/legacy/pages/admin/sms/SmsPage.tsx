import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { range } from 'lodash'
import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { CoachMark } from 'react-coach-mark'

import { FrontPagination } from '@/legacy/components'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { CoachPosition, type Guide, useCoachMark } from '@/legacy/components/common/CoachMark'
import { TextInput } from '@/legacy/components/common/TextInput'
import {
  useSmsGetFieldtripsByTeacher,
  useSmsManagementGetCreditCharge,
  useSmsManagementGetCreditRemain,
  useSmsManagementGetStatistics,
} from '@/legacy/generated/endpoint'
import { type SmsCreditHistory } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { isValidDate, makeDateToString } from '@/legacy/util/time'

export function SmsPage() {
  const { t } = useLanguage()
  const thisYear = new Date().getFullYear()
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1)

  const [page, setPage] = useState(1)
  const limit = 10

  const [startDate, setStartDate] = useState<string | undefined>(makeDateToString(new Date()))
  const [endDate, setEndDate] = useState<string | undefined>(makeDateToString(new Date()))

  const [statistics, setStatistics] = useState<SmsCreditHistory[] | undefined>()

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

  const { data: creditRemain } = useSmsManagementGetCreditRemain()

  useSmsManagementGetStatistics(
    {
      startDate: makeDateToString(new Date(thisYear, selMonth === 0 ? 0 : selMonth - 1, 1)),
      endDate: makeDateToString(new Date(thisYear, selMonth === 0 ? 12 : selMonth, 0)),
    },
    {
      query: {
        enabled: true,
        onSuccess: (data) => {
          data.sort((a, b) => a.calculateAt.localeCompare(b.calculateAt))

          const uniqueData = data.filter((item, index, array) => {
            return index === 0 || item.calculateAt !== array[index - 1].calculateAt
          })

          setStatistics(uniqueData)
        },
      },
    },
  )

  const dataChart = {
    labels: statistics?.map((data) => data.calculateAt),
    datasets: [
      {
        label: t('daily_usage_amount'),
        backgroundColor: 'rgb(255, 99, 132)',
        data: statistics?.map((data) => data.usageCredit),
      },
      {
        label: t('cumulative_usage_amount'),
        backgroundColor: 'rgb(75, 192, 192)',
        data: statistics?.map((data) => data.accumulateUsageCredit),
      },
      {
        label: t('remaining_amount'),
        backgroundColor: 'rgb(54, 162, 235)',
        data: statistics?.map((data) => data.remainCredit),
      },
    ],
  }

  const { data: chargeHistory } = useSmsManagementGetCreditCharge({
    startDate: '2024-01-01',
    endDate: '2099-12-31',
  })

  const { data: smsHistoryList } = useSmsGetFieldtripsByTeacher(
    {
      startDate: startDate || '',
      endDate: endDate || '',
      withSuccess: true,
      withFail: false,
      page: page,
      limit: limit,
    },
    {
      query: {
        enabled: !!startDate && !!endDate,
      },
    },
  )

  const coachList: Array<Guide> = [
    {
      comment: (
        <div>
          {t('click_legend_to_toggle_data')}
          <br /> {t('click_to_hide_unwanted_data')}
        </div>
      ),
      location: CoachPosition.TOP,
    },
    {
      comment: <div>{t('contact_superschool_for_charge')}</div>,
    },
  ]
  const { coach, refs } = useCoachMark('smsAdmin', coachList)

  return (
    <div className="flex w-full">
      {<CoachMark {...coach} />}
      <Admin.Section className="w-1/2">
        <Admin.H2>{t('sms_usage_history')}</Admin.H2>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Select value={selMonth} onChange={(e) => setSelMonth(Number(e.target.value))}>
              {/* <option key={0} value={0}>
                월별 보기
              </option> */}
              {range(1, 12 + 1, 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                  {t('monthly_daily_view')}
                </option>
              ))}
            </Select>
          </div>

          <Label.col className="text-right">
            {t('remaining_balance')} : {creditRemain?.remainCredit.toLocaleString() + t('won')}
          </Label.col>
        </div>

        <div ref={refs[0]} className="w-full">
          <Line data={dataChart} />
        </div>
        <br />
        <div className="flex gap-2" ref={refs[1]}>
          <Admin.H2>{t('charge_history')}</Admin.H2>
          <Button.sm
            children={t('charge')}
            onClick={() => window.open('http://superstudy.channel.io/', '_blank')}
            className="outlined-gray"
          />
        </div>

        <Admin.Table>
          <Admin.TableHead>
            <Admin.TableRow>
              <Admin.TableHCell children={t('date')} />
              <Admin.TableHCell children={t('amount')} />
              <Admin.TableHCell children={t('remarks')} />
            </Admin.TableRow>
          </Admin.TableHead>
          <Admin.TableBody>
            {chargeHistory?.map((item, i) => (
              <Admin.TableRow key={i}>
                <Admin.TableCell children={makeDateToString(item.createdAt)} />
                <Admin.TableCell children={item.chargeCredit.toLocaleString() + t('won')} />
                <Admin.TableCell children={item.chargeReason} />
              </Admin.TableRow>
            ))}
          </Admin.TableBody>
        </Admin.Table>
      </Admin.Section>

      <Admin.Section className="w-1/2">
        <Admin.H2>{t('sms_sending_history')}</Admin.H2>

        <div className="scroll-box h-screen-10 pb-10">
          <div className="my-3 flex items-center space-x-3">
            <TextInput
              type="date"
              value={makeDateToString(new Date(startDate || ''))}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value)
                if (!isValidDate(selectedDate)) {
                  return
                }
                if (endDate && selectedDate > new Date(endDate || '')) {
                  setEndDate(e.target.value)
                }
                setStartDate(e.target.value)
                setPage(1)
              }}
            />
            <div className="px-4 text-xl font-bold">~</div>
            <TextInput
              type="date"
              value={makeDateToString(new Date(endDate || ''))}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value)
                if (!isValidDate(selectedDate)) {
                  return
                }
                if (startDate && selectedDate < new Date(startDate || '')) {
                  setStartDate(e.target.value)
                }
                setEndDate(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <Admin.Table>
            <Admin.TableHead>
              <Admin.TableRow>
                <Admin.TableHCell children={t('sending_date')} />
                <Admin.TableHCell children={t('sender')} />
                <Admin.TableHCell children={t('receiver')} />
                <Admin.TableHCell children={t('content')} />
              </Admin.TableRow>
            </Admin.TableHead>
            <Admin.TableBody>
              {smsHistoryList?.items.map((item) => (
                <Admin.TableRow key={item.id}>
                  <Admin.TableCell children={format(new Date(item.createdAt), 'yyyy.MM.dd HH:mm:ss', { locale: ko })} />
                  <Admin.TableCell children={item.senderName} />
                  <Admin.TableCell
                    children={(item.receiverName || item.receiverPhone || '') + (item.useNokInfo ? t('parent') : '')}
                  />
                  <Admin.TableCell children={item.content} />
                </Admin.TableRow>
              ))}
            </Admin.TableBody>
          </Admin.Table>

          {smsHistoryList && smsHistoryList?.total > limit && (
            <div className="grid place-items-center">
              <FrontPagination
                basePath="/admin/sms"
                total={smsHistoryList?.total}
                limit={limit}
                page={page}
                setPage={setPage}
              />
            </div>
          )}
        </div>
      </Admin.Section>
    </div>
  )
}
