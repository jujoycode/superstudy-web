import { Fieldtrip } from '@/legacy/generated/model'
import { makeDateToString2 } from '@/legacy/util/time'

interface FieldtripSeparatePaperProps {
  studentName?: string
  studentGradeKlass?: string
  index: number
  content: any
  fieldtrip: Fieldtrip | undefined
  type: '신청서' | '결과보고서'
}

export function FieldtripSeparatePaper({
  studentName,
  studentGradeKlass,
  index,
  content,
  fieldtrip,
  type = '신청서',
}: FieldtripSeparatePaperProps) {
  let homeContentType = 'Time'

  if (fieldtrip?.type === 'HOME' && content && Array.isArray(content) && content[0].day) {
    homeContentType = 'Day'
  }

  if (type === '신청서') {
    return (
      <div className="text-xs md:px-12 md:pt-10 md:text-base">
        <div className="flex w-full justify-center">
          <h5 className="text-sm font-bold md:text-xl">「학교장허가 가정학습」 {type}(별지)</h5>
        </div>
        <div className="-mt-0.5 flex justify-center pt-10">
          <table className="w-full table-fixed border-2 border-black">
            <thead>
              <tr className="h-8">
                <th className="border border-black bg-gray-200" colSpan={3}>
                  성명
                </th>
                <td className="border border-black text-center" colSpan={6}>
                  {studentName}
                </td>
                <th className="border border-black bg-gray-200" colSpan={7}>
                  {studentGradeKlass}
                </th>
                <th className="border border-black" colSpan={7}>
                  {homeContentType === 'Time' ? (index + 1).toString() + '일차' : ''}
                </th>
              </tr>
              <tr className="h-8">
                <th className="border border-black bg-gray-200" colSpan={9}>
                  교외체험학습 기간
                </th>
                <td className="border border-black text-center" colSpan={14}>
                  {makeDateToString2(fieldtrip?.startAt || '')} ~ {makeDateToString2(fieldtrip?.endAt || '')} (
                  {fieldtrip?.usedDays}) 일간
                </td>
              </tr>
            </thead>
            <tbody>
              {/* 왼쪽 교외체험 학습결과 || rowSpan 총 8개인데 10개여야 정상 작동 하는 버그 있습니다.*/}
              <td
                className="h-full border border-black text-center font-bold"
                colSpan={3}
                rowSpan={homeContentType === 'Time' ? 9 : 11}
              >
                교외체험 <br /> 학습계획
              </td>
              {homeContentType === 'Time' ? (
                <>
                  {/* 첫째 줄 start */}
                  <tr>
                    <td className="h-6 border border-black text-center" colSpan={2}>
                      교시
                    </td>
                    <td className="h-6 border border-black text-center" colSpan={4}>
                      교과
                    </td>
                    <th className="h-6 border border-black text-center" colSpan={14}>
                      ※ 학습할 내용을 기록합니다.
                    </th>
                  </tr>
                  {/* 첫째 줄 end */}

                  {new Array(7).fill('').map((_: any, i: number) => (
                    <>
                      <tr>
                        <td className="h-20 border border-black text-center text-blue-700" colSpan={2}>
                          {i + 1}
                        </td>
                        <td className="h-20 border border-black text-center" colSpan={4}>
                          {content['subject' + (i + 1)] && content['subject' + (i + 1)]}
                        </td>
                        <td className="h-20 border border-black text-left" colSpan={14}>
                          {content['content' + (i + 1)] && content['content' + (i + 1)]}
                        </td>
                      </tr>
                    </>
                  ))}
                </>
              ) : (
                <>
                  {new Array(10).fill('').map((_: any, i: number) => (
                    <>
                      <tr>
                        <td className="h-16 border border-black text-center" colSpan={4}>
                          {content[i] && content[i].day + '일차'}
                        </td>
                        <td className="h-16 border border-black text-left text-sm" colSpan={16}>
                          {content[i] && content[i].content}
                        </td>
                      </tr>
                    </>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  } else if (type === '결과보고서') {
    return (
      <div className="text-xs md:px-12 md:pt-10 md:text-base">
        <div className="w-full text-center text-sm font-bold md:text-xl">「학교장허가 가정학습」 {type}(별지)</div>
        <div className="mt-10 mb-20 flex justify-center">
          <table className="w-full table-fixed border-2 border-black">
            <thead>
              <tr className="h-8">
                <th className="border border-black bg-gray-200" colSpan={3}>
                  성명
                </th>
                <td className="border border-black text-center" colSpan={6}>
                  {studentName}
                </td>
                <th className="border border-black bg-gray-200 text-center" colSpan={7}>
                  {studentGradeKlass}
                </th>
                <th className="border border-black" colSpan={7}>
                  {homeContentType === 'Time' ? (index + 1).toString() + '일차' : ''}
                </th>
              </tr>
              <tr className="h-8">
                <th className="border border-black bg-gray-200 text-center" colSpan={9}>
                  교외체험학습 기간
                </th>
                <td className="border border-black text-center" colSpan={14}>
                  {makeDateToString2(fieldtrip?.startAt || '')} ~ {makeDateToString2(fieldtrip?.endAt || '')} (
                  {fieldtrip?.usedDays}) 일간
                </td>
              </tr>
            </thead>
            <tbody>
              {/* 왼쪽 교외체험 학습결과 || rowSpan 총 8개인데 10개여야 정상 작동 하는 버그 있습니다.*/}
              <td
                className="h-full border border-black text-center font-bold"
                colSpan={3}
                rowSpan={homeContentType === 'Time' ? 10 : 11}
              >
                교외체험 <br />
                학습결과
              </td>

              {homeContentType === 'Time' ? (
                <>
                  {/* 첫째 줄 start */}
                  <tr>
                    <td className="h-6 border border-black text-center" colSpan={2} rowSpan={1}>
                      교시
                    </td>
                    <td className="h-6 border border-black text-center" colSpan={4} rowSpan={1}>
                      교과
                    </td>
                    <th className="h-6 border border-black text-left" colSpan={14} rowSpan={1}>
                      학습내용
                    </th>
                    {/* <th className="h-3 border border-black text-center" colSpan={4}>
                      학습확인
                    </th> */}
                  </tr>
                  {/* <tr>
                    <th className="h-3 border border-black text-center" colSpan={2}>
                      학생
                    </th>
                    <th className="h-3 border border-black text-center" colSpan={2}>
                      교사
                    </th>
                  </tr> */}
                  {/* 첫째 줄 end */}

                  {new Array(7).fill('').map((_: any, i: number) => (
                    <>
                      <tr>
                        <td className="h-20 border border-black px-4 text-center text-blue-700" colSpan={2}>
                          {i + 1}
                        </td>
                        <td className="h-20 border border-black px-4 text-center" colSpan={4}>
                          {content['subject' + (i + 1)] && content['subject' + (i + 1)]}
                        </td>
                        <td className="h-20 border border-black px-4 text-left" colSpan={14}>
                          {content['content' + (i + 1)] && content['content' + (i + 1)]}
                        </td>

                        {/* <td className="h-20 border border-black px-4 text-center" colSpan={2}>
                          O
                        </td>
                        <td className="h-20 border border-black px-4 text-center" colSpan={2}>
                          O
                        </td> */}
                      </tr>
                    </>
                  ))}
                </>
              ) : (
                <>
                  {new Array(10).fill('').map((_: any, i: number) => (
                    <>
                      <tr>
                        <td className="h-16 border border-black text-center" colSpan={4}>
                          {content[i] && content[i].day + '일차'}
                        </td>
                        <td className="h-16 border border-black text-left text-sm" colSpan={16}>
                          {content[i] && content[i].content}
                        </td>
                      </tr>
                    </>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  } else {
    return <></>
  }
}
