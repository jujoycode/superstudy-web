import { cn } from '@/utils/commonUtil'
import { t } from 'i18next'
import moment from 'moment'
import { useState } from 'react'
import { useUserStore } from '@/stores/user'
import { ErrorBlank, SelectValues, SuperModal } from '@/legacy/components'
import { BackButton, Badge, Blank, Label, PhoneNumberField, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { MobileImageUpload } from '@/legacy/components/common/MobileImageUpload'
import { ProgressBar } from '@/legacy/components/common/ProgressBar'
import { SignDataCheck, SignPad, ToSign } from '@/legacy/components/common/SignPad'
import { TextInput } from '@/legacy/components/common/TextInput'
import { FieldtripDatePicker } from '@/legacy/components/fieldtrip/FieldtripDatePicker'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useCommonGetHolidays } from '@/legacy/container/common-get-holidays'
import { useStudentAbsentAdd } from '@/legacy/container/student-absent-add'
import { UserContainer } from '@/legacy/container/user'
import { Absent, AbsentStatus, Role } from '@/legacy/generated/model'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { AbsentTimeType } from '@/legacy/types'
import { makeDateToString } from '@/legacy/util/time'

const reportType = ['결석', '지각', '조퇴', '결과']
const descriptionType = ['인정', '질병', '기타', '미인정']

interface AbsentAddPageProps {
  absentData?: Absent
  returnToDetail?: () => void
}

export function AbsentAddPage({ absentData, returnToDetail }: AbsentAddPageProps) {
  const { me } = UserContainer.useContext()
  const { child: myChild } = useUserStore()

  const [agree, setAgree] = useState(false)

  const { holidays } = useCommonGetHolidays()
  const {
    imageObjectMap: image2ObjectMap,
    handleImageAdd: handleImage2Add,
    toggleImageDelete: toggleImage2Delete,
  } = useImageAndDocument({
    images: absentData?.evidenceFiles2,
  })

  const {
    state: {
      reason,
      reasonText,
      report,
      evidenceType,
      evidenceTypeText,
      isEvidenceFile2,
      evidenceType2,
      evidenceType2Text,
      parentsName,
      parentsPhone,
      startAt,
      endAt,
      description,
      parentComment,
      startHour,
      endHour,
      errorMessage,
      isLoading,
      openSignModal,
      startMinute,
      endMinute,
      timeType,
      startPeriod,
      endPeriod,
      mensesTexts,
      mensesDialog,
    },
    setState: {
      setReason,
      setReasonText,
      setReport,
      setEvidenceType,
      setEvidenceTypeText,
      setIsEvidenceFile2,
      setEvidenceType2,
      setEvidenceType2Text,
      setParentsName,
      setParentsPhone,
      setStartAt,
      setEndAt,
      setDescription,
      setParentComment,
      setStartMinute,
      setEndMinute,
      setLoading,
      setSignModal,
      setStartHour,
      setEndHour,
      setTimeType,
      setStartPeriod,
      setEndPeriod,
      setMensesDialog,
    },
    reasonType,
    desType,
    updateAbsent,
    createAbsent,
    error,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    hasNoImageToUpload,
    uploadProgress,
  } = useStudentAbsentAdd({
    absentData,
    returnToDetail,
  })

  const buttonDisabled =
    !agree ||
    (reason === '학교장 출석인정' || reason === '기타' ? !reasonText : !reasonType.includes(reason)) ||
    !descriptionType.includes(description) ||
    (evidenceType === '기타' ? !evidenceTypeText : !desType[description]?.evidenceFileType.includes(evidenceType)) ||
    !reportType.includes(report) ||
    (me?.role === Role.USER && !parentsName) ||
    (me?.role === Role.USER && !(parentsPhone.trim().replace(/-/g, '').length === 11)) ||
    !startAt ||
    (report !== '결석' ? !startAt && !endAt : !endAt) ||
    (!absentData ? evidenceType === '기타' && hasNoImageToUpload : false) ||
    (report !== '결석' && timeType === AbsentTimeType.PERIOD && (startPeriod === '0' || endPeriod === '0')) ||
    (me?.role === Role.PARENT && evidenceType === '학부모 확인서' && !parentComment)

  return (
    <>
      {/* {loading && <Blank />} */}
      {/* {isLoading && <Blank text={uploadProgress.toString()} />} */}
      {isLoading && (
        <ProgressBar
          progress={uploadProgress}
          text={`작성한 내용을 제출 중입니다.\n페이지를 나가면 서류제출이 취소됩니다.`}
        />
      )}
      {error && <ErrorBlank />}
      <TopNavbar
        title={`${t(`absentTitle`, '결석신고서')} 작성`}
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section>
        {me?.role === Role.PARENT ? (
          <Label.col>
            <Label.Text children="학생 이름" />
            <TextInput value={myChild?.name} disabled />
          </Label.col>
        ) : (
          <Label.col>
            <Label.Text children="학생 이름(본인)" />
            <TextInput value={me?.name} className="bg-gray-100" disabled />
          </Label.col>
        )}
        {me?.role === Role.PARENT ? (
          <Label.col>
            <Label.Text children="학생 학년/반/번호" />
            <TextInput value={myChild?.klassGroupName + ' ' + myChild?.studentNumber + '번'} disabled />
          </Label.col>
        ) : (
          <Label.col>
            <Label.Text children="학생 학년/반/번호" />
            <TextInput value={me?.klassGroupName + ' ' + me?.studentNumber + '번'} disabled />
          </Label.col>
        )}

        <div className="w-full">
          <SelectValues
            label="*신고유형"
            placeholder="선택"
            selectValues={reportType}
            value={report}
            onChange={(group) => setReport(group)}
            className={reportType.includes(report) ? 'border border-gray-300' : 'border-2 border-red-700'}
          />
          <SelectValues
            placeholder="선택"
            selectValues={descriptionType}
            value={description}
            onChange={(group) => {
              setDescription(group)
              if (!desType[group]?.reasonType?.includes(reason)) {
                setReason('')
              }
              if (!desType[group]?.evidenceFileType?.includes(evidenceType)) {
                setEvidenceType('')
              }
            }}
            className={descriptionType.includes(description) ? 'border border-gray-300' : 'border-2 border-red-700'}
          />
        </div>
        {report === '결석' && (
          <div className="w-full pb-6">
            <label className="mb-1 text-sm text-gray-800">*발생일</label>
            <div className="mb-3 flex items-center">
              <FieldtripDatePicker
                selectedDate={new Date(startAt)}
                excludeDates={holidays}
                hasSaturdayClass
                placeholderText="시작 날짜"
                onChange={(selectedDate) => {
                  if (!selectedDate) {
                    return
                  }

                  if (endAt && selectedDate > new Date(endAt)) {
                    setEndAt(makeDateToString(selectedDate))
                  }
                  setStartAt(makeDateToString(selectedDate))
                }}
              />
              <span className="ml-3 flex-shrink-0">일 부터</span>
            </div>
            <div className="flex items-center">
              <FieldtripDatePicker
                selectedDate={new Date(endAt)}
                excludeDates={holidays}
                hasSaturdayClass
                placeholderText="종료 날짜"
                onChange={(selectedDate) => {
                  if (!selectedDate) {
                    return
                  }

                  if (startAt && selectedDate < new Date(startAt)) {
                    setStartAt(makeDateToString(selectedDate))
                  }
                  setEndAt(makeDateToString(selectedDate))
                }}
              />
              <span className="ml-3 flex-shrink-0">일 까지</span>
            </div>
          </div>
        )}
        {report !== '결석' && (
          <div className="pb-6">
            <label className="mb-1 text-sm text-gray-800">*발생일</label>
            <FieldtripDatePicker
              selectedDate={new Date(startAt)}
              excludeDates={holidays}
              hasSaturdayClass
              placeholderText="시작 날짜"
              onChange={(selectedDate) => {
                if (!selectedDate) {
                  return
                }

                if (endAt && selectedDate > new Date(endAt)) {
                  setEndAt(makeDateToString(selectedDate))
                }
                setStartAt(makeDateToString(selectedDate))
              }}
            />
            <div className="flex w-full items-end space-x-2 py-4">
              <label className="mb-1.5 text-sm text-gray-800">발생시간 : </label>
              <Badge
                children="교시설정"
                onClick={() => setTimeType(AbsentTimeType.PERIOD)}
                className={cn(
                  'py-1.5',
                  timeType === AbsentTimeType.PERIOD ? 'bg-brand-1 text-white' : 'bg-white text-black',
                )}
              />
              <Badge
                children="시간설정"
                onClick={() => setTimeType(AbsentTimeType.TIME)}
                className={cn(
                  'py-1.5',
                  timeType === AbsentTimeType.TIME ? 'bg-brand-1 text-white' : 'bg-white text-black',
                )}
              />
              <Badge
                children="사용안함"
                onClick={() => setTimeType(AbsentTimeType.NONE)}
                className={cn(
                  'py-1.5',
                  timeType === AbsentTimeType.NONE ? 'bg-brand-1 text-white' : 'bg-white text-black',
                )}
              />
            </div>
            {timeType === AbsentTimeType.TIME && (
              <div className="flex items-center space-x-2">
                <span>
                  <TextInput
                    type="text"
                    min="0"
                    max="24"
                    maxLength={2}
                    className="focus:border-brand-1 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    value={startHour}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        if (!isNaN(Number(e.target.value))) {
                          const _startHour = Number(e.target.value)
                          if (Number(e.target.value) >= 0 && _startHour < 24) {
                            setStartHour(_startHour)
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const _startHour = Number(e.target.value)
                      if (startHour > endHour) {
                        setEndHour(startHour + 1)
                      }
                      if (_startHour === endHour && startMinute > endMinute) {
                        setEndMinute(startMinute)
                      }
                    }}
                  />
                  <span className="text-sm"> 시 </span>
                  <TextInput
                    type="text"
                    min="0"
                    max="59"
                    maxLength={2}
                    className="focus:border-brand-1 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    value={startMinute}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        if (!isNaN(Number(e.target.value))) {
                          const _startMinute = Number(e.target.value)
                          if (_startMinute >= 0 && _startMinute < 60) {
                            setStartMinute(_startMinute)
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const _startMinute = Number(e.target.value)
                      // if (startMinute > endMinute) {
                      //   setEndMinute(startMinute);
                      // }
                      if (startHour === endHour && _startMinute > endMinute) {
                        setEndMinute(_startMinute)
                      }
                    }}
                  />
                  <span className="text-sm"> 분 부터 </span>
                  <br />
                  <TextInput
                    type="text"
                    min="0"
                    max="24"
                    maxLength={2}
                    className="focus:border-brand-1 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    value={endHour}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        if (!isNaN(Number(e.target.value))) {
                          const _endHour = Number(e.target.value)
                          if (_endHour >= 0 && _endHour < 24) {
                            setEndHour(_endHour)
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const _endHour = Number(e.target.value)
                      if (startHour > _endHour) {
                        setStartHour(_endHour)
                      }
                      if (startHour === _endHour && startMinute > endMinute) {
                        setEndMinute(startMinute)
                      }
                    }}
                  />
                  <span className="text-sm"> 시 </span>
                  <TextInput
                    type="text"
                    min="0"
                    max="59"
                    maxLength={2}
                    className="focus:border-brand-1 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    value={endMinute}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        if (!isNaN(Number(e.target.value))) {
                          const _endMinute = Number(e.target.value)
                          if (_endMinute >= 0 && _endMinute < 60) {
                            setEndMinute(_endMinute)
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const _endMinute = Number(e.target.value)
                      if (startHour === endHour && startMinute > _endMinute) {
                        setStartMinute(_endMinute)
                      }
                    }}
                  />
                  <span className="text-sm"> 분 까지 </span>
                </span>
              </div>
            )}
            {timeType === AbsentTimeType.PERIOD && (
              <div className="flex items-center space-x-2">
                <SelectValues
                  placeholder="선택"
                  selectValues={['조회', '1', '2', '3', '4', '5', '6', '7', '8', '9', '종례']}
                  value={startPeriod}
                  onChange={(stime: string) => {
                    if (stime !== '조회' && (endPeriod === '조회' || stime > endPeriod)) {
                      setEndPeriod(stime)
                    }
                    setStartPeriod(stime)
                  }}
                  className={startPeriod !== '0' ? 'w-16 border border-gray-300' : 'w-16 border-2 border-red-700'}
                />
                <span className="text-sm"> 교시부터 </span>
                <SelectValues
                  placeholder="선택"
                  selectValues={['조회', '1', '2', '3', '4', '5', '6', '7', '8', '9', '종례']}
                  value={endPeriod}
                  onChange={(etime: string) => {
                    if (startPeriod !== '조회' && (etime === '조회' || etime < startPeriod)) {
                      setStartPeriod(etime)
                    }
                    setEndPeriod(etime)
                  }}
                  className={endPeriod !== '0' ? 'w-16 border border-gray-300' : 'w-16 border-2 border-red-700'}
                />
                <span className="text-sm"> 교시까지 </span>
              </div>
            )}
          </div>
        )}
        <div className="w-full">
          <SelectValues
            label="*신고사유 선택"
            placeholder="선택"
            value={reason}
            selectValues={desType[description]?.reasonType || []}
            onChange={(group) => {
              setReason(group)
              setMensesDialog(group === '생리')
            }}
            className={reasonType.includes(reason) ? 'border border-gray-300' : 'border-2 border-red-700'}
          />

          <label className="mb-1 text-sm text-gray-800">상세 신고사유</label>
          <TextInput
            maxLength={100}
            placeholder="예) 독감, 감기, 장염, 위염 등"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            className={cn('mt-1 border border-gray-300')}
          />
        </div>
        <div className="w-full"></div>
        <div className="w-full">
          <SelectValues
            label="*증빙서류 선택"
            placeholder="증빙서류를 선택해주세요."
            selectValues={desType[description]?.evidenceFileType || []}
            value={evidenceType}
            onChange={(group) => setEvidenceType(group)}
            className={
              desType[description]?.evidenceFileType.includes(evidenceType)
                ? 'mb-2 border border-gray-300'
                : 'mb-2 border-2 border-red-700'
            }
          />
          {(evidenceType === '기타' || evidenceType === '증빙서류 별도첨부') && (
            <TextInput
              placeholder="서류 종류를 입력해주세요."
              value={evidenceTypeText}
              onChange={(e) => setEvidenceTypeText(e.target.value)}
              className={cn(evidenceTypeText ? 'border border-gray-300' : 'border-2 border-red-700')}
            />
          )}
          {evidenceType === '학부모 확인서' && me?.role === Role.PARENT && (
            <>
              <textarea
                placeholder="예) 어젯밤부터 감기 몸살 증상이 보여 약을 먹었으나 나아지지 않아 가정에서 안정을 찾기 위해 결석하였습니다."
                value={parentComment}
                rows={3}
                onChange={(e) => setParentComment(e.target.value)}
                className={`focus:border-brand-1 w-full rounded-lg focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 ${cn(
                  parentComment ? 'border border-gray-300' : 'border-2 border-red-700',
                )}`}
              />
            </>
          )}
        </div>
        {evidenceType !== '학부모 확인서' &&
          evidenceType !== '증빙서류 없음' &&
          evidenceType !== '증빙서류 별도첨부' && (
            <>
              <>
                <div className="text-base">
                  <Checkbox /> 증빙서류 확인 후 파쇄처리를 희망합니다.
                  <br />
                  <div className="ml-4 text-sm text-red-600">
                    *증빙서류 원본은 담임선생님께 <b>반드시</b> 제출해 주세요.
                  </div>
                </div>
              </>

              <div className="mt-1 grid w-full grid-flow-row grid-cols-3 gap-2">
                {[...imageObjectMap].map(([key, value]) => (
                  <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
                ))}
                <MobileImageUpload
                  onChange={(e) => {
                    if (!e.target.files?.[0]) return
                    handleImageAdd(e, [fileType.IMAGES, fileType.PDF])
                  }}
                  onClick={() => {
                    alert(
                      '진료확인서 및 진단서 내 주민등록번호 정보는 개인정보로 인해 꼭 가린 후 업로드 해주세요. (가리지 않을 경우 반려 될 수 있음) 진료확인서 및 처방전 원본은 반드시 담임선생님께 제출하여 주시기 바랍니다.',
                    )
                  }}
                />
              </div>
            </>
          )}
        {evidenceType && (
          <label className="flex items-center space-x-2">
            <Checkbox checked={isEvidenceFile2} onChange={() => setIsEvidenceFile2(!isEvidenceFile2)} />
            <div className="text-lg">증빙서류 추가</div>
          </label>
        )}
        {isEvidenceFile2 && (
          <>
            <div className="w-full">
              <SelectValues
                label="*증빙서류 선택"
                placeholder="증빙서류를 선택해주세요."
                selectValues={desType[description]?.evidenceFileType.filter((el) => el !== evidenceType) || []}
                value={evidenceType2}
                onChange={(group) => setEvidenceType2(group)}
                className={
                  desType[description]?.evidenceFileType.includes(evidenceType2)
                    ? 'mb-2 border border-gray-300'
                    : 'mb-2 border-2 border-red-700'
                }
              />
              {(evidenceType2 === '기타' || evidenceType2 === '증빙서류 별도첨부') && (
                <TextInput
                  placeholder="서류 종류를 입력해주세요."
                  value={evidenceType2Text}
                  onChange={(e) => setEvidenceType2Text(e.target.value)}
                  className={cn(evidenceType2Text ? 'border border-gray-300' : 'border-2 border-red-700')}
                />
              )}
              {evidenceType2 === '학부모 확인서' && me?.role === Role.PARENT && (
                <>
                  <textarea
                    placeholder="예) 어젯밤부터 감기 몸살 증상이 보여 약을 먹었으나 나아지지 않아 가정에서 안정을 찾기 위해 결석하였습니다."
                    value={parentComment}
                    rows={3}
                    onChange={(e) => setParentComment(e.target.value)}
                    className={`focus:border-brand-1 w-full rounded-lg focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 ${cn(
                      parentComment ? 'border border-gray-300' : 'border-2 border-red-700',
                    )}`}
                  />
                </>
              )}
            </div>
            {evidenceType2 !== '학부모 확인서' &&
              evidenceType2 !== '증빙서류 없음' &&
              evidenceType2 !== '증빙서류 별도첨부' && (
                <>
                  <>
                    <div className="text-base">
                      <Checkbox /> 증빙서류 확인 후 파쇄처리를 희망합니다.
                      <br />
                      <div className="ml-4 text-sm text-red-600">
                        *증빙서류 원본은 담임선생님께 <b>반드시</b> 제출해 주세요.
                      </div>
                    </div>
                  </>

                  <div className="mt-1 grid w-full grid-flow-row grid-cols-3 gap-2">
                    {[...image2ObjectMap].map(([key, value]) => (
                      <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImage2Delete} />
                    ))}
                    <MobileImageUpload
                      onChange={(e) => {
                        if (!e.target.files?.[0]) return
                        handleImage2Add(e, [fileType.IMAGES, fileType.PDF])
                      }}
                      onClick={() => {
                        alert(
                          '진료확인서 및 진단서 내 주민등록번호 정보는 개인정보로 인해 꼭 가린 후 업로드 해주세요. (가리지 않을 경우 반려 될 수 있음) 진료확인서 및 처방전 원본은 반드시 담임선생님께 제출하여 주시기 바랍니다.',
                        )
                      }}
                    />
                  </div>
                </>
              )}
          </>
        )}

        <div>
          <div className="text-sm whitespace-pre-line text-red-600">
            *민감정보(진료확인서 및 진단서)의 수집/이용/제3자 제공에 동의
          </div>
          <div className="mt-1 rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line">
            진료 확인서 등 건강 관련 민감 정보는 소속 학교에 제공되어 출결 관리 목적으로만 사용됩니다.
          </div>
          <Label.row className="mt-1">
            <Checkbox onChange={() => setAgree(!agree)} checked={agree} />
            <p className="text-lg font-semibold">
              <span>동의하기 </span>
              <span className="text-sm whitespace-pre-line text-red-600">
                (체크하지 않으면 다음단계로 넘어가지 않습니다.)
              </span>
            </p>
          </Label.row>
        </div>
        {absentData?.absentStatus !== AbsentStatus.RETURNED && me?.role === Role.USER && (
          <>
            <Label.col>
              <Label.Text children="보호자 이름" />
              <TextInput value={parentsName} disabled onChange={(e) => setParentsName(e.target.value)} />
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
                style={{
                  borderWidth: parentsName ? 'border' : 'border-2',
                  borderColor: !parentsPhone ? 'rgba(185, 28, 28)' : '',
                }}
              />
              <div className="text-sm">
                * {t('parent_info_edit_my_page', '보호자 정보 수정은 보호자의 MY페이지에서만 가능합니다.')}
              </div>
            </Label.col>
          </>
        )}

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}

        <Button.lg
          children="제출하기"
          disabled={buttonDisabled}
          onClick={() => {
            const regExp = /^010(?:\d{4})\d{4}$/
            if (parentsPhone && !regExp.test(parentsPhone.replace(/-/g, ''))) {
              alert('보호자 연락처를 확인해 주세요.')
              setLoading(false)
              return
            }
            // if (absentData && absentData.absentStatus !== AbsentStatus.RETURNED) {
            //   setLoading(true);
            //   updateAbsent(imageObjectMap);
            // } else {
            setSignModal(true)
            //}
          }}
          className="filled-primary"
        />
      </Section>

      <SuperModal
        modalOpen={mensesDialog && !!mensesTexts && mensesTexts.length > 0}
        setModalClose={() => setMensesDialog(false)}
        className="w-max"
      >
        <Section className="mt-7">
          <div>
            <div className="w-full text-center text-lg font-bold text-gray-900">
              {moment(startAt).month() + 1}월 중, 생리 관련 출결신청을 한 이전 서류가 {mensesTexts?.length}건 있습니다.
            </div>
            <div className="my-10 w-full text-center text-base text-gray-900">
              {mensesTexts?.map((m) => (
                <span>
                  {m}
                  <br />
                </span>
              ))}
            </div>
            <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
              계속 출결 서류를 작성하시겠습니까?
            </div>
          </div>

          <Button.lg children="확인" onClick={() => setMensesDialog(false)} className="filled-green w-full" />
        </Section>
      </SuperModal>

      <div className={openSignModal ? '' : 'hidden'}>
        <Blank text="  " />
        <SignPad
          ToSigns={me?.role === Role.USER ? [ToSign.STUDENT] : [ToSign.STUDENT, ToSign.PARENT]}
          onClose={() => setSignModal(false)}
          onComplete={(signData: string[]) => {
            setSignModal(false)
            setLoading(true)

            if (absentData) {
              updateAbsent(imageObjectMap, image2ObjectMap, [signData[0]], [signData[1]])
            } else if (SignDataCheck(me?.role, signData)) {
              createAbsent(imageObjectMap, image2ObjectMap, signData)
            }
          }}
        ></SignPad>
      </div>
    </>
  )
}
