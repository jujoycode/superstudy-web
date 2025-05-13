import { add } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import { useSchoolWording } from '@/legacy/container/school-wording'
import { Fieldtrip, ResponseUserDto } from '@/legacy/generated/model'
import { useSignedUrl } from '@/legacy/lib/query'
import { meState } from '@/stores'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getNickName } from '@/legacy/util/status'
import { getCustomString } from '@/legacy/util/string'
import { fieldtripPeriodDayCnt, makeDateToString2 } from '@/legacy/util/time'
import { Td2 } from '../Td2'
import { Checkbox } from '../common/Checkbox'

interface FieldtripPaperProps {
  school: ResponseUserDto['school'] | undefined
  fieldtrip: Fieldtrip | undefined
  content?: any
  type: '신청서' | '통보서' | '결과보고서'
  resultTextPage1?: string | undefined
  isPaper?: boolean
}

const forms = ['가족동반여행', '친·인척 방문', '답사∙견학 활동', '체험활동']

export function FieldtripPaper({ school, fieldtrip, content, type, resultTextPage1, isPaper }: FieldtripPaperProps) {
  const { data: approver1Signature } = useSignedUrl(fieldtrip?.approver1Signature)
  const { data: approver2Signature } = useSignedUrl(fieldtrip?.approver2Signature)
  const { data: approver3Signature } = useSignedUrl(fieldtrip?.approver3Signature)
  const { data: approver4Signature } = useSignedUrl(fieldtrip?.approver4Signature)
  const { data: approver5Signature } = useSignedUrl(fieldtrip?.approver5Signature)
  const { data: resultApprover1Signature } = useSignedUrl(fieldtrip?.resultApprover1Signature)
  const { data: resultApprover2Signature } = useSignedUrl(fieldtrip?.resultApprover2Signature)
  const { data: resultApprover3Signature } = useSignedUrl(fieldtrip?.resultApprover3Signature)
  const { data: resultApprover4Signature } = useSignedUrl(fieldtrip?.resultApprover4Signature)
  const { data: resultApprover5Signature } = useSignedUrl(fieldtrip?.resultApprover5Signature)

  const meRecoil = useRecoilValue(meState)

  const schoolName = school?.name
  const [agree, setAgree] = useState(true)

  const { t } = useTranslation()

  const { sHalfUsedDayCnt, wholeUsedDayCnt, eHalfUsedDayCnt } = fieldtripPeriodDayCnt(
    fieldtrip?.usedDays,
    fieldtrip?.startPeriodS,
    fieldtrip?.endPeriodE,
  )

  const { fieldtripSafety, fieldtripResultGuide } = useSchoolWording()

  let homeContentType = 'Time'

  if (type === '신청서') {
    // if (!content) {
    if (fieldtrip?.type === 'HOME') {
      try {
        content = JSON.parse(fieldtrip?.content || '')
      } catch (err) {
        console.log(err)
      }
    } else if (fieldtrip?.type === 'SUBURBS') {
      content = fieldtrip?.content
    }
    // }

    if (fieldtrip?.type === 'HOME' && content && content[0].day) {
      homeContentType = 'Day'
    }
    return (
      <div className="text-xs md:px-12 md:pt-12 md:text-base">
        <div className="flex w-full justify-end">
          <h5 className="mt-4 w-full text-center text-sm font-bold md:text-xl">
            「학교장허가 {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'}」 신청서
          </h5>
          <table className="min-w-max border-2 border-black">
            <tr>
              {fieldtrip?.approver1Title && <Td2 className="h-4 whitespace-pre">{fieldtrip?.approver1Title}</Td2>}
              {fieldtrip?.approver2Title && <Td2 className="h-4 whitespace-pre">{fieldtrip?.approver2Title}</Td2>}
              {fieldtrip?.approver3Title && <Td2 className="h-4 whitespace-pre">{fieldtrip?.approver3Title}</Td2>}
              {fieldtrip?.approver4Title && <Td2 className="h-4 whitespace-pre">{fieldtrip?.approver4Title}</Td2>}
              {fieldtrip?.approver5Title && <Td2 className="h-4 whitespace-pre">{fieldtrip?.approver5Title}</Td2>}
            </tr>
            <tr>
              {fieldtrip?.approver1Title && (
                <Td2 className="h-10">
                  {approver1Signature && (
                    <img src={approver1Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.approver2Title && (
                <Td2 className="h-10">
                  {approver2Signature && (
                    <img src={approver2Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.approver3Title && (
                <Td2 className="h-10">
                  {approver3Signature && (
                    <img src={approver3Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.approver4Title && (
                <Td2 className="h-10">
                  {approver4Signature && (
                    <img src={approver4Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.approver5Title && (
                <Td2 className="h-10">
                  {approver5Signature && (
                    <img src={approver5Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
            </tr>
          </table>
        </div>
        <div className="-mt-0.5 flex justify-center">
          <table className="w-full table-fixed border-2 border-black text-center">
            <tr>
              <th className="border border-black bg-gray-200" colSpan={4}>
                이름
              </th>
              <td className="border border-black" colSpan={5}>
                {fieldtrip?.student?.name}
                {getNickName(fieldtrip?.student?.nickName)}
              </td>
              <th className="border border-black bg-gray-200" colSpan={5}>
                학년 / 반 / 번호
              </th>
              <th className="border border-black" colSpan={5}>
                {fieldtrip?.studentGradeKlass} {fieldtrip?.studentNumber}번
              </th>
              <td className="border border-black break-words" colSpan={4}>
                {fieldtrip?.student?.phone}
              </td>
            </tr>

            <tr className="h-0">
              <th className="border border-black bg-gray-200 break-normal" colSpan={3} rowSpan={4}>
                본교 출석인정기간 연간({school?.fieldtripDays}
                )일
              </th>
              <th className="border border-black bg-gray-200" colSpan={3} rowSpan={3}>
                신청 기간
              </th>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={11}>
                {sHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}{' '}
                    {fieldtrip?.usedDays && fieldtrip?.usedDays < 1 && fieldtrip?.endPeriodE > 0 ? (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시~
                        {fieldtrip?.endPeriodE}교시
                      </>
                    ) : (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시부터
                      </>
                    )}{' '}
                    ({sHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
              <th className="border border-black" colSpan={3} rowSpan={3}>
                총({fieldtrip?.usedDays})일
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                1일 기준
              </th>
              <th className="border border-black" colSpan={11}>
                {(sHalfUsedDayCnt > 0 || eHalfUsedDayCnt > 0) && wholeUsedDayCnt > 0 && (
                  <>
                    {fieldtrip?.wholeDayPeriod} ({wholeUsedDayCnt}
                    일)
                  </>
                )}
                {sHalfUsedDayCnt === 0 && eHalfUsedDayCnt === 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}~
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} ({fieldtrip?.usedDays}) 일간
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={11}>
                {eHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} {fieldtrip?.endPeriodE}
                    교시까지 ({eHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black text-sm" colSpan={16}>
                우리 학교 학교장허가 {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'} 세부 규정 및 불허 기간
                확인
                <p></p> ※ 담임교사와의 사전 협의 또는 문의
              </th>
              <td className="border border-black text-center" colSpan={4}>
                확인 ( O )
              </td>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                학습형태
              </th>
              <td className="border border-black text-center font-bold" colSpan={20}>
                <div className="items-center justify-center space-x-2 text-sm">
                  {fieldtrip?.type === 'SUBURBS' && (
                    <>
                      {forms.map((f: string) => (
                        <span className={`${fieldtrip?.form === f && 'text-blue-600'}`}>
                          ∘{f}( {fieldtrip?.form === f && '○'} )
                        </span>
                      ))}
                    </>
                  )}
                  {fieldtrip?.type === 'HOME' && (
                    <>
                      {forms.map((f: string) => (
                        <span>∘{f}( )</span>
                      ))}
                      <span className="text-blue-600">∘가정학습( ○ )</span>
                    </>
                  )}
                </div>
              </td>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                목적지
              </th>
              <td className="border border-black text-center" colSpan={11}>
                {fieldtrip?.destination}{' '}
                {fieldtrip?.overseas && ` (${t(getCustomString(school?.id, 'oversea'), '해외')})`}
              </td>
              <th className="border border-black" colSpan={4}>
                <div className="">
                  <p className="text-sm font-normal">(숙박시)</p> 숙박장소
                </div>
              </th>
              <td className="border border-black" colSpan={5}>
                {fieldtrip?.accommodation}
              </td>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                보호자명
              </th>
              <td className="border border-black text-center" colSpan={6}>
                {fieldtrip?.student?.nokName}
              </td>
              <th className="border border-black" colSpan={2}>
                관계
              </th>
              <td className="border border-black" colSpan={3}>
                보호자
              </td>
              <th className="border border-black" colSpan={4}>
                휴대폰
              </th>
              <td className="border border-black break-words" colSpan={5}>
                {fieldtrip?.student?.nokPhone}
              </td>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                인솔자명
              </th>
              <td className="border border-black text-center" colSpan={6}>
                {fieldtrip?.guideName}
              </td>
              <th className="border border-black" colSpan={2}>
                관계
              </th>
              <td className="border border-black" colSpan={3}>
                {fieldtrip?.relationship}
              </td>
              <th className="border border-black" colSpan={4}>
                휴대폰
              </th>
              <td className="border border-black break-words" colSpan={5}>
                {fieldtrip?.guidePhone}
              </td>
            </tr>

            <tr>
              <th className="h-12 border border-black bg-gray-200" colSpan={3}>
                목적
              </th>
              <td className="border border-black text-center" colSpan={20}>
                {fieldtrip?.purpose}
              </td>
            </tr>

            {fieldtrip?.type === 'HOME' && (
              <>
                <tr className={`${homeContentType === 'Time' ? 'h-12' : 'h-16'} `}>
                  <th
                    className="border border-black bg-gray-200"
                    colSpan={3}
                    rowSpan={homeContentType === 'Time' ? 8 : 5}
                  >
                    가정학습 <p></p>계획
                  </th>
                  {homeContentType === 'Time' ? (
                    <>
                      <th className="border border-black" colSpan={2}>
                        교시
                      </th>
                      <th className="min-w-max border border-black" colSpan={4}>
                        교과
                      </th>
                      <td className="border border-black pl-5 font-semibold" colSpan={14}>
                        ※ 학습할 내용을 기록합니다.
                      </td>
                    </>
                  ) : (
                    <>
                      <th className="border border-black" colSpan={4}>
                        1일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[0]?.content}
                      </td>
                    </>
                  )}
                </tr>
                {homeContentType === 'Time' ? (
                  <>
                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        1
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject1}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content1}
                      </td>
                    </tr>

                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        2
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject2}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content2}
                      </td>
                    </tr>

                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        3
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject3}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content3}
                      </td>
                    </tr>

                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        4
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject4}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content4}
                      </td>
                    </tr>

                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        5
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject5}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content5}
                      </td>
                    </tr>

                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        6
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject6}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content6}
                      </td>
                    </tr>

                    <tr className="h-12">
                      <th className="border border-black" colSpan={2}>
                        7
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content[0].subject7}
                      </td>
                      <td className="border border-black pl-5 text-left font-semibold" colSpan={14}>
                        {content && content[0].content7}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="h-16">
                      <th className="border border-black" colSpan={4}>
                        2일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[1]?.content}
                      </td>
                    </tr>
                    <tr className="h-16">
                      <th className="border border-black" colSpan={4}>
                        3일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[2]?.content}
                      </td>
                    </tr>
                    <tr className="h-16">
                      <th className="border border-black" colSpan={4}>
                        4일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[3]?.content}
                      </td>
                    </tr>
                    <tr className="h-16">
                      <th className="border border-black" colSpan={4}>
                        5일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[4]?.content}
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
            {fieldtrip?.type === 'SUBURBS' && (
              <>
                <tr>
                  <th className="h-12 border border-black bg-gray-200 py-8" colSpan={3}>
                    교외<p></p>체험<p></p>학습<p></p>계획
                  </th>
                  <td
                    className="h-96 overflow-hidden border border-black px-4 text-left whitespace-pre-line"
                    colSpan={20}
                  >
                    {content}
                  </td>
                </tr>
              </>
            )}
            <tr>
              <th className="h-12 border border-black bg-gray-200" colSpan={3}>
                학생<p></p>안전
              </th>
              <td
                className="overflow-hidden border border-black bg-gray-200 text-left text-xs whitespace-pre-wrap"
                colSpan={17}
              >
                {fieldtripSafety}
              </td>
              <td className="border border-black bg-gray-200 text-center" colSpan={3}>
                <Checkbox checked={agree} disabled className={'bg-gray-100'} style={{ color: 'gray' }} />
                <p>동의함</p>
              </td>
            </tr>
            <tr>
              <th className="bg-gray-200" colSpan={23}>
                위와 같이 「학교장허가 {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'}
                」을 신청합니다.
              </th>
            </tr>
            <tr>
              <th colSpan={23} className="bg-gray-200">
                {fieldtrip?.reportedAt && makeDateToString2(new Date(fieldtrip.reportedAt) || '')}
              </th>
            </tr>
            <tr>
              <th className="bg-gray-200 pr-3" colSpan={23}>
                <div className="-my-4 w-full">
                  <div className="flex w-full items-center justify-end space-x-2">
                    <div className="whitespace-pre">학생 : {fieldtrip?.student?.name} </div>
                    <div className="relative" style={{ width: '75px', minHeight: '50px' }}>
                      <div className="text-littleblack absolute" style={{ top: '13px', left: '27px' }}>
                        (인)
                      </div>
                      {fieldtrip?.studentSignature && (
                        // <img style={{ width: '75px' }} src={fieldtrip?.studentSignature} alt="" />
                        <img src={fieldtrip?.studentSignature ?? undefined} alt="" className="mt-4 w-[100px]" />
                      )}
                    </div>
                  </div>
                  <div className="-mt-6 flex w-full items-center justify-end space-x-2">
                    <div className="whitespace-pre">보호자 : {fieldtrip?.student?.nokName} </div>
                    <div className="relative" style={{ width: '75px', minHeight: '50px' }}>
                      <div className="text-littleblack absolute" style={{ top: '13px', left: '27px' }}>
                        (인)
                      </div>

                      {fieldtrip?.parentSignature && (
                        // <img style={{ width: '75px' }} src={fieldtrip?.parentSignature} alt="" />
                        <img src={fieldtrip?.parentSignature ?? undefined} alt="" className="mt-4 w-[100px]" />
                      )}
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th className="bg-gray-200 text-xl font-extrabold" colSpan={23}>
                {schoolName}장 귀하
              </th>
            </tr>
          </table>
        </div>
        <div className="mx-5 mt-1 text-sm">
          <p>
            ※ 보호자가 신청서를 제출하였다 하여 체험학습이 허가된 것이 아니며 담임교사로부터 반드시 최종 허가 여부
            통보서(또는 문자)를 받은 후 실시해야 함
          </p>
        </div>
      </div>
    )
  } else if (type === '통보서') {
    return (
      <div className="col-span-3 col-start-2 text-xs md:px-12 md:pt-12 md:text-base">
        <div className="mt-4 mb-2 flex w-full justify-center">
          <h5 className="text-sm font-bold md:text-2xl">
            「학교장허가 {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'}」 통보서
          </h5>
        </div>
        <div className="-mt-0.5 flex justify-center text-center">
          <table className="w-full table-fixed border-2 border-black">
            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                성명
              </th>
              <td className="border border-black" colSpan={7}>
                {fieldtrip?.student?.name}
                {getNickName(fieldtrip?.student?.nickName)}
              </td>
              <th className="border border-black bg-gray-200" colSpan={5}>
                학년 / 반 / 번호
              </th>
              <th className="border border-black" colSpan={10}>
                {fieldtrip?.studentGradeKlass} {fieldtrip?.studentNumber}번
              </th>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={3} rowSpan={9}>
                본교 <p></p> 출석인정기간 <p></p> 연간({school?.fieldtripDays}
                )일
              </th>
              <th className="border border-black bg-gray-200" colSpan={4} rowSpan={3}>
                신청 기간
              </th>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={12}>
                {sHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}{' '}
                    {fieldtrip?.usedDays && fieldtrip?.usedDays < 1 && fieldtrip?.endPeriodE > 0 ? (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시~
                        {fieldtrip?.endPeriodE}교시
                      </>
                    ) : (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시부터
                      </>
                    )}{' '}
                    ({sHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
              <th className="border border-black" colSpan={3} rowSpan={3}>
                총({fieldtrip?.usedDays})일
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                1일 기준
              </th>
              <th className="border border-black" colSpan={12}>
                {(sHalfUsedDayCnt > 0 || eHalfUsedDayCnt > 0) && wholeUsedDayCnt > 0 && (
                  <>
                    {fieldtrip?.wholeDayPeriod} ({wholeUsedDayCnt}
                    일)
                  </>
                )}
                {sHalfUsedDayCnt === 0 && eHalfUsedDayCnt === 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}~
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} ({fieldtrip?.usedDays}) 일간
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={12}>
                {eHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} {fieldtrip?.endPeriodE}
                    교시까지 ({eHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={4} rowSpan={3}>
                허가 기간
              </th>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={12}>
                {sHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}{' '}
                    {fieldtrip?.usedDays && fieldtrip?.usedDays < 1 && fieldtrip?.endPeriodE > 0 ? (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시~
                        {fieldtrip?.endPeriodE}교시
                      </>
                    ) : (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시부터
                      </>
                    )}{' '}
                    ({sHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
              <th className="border border-black" colSpan={3} rowSpan={3}>
                총({fieldtrip?.usedDays})일
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                1일 기준
              </th>
              <th className="border border-black" colSpan={12}>
                {(sHalfUsedDayCnt > 0 || eHalfUsedDayCnt > 0) && wholeUsedDayCnt > 0 && (
                  <>
                    {fieldtrip?.wholeDayPeriod} ({wholeUsedDayCnt}
                    일)
                  </>
                )}
                {sHalfUsedDayCnt === 0 && eHalfUsedDayCnt === 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}~
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} ({fieldtrip?.usedDays}) 일간
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={12}>
                {eHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} {fieldtrip?.endPeriodE}
                    교시까지 ({eHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={4} rowSpan={3}>
                금회까지<p></p>누적<p></p>사용기간 (
                {school?.fieldtripDays &&
                  fieldtrip?.currentRemainDays &&
                  fieldtrip?.usedDays &&
                  school.fieldtripDays - fieldtrip.currentRemainDays + fieldtrip.usedDays}
                )일
              </th>
              <th colSpan={17}>
                {fieldtrip?.endAt && makeDateToString2(add(new Date(fieldtrip.endAt), { days: 1 }) || '')}
              </th>
            </tr>
            <tr>
              <th className="text-right" colSpan={18}>
                <div className="flex w-full items-center justify-end">
                  <div className="flex w-full items-center justify-end space-x-2">
                    <div className="whitespace-pre">
                      {schoolName} {fieldtrip?.studentGradeKlass} {fieldtrip?.approver1Title} 교사{' '}
                    </div>
                    <div className="relative" style={{ width: '75px', minHeight: '50px' }}>
                      <div className="text-littleblack absolute" style={{ top: '15px', left: '37px' }}>
                        (인)
                      </div>
                      {fieldtrip?.approver1Signature && (
                        <img src={approver1Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                      )}
                    </div>

                    {/* 
                    {
                      <div
                        className="h-20 bg-contain bg-right bg-no-repeat"
                        style={{
                          backgroundImage: `url(${approver1Signature})`,
                        }}
                      >
                        <div className="mr-5 mt-5 min-w-max text-right font-bold">
                          {schoolName} {fieldtrip?.studentGradeKlass} {fieldtrip?.approver1Title} 교사
                          &nbsp;&nbsp;&nbsp; (인)
                        </div>
                      </div>
                    } */}
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th className="text-right text-xl font-extrabold" colSpan={18}>
                보호자님 귀하
              </th>
            </tr>
          </table>
        </div>
        <div className="mx-5 mt-5 text-sm">
          <p className="font-extrabold">
            ※ 보호자가 신청서를 제출하였다 하여 체험학습이 허가된 것이 아니며 담임교사로부터 반드시 최종 허가 여부
            통보서(또는 문자)를 받은 후 실시해야 함
          </p>
          <p className="font-extrabold">
            ※ 교외체험학습 실시 중에는 보호자와 담당교사 간 연락체계를 유지하고 사안(사고) 발생 시 보호자는 담당교사에게
            연락을 하도록 합니다.
          </p>
          <p className="font-extrabold">
            ※ {fieldtripSafety} 미이행의 경우 시‧군‧구 아동복지과 또는 수사기관에 통보될 수 있음을 알려드립니다.{' '}
          </p>
        </div>
      </div>
    )
  } else if (type === '결과보고서') {
    if (fieldtrip?.type === 'HOME' && (!content || content.day)) {
      content = content = JSON.parse(fieldtrip?.content || '')
      homeContentType = 'Day'
    }

    return (
      <div className="col-span-3 col-start-2 text-xs md:px-12 md:pt-12 md:text-base">
        <div className="flex w-full justify-end">
          <h5 className="mt-4 w-full text-center text-sm font-bold md:text-xl">
            「학교장허가 {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'}」 결과보고서
          </h5>
          <table className="min-w-max border-2 border-black">
            <tr>
              {fieldtrip?.resultApprover1Title && (
                <Td2 className="h-4 whitespace-pre">{fieldtrip?.resultApprover1Title}</Td2>
              )}
              {fieldtrip?.resultApprover2Title && (
                <Td2 className="h-4 whitespace-pre">{fieldtrip?.resultApprover2Title}</Td2>
              )}
              {fieldtrip?.resultApprover3Title && (
                <Td2 className="h-4 whitespace-pre">{fieldtrip?.resultApprover3Title}</Td2>
              )}
              {fieldtrip?.resultApprover4Title && (
                <Td2 className="h-4 whitespace-pre">{fieldtrip?.resultApprover4Title}</Td2>
              )}
              {fieldtrip?.resultApprover5Title && (
                <Td2 className="h-4 whitespace-pre">{fieldtrip?.resultApprover5Title}</Td2>
              )}
            </tr>
            <tr>
              {fieldtrip?.resultApprover1Title && (
                <Td2 className="h-10">
                  {resultApprover1Signature && (
                    <img src={resultApprover1Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.resultApprover2Title && (
                <Td2 className="h-10">
                  {resultApprover2Signature && (
                    <img src={resultApprover2Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.resultApprover3Title && (
                <Td2 className="h-10">
                  {resultApprover3Signature && (
                    <img src={resultApprover3Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.resultApprover4Title && (
                <Td2 className="h-10">
                  {resultApprover4Signature && (
                    <img src={resultApprover4Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
              {fieldtrip?.resultApprover5Title && (
                <Td2 className="h-10">
                  {resultApprover5Signature && (
                    <img src={resultApprover5Signature} alt="" crossOrigin="anonymous" className="m-auto w-[50px]" />
                  )}
                </Td2>
              )}
            </tr>
          </table>
        </div>
        <div className="-mt-0.5 flex justify-center text-center">
          <table className="w-full table-fixed border-2 border-black">
            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                성명
              </th>
              <td className="border border-black" colSpan={6}>
                {fieldtrip?.student?.name}
                {getNickName(fieldtrip?.student?.nickName)}
              </td>
              <th className="border border-black bg-gray-200" colSpan={7}>
                학년 / 반 / 번호
              </th>
              <th className="border border-black" colSpan={7}>
                {fieldtrip?.studentGradeKlass} {fieldtrip?.studentNumber}번
              </th>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={6} rowSpan={3}>
                {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'} 기간
              </th>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={11}>
                {sHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}{' '}
                    {fieldtrip?.usedDays && fieldtrip?.usedDays < 1 && fieldtrip?.endPeriodE > 0 ? (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시~
                        {fieldtrip?.endPeriodE}교시
                      </>
                    ) : (
                      <>
                        {fieldtrip?.startPeriodS}
                        교시부터
                      </>
                    )}{' '}
                    ({sHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
              <th className="border border-black" colSpan={3} rowSpan={3}>
                총({fieldtrip?.usedDays})일
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                1일 기준
              </th>
              <th className="border border-black" colSpan={11}>
                {(sHalfUsedDayCnt > 0 || eHalfUsedDayCnt > 0) && wholeUsedDayCnt > 0 && (
                  <>
                    {fieldtrip?.wholeDayPeriod} ({wholeUsedDayCnt}
                    일)
                  </>
                )}
                {sHalfUsedDayCnt === 0 && eHalfUsedDayCnt === 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.startAt || '', DateFormat['YYYY-MM-DD'])}~
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} ({fieldtrip?.usedDays}) 일간
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black" colSpan={3}>
                반일기준
              </th>
              <th className="border border-black" colSpan={11}>
                {eHalfUsedDayCnt > 0 && (
                  <>
                    {DateUtil.formatDate(fieldtrip?.endAt || '', DateFormat['YYYY-MM-DD'])} {fieldtrip?.endPeriodE}
                    교시까지 ({eHalfUsedDayCnt}
                    일)
                  </>
                )}
              </th>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={6}>
                {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'} 장소
              </th>
              <th className="border border-black" colSpan={17}>
                {fieldtrip?.type === 'HOME'
                  ? '가정'
                  : `${fieldtrip?.destination} ${
                      fieldtrip?.overseas ? `(${t(getCustomString(school?.id, 'oversea'), '해외')})` : ''
                    }`}
              </th>
            </tr>

            <tr>
              <th className="border border-black bg-gray-200" colSpan={3}>
                학습형태
              </th>
              <td className="border border-black text-center font-bold" colSpan={20}>
                <div className="items-center justify-center space-x-2 text-sm">
                  {fieldtrip?.type === 'SUBURBS' && (
                    <>
                      {forms.map((f: string) => (
                        <span className={`${fieldtrip?.form === f && 'text-blue-600'}`}>
                          ∘{f}( {fieldtrip?.form === f && '○'} )
                        </span>
                      ))}
                    </>
                  )}
                  {fieldtrip?.type === 'HOME' && (
                    <>
                      {forms.map((f: string) => (
                        <span>∘{f}( )</span>
                      ))}
                      <span className="text-blue-600">∘가정학습( ○ )</span>
                    </>
                  )}
                </div>
              </td>
            </tr>

            {fieldtrip?.type === 'HOME' && (
              <>
                <tr className={`${homeContentType === 'Time' ? 'h-10' : 'h-20'} `}>
                  <th
                    className="border border-black bg-gray-200"
                    colSpan={3}
                    rowSpan={homeContentType === 'Time' ? 8 : 5}
                  >
                    가정학습<p></p>결과
                  </th>
                  {homeContentType === 'Time' ? (
                    <>
                      <th className="border border-black" colSpan={2}>
                        교시
                      </th>
                      <th className="min-w-max border border-black" colSpan={4}>
                        교과
                      </th>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        ※ 학습한 내용을 기록합니다.
                      </td>
                    </>
                  ) : (
                    <>
                      <th className="border border-black" colSpan={4}>
                        1일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[0]?.content}
                      </td>
                    </>
                  )}
                </tr>
                {homeContentType === 'Time' ? (
                  <>
                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        1
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject1}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content1}
                      </td>
                    </tr>

                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        2
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject2}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content2}
                      </td>
                    </tr>

                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        3
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject3}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content3}
                      </td>
                    </tr>

                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        4
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject4}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content4}
                      </td>
                    </tr>

                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        5
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject5}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content5}
                      </td>
                    </tr>

                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        6
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject6}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content6}
                      </td>
                    </tr>

                    <tr className="h-14">
                      <th className="border border-black" colSpan={2}>
                        7
                      </th>
                      <td className="min-w-max border border-black" colSpan={4}>
                        {content && content.subject7}
                      </td>
                      <td className="border border-black pl-5 text-lg font-semibold" colSpan={14}>
                        {content && content.content7}
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="h-20">
                      <th className="border border-black" colSpan={4}>
                        2일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[1]?.content}
                      </td>
                    </tr>
                    <tr className="h-20">
                      <th className="border border-black" colSpan={4}>
                        3일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[2]?.content}
                      </td>
                    </tr>
                    <tr className="h-20">
                      <th className="border border-black" colSpan={4}>
                        4일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[3]?.content}
                      </td>
                    </tr>
                    <tr className="h-20">
                      <th className="border border-black" colSpan={4}>
                        5일차
                      </th>
                      <td className="border border-black px-2 text-left text-sm" colSpan={16}>
                        {content && content[4]?.content}
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
            {fieldtrip?.type === 'SUBURBS' && (
              <>
                <tr>
                  <th className="border border-black bg-gray-200" colSpan={3}>
                    제목
                  </th>
                  <td className="border border-black text-center" colSpan={20}>
                    {fieldtrip?.resultTitle}
                  </td>
                </tr>

                <tbody>
                  <tr>
                    <td
                      className="border border-dashed border-black px-4 text-left text-xs whitespace-pre-wrap"
                      colSpan={23}
                    >
                      {fieldtripResultGuide}
                    </td>
                  </tr>
                  <tr className="h-128 max-h-128">
                    <td className="border border-dashed border-black text-left whitespace-pre-line" colSpan={23}>
                      <div className={`h-128 px-4 ${isPaper ? '' : 'overflow-y-auto'}`}>
                        {resultTextPage1 ? resultTextPage1 : fieldtrip?.resultText}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </>
            )}

            <tr>
              <th colSpan={23} className="bg-gray-200">
                위와 같이 「학교장허가 {fieldtrip?.type === 'HOME' ? '가정학습' : '교외체험학습'}」 결과보고서를
                제출합니다.
              </th>
            </tr>
            <tr>
              <th colSpan={23} className="bg-gray-200">
                {fieldtrip?.resultReportedAt && makeDateToString2(new Date(fieldtrip.resultReportedAt) || '')}
              </th>
            </tr>
            <tr>
              <th className="bg-gray-200 pr-3" colSpan={23}>
                <div className="-my-5 w-full">
                  <div className="flex w-full items-center justify-end space-x-2">
                    <div className="whitespace-pre">보호자 {fieldtrip?.student?.nokName}:</div>
                    <div className="relative" style={{ width: '75px', minHeight: '50px' }}>
                      <div className="text-littleblack absolute" style={{ top: '13px', left: '37px' }}>
                        (인)
                      </div>
                      {fieldtrip?.parentResultSignature && (
                        <img style={{ width: '75px' }} src={fieldtrip?.parentResultSignature} alt="" />
                      )}
                    </div>
                  </div>
                  <div className="-mt-5 flex w-full items-center justify-end space-x-2">
                    <div className="whitespace-pre">학생 {fieldtrip?.student?.name}:</div>
                    <div className="relative" style={{ width: '75px', minHeight: '50px' }}>
                      <div className="text-littleblack absolute" style={{ top: '13px', left: '37px' }}>
                        (인)
                      </div>
                      {fieldtrip?.studentResultSignature && (
                        <img style={{ width: '75px' }} src={fieldtrip?.studentResultSignature} alt="" />
                      )}
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th className="bg-gray-200 text-xl font-extrabold" colSpan={23}>
                {schoolName}장 귀하
              </th>
            </tr>
          </table>
        </div>
        <p className="mt-5 mb-10 font-bold">
          ※ 보고서 제출 기한: 체험학습 종료 후 {meRecoil?.school.fieldtripResultDueDays || 5}일 이내
        </p>
      </div>
    )
  }
  return <></>
}
