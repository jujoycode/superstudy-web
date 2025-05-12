import { Link, useLocation } from 'react-router'
import { Badge } from '@/legacy/components/common'
import { Fieldtrip, FieldtripStatus } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'
import { makeStartEndToString } from '@/legacy/util/time'

interface FieldtripResultCardProps {
  fieldtrip: Fieldtrip
}

export function FieldtripResultCard({ fieldtrip }: FieldtripResultCardProps) {
  const { pathname, search } = useLocation()
  const { t } = useLanguage()

  let text = <div className="text-sm text-red-500"> {t('before_writing', '작성 전')}</div>

  switch (fieldtrip?.fieldtripResultStatus) {
    case FieldtripStatus.BEFORE_PARENT_CONFIRM:
      text = <div className="text-sm text-red-500">{t('before_parent_approval', '학부모 승인 전')}</div>
      break
    case FieldtripStatus.PROCESSING:
      text = (
        <div className="text-sm text-red-500">
          {fieldtrip?.nextResultApproverTitle} {t('pending_approval', '승인 전')}
        </div>
      )
      break
    case FieldtripStatus.PROCESSED:
      text = <div className="text-sm text-gray-600">{t('approved', '승인 완료')}</div>
      break
    case FieldtripStatus.RETURNED:
      text = <div className="text-brand-1 text-sm">{t('rejected', '반려됨')}</div>
      break
    case FieldtripStatus.DELETE_APPEAL:
      text = <div className="text-sm text-red-800">{t('delete_request', '삭제 요청')}</div>
      break
  }
  return (
    <>
      <Link to={`/teacher/fieldtrip/result/${fieldtrip.id}${search}`}>
        <div
          className={
            pathname.startsWith(`/teacher/fieldtrip/result/${fieldtrip.id}`)
              ? 'relative flex w-full items-center justify-between bg-gray-50 p-4'
              : 'relative flex w-full items-center justify-between p-4'
          }
        >
          <div>
            <h3 className="text-lg font-semibold">
              [{t('report_form', '결과보고서')}] {fieldtrip?.student?.name}
              {getNickName(fieldtrip?.student?.nickName)} {fieldtrip?.studentGradeKlass} {fieldtrip?.studentNumber}번
            </h3>
            <div className="my-1 flex space-x-2 text-sm font-semibold">
              {fieldtrip?.type === 'HOME' ? (
                <Badge children={t('home', '가정')} className="bg-brand-5 text-brand-1" />
              ) : (
                <Badge children={t('off_campus', '교외')} className="bg-brand-5 text-brand-1" />
              )}

              <div>{fieldtrip.type === 'SUBURBS' ? fieldtrip?.form || '교외체험학습' : '가정학습'}</div>
            </div>
            <div className="pt-1 text-xs text-gray-500">
              {t('period', '기간')} :{' '}
              {fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)}
            </div>
            <div className="pt-1 text-xs text-gray-500">
              {t('application_date', '신청일')} : {fieldtrip.resultReportedAt}
            </div>
          </div>
          <div>{text}</div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
      </Link>
    </>
  )
}
