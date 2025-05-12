import { useParams } from 'react-router'
import { ErrorBlank, Td } from '@/legacy/components'
import { Blank, Section, TopNavbar } from '@/legacy/components/common'
import { useParentFieldtripNotice } from '@/legacy/container/parent-fieldtrip-notice'
import { makeStartEndToString } from '@/legacy/util/time'

export function FieldtripParentNoticePage() {
  const { uuid } = useParams<{ uuid: string }>()
  const { data: fieldtrip, isLoading, error, me } = useParentFieldtripNotice(uuid)

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar title="통보서" left={<div className="h-15" />} />
      <Section>
        <h1 className="text-center text-xl font-bold underline">학교장허가 교외체험 학습통보서</h1>
        <label className="mb-1 text-center text-sm font-semibold text-gray-800">
          {fieldtrip?.student?.name} {fieldtrip?.studentGradeKlass} {fieldtrip?.studentNumber}번
        </label>
        <table className="w-full text-center font-bold">
          <tr>
            <Td>신청기간</Td>
            <Td>
              {fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)} (
              {fieldtrip?.usedDays}일간)
            </Td>
          </tr>
          <tr>
            <Td>허가기간</Td>
            <Td>
              {fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)} (
              {fieldtrip?.usedDays}일간)
            </Td>
          </tr>
        </table>
        <div className="text-sm">
          본교 교외체험학습 <span className="font-bold">출석인정 기간 연간 50일 중 </span> 금회까지
          <span className="font-bold">
            {' '}
            누적 사용기간은{' '}
            {me?.school?.fieldtripDays &&
              fieldtrip?.currentRemainDays &&
              fieldtrip?.usedDays &&
              me?.school.fieldtripDays - fieldtrip.currentRemainDays + fieldtrip.usedDays}
            일
          </span>
          입니다.
        </div>
        <label className="mb-1 text-center text-sm text-gray-800">위와 같이 처리되었음을 알려드립니다.</label>
        <label className="mb-1 text-center text-sm text-gray-800">{fieldtrip?.noticedAt}</label>
        <div className="flex w-full items-center space-x-4">
          <div className="w-full min-w-max text-right font-bold text-gray-600">
            {me?.school?.name} {fieldtrip?.studentGradeKlass}
          </div>
        </div>
        <div className="flex w-full justify-end space-x-4 text-gray-600">
          <div className="min-w-max">담임교사 {fieldtrip?.teacher?.name} (인)</div>
        </div>
        <div className="flex w-full justify-end">
          {fieldtrip?.teacherSignature && <img src={fieldtrip?.teacherSignature} alt="" className="w-[50px]" />}
        </div>
        <div className="flex w-full items-center space-x-4">
          <div className="w-full min-w-max text-right text-gray-600">{me?.nokName} 귀하</div>
        </div>
        <label className="mb-1 text-center text-sm font-semibold text-gray-800">
          *교외체험학습 실시 중에는 보호자와 담당교사 간 연락체계를 유지하고 사안(사고) 발생 시 보호자는 담당교사에게
          연락을 하도록 합니다.
        </label>
        <label className="mb-1 text-center text-sm font-semibold text-gray-800">
          * {me?.school?.studentSafeText} 미이행의 경우 시‧군‧구 아동복지과 또는 수사기관에 통보될 수 있음을
          알려드립니다.{' '}
        </label>
        <label className="mb-1 text-center text-sm font-semibold text-gray-800">
          *결과보고서 제출 기한은 체험학습 종료 후 {me?.school.fieldtripResultDueDays || 5}일 이내입니다.
        </label>
      </Section>
    </>
  )
}
