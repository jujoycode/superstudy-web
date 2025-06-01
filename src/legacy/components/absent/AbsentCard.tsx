import React from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { Checkbox } from '@/atoms/Checkbox'
import { Flex } from '@/atoms/Flex'
import { Text, type TextVariant } from '@/atoms/Text'
import { Absent, AbsentStatus, ResponsePaginatedAbsentDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { getNickName, getPeriodStr } from '@/legacy/util/status'
import { makeStartEndToString, makeTimeToString } from '@/legacy/util/time'

interface AbsentCardProps {
  absent: ResponsePaginatedAbsentDto['items'][number]
  submitAbsent: ({ id, submitted, callback }: { id: Absent['id']; submitted: boolean; callback: () => void }) => void
  submitNiceAbsent: (params: { id: Absent['id']; submitted: boolean; callback: () => void }) => void
  page: number
  limit: number
  type: string
}

export function AbsentCard({ absent, submitAbsent, submitNiceAbsent, page, limit, type }: AbsentCardProps) {
  const { t } = useLanguage()
  const { pathname, search } = useLocation()
  const { push } = useHistory()
  const [clicked, setClicked] = useState(false)

  const getStatusContent = (absentStatus: AbsentStatus) => {
    let variant: TextVariant = 'default'
    let content = ''

    switch (absentStatus) {
      case AbsentStatus.BEFORE_PARENT_CONFIRM: {
        variant = 'primary'
        content = t('before_parent_approval', '보호자\n승인 전')
        break
      }
      case AbsentStatus.PROCESSING: {
        variant = 'primary'
        content = `${absent?.nextApproverTitle}\n${t('pending_approval', '승인 전')}`
        break
      }
      case AbsentStatus.PROCESSED: {
        variant = 'sub'
        content = t('approved', '승인 완료')
        break
      }
      case AbsentStatus.RETURNED: {
        variant = 'error'
        content = t('rejected', '반려됨')
        break
      }
      case AbsentStatus.DELETE_APPEAL: {
        variant = 'error'
        content = t('delete_request', '삭제 요청')
        break
      }
    }

    // 2025.06.01 / jujoycode
    // 줄바꿈 처리를 위해 어쩔 수 없는 구조이나, 이후 리팩토링 필요
    return (
      <Flex items="center" justify="center">
        <Text size="xs" weight="sm" variant={variant} className="w-fit text-center">
          {content.split('\n').map((text, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {text}
            </React.Fragment>
          ))}
        </Text>
      </Flex>
    )
  }

  const handleCheckboxChange = () => {
    setClicked(true)
    submitAbsent({
      id: absent.id,
      submitted: !absent.submitted,
      callback: () => {
        setClicked(false)
      },
    })
  }

  return (
    <div
      className={
        pathname.startsWith(`/teacher/absent/${absent.id}`) || pathname.startsWith(`/teacher/history/${absent.id}`)
          ? 'w-full bg-gray-100 py-4'
          : 'w-full cursor-pointer border-b border-gray-100 py-4'
      }
      onClick={() => push(`/teacher/${type}/${absent.id}${search}`)}
    >
      {/* Mobile V */}
      <div className="mx-5 flex items-center justify-between md:hidden">
        <div className="flex items-center">
          <div>
            <h3 className="mb-1 text-lg font-semibold">
              [{absent.description} {absent?.reportType}] {absent.student?.name}
              {getNickName(absent?.student?.nickName)} {absent.studentGradeKlass} {absent.studentNumber}번
            </h3>
            <div className="text-xs text-gray-500">
              기간 :{' '}
              {absent.startAt &&
                absent.endAt &&
                absent.reportType &&
                makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}
            </div>
            <div className="text-xs text-gray-500">신고일 : {absent.reportedAt}</div>
          </div>
        </div>
        {getStatusContent(absent.absentStatus)}
      </div>

      {/* Desktop V */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[8fr_2fr_3fr_3fr] items-center px-2">
          <div className="flex flex-col">
            <div className="text-lg font-semibold">
              [{absent.description} {absent?.reportType}] {absent.student?.name}
              {getNickName(absent?.student?.nickName)} {absent.studentGradeKlass} {absent.studentNumber}번
            </div>

            <div className="overflow-x-hidden text-xs text-gray-500">
              {t('period', '기간')} :{' '}
              {absent.startAt &&
                absent.endAt &&
                absent.reportType &&
                makeStartEndToString(absent.startAt, absent.endAt, absent.reportType)}{' '}
              {(absent?.reportType === '지각' || absent?.reportType === '결과' || absent?.reportType === '조퇴') && (
                <>
                  {absent?.startPeriod !== 0 && absent?.endPeriod !== 0
                    ? getPeriodStr(absent?.startPeriod) + '교시~' + getPeriodStr(absent?.endPeriod) + '교시'
                    : makeTimeToString(absent?.startAt || '') === '00:00' &&
                        makeTimeToString(absent?.endAt || '') === '00:00'
                      ? ' '
                      : makeTimeToString(absent?.startAt || '') + ' ~ ' + makeTimeToString(absent?.endAt || '')}
                </>
              )}
            </div>
            <div className="overflow-x-hidden text-xs text-gray-500">
              {t('application_date', '신청일')} : {absent.reportedAt}
            </div>
          </div>
          {getStatusContent(absent.absentStatus)}
          <div className="flex h-full items-center justify-center gap-2">
            <Flex direction="row" items="center" justify="center" gap="2">
              <Flex items="center" justify="end" className="w-fit">
                <Text size="xs" weight="sm" variant="sub" className="w-full text-center">
                  나이스입력완료
                </Text>
              </Flex>
              <Flex items="center" justify="center" className="w-fit">
                <Checkbox
                  checked={absent.niceSubmitted}
                  disabled={clicked}
                  onChange={() => {
                    setClicked(true)
                    submitNiceAbsent({
                      id: absent.id,
                      submitted: !absent.niceSubmitted,
                      callback: () => setClicked(false),
                    })
                  }}
                />
              </Flex>
            </Flex>
          </div>
          <div className="flex h-full items-center justify-center gap-2 text-center text-xs md:text-sm">
            <Flex direction="row" items="center" justify="center" gap="2">
              <Flex items="center" justify="center">
                <Text size="xs" weight="sm" variant="sub" className="w-full text-center">
                  {absent?.evidenceType === '진료확인서류(진료확인서, 진단서, 의사소견서, 처방전, 약봉투 등)'
                    ? '진료확인서류'
                    : absent?.evidenceType}
                </Text>
              </Flex>
              <Flex items="center" justify="center" className="w-fit pr-7">
                <Checkbox
                  checked={absent.submitted || absent?.evidenceType === '학부모 확인서'}
                  disabled={clicked || absent?.evidenceType === '학부모 확인서'}
                  onChange={handleCheckboxChange}
                />
              </Flex>
            </Flex>
          </div>
        </div>
      </div>
    </div>
  )
}
