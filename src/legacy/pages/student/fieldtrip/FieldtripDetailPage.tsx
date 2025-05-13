import { useState } from 'react'
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FieldtripPaper } from '@/legacy/components/fieldtrip/FieldtripPaper'
import { FieldtripSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSeparatePaper'
import { FieldtripSuburbsSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSuburbsSeparatePaper'
import { useStudentFieldtripDetail } from '@/legacy/container/student-fieldtrip-detail'
import { UserContainer } from '@/legacy/container/user'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { getNickName } from '@/legacy/util/status'

import { FieldtripAddPage } from './FieldtripAddPage'

export function FieldtripDetailPage() {
  const { push } = useHistory()

  const { id } = useParams<{ id: string }>()
  const [mode, setMode] = useState(false)
  const { me, isMeLoading } = UserContainer.useContext()
  const { fieldtrip, isFieldtripLoading, error, deleteFieldtrip, resendAlimtalk, errorMessage, refetchFieldtrip } =
    useStudentFieldtripDetail(Number(id))

  let homeplans: Record<string, string>[] = []

  try {
    if (fieldtrip?.type === 'HOME') {
      const content = JSON.parse(fieldtrip?.content || '[]')
      if (content[0].subject1) {
        homeplans = content?.slice(1)
      } else {
        const subContent = content?.slice(5)
        homeplans = Array.from({ length: Math.ceil(subContent.length / 10) }, (_, index) =>
          subContent.slice(index * 10, index * 10 + 10),
        )
      }
    }
  } catch (err) {
    console.log(err)
  }

  const applyFilesWithTwo: string[][] = []

  try {
    if (fieldtrip?.applyFiles instanceof Array) {
      let chunk = []

      for (let i = 0; i < fieldtrip?.applyFiles?.length; i++) {
        chunk.push(fieldtrip?.applyFiles[i])
        if (i % 2 === 1) {
          applyFilesWithTwo.push(chunk)
          chunk = []
        }
      }
      if (chunk.length > 0) {
        applyFilesWithTwo.push(chunk)
      }
    }
  } catch (err) {
    console.log(err)
  }

  const isLoading = isMeLoading || isFieldtripLoading

  if (mode) {
    return (
      <FieldtripAddPage
        fieldtripData={fieldtrip}
        returnToDetail={() => {
          setMode(false)
          refetchFieldtrip()
        }}
      />
    )
  }

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar title="체험학습 신청서 상세" left={<BackButton />} />
      <Section>
        {fieldtrip?.fieldtripStatus === 'RETURNED' && (
          <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
            <div className="text-brand-1 text-sm">{fieldtrip?.notApprovedReason}</div>
            <div className="text-red-500">반려 이유</div>
          </div>
        )}
        {fieldtrip?.fieldtripStatus === 'DELETE_APPEAL' && (
          <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
            <div className="text-brand-1 text-sm">{fieldtrip?.deleteReason}</div>
            <div className="text-red-500">삭제 이유</div>
          </div>
        )}
        <div className="mx-5 mt-2">
          ※ 연간 {me?.school?.fieldtripDays} 일 중, 금회 {fieldtrip?.usedDays} 일, 누적{' '}
          {me?.school?.fieldtripDays &&
            fieldtrip?.currentRemainDays &&
            fieldtrip?.usedDays &&
            me?.school.fieldtripDays - fieldtrip.currentRemainDays + fieldtrip.usedDays}{' '}
          일 사용하여 잔여{' '}
          {fieldtrip?.currentRemainDays && fieldtrip?.usedDays && fieldtrip?.currentRemainDays - fieldtrip?.usedDays} 일
          남았습니다.
        </div>
        {fieldtrip?.type === 'HOME' && fieldtrip?.usedDays > 1 && homeplans?.length === 0 && (
          <div className="mx-5 mt-2 text-red-500">※ 전 일정 동일한 계획으로 가정학습을 신청합니다.</div>
        )}

        <div className="w-full bg-white p-5">
          <FieldtripPaper school={me?.school} fieldtrip={fieldtrip} type="신청서" />
        </div>
        {fieldtrip?.type === 'HOME' && (
          <>
            {homeplans?.map((content: any, i: number) => (
              <div key={i} className="w-full bg-white p-5">
                <FieldtripSeparatePaper
                  studentName={fieldtrip?.student?.name + getNickName(fieldtrip?.student?.nickName)}
                  studentGradeKlass={fieldtrip?.studentGradeKlass + ' ' + fieldtrip?.studentNumber + '번'}
                  fieldtrip={fieldtrip}
                  index={i + 1}
                  content={content}
                  type="신청서"
                />
              </div>
            ))}
          </>
        )}

        {fieldtrip?.type === 'SUBURBS' && (
          <>
            {applyFilesWithTwo.map((el: string[], i: number) => (
              <div key={i} className="w-full bg-white p-5">
                <FieldtripSuburbsSeparatePaper
                  studentName={(fieldtrip?.student?.name || '') + getNickName(fieldtrip?.student?.nickName)}
                  fieldtrip={fieldtrip}
                  resultFile1={el[0]}
                  resultFile2={el[1]}
                  title="신청서"
                />
              </div>
            ))}
          </>
        )}

        <div className="text-red-500">{errorMessage}</div>
        <>
          {me?.role === Role.PARENT && fieldtrip?.fieldtripStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM && (
            <Button.lg
              children="승인하기"
              onClick={() => push(`/fieldtrip/approve/${fieldtrip?.id}`)}
              className={'bg-brand-1 text-white'}
            />
          )}

          {(fieldtrip?.fieldtripStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM ||
            fieldtrip?.fieldtripStatus === FieldtripStatus.RETURNED ||
            fieldtrip?.nextApprover === 'approver1') && (
            <Button.lg children="수정하기" onClick={() => setMode(true)} className={'bg-yellow-500 text-white'} />
          )}

          {me?.role != Role.PARENT && fieldtrip?.fieldtripStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM && (
            <Button.lg
              children="알림톡 재전송하기"
              onClick={() => resendAlimtalk()}
              className="bg-blue-500 text-white"
            />
          )}

          {(fieldtrip?.fieldtripStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM ||
            fieldtrip?.fieldtripStatus === FieldtripStatus.RETURNED ||
            fieldtrip?.fieldtripStatus === FieldtripStatus.DELETE_APPEAL ||
            fieldtrip?.nextApprover === 'approver1') && (
            <Button.lg children="삭제하기" onClick={deleteFieldtrip} className="bg-red-500 text-white" />
          )}
        </>

        <div className="h-32 w-full" />
      </Section>
    </>
  )
}
