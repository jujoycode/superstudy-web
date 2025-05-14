import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { SignPad, ToSign } from '@/legacy/components/common/SignPad'
import { OutingDetail } from '@/legacy/components/outing/OutingDetail'
import { useDialog } from '@/legacy/container/DialogContext'
import { useStudentOutingDetail } from '@/legacy/container/student-outing-detail'
import { UserContainer } from '@/legacy/container/user'
import { OutingStatus, OutingUse, Role } from '@/legacy/generated/model'
import { useSignedUrl } from '@/legacy/lib/query'
import { useUserStore } from '@/stores2/user'
import { OutingAddPage } from './OutingAddPage'

export function OutingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { me } = UserContainer.useContext()
  const { child: myChild } = useUserStore()
  const { outing, isLoading, error, deleteOuting, errorMessage, openSignModal, setSignModal, signOuting } =
    useStudentOutingDetail(Number(id))

  const [mode, setMode] = useState(false)

  const { confirm } = useDialog()

  const { data: parentSignature } = useSignedUrl(outing?.parentSignature)
  const { data: approver1Signature } = useSignedUrl(outing?.approver1Signature)
  const { data: approver2Signature } = useSignedUrl(outing?.approver2Signature)
  const { data: approver3Signature } = useSignedUrl(outing?.approver3Signature)
  const { data: approver4Signature } = useSignedUrl(outing?.approver4Signature)
  const { data: approver5Signature } = useSignedUrl(outing?.approver5Signature)

  const isProccesing =
    !!parentSignature ||
    !!approver1Signature ||
    !!approver2Signature ||
    !!approver3Signature ||
    !!approver4Signature ||
    !!approver5Signature

  if (mode && outing) {
    return (
      <OutingAddPage
        outingData={outing}
        goDetail={() => {
          setMode(false)
        }}
      />
    )
  }

  const deleteHandler = async () => {
    if (await confirm('경고', `삭제하시겠습니까?`)) deleteOuting()
  }

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      {isLoading && <Blank />}
      <TopNavbar
        title={'확인증'}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      <div className="px-3 pt-5">
        {outing?.outingStatus === 'RETURNED' && (
          <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
            <div className="text-brand-1 text-sm">{outing?.notApprovedReason}</div>
            <div className="text-red-500">반려 이유</div>
          </div>
        )}
        {outing?.outingStatus === 'DELETE_APPEAL' && (
          <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
            <div className="text-brand-1 text-sm">{outing?.deleteReason}</div>
            <div className="text-red-500">삭제 이유</div>
          </div>
        )}
        {outing?.outingStatus === 'PROCESSED' && (
          <div className="bg-brand-5 rounded-lg px-5 py-2">
            <div className="text-red-500">승인완료</div>
          </div>
        )}
        {outing?.outingStatus === 'BEFORE_TEACHER_APPROVAL' && (
          <div className="bg-brand-5 rounded-lg px-5 py-2">
            <div className="text-gray-900">학교 승인 대기</div>
          </div>
        )}
        {outing?.outingStatus === OutingStatus.PROCESSING && (
          <div className="bg-brand-5 rounded-lg px-5 py-2">
            <div className="text-gray-900">학교 승인 중</div>
          </div>
        )}
        <br />
        <OutingDetail outing={outing} />
      </div>

      {me?.role === Role.USER && outing?.outingStatus !== OutingStatus.PROCESSED && (
        <div className="px-2">
          <div className="text-red-500">{errorMessage}</div>
          <Button.lg
            children="수정하기"
            disabled={outing?.outingStatus === 'DELETE_APPEAL' || (outing?.outingStatus !== 'RETURNED' && isProccesing)}
            onClick={() => setMode(true)}
            className="filled-primary w-full"
          />

          <Button.lg
            children="삭제하기"
            disabled={outing?.outingStatus !== 'DELETE_APPEAL' && outing?.outingStatus !== 'RETURNED' && isProccesing}
            onClick={deleteHandler}
            className="filled-red mt-2 w-full"
          />
        </div>
      )}

      {me?.role === Role.PARENT && (
        <div className="px-2">
          {myChild?.school.isOutingActive === OutingUse.USE_PARENT_APPROVE &&
          (outing?.outingStatus === OutingStatus.BEFORE_PARENT_APPROVAL ||
            outing?.outingStatus === OutingStatus.DELETE_APPEAL ||
            outing?.outingStatus === OutingStatus.RETURNED) ? (
            <>
              <div className="text-red-500">{errorMessage}</div>
              <Button.lg
                children="승인하기"
                disabled={outing?.outingStatus === 'DELETE_APPEAL' || outing?.outingStatus === 'RETURNED'}
                onClick={() => setSignModal(true)}
                className="filled-primary w-full"
              />
              {/* <Button.lg
                children="수정하기"
                disabled={outing?.outingStatus === 'DELETE_APPEAL' || outing?.outingStatus !== 'RETURNED'}
                onClick={() => setMode(true)}
                className="filled-primary mt-2 w-full"
              /> */}

              <Button.lg
                children="삭제하기"
                disabled={
                  outing?.outingStatus !== 'DELETE_APPEAL' && outing?.outingStatus !== 'RETURNED' && isProccesing
                }
                onClick={deleteHandler}
                className="filled-red mt-2 w-full"
              />
            </>
          ) : (
            <Button.lg
              children="삭제하기"
              disabled={outing?.outingStatus !== 'DELETE_APPEAL' && outing?.outingStatus !== 'RETURNED' && isProccesing}
              onClick={deleteHandler}
              className="filled-red mt-2 w-full"
            />
          )}
        </div>
      )}

      <div className={openSignModal ? '' : 'hidden'}>
        <Blank text="  " />
        <SignPad
          ToSigns={[ToSign.PARENT]}
          onClose={() => setSignModal(false)}
          onComplete={(signData: string[]) => {
            setSignModal(false)
            signOuting(signData[0])
          }}
        ></SignPad>
      </div>
    </>
  )
}
