import { cn } from '@/utils/commonUtil'
import { t } from 'i18next'
import { useState } from 'react'

import { SelectValues, SuperModal } from '@/legacy/components'
import { Badge, Blank, Label, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { MobileImageUpload } from '@/legacy/components/common/MobileImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useTeacherAbsentUpdate } from '@/legacy/container/teacher-absent-update'
import { Absent } from '@/legacy/generated/model/absent'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { AbsentTimeType } from '@/legacy/types'

interface AbsentUpdatePageProps {
  absentData?: Absent
  setChangeMode: (b: boolean) => void
  isConfirmed: boolean
}

export function AbsentUpdatePage({ absentData, setChangeMode }: AbsentUpdatePageProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const {
    imageObjectMap: image2ObjectMap,
    handleImageAdd: handleImage2Add,
    toggleImageDelete: toggleImage2Delete,
  } = useImageAndDocument({
    images: absentData?.evidenceFiles2,
  })

  const {
    updateReason,
    setUpdateReason,
    reason,
    setReason,
    reasonText,
    setReasonText,
    report,
    setReport,
    reportedAt,
    setReportedAt,
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    description,
    setDescription,
    evidenceTypeText,
    setEvidenceTypeText,
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
    endHour,
    setEndHour,
    endMinute,
    setEndMinute,
    evidenceType,
    setEvidenceType,
    isEvidenceFile2,
    setIsEvidenceFile2,
    evidenceType2,
    setEvidenceType2,
    evidenceType2Text,
    setEvidenceType2Text,
    isLoading,
    updateAbsent,
    imageObjectMap,
    timeType,
    setTimeType,
    startPeriod,
    setStartPeriod,
    endPeriod,
    setEndPeriod,
    handleImageAdd,
    toggleImageDelete,
    reportType,
    desType,
    descriptionType,
    teacherComment,
    setTeacherComment,
  } = useTeacherAbsentUpdate({ setChangeMode, absentData })

  const handleSubmitButton = () => {
    updateAbsent(imageObjectMap, image2ObjectMap)
  }

  return (
    <div className="rounded-lg border bg-white p-5">
      {isLoading && <Blank />}
      <div className="h-full w-auto">
        <Section>
          <div className="flex w-full items-center justify-between">
            <div className="text-2xl font-bold">
              [{absentData?.reportType}] {absentData?.student?.name} {absentData?.studentGradeKlass}{' '}
              {absentData?.studentNumber}번
            </div>
          </div>

          {[
            {
              label: '학번',
              title: `${absentData?.studentGradeKlass || ''} ${absentData?.studentNumber || ''}번`,
            },
            { label: '학생이름', title: absentData?.student?.name },
            { label: '보호자이름', title: absentData?.student?.nokName },
            // { label: '제출일', title: absentData?.reportedAt },
          ].map((item, index) => (
            <div key={index}>
              <div className="text-sm text-gray-500">{item.label}</div>
              <span className="text-lg font-semibold">{item.title}</span>
            </div>
          ))}
          <div>
            <label className="mb-1 text-sm text-gray-800">*신고일</label>
            <div className="mb-3 flex items-center">
              <input
                type="date"
                value={reportedAt}
                className="focus:border-primary-800 h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                onChange={(e) => {
                  setReportedAt(e.target.value)
                }}
              />
            </div>
          </div>

          <div className="flex justify-between space-x-2">
            <div className="w-full">
              <SelectValues
                label="*신고유형"
                placeholder="선택"
                selectValues={reportType}
                value={report}
                onChange={(group: string) => setReport(group)}
                className={report ? 'border-gray-300' : 'border-red-700'}
              />
            </div>
            <div className="w-full">
              <SelectValues
                label="*"
                placeholder="선택"
                selectValues={descriptionType}
                value={description}
                onChange={(group: '인정') => {
                  setDescription(group)
                  if (!desType[group]?.reasonType?.includes(reason)) {
                    setReason('')
                  }
                  if (!desType[group]?.evidenceFileType?.includes(evidenceType)) {
                    setEvidenceType('')
                  }
                }}
                className={description ? 'border-gray-300' : 'border-red-700'}
              />
            </div>
          </div>
          <div>
            {report === '결석' && (
              <div className="w-full pb-6">
                <label className="mb-1 text-sm text-gray-800">*발생일</label>
                <div className="mb-3 flex items-center">
                  <input
                    type="date"
                    value={startAt.substring(0, 10)}
                    className="focus:border-primary-800 h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    onChange={(e) => {
                      if (endAt && e.target.value > endAt) {
                        setEndAt(e.target.value)
                      }
                      setStartAt(e.target.value)
                    }}
                  />
                  <span className="ml-3 shrink-0">일 부터</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="date"
                    value={endAt.substring(0, 10)}
                    className="focus:border-primary-800 h-12 w-full min-w-max rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                    onChange={(e) => {
                      if (startAt && e.target.value < startAt) {
                        setStartAt(e.target.value)
                      }
                      setEndAt(e.target.value)
                    }}
                  />
                  <span className="ml-3 shrink-0">일 까지</span>
                </div>
              </div>
            )}
            {report !== '결석' && (
              <h1 className="space-y-3 pb-6">
                <div>
                  <label className="mb-1 text-sm text-gray-800">*발생일</label>
                  <input
                    type="date"
                    value={startAt.substring(0, 10)}
                    defaultValue={absentData?.startAt}
                    className={`${
                      startAt ? 'border-gray-300' : 'border-red-700'
                    } focus:border-primary-800 h-12 w-full min-w-max rounded-md border px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm`}
                    onChange={(e) => setStartAt(e.target.value)}
                  />

                  <div className="flex w-full items-end space-x-2 py-4">
                    <label className="mb-1.5 text-sm text-gray-800">발생시간 : </label>
                    <Badge
                      children="교시설정"
                      onClick={() => setTimeType(AbsentTimeType.PERIOD)}
                      className={cn(
                        'py-1.5',
                        timeType === AbsentTimeType.PERIOD ? 'bg-primary-800 text-white' : 'bg-white text-black',
                      )}
                    />
                    <Badge
                      children="시간설정"
                      onClick={() => setTimeType(AbsentTimeType.TIME)}
                      className={cn(
                        'py-1.5',
                        timeType === AbsentTimeType.TIME ? 'bg-primary-800 text-white' : 'bg-white text-black',
                      )}
                    />
                    <Badge
                      children="사용안함"
                      onClick={() => setTimeType(AbsentTimeType.NONE)}
                      className={cn(
                        'py-1.5',
                        timeType === AbsentTimeType.NONE ? 'bg-primary-800 text-white' : 'bg-white text-black',
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
                          className="focus:border-primary-800 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
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
                          className="focus:border-primary-800 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
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
                          className="focus:border-primary-800 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
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
                          className="focus:border-primary-800 inline h-12 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
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
              </h1>
            )}
          </div>
          <div>
            <SelectValues
              label="*신고사유 선택"
              placeholder="선택"
              selectValues={desType[description]?.reasonType || []}
              value={reason}
              onChange={(group: string) => setReason(group)}
            />
            {/* {(reason === '학교장 출석인정' || reason === '기타') && ( */}
            <label className="mb-1 text-sm text-gray-800">상세 신고사유</label>
            <TextInput
              placeholder="예) 독감, 감기, 장염, 위염 등"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="mt-1"
            />
            {/* )} */}
          </div>
          <div>
            <SelectValues
              label="*증빙서류 선택"
              selectValues={desType[description]?.evidenceFileType || []}
              value={evidenceType}
              onChange={(group: string) => {
                setEvidenceTypeText('')
                setEvidenceType(group)
              }}
            />
            {evidenceType === '기타' && (
              <TextInput
                placeholder="서류 종류를 입력해주세요."
                value={evidenceTypeText}
                onChange={(e) => setEvidenceTypeText(e.target.value)}
                className={cn(evidenceTypeText ? 'border border-gray-300' : 'border-2 border-red-700')}
              />
            )}
            {evidenceType === '담임교사 확인서' && (
              <>
                <label className="mb-1 text-sm text-gray-800">담임교사 코멘트</label>
                <TextInput
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  className="mt-1"
                />
              </>
            )}
          </div>

          {evidenceType !== '학부모 확인서' &&
            evidenceType !== '증빙서류 없음' &&
            evidenceType !== '증빙서류 별도첨부' && (
              <>
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
                    <MobileImageUpload
                      onChange={(e) => {
                        if (!e.target.files?.[0]) return
                        handleImageAdd(e, [fileType.IMAGES, fileType.PDF])
                      }}
                    />
                  </div>
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
              </div>
              {evidenceType2 !== '학부모 확인서' &&
                evidenceType2 !== '증빙서류 없음' &&
                evidenceType2 !== '증빙서류 별도첨부' && (
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
                )}
            </>
          )}
        </Section>
      </div>

      {/* 버튼 */}
      <div className="mt-14 flex w-full items-center space-x-2">
        <Button.xl children="수정하기" onClick={() => setModalOpen(true)} className="filled-primary w-full" />
        <Button.xl children="취소하기" onClick={() => setChangeMode(false)} className="filled-gray w-full" />
      </div>

      <SuperModal modalOpen={modalOpen} setModalClose={() => setModalOpen(false)} className="w-max">
        <Section className="mt-7">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
            {`이 ${t(`Custom.SID${absentData?.schoolId}.absentTitle`, '결석신고서')}를 수정하시는 이유를 적어주세요.`}
          </div>
          <Textarea placeholder="수정 이유" value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} />
          <Button.lg children="수정하기" disabled={!updateReason} onClick={handleSubmitButton} className="filled-red" />
        </Section>
      </SuperModal>
      <div className="h-24 w-full" />
    </div>
  )
}
