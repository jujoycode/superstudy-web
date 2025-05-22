import { useState } from 'react'

import { SuperModal } from '@/legacy/components'
import { Blank, Label, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useTeacherFieldtripResultUpdate } from '@/legacy/container/teacher-fieldtrip-result-update'
import { Fieldtrip, FieldtripType, School } from '@/legacy/generated/model'
import { makeDateToString } from '@/legacy/util/time'

interface FieldtripResultUpdatePageProps {
  school?: School
  fieldtrip: Fieldtrip
  setReadState: () => void
  isConfirmed: boolean
}

export function FieldtripResultUpdatePage({ fieldtrip, setReadState, isConfirmed }: FieldtripResultUpdatePageProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [destination, setDestination] = useState(fieldtrip?.destination)
  const [resultText, setResultText] = useState(fieldtrip?.resultText || '')
  const [resultTitle, setResultTitle] = useState(fieldtrip?.resultTitle || '')
  const [updateReason, setUpdateReason] = useState('')

  const {
    errorMessage,
    isLoading,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    uploadFiles,
    resultReportedAt,
    setResultReportedAt,
  } = useTeacherFieldtripResultUpdate({
    fieldtripId: fieldtrip?.id,
    reportedAt: fieldtrip?.resultReportedAt,
    destination,
    overseas: fieldtrip?.overseas,
    resultText,
    resultTitle,
    resultFiles: fieldtrip?.resultFiles,
    updateReason,
    setReadState,
  })

  const buttonDisabled =
    fieldtrip?.type !== FieldtripType.HOME ? !destination || !resultText || !resultTitle : !destination

  function handleSubmitButton() {
    uploadFiles({ imageObjectMap })
  }

  return (
    <div className="scroll-box h-screen-10 overflow-y-scroll rounded-lg border bg-white py-5">
      {isLoading && <Blank reversed />}
      <Section>
        <Section className="bg-[#F7F7F7]">
          <h1 className="text-xl font-semibold">
            {fieldtrip?.type !== FieldtripType.HOME ? '교외 체험학습 결과 보고서' : '가정학습 결과 보고서'}
          </h1>
          <div className="mb-2 text-xs whitespace-pre-line text-red-600">
            제출기한 : {makeDateToString(new Date(fieldtrip?.endAt || ''), ' ')}
            까지
          </div>
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
              <span className="text-primary-800 underline">
                {fieldtrip?.currentRemainDays}일 중 {fieldtrip?.usedDays}일 신청
              </span>
              합니다.
            </div>
            <div className="mb-2 text-xs whitespace-pre-line text-gray-600">
              ※<span className="font-bold">토,일, 개교기념일 등 학교 휴업일</span>은 체험학습 신청 일수에 넣지 않음.
            </div>
            <div>
              <label className="mb-1 text-sm text-gray-800">*결과보고서 신고일</label>
              <div className="flex items-center">
                <input
                  id="startAt"
                  type="date"
                  value={resultReportedAt}
                  className="focus:border-primary-800 h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                  onChange={(e) => {
                    setResultReportedAt(e.target.value)
                  }}
                />
              </div>
            </div>
            {fieldtrip?.type !== FieldtripType.HOME && (
              <Label.col>
                <Label.Text children="*체험학습 형태" />
                <TextInput placeholder={fieldtrip?.form} disabled />
              </Label.col>
            )}
            <Label.col>
              <Label.Text children="*목적지" />
              <TextInput
                placeholder="목적지를 입력해주세요."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={destination ? 'border-gray-300' : 'border-red-700'}
              />
            </Label.col>
          </div>
          {fieldtrip?.type !== FieldtripType.HOME && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-800">*현장학습 결과 보고서 작성 </div>
              </div>
              <Label.col>
                <Label.Text children="*제목" />
                <TextInput
                  placeholder="내용을 입력해주세요."
                  value={resultTitle}
                  onChange={(e) => setResultTitle(e.target.value)}
                  className={resultTitle ? 'border-gray-300' : 'border-red-700'}
                />
              </Label.col>
              <Label.col>
                <Label.Text children="*내용" />
                <Textarea
                  placeholder=" 할아버지 칠순 잔치에 대한 참여는 가족과 좋은 시간을 보냈습니다. 경주의 역사 유적지를 방문하면서 신라 시대의 장엄한 유산과 불교문화의 중요성에 대해 깊이 이해할 수 있었습니다.
                  대구에 살고 있는 조부모와 친척들을 만나는 시간은 가족 간의 유대를 더욱 강화하는 계기가 되었습니다. 서로의 이야기를 나누고 공감하는 과정에서 가족 간의 우애와 사랑이 더욱 깊어졌습니다"
                  rows={10}
                  value={resultText}
                  onChange={(e) => {
                    const input = e.target.value //removeControlCharacters(e.target.value);
                    setResultText(input)
                  }}
                  className="h-auto border"
                />
              </Label.col>

              <div>
                <Label.Text children="이미지" />
                <div className="mt-1 grid w-full grid-flow-row grid-cols-3 gap-2">
                  {[...imageObjectMap].map(([key, value]) => (
                    <ImageObjectComponent
                      key={key}
                      id={key}
                      imageObjet={value}
                      onDeleteClick={toggleImageDelete}
                      cardType={true}
                    />
                  ))}
                  <ImageUpload onChange={handleImageAdd} />
                </div>
              </div>
            </>
          )}

          {errorMessage && <div className="text-red-600">{errorMessage}</div>}
        </Section>
        <div className="mt-3 flex w-full items-center space-x-2">
          <Button.xl
            children="수정하기"
            disabled={buttonDisabled}
            onClick={() => {
              if (isConfirmed) {
                setModalOpen(true)
              } else {
                handleSubmitButton()
              }
            }}
            className="filled-primary w-full"
          />
          <Button.xl children="취소하기" onClick={() => setReadState()} className="filled-gray w-full" />
        </div>

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </Section>
      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            이 체험학습 결과보고서를 수정하시는 이유를 적어주세요.
          </div>
          <Textarea placeholder="수정 이유" value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} />
          <Button.xl children="수정하기" onClick={handleSubmitButton} className="filled-red" />
        </Section>
      </SuperModal>
    </div>
  )
}
