import { Link, useLocation } from 'react-router'

import { Badge } from '@/legacy/components/common'
import { FieldtripStatus, ResponsePaginatedFieldtripDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName } from '@/legacy/util/status'
import { makeStartEndToString } from '@/legacy/util/time'

interface FieldtripCardProps {
  fieldtrip: ResponsePaginatedFieldtripDto['items'][number]
  type: string
}

export function FieldtripCard({ fieldtrip, type }: FieldtripCardProps) {
  const { pathname, search } = useLocation()
  const { t } = useLanguage()
  let text
  let textResult

  switch (fieldtrip?.fieldtripStatus) {
    case FieldtripStatus.BEFORE_PARENT_CONFIRM:
      text = <div className="text-sm text-red-500">{t('before_parent_approval', '보호자 승인 전')}</div>
      break
    case FieldtripStatus.PROCESSING:
      text = (
        <div className="text-sm text-red-500">
          {fieldtrip?.nextApproverTitle} {t('pending_approval', '승인 전')}
        </div>
      )
      break
    case FieldtripStatus.PROCESSED:
      text = <div className="text-sm text-gray-600">{t('approved', '승인 완료')}</div>
      break
    case FieldtripStatus.RETURNED:
      text = <div className="text-primary-800 text-sm">{t('rejected', '반려됨')}</div>
      break
    case FieldtripStatus.DELETE_APPEAL:
      text = <div className="text-sm text-red-800">{t('delete_request', '삭제 요청')}</div>
      break
  }

  if (fieldtrip?.fieldtripStatus === FieldtripStatus.PROCESSED) {
    switch (fieldtrip?.fieldtripResultStatus) {
      case FieldtripStatus.BEFORE_PARENT_CONFIRM:
        textResult = fieldtrip?.resultTitle ? (
          <div className="text-xs text-red-500">
            {t('report_form', '결과보고서')} : {t('before_parent_approval', '보호자 승인 전')}
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            {t('report_form', '결과보고서')} : {t('before_writing', '작성 전')}
          </div>
        )
        break
      case FieldtripStatus.PROCESSING:
        textResult = (
          <div className="text-xs text-red-500">
            {t('report_form', '결과보고서')} : {fieldtrip?.nextResultApproverTitle}
            {t('pending_approval', '승인 전')}
          </div>
        )
        break
      case FieldtripStatus.PROCESSED:
        textResult = (
          <div className="text-xs text-gray-600">
            {t('report_form', '결과보고서')} : {t('approved', '승인 완료')}
          </div>
        )
        break
      case FieldtripStatus.RETURNED:
        textResult = (
          <div className="text-primary-800 text-xs">
            {t('report_form', '결과보고서')} : {t('rejected', '반려됨')}
          </div>
        )
        break
      case FieldtripStatus.DELETE_APPEAL:
        textResult = (
          <div className="text-xs text-red-800">
            {t('report_form', '결과보고서')} : {t('delete_request', '삭제 요청')}
          </div>
        )
        break
      default:
        textResult = (
          <div className="text-xs text-gray-500">
            {t('report_form', '결과보고서')} : {t('before_writing', '작성 전')}
          </div>
        )
        break
    }
  }

  return (
    <>
      <Link to={`/teacher/${type}/${fieldtrip.id}${search}`}>
        <div
          className={
            pathname.startsWith(`/teacher/fieldtrip/${fieldtrip.id}`)
              ? 'relative flex w-full items-center justify-between bg-gray-50 p-4'
              : 'relative flex w-full items-center justify-between p-4'
          }
        >
          <div>
            <h3 className="text-lg font-semibold">
              [{t('application_form', '신청서')}] {fieldtrip?.student?.name}
              {getNickName(fieldtrip?.student?.nickName)} {fieldtrip?.studentGradeKlass} {fieldtrip?.studentNumber}번
            </h3>
            <div className="my-1 flex space-x-2 text-sm font-semibold">
              {fieldtrip?.type === 'HOME' ? (
                <Badge children={t('home', '가정')} className="bg-primary-100 text-primary-800" />
              ) : (
                <Badge children={t('off_campus', '교외')} className="bg-primary-100 text-primary-800" />
              )}

              <div>{fieldtrip.type === 'SUBURBS' ? fieldtrip?.form || '교외체험학습' : '가정학습'}</div>
            </div>
            <div className="pt-1 text-xs text-gray-500">
              {t('period', '기간')} :{' '}
              {fieldtrip?.startAt && fieldtrip?.endAt && makeStartEndToString(fieldtrip.startAt, fieldtrip.endAt)}
            </div>
            <div className="pt-1 text-xs text-gray-500">
              {t('application_date', '신청일')} : {fieldtrip.reportedAt}
            </div>
          </div>
          <div className="text-right">
            {text}
            <br />
            {textResult}
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
      </Link>
    </>
  )
}
