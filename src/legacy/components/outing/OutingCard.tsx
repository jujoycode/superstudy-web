import { Link, useLocation } from 'react-router-dom'
import { OutingStatus, OutingTypeEnum, ResponseCreateOutingDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getNickName, getPeriodStr } from '@/legacy/util/status'
import { makeDateToString } from '@/legacy/util/time'
import { useUserStore } from '@/stores/user'

interface OutingCardProps {
  outing: ResponseCreateOutingDto
  type: string
}

export function OutingCard({ outing, type }: OutingCardProps) {
  const { pathname, search } = useLocation()
  const { t } = useLanguage()

  const { me } = useUserStore()

  const startAt = DateUtil.formatDate(outing.startAt, DateFormat['YYYY-MM-DD HH:mm'])
  const endAt = DateUtil.formatDate(outing.endAt, DateFormat['YYYY-MM-DD HH:mm'])

  const myConfirmState =
    (outing.approver1Id === me?.id && !!outing.approver1Signature) ||
    (outing.approver2Id === me?.id && !!outing.approver2Signature) ||
    (outing.approver3Id === me?.id && !!outing.approver3Signature) ||
    (outing.approver4Id === me?.id && !!outing.approver4Signature) ||
    (outing.approver5Id === me?.id && !!outing.approver5Signature)

  return (
    <>
      <Link to={`/teacher/${type}/${outing.id}${search}`}>
        <div
          className={
            pathname.startsWith(`/teacher/outing/${outing.id}`)
              ? 'relative flex w-full items-center justify-between bg-gray-100 p-4'
              : 'relative flex w-full cursor-pointer items-center justify-between p-4'
          }
        >
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="mb-1 text-lg font-semibold">
                [{outing.type === OutingTypeEnum.확인 ? t(`${outing.type2}`) : t(`OutingType.${outing.type}`, '용무')}]{' '}
                {outing?.studentName}
                {getNickName(outing?.studentNickName)} {outing.studentGradeKlass} {outing.studentNumber}번
              </h3>
              <div className="text-xs text-gray-500">
                {t('period', '기간')} :{' '}
                {outing?.startPeriod !== 0 && outing?.endPeriod !== 0
                  ? makeDateToString(startAt) +
                    ' ' +
                    getPeriodStr(outing?.startPeriod) +
                    '교시 ~ ' +
                    makeDateToString(endAt) +
                    ' ' +
                    getPeriodStr(outing?.endPeriod) +
                    '교시'
                  : `${startAt} ~ ${endAt}`}
              </div>
              <div className="text-xs text-gray-500">
                {t('application_date', '신청일')} : {outing.reportedAt}
              </div>
            </div>
          </div>
          <div>
            {outing?.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL ? (
              <span className="my-1 mr-1 inline-block rounded-md px-1 py-2 text-xs text-gray-600 md:mr-2 md:px-3 md:text-sm">
                {t('before_parent_approval', '학부모 승인 전')}
              </span>
            ) : outing?.outingStatus === OutingStatus.BEFORE_TEACHER_APPROVAL && !myConfirmState ? (
              <span className="my-1 mr-1 inline-block rounded-md px-1 py-2 text-xs text-red-500 md:mr-2 md:px-3 md:text-sm">
                {t('pending_approval', '승인 전')}
              </span>
            ) : outing?.outingStatus === OutingStatus.BEFORE_TEACHER_APPROVAL && myConfirmState ? (
              <span className="my-1 mr-1 inline-block rounded-md px-1 py-2 text-xs text-gray-600 md:mr-2 md:px-3 md:text-sm">
                {t('before_other_teacher_approval', '타교사 승인 전')}
              </span>
            ) : outing?.outingStatus === 'PROCESSED' ? (
              <span className="my-1 mr-1 inline-block rounded-md px-1 py-2 text-xs text-gray-600 md:mr-2 md:px-3 md:text-sm">
                {t('approved', '승인 완료')}
              </span>
            ) : outing?.outingStatus === 'RETURNED' ? (
              <span className="text-brand-1 my-1 mr-1 inline-block rounded-md px-1 py-2 text-xs md:mr-2 md:px-3 md:text-sm">
                {t('rejected', '반려됨')}
              </span>
            ) : outing?.outingStatus === 'DELETE_APPEAL' ? (
              <span className="text-brand-1 my-1 mr-1 inline-block rounded-md px-1 py-2 text-xs md:mr-2 md:px-3 md:text-sm">
                {t('delete_request', '삭제 요청')}
              </span>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="h-0.5 bg-gray-100"></div>
      </Link>
    </>
  )
}
