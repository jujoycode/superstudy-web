import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { useGetFeedbackBatchExist, useGetUnreadFeedbackCount } from '@/legacy/container/ib-feedback'
import { useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { ResponseIBDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { meState } from '@/stores'

import FeedbackViewer from '../../FeedbackViewer'

import TkppfIbSubmitInformPopup from './TkppfIbSubmitInformPopup'

import NODATA from '@/assets/images/no-data.png'

interface ExhibitionListProps {
  data: ResponseIBDto
  refetch: () => void
}

export default function TKPPFList({ data }: ExhibitionListProps) {
  const me = useRecoilValue(meState)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [ibModalType, setIbModalType] = useState<'CREATE' | 'VIEW' | null>(null) // IB Modal 타입 관리

  const { data: tkppf, isLoading } = useTKPPFGetByIBId(data.id)

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const { push } = useHistory()
  const { data: Feedback } = useGetFeedbackBatchExist(
    {
      referenceIds: String(tkppf?.id),
      referenceTable: 'TKPPF',
    },
    { enabled: !!data },
  )

  const { data: count } = useGetUnreadFeedbackCount(
    { referenceId: tkppf?.id || 0, referenceTable: 'TKPPF' },
    {
      enabled: !!data,
    },
  )

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true)
    if (unreadCount && unreadCount > 0) {
      setUnreadCount(0)
    }
  }

  const handleIbModalOpen = (type: 'CREATE' | 'VIEW') => {
    setIbModalType(type) // 모달 타입 설정
  }

  const handleIbModalClose = () => {
    setIbModalType(null) // 모달 타입 초기화
  }
  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count)
    }
  }, [count])

  if (data === undefined || tkppf === undefined) return null

  return (
    <section className="h-[664px]">
      {isLoading && <Blank />}
      <header className="flex min-h-[88px] flex-row items-center justify-between gap-4 p-6 pb-6">
        <Typography variant="title1" className="text-primary-gray-900">
          TKPPF
        </Typography>
        {data?.status === 'COMPLETE' && (
          <ButtonV2
            variant="solid"
            color="gray700"
            size={40}
            className="w-[145px]"
            onClick={() => handleIbModalOpen('VIEW')}
          >
            TKPPF 정보 확인
          </ButtonV2>
        )}

        {/* 권한이 없는 선생님의 경우 */}
        {data?.status === 'WAIT_COMPLETE' &&
          !hasPermission &&
          (tkppf.academicIntegrityConsent ? (
            <ButtonV2
              variant="solid"
              color="gray700"
              size={40}
              className="w-[145px]"
              onClick={() => handleIbModalOpen('VIEW')}
            >
              TKPPF 정보 확인
            </ButtonV2>
          ) : (
            <ButtonV2 variant="solid" color="gray700" size={40} onClick={() => handleIbModalOpen('CREATE')} disabled>
              TKPPF 정보 기입
            </ButtonV2>
          ))}

        {/* 권한이 있는 선생님의 경우 */}
        {data?.status === 'WAIT_COMPLETE' &&
          hasPermission &&
          (tkppf.academicIntegrityConsent ? (
            <ButtonV2 variant="solid" color="gray700" size={40} onClick={() => handleIbModalOpen('CREATE')}>
              TKPPF 정보 확인 및 수정
            </ButtonV2>
          ) : (
            <ButtonV2
              variant="solid"
              color="orange800"
              size={40}
              className="w-[145px]"
              onClick={() => handleIbModalOpen('CREATE')}
            >
              TKPPF 정보 기입
            </ButtonV2>
          ))}
      </header>
      <main>
        {Object.keys(tkppf).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="h-12 w-12 px-[2.50px]">
              <img src={NODATA} className="h-12 w-[43px] object-cover" />
            </div>
            <span className="text-center">
              <Typography variant="body2" className="text-primary-gray-700 font-medium">
                아웃라인 승인 후, 학생이 TKPPF를 업로드해야
                <br />
                확인할 수 있습니다.
              </Typography>
            </span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-y-primary-gray-100 text-primary-gray-500 border-y text-[15px] font-medium">
              <tr>
                <td className="w-[964px] py-[9px] pr-2 pl-6 text-center">제목</td>
                <td className="w-[150px] px-2 py-[9px] text-center">수정일</td>
                <td className="w-[166px] py-[9px] pr-6 pl-2 text-center">피드백</td>
              </tr>
            </thead>
            <tbody className="text-primary-gray-900 text-[15px] font-medium">
              <tr className="border-b-primary-gray-100 border-b">
                <td
                  className="cursor-pointer overflow-hidden py-4 pr-2 pl-6 text-center text-ellipsis whitespace-nowrap"
                  onClick={() =>
                    push(`/teacher/ib/tok/tkppf/${data.id}/detail/${tkppf.id}`, {
                      project: data,
                    })
                  }
                >
                  공식 TKPPF
                </td>
                <td className="px-2 py-4 text-center">{format(new Date(data?.updatedAt), 'yyyy.MM.dd')}</td>
                <td className="flex justify-center py-4 pr-6 pl-2">
                  {Feedback?.items[0].totalCount && Feedback?.items[0].totalCount > 0 ? (
                    <ButtonV2
                      variant="outline"
                      color="gray400"
                      size={32}
                      className={`${unreadCount && unreadCount > 0 && 'flex flex-row items-center gap-1'}`}
                      onClick={() => {
                        if (unreadCount) {
                          handleFeedbackOpen()
                        } else {
                          push(`/teacher/ib/tok/tkppf/${data.id}/detail/${tkppf.id}`)
                        }
                      }}
                    >
                      {unreadCount && unreadCount > 0 ? (
                        <>
                          <ColorSVGIcon.New color="orange800" />
                          보기
                        </>
                      ) : (
                        '보기'
                      )}
                    </ButtonV2>
                  ) : (
                    <>-</>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </main>
      {feedbackOpen && (
        <FeedbackViewer
          modalOpen={feedbackOpen}
          setModalClose={() => setFeedbackOpen(!feedbackOpen)}
          referenceId={tkppf?.id || 0}
          referenceTable="TKPPF"
        />
      )}
      {alertMessage && (
        <AlertV2
          confirmText="확인"
          message={alertMessage}
          onConfirm={() => {
            setAlertMessage(null)
          }}
        />
      )}

      {ibModalType && tkppf && (
        <TkppfIbSubmitInformPopup
          IBData={data}
          ibId={data.id}
          tkppfData={tkppf}
          modalOpen={Boolean(ibModalType)}
          setModalClose={handleIbModalClose}
          type={ibModalType}
        />
      )}
    </section>
  )
}
