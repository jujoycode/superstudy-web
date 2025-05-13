import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import {
  BackButton,
  Blank,
  BottomFixed,
  Label,
  PhoneNumberField,
  Section,
  Textarea,
  TopNavbar,
} from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { MobileImageUpload } from '@/legacy/components/common/MobileImageUpload'
import { SignDataCheck, SignPad, ToSign } from '@/legacy/components/common/SignPad'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useStudentFieldtripSuburbsReportAdd } from '@/legacy/container/student-fieldtrip-suburbs-report-add'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { getCustomString } from '@/legacy/util/string'
import { makeDateToString } from '@/legacy/util/time'

export function FieldtripSuburbsReportAddPage() {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const {
    fieldtrip,
    isLoading,
    error,
    errorMessage,
    updateFieldtripResult,
    isUpdateFieldtripSuccess,
    parentsPhone,
    parentsName,
    destination,
    overseas,
    resultText,
    resultTitle,
    setParentsPhone,
    setParentsName,
    setDestination,
    setResultText,
    setResultTitle,
    me,
    approverName,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
  } = useStudentFieldtripSuburbsReportAdd({ id: Number(id) })

  const [agree, setAgree] = useState(false)
  const [openSignModal, setSignModal] = useState(false)
  const trimmedContent = resultText.replace(/ /g, '')

  if (fieldtrip && isUpdateFieldtripSuccess) {
    if (fieldtrip?.fieldtripResultStatus === FieldtripStatus.WAITING) {
      return (
        <>
          <TopNavbar
            title="체험학습 신청서"
            left={
              <div className="h-15">
                <BackButton className="h-15" />
              </div>
            }
          />
          <div className="h-screen-15 flex w-full flex-col items-center justify-center text-center">
            <div className="text-xl font-bold text-gray-600">체험학습 결과보고서 제출 완료</div>
            <div className="mt-4 text-gray-400">
              결과보고서 제출이 완료되었습니다. {me?.role === Role.USER && '보호자, '}
              {approverName}의 서명 후 결재 승인이 완료됩니다.
            </div>
            <BottomFixed className="bottom-16 px-5">
              <Button.lg
                children="결과보고서 확인하기"
                onClick={() => push(`/student/fieldtrip/result/${fieldtrip.id}`)}
                className="filled-primary w-full"
              />
              <Button.lg
                children="목록으로 가기"
                onClick={() => push(`/student/fieldtrip`)}
                className="outlined-primary mt-4 w-full"
              />
            </BottomFixed>
          </div>
        </>
      )
    } else {
      push(`/student/fieldtrip/result/${fieldtrip.id}`)
    }
  }

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar title="교외 체험학습 결과 보고서" left={<BackButton />} />
      <Section className="bg-[#F7F7F7]">
        <h1 className="text-xl font-semibold">교외 체험학습 결과 보고서</h1>
        {/* <div className="mb-2 whitespace-pre-line text-xs text-red-600">
          제출기한 : {makeDateToString(new Date(fieldtrip?.endAt || ''), ' ')}
          까지
        </div> */}
        <label className="mb-1 text-sm text-gray-800">*기간</label>
        <div className="space-y-3 pb-6">
          <div>
            <div className="flex items-center space-x-4">
              <div className="text-lg">
                {fieldtrip?.startAt && makeDateToString(new Date(fieldtrip?.startAt || ''), '. ')}
              </div>
              <span className="">부터</span>
            </div>
            <div className="flex items-center space-x-4 pt-2">
              <div className="text-lg">
                {fieldtrip?.endAt && makeDateToString(new Date(fieldtrip?.endAt || ''), '. ')}
              </div>
              <span className="">까지</span>
            </div>
          </div>
          <div className="mb-2 text-lg whitespace-pre-line">
            남은 일수
            <span className="text-brand-1 underline">
              {fieldtrip?.currentRemainDays}일 중 {fieldtrip?.usedDays}일 신청
            </span>
            합니다.
          </div>
          <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
            ※<span className="font-bold">토,일, 개교기념일 등 학교 휴업일</span>은 체험학습 신청 일수에 넣지 않음.
          </div>
          <Label.col>
            <Label.Text children="*체험학습 형태" />
            <TextInput placeholder={fieldtrip?.form} disabled />
          </Label.col>
          <Label.col>
            <Label.Text children="*목적지" />
            <div className="flex items-center space-x-2">
              <TextInput
                placeholder="목적지를 입력해주세요."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <span className="w-16">
                {overseas
                  ? `(${t(getCustomString(me?.school?.id, 'oversea'), '해외')})`
                  : `(${t(getCustomString(me?.school?.id, 'domestic'), '국내')})`}{' '}
              </span>
            </div>
          </Label.col>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-800">*현장학습 결과 보고서 작성 </div>
        </div>
        <Label.col>
          <Label.Text children="*제목" />
          <TextInput
            placeholder="제목을 입력해주세요."
            value={resultTitle}
            onChange={(e) => setResultTitle(e.target.value)}
          />
        </Label.col>
        <div>
          <Textarea
            placeholder="할아버지 칠순 잔치에 대한 참여는 가족과 좋은 시간을 보냈습니다. 경주의 역사 유적지를 방문하면서 신라 시대의 장엄한 유산과 불교문화의 중요성에 대해 깊이 이해할 수 있었습니다.
          대구에 살고 있는 조부모와 친척들을 만나는 시간은 가족 간의 유대를 더욱 강화하는 계기가 되었습니다. 서로의 이야기를 나누고 공감하는 과정에서 가족 간의 우애와 사랑이 더욱 깊어졌습니다"
            rows={10}
            value={resultText}
            onChange={(e) => {
              setResultText(e.target.value)
            }}
            className="h-auto border"
          />
          <div className="flex items-center justify-end">
            공백제외&nbsp;<span className="text-brand-1">{trimmedContent.length}</span>&nbsp;자&nbsp; 공백포함&nbsp;
            <span className="text-brand-1">{resultText.length}</span>&nbsp;자
          </div>
        </div>

        <div className="grid w-full grid-flow-row gap-2">
          {[...imageObjectMap].map(([key, value]) => (
            <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
          ))}
          <MobileImageUpload
            onChange={(e) => {
              if (!e.target.files?.[0]) return
              if (!e.target.files?.[0]?.type?.includes('image')) return alert('이미지 파일만 업로드 가능합니다.')
              handleImageAdd(e)
            }}
          />
        </div>

        {me?.role === Role.USER && (
          <>
            <Label.col>
              <Label.Text children="보호자 이름" />
              <TextInput
                placeholder="보호자 이름을 입력해주세요."
                value={parentsName}
                disabled={parentsName ? true : false}
                onChange={(e) => setParentsName(e.target.value)}
                className={clsx(parentsName ? 'border-gray-300' : 'border-red-700')}
              />
            </Label.col>
            <Label.col>
              <Label.Text children="보호자 연락처" />
              <PhoneNumberField
                value={parentsPhone || '010'}
                disabled={
                  parentsPhone !== undefined &&
                  parentsPhone !== '' &&
                  parentsPhone !== '010' &&
                  parentsPhone.length >= 10
                    ? true
                    : false
                }
                onChange={(e) => setParentsPhone(e.target.value)}
                style={{ borderColor: !parentsPhone ? 'rgba(185, 28, 28)' : '' }}
              />
              <div className="mt-2 mb-2 text-xs whitespace-pre-line text-gray-600">
                * {t('parent_info_edit_my_page', '보호자 정보 수정은 보호자의 MY페이지에서만 가능합니다.')}
              </div>
            </Label.col>
          </>
        )}
        <Label.row>
          <Checkbox checked={agree} onChange={() => setAgree(!agree)} />
          <p className="text-lg font-semibold">아래 내용을 체크하셨습니까?</p>
        </Label.row>
        <p className="mt-1 rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line">
          {me?.role === Role.USER ? '-신고자는 학생 본인입니다.' : '-보호자의 지도 하에 학생과 함께 신청합니다.'}
        </p>
        <Button.lg
          children="제출하기"
          disabled={!resultTitle || !resultText || !agree}
          onClick={() => {
            const regExp = /^010(?:\d{4})\d{4}$/
            if (parentsPhone && !regExp.test(parentsPhone.replace(/-/g, ''))) {
              alert('보호자 연락처를 확인해 주세요.')
              return
            }

            // if (
            //   fieldtrip?.fieldtripResultStatus === FieldtripStatus.WAITING ||
            //   fieldtrip?.fieldtripResultStatus === FieldtripStatus.RETURNED
            // ) {
            setSignModal(true)
            // } else {
            //   updateFieldtripResult(imageObjectMap, ['', '']);
            // }
          }}
          className="filled-primary"
        />

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
      <div className={openSignModal ? '' : 'hidden'}>
        <Blank text="" />
        <SignPad
          ToSigns={me?.role === Role.USER ? [ToSign.STUDENT] : [ToSign.STUDENT, ToSign.PARENT]}
          onClose={() => setSignModal(false)}
          onComplete={(signData: string[]) => {
            setSignModal(false)

            if (SignDataCheck(me?.role, signData)) {
              updateFieldtripResult(imageObjectMap, signData)
            }
          }}
        ></SignPad>
      </div>
    </>
  )
}
