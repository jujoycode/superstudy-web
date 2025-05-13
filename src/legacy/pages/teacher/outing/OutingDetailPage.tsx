import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import { ErrorBlank, SuperModal } from '@/legacy/components'
import CertificationBadge from '@/legacy/components/blockchain/CertificationBadge'
import { BackButton, Blank, Section, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { OutingDetail } from '@/legacy/components/outing/OutingDetail'
import { useBlockChainDocument } from '@/legacy/container/block-chain-document-status'
import { useTeacherOutingDetail } from '@/legacy/container/teacher-outing-detail'
import { OutingStatus, Role } from '@/legacy/generated/model'
import { approveButtonType } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { PermissionUtil, buttonEnableState } from '@/legacy/util/permission'
import { meState } from '@/stores'

import { OutingUpdatePage } from './OutingUpdatePage'

interface OutingDetailPageProps {
  userRole?: Role
  setOpen: (b: boolean) => void
  setOutingId: (n: number) => void
  setAgreeAll: (b: boolean) => void
  isLoading: boolean
}

export function OutingDetailPage({
  userRole,
  setOpen,
  setOutingId,
  setAgreeAll,
  isLoading: isLoadingProps,
}: OutingDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const me = useRecoilValue(meState)
  const [changeMode, setChangeMode] = useState(false)
  const { data, isLoading: isLoadingBlockChain } = useBlockChainDocument({
    referenceTable: 'OUTING',
    referenceId: Number(id),
  })

  const {
    deny,
    setDeny,
    notApprovedReason,
    setNotApprovedReason,
    deleteReason,
    setDeleteReason,
    deleteAppeal,
    setDeleteAppeal,
    errM,
    requestDeleteOuting,
    deleteOuting,
    denyOuting,
    isLoading,
    outing,
    isLoadingDoc,
    resendAlimtalk,
  } = useTeacherOutingDetail(Number(id))

  useEffect(() => {
    setOutingId(Number(id))
    setChangeMode(false)
  }, [id, setOutingId])

  if (isLoadingProps || isLoading || isLoadingBlockChain) {
    return <Blank reversed />
  }

  if (!outing && !isLoadingDoc) {
    return <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />
  }

  const isConfirmed = outing?.outingStatus === 'PROCESSED'

  const updatedAt = DateUtil.formatDate(outing ? outing.updatedAt : '', DateFormat['YYYY-MM-DD HH:mm'])
  // const startAt = DateUtil.formatDate(outing.startAt, DateFormat['YYYY-MM-DD HH:mm']);
  // const endAt = DateUtil.formatDate(outing.endAt, DateFormat['YYYY-MM-DD HH:mm']);

  if (changeMode && outing) {
    return (
      <OutingUpdatePage
        outingData={outing}
        isConfirmed={isConfirmed}
        setChangeMode={(b: boolean) => setChangeMode(b)}
      />
    )
  }

  // 결재권자 인지. 결재라인에 있으면 true, 없으면 false
  const approver =
    outing?.approver1Id === me?.id ||
    outing?.approver2Id === me?.id ||
    outing?.approver3Id === me?.id ||
    outing?.approver4Id === me?.id ||
    outing?.approver5Id === me?.id

  const approvedLine = [
    outing?.approver1Signature && outing?.approver1Id,
    outing?.approver2Signature && outing?.approver2Id,
    outing?.approver3Signature && outing?.approver3Id,
    outing?.approver4Signature && outing?.approver4Id,
    outing?.approver5Signature && outing?.approver5Id,
  ]
  // 내가 승인한 건 : ture , 승인 안한 건 : false
  const isApproved = approvedLine.includes(me?.id || 0)

  // 승인할 차례 : true, 승인전/승인후 : false
  // 지금은 순서가 없으므로, 결재유무만 판단
  //const nowApprove = outing?.nextApproverId === me?.id;
  const nowApprove = !isApproved

  // 승인 전 = !isApproved && !nowApprove
  // 승인 후 = isApproved && !nowApprove

  const checkButtonDisable = (bottonType: approveButtonType) => {
    return !buttonEnableState(
      bottonType,
      approver,
      nowApprove,
      outing?.outingStatus || '',
      outing?.studentGradeKlass === me?.klassGroupName,
    )
  }

  const handleResendAlimtalk = () =>
    resendAlimtalk().then(() => {
      alert('보호자에게 승인요청 알림을 보냈습니다.')
    })

  return (
    <>
      <div className="md:hidden">
        <TopNavbar title="상세보기" left={<BackButton />} />
      </div>
      <div className="md:h-screen-3 bg-white py-5 md:m-6 md:rounded-lg md:border">
        <div className="h-screen-13 md:h-screen-8 overflow-y-auto">
          <Section>
            {outing?.updateReason && (
              <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
                <div className="text-brand-1">{outing?.updateReason}</div>
                <div className="text-sm text-gray-500">{updatedAt}에 마지막으로 수정</div>
              </div>
            )}
            {outing?.outingStatus === 'RETURNED' && (
              <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
                <div className="text-brand-1 text-sm">{outing?.notApprovedReason}</div>
                <div className="text-red-500">반려 이유</div>
              </div>
            )}
            {data?.status && data?.status !== 'NO_DATA' && (
              <div className="flex justify-end">
                <CertificationBadge status={data?.status} />
              </div>
            )}
            {outing && <OutingDetail outing={outing} onResendAlimtalk={handleResendAlimtalk} />}
          </Section>
        </div>

        {errM && <div className="text-red-500">{errM}</div>}
        <div className="grid grid-cols-4 gap-2 px-2 pt-3 md:px-0">
          {PermissionUtil.hasOutingAuthorization(userRole) && (
            <>
              {outing?.writerName === me?.name && outing?.outingStatus !== OutingStatus.PROCESSED ? (
                <Button.xl
                  children={'삭제'}
                  onClick={() => {
                    if (confirm('확인증을 삭제하시겠습니까?')) {
                      deleteOuting()
                    }
                  }}
                  className="filled-red"
                />
              ) : (
                <Button.xl
                  children={outing?.outingStatus === 'DELETE_APPEAL' ? '삭제대기' : '삭제요청'}
                  disabled={checkButtonDisable(approveButtonType.DELETE)}
                  onClick={() => setDeleteAppeal(true)}
                  className="filled-red"
                />
              )}
              <Button.xl
                children={outing?.outingStatus === 'RETURNED' ? '반려됨' : '반려'}
                disabled={checkButtonDisable(approveButtonType.RETURN)}
                onClick={() => setDeny(true)}
                className="filled-blue"
              />
              <Button.xl
                children={isConfirmed ? '승인 후 수정' : '수정'}
                disabled={checkButtonDisable(approveButtonType.EDIT)}
                onClick={() => setChangeMode(true)}
                className="filled-yellow"
              />
              <Button.xl
                children={outing?.outingStatus === 'PROCESSED' ? '승인 완료' : '승인'}
                disabled={checkButtonDisable(approveButtonType.APPROVE)}
                onClick={() => {
                  setOpen(true)
                  setAgreeAll(false)
                }}
                className="filled-primary"
              />
            </>
          )}
        </div>

        <SuperModal modalOpen={deny} setModalClose={() => setDeny(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              이 학생의 확인증을 반려하시겠습니까?
            </div>
            <Textarea
              placeholder="반려 이유"
              value={notApprovedReason}
              onChange={(e) => setNotApprovedReason(e.target.value)}
            />
            <Button.xl
              children="반려하기"
              disabled={!notApprovedReason}
              onClick={() => denyOuting()}
              className="filled-primary"
            />
          </Section>
        </SuperModal>
        <SuperModal modalOpen={deleteAppeal} setModalClose={() => setDeleteAppeal(false)} className="w-max">
          <Section className="mt-7">
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              이 확인증을 삭제하도록 요청하시겠습니까?
            </div>
            <Textarea placeholder="삭제 이유" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} />
            <span className="text-sm text-red-400">* 교사가 삭제요청하면 학생 또는 보호자가 삭제할 수 있습니다.</span>
            <Button.xl
              children="삭제 요청하기"
              disabled={!deleteReason}
              onClick={() => requestDeleteOuting()}
              className="filled-red"
            />
          </Section>
        </SuperModal>
      </div>
    </>
  )
}
