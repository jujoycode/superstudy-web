import clsx from 'clsx'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import Close from '@/assets/svg/close.svg'
import { SelectMenus, SelectValues } from '@/legacy/components'
import { BackButton, Badge, Blank, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { MobileImageUpload } from '@/legacy/components/common/MobileImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { FieldtripDatePicker } from '@/legacy/components/fieldtrip/FieldtripDatePicker'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useCommonGetHolidays } from '@/legacy/container/common-get-holidays'
import { useTeacherAbsentAdd } from '@/legacy/container/teacher-absent-add'
import { Absent, GroupType, StudentGroup } from '@/legacy/generated/model'
import { fileType, useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { AbsentTimeType } from '@/legacy/types'
import { makeDateToString } from '@/legacy/util/time'

const reportType = ['결석', '지각', '조퇴', '결과']
const descriptionType = ['인정', '기타', '미인정']

interface AbsentAddPageProps {
  absentData?: Absent
  returnToDetail?: () => void
}

export function AbsentAddPage({ absentData, returnToDetail }: AbsentAddPageProps) {
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
      startAt,
      endAt,
      description,
      startHour,
      endHour,
      errorMessage,
      isLoading,
      startMinute,
      endMinute,
      timeType,
      startPeriod,
      endPeriod,
      selectedGroup,
      studentGroups,
      groupStudentsData,
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
      setStartAt,
      setEndAt,
      setDescription,
      setStartMinute,
      setEndMinute,
      setStartHour,
      setEndHour,
      setTimeType,
      setStartPeriod,
      setEndPeriod,
      setSelectedGroup,
      setSelectedUsers,
    },
    selectedUsers,
    allKlassGroups,
    reasonType,
    desType,
    createAbsent,
    imageObjectMap,
    handleImageAdd,
    toggleImageDelete,
    hasNoImageToUpload,
  } = useTeacherAbsentAdd({
    absentData,
    returnToDetail,
  })

  let userIds = selectedUsers.map((el) => el.id)

  useEffect(() => {
    setSelectedUsers(groupStudentsData)
    userIds = groupStudentsData.map((el) => el.id)
  }, [groupStudentsData])

  const buttonDisabled =
    !agree ||
    (reason === '학교장 출석인정' || reason === '기타' ? !reasonText : !reasonType.includes(reason)) ||
    !descriptionType.includes(description) ||
    (evidenceType === '기타' ? !evidenceTypeText : !desType[description]?.evidenceFileType.includes(evidenceType)) ||
    !reportType.includes(report) ||
    !startAt ||
    (report !== '결석' ? !startAt && !endAt : !endAt) ||
    (!absentData ? evidenceType === '기타' && hasNoImageToUpload : false) ||
    (report !== '결석' && timeType === AbsentTimeType.PERIOD && (startPeriod === '0' || endPeriod === '0')) ||
    selectedUsers.length === 0

  return (
    <>
      {/* {loading && <Blank />} */}
      {isLoading && <Blank />}
      {/* {error && <ErrorBlank />} */}
      <TopNavbar
        title={`${t(`absentTitle`, '결석신고서')} 작성`}
        left={
          <div className="h-15 md:hidden">
            <BackButton className="h-15" />
          </div>
        }
      />
      <Section>
        <div>
          <div className="w-36 py-2">
            <SelectMenus
              label="* 학생 선택"
              items={allKlassGroups.map((tg) => ({ id: tg.id, name: tg.name }))}
              value={selectedGroup || undefined}
              onChange={({ id }: { id: number }) => setSelectedGroup(allKlassGroups.find((tg) => tg.id === id) || null)}
            />
            {!!studentGroups?.length && (
              <Label.row>
                <Checkbox
                  checked={!studentGroups?.filter((el) => !userIds.includes(el.user?.id)).length}
                  onChange={() =>
                    !studentGroups?.filter((el) => !userIds.includes(el.user?.id)).length
                      ? setSelectedUsers(
                          selectedUsers.filter((el) => !studentGroups?.map((sg) => sg.user?.id).includes(el.id)),
                        )
                      : setSelectedUsers(
                          selectedUsers.concat(
                            studentGroups
                              ?.filter((el) => !selectedUsers.map((u) => u.id).includes(el.user?.id))
                              .map((el) => el.user) || [],
                          ),
                        )
                  }
                />
                <Label.Text className="py-1" children="전체 선택" />
              </Label.row>
            )}
          </div>

          <div className="grid grid-flow-row grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
            {studentGroups
              ?.slice()
              ?.sort((a, b) => a.studentNumber - b.studentNumber)
              ?.map((el: StudentGroup) => (
                <div
                  key={el.id}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg border-2 px-3 py-1 text-sm ${
                    userIds.includes(el.user?.id) ? 'border-brand-1 bg-light_orange' : 'border-grey-6'
                  }`}
                  onClick={() => {
                    if (el?.user) {
                      if (userIds.includes(el.user.id)) {
                        setSelectedUsers(selectedUsers.filter((u) => u.id !== el.user?.id))
                      } else {
                        setSelectedUsers(selectedUsers.concat(el.user))
                      }
                    }
                  }}
                >
                  {selectedGroup?.type === GroupType.KLASS && <div className="font-bold">{el.studentNumber}</div>}
                  <div className="font-base overflow-hidden whitespace-pre">{el.user?.name}</div>
                </div>
              ))}
          </div>
          <div>
            <label className="mb-1 text-sm text-gray-800">*학생 이름</label>
            <div
              className={
                selectedUsers.length > 0
                  ? 'mt-2 flex flex-wrap rounded-lg border border-gray-300 px-4 py-3 whitespace-pre-line'
                  : 'mt-2 flex flex-wrap rounded-lg border border-2 border-red-700 px-4 py-3 whitespace-pre-line'
              }
            >
              {selectedUsers.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedUsers(selectedUsers.filter((u) => u.id !== el.id))}
                  className="m-1s text-2sm border-brand-1 text-brand-1 mt-1 mr-1 flex w-max cursor-pointer items-center space-x-2 rounded-full border-1 bg-white px-2.5 py-1 whitespace-nowrap"
                >
                  <div className="text-sm whitespace-pre">{el.name}</div>
                  <Close />
                </div>
              ))}
            </div>
          </div>
        </div>

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
                placeholderText="시작 날짜"
                hasSaturdayClass
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
                className={clsx(
                  'py-1.5',
                  timeType === AbsentTimeType.PERIOD ? 'bg-brand-1 text-white' : 'bg-white text-black',
                )}
              />
              <Badge
                children="시간설정"
                onClick={() => setTimeType(AbsentTimeType.TIME)}
                className={clsx(
                  'py-1.5',
                  timeType === AbsentTimeType.TIME ? 'bg-brand-1 text-white' : 'bg-white text-black',
                )}
              />
              <Badge
                children="사용안함"
                onClick={() => setTimeType(AbsentTimeType.NONE)}
                className={clsx(
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
            onChange={(group) => setReason(group)}
            className={reasonType.includes(reason) ? 'border border-gray-300' : 'border-2 border-red-700'}
          />

          <label className="mb-1 text-sm text-gray-800">상세 신고사유</label>
          <TextInput
            maxLength={100}
            placeholder="예) 독감, 감기, 장염, 위염 등"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            className={clsx('mt-1 border border-gray-300')}
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
                ? 'border border-gray-300'
                : 'border-2 border-red-700'
            }
          />
          {evidenceType === '기타' && (
            <TextInput
              placeholder="서류 종류를 입력해주세요."
              value={evidenceTypeText}
              onChange={(e) => setEvidenceTypeText(e.target.value)}
              className={clsx(evidenceTypeText ? 'border border-gray-300' : 'border-2 border-red-700')}
            />
          )}
        </div>

        {evidenceType !== '학부모 확인서' &&
          evidenceType !== '증빙서류 없음' &&
          evidenceType !== '증빙서류 별도첨부' && (
            <div className="grid w-full grid-flow-row grid-cols-3 gap-2">
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
                  className={clsx(evidenceType2Text ? 'border border-gray-300' : 'border-2 border-red-700')}
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

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}

        <Button.lg
          children="제출하기"
          disabled={buttonDisabled}
          onClick={() => {
            selectedUsers.map(async (user) => {
              createAbsent(imageObjectMap, image2ObjectMap, user.id)
            })
          }}
          className="filled-primary"
        />
      </Section>
    </>
  )
}
