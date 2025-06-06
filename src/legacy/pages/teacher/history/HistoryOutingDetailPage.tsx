import { useEffect } from 'react'
import { useParams } from 'react-router'

import { Blank, Section } from '@/legacy/components/common'
import { useTeacherOutingDetail } from '@/legacy/container/teacher-outing-detail'
import { OutingTypeEnum, ResponsePaginatedOutingDto } from '@/legacy/generated/model'
import { useSignedUrl } from '@/legacy/lib/query'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getNickName } from '@/legacy/util/status'

interface HistoryOutingDetailPageProps {
  outings?: ResponsePaginatedOutingDto
  setOpen: (b: boolean) => void
  setOutingId: (n: number) => void
  setAgreeAll: (b: boolean) => void
}

export function HistoryOutingDetailPage({ outings, setOutingId }: HistoryOutingDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const outing = outings?.items?.filter((el) => el.id === Number(id))[0]

  const { isLoading } = useTeacherOutingDetail(Number(id))

  useEffect(() => {
    setOutingId(Number(id))
  }, [id, setOutingId])

  const updatedAt = DateUtil.formatDate(outing?.updatedAt || '', DateFormat['YYYY-MM-DD HH:mm'])
  const startAt = DateUtil.formatDate(outing?.startAt || '', DateFormat['YYYY-MM-DD HH:mm'])
  const endAt = DateUtil.formatDate(outing?.endAt || '', DateFormat['YYYY-MM-DD HH:mm'])

  const { data: approver1Signature } = useSignedUrl(outing?.approver1Signature)
  const { data: approver2Signature } = useSignedUrl(outing?.approver2Signature)
  const { data: approver3Signature } = useSignedUrl(outing?.approver3Signature)
  const { data: approver4Signature } = useSignedUrl(outing?.approver4Signature)
  const { data: approver5Signature } = useSignedUrl(outing?.approver5Signature)

  if (!outing) {
    return <div className="h-screen-14 rounded-lg border bg-white p-5"></div>
  }

  return (
    <>
      <div className="h-screen-12 md:h-screen-10 bg-white py-5 md:m-6 md:rounded-lg md:border">
        {isLoading && <Blank reversed />}

        <div className="overflow-scroll-auto h-screen-10 relative w-auto">
          <Section>
            {outing?.updateReason && (
              <div className="bg-primary-100 flex items-center justify-between rounded-lg px-5 py-2">
                <div className="text-primary-800">{outing?.updateReason}</div>
                <div className="text-sm text-gray-500">{updatedAt}에 마지막으로 수정</div>
              </div>
            )}
            {outing?.outingStatus === 'RETURNED' && (
              <div className="bg-primary-100 flex items-center justify-between rounded-lg px-5 py-2">
                <div className="text-primary-800 text-sm">{outing?.notApprovedReason}</div>
                <div className="text-red-500">반려 이유</div>
              </div>
            )}

            <div className="w-full min-w-max text-center text-3xl font-bold">
              {outing?.type ? outing.type + '증' : ''}
            </div>
            <div className="text-xl font-bold">
              [{outing?.type}] {outing?.studentName}
              {getNickName(outing?.studentNickName)} {outing?.studentGradeKlass} {outing?.studentNumber}번
            </div>

            <table className="w-full text-center">
              <tbody>
                <tr>
                  <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">이름</td>
                  <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                    {outing?.studentName}
                    {getNickName(outing?.studentNickName)}
                  </td>
                </tr>
                <tr>
                  <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">학번</td>
                  <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                    {outing?.studentGradeKlass} {outing?.studentNumber}번
                  </td>
                </tr>
                <tr>
                  <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">유형</td>
                  <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                    {outing?.type === OutingTypeEnum.확인 && outing?.type2} {outing?.type}
                  </td>
                </tr>
                <tr>
                  <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">사유</td>
                  <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                    {outing?.reason}
                  </td>
                </tr>
                <tr>
                  <td className="w-1/3 border border-gray-900 p-2 text-center font-bold text-gray-800">일시</td>
                  <td className="w-2/3 border border-gray-900 p-2 text-center font-bold text-gray-500">
                    {startAt}&nbsp;~&nbsp;{endAt}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="my-6">
              {outing?.approver1Title && (
                <div className="flex w-full items-center justify-end space-x-2">
                  <div>
                    <div className="flex w-full flex-col items-end">
                      {
                        <div
                          className="h-20 bg-contain bg-right bg-no-repeat"
                          style={{ backgroundImage: `url(${approver1Signature})` }}
                        >
                          <div className="mt-5 mr-10 min-w-max text-right font-bold">
                            {outing?.approver1Title}: {outing?.approver1Name} &nbsp;&nbsp;&nbsp;
                            {outing?.approver1Signature ? ' (인)' : '승인 전'}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              )}

              {outing?.approver2Title && (
                <div className="flex w-full items-center justify-end space-x-2">
                  <div>
                    <div className="flex w-full flex-col items-end">
                      {
                        <div
                          className="h-20 bg-contain bg-right bg-no-repeat"
                          style={{ backgroundImage: `url(${approver2Signature})` }}
                        >
                          <div className="mt-5 mr-10 min-w-max text-right font-bold">
                            {outing?.approver2Title}: {outing?.approver2Name} &nbsp;&nbsp;&nbsp;
                            {outing?.approver2Signature ? ' (인)' : '승인 전'}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              )}

              {outing?.approver3Title && (
                <div className="flex w-full items-center justify-end space-x-2">
                  <div>
                    <div className="flex w-full flex-col items-end">
                      {
                        <div
                          className="h-20 bg-contain bg-right bg-no-repeat"
                          style={{ backgroundImage: `url(${approver3Signature})` }}
                        >
                          <div className="mt-5 mr-10 min-w-max text-right font-bold">
                            {outing?.approver3Title}: {outing?.approver3Name} &nbsp;&nbsp;&nbsp;
                            {outing?.approver3Signature ? ' (인)' : '승인 전'}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              )}

              {outing?.approver4Title && (
                <div className="flex w-full items-center justify-end space-x-2">
                  <div>
                    <div className="flex w-full flex-col items-end">
                      {
                        <div
                          className="h-20 bg-contain bg-right bg-no-repeat"
                          style={{ backgroundImage: `url(${approver4Signature})` }}
                        >
                          <div className="mt-5 mr-10 min-w-max text-right font-bold">
                            {outing?.approver4Title}: {outing?.approver4Name} &nbsp;&nbsp;&nbsp;
                            {outing?.approver4Signature ? ' (인)' : '승인 전'}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              )}

              {outing?.approver5Title && (
                <div className="flex w-full items-center justify-end space-x-2">
                  <div>
                    <div className="flex w-full flex-col items-end">
                      {
                        <div
                          className="h-20 bg-contain bg-right bg-no-repeat"
                          style={{ backgroundImage: `url(${approver5Signature})` }}
                        >
                          <div className="mt-5 mr-10 min-w-max text-right font-bold">
                            {outing?.approver5Title}: {outing?.approver5Name} &nbsp;&nbsp;&nbsp;
                            {outing?.approver5Signature ? ' (인)' : '승인 전'}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
