import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { Radio } from '@/atoms/Radio'
import { SuperModal } from '@/legacy/components'
import { ActivitySessionTeacherView } from '@/legacy/components/activityv3/ActivitySessionTeacherView'
import { Blank, CloseButton, Label, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { DocumentObjectComponentDel } from '@/legacy/components/DocumentObjectComponentDel'
import { ImageObjectComponentDel } from '@/legacy/components/ImageObjectComponentDel'
import { SuperSurveyAddComponent } from '@/legacy/components/survey/SuperSurveyAddComponent'
import { ACTIVITY_SESSION_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import { useActivitySessionCreate, useActivitySessionUpdate } from '@/legacy/generated/endpoint'
import {
  ActivitySession,
  ActivityType,
  RequestCreateActivitySessionDto,
  UploadFileTypeEnum,
} from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'

interface ActivityV3SessionAddPageProps {
  activitySessionData?: ActivitySession
}

export const ActivityV3SessionAddPage: React.FC<ActivityV3SessionAddPageProps> = ({ activitySessionData }) => {
  const { setToast: setToastMsg } = useNotificationStore()
  const { push, goBack } = useHistory()
  const { id } = useParams<{ id: string }>()

  const [showDialog, setShowDialog] = useState(false)

  const handleConfirm = () => {
    setShowDialog(false)
    goBack()
  }

  const handleCancel = () => {
    setShowDialog(false)
  }

  const activityv3Id = Number(id)
  const [disableStartDate, setDisableStartDate] = useState(activitySessionData?.startDate !== '' ? true : false)
  const [disableEndDate, setDisableEndDate] = useState(activitySessionData?.endDate !== '' ? true : false)
  const [disableSubmitDate, setDisableSubmitDate] = useState(
    !activitySessionData ||
      activitySessionData?.submitStartHour === -1 ||
      (activitySessionData.submitStartHour === 0 &&
        activitySessionData.submitStartMinute === 0 &&
        activitySessionData.submitEndHour === 0 &&
        activitySessionData.submitEndMinute === 0),
  )
  const [previewOpen, setPreviewOpen] = useState(false)

  const [startHour, setStartHour] = useState(activitySessionData?.submitStartHour || -1)
  const [startMinute, setStartMinute] = useState(activitySessionData?.submitStartMinute || -1)
  const [endHour, setEndHour] = useState(activitySessionData?.submitEndHour || -1)
  const [endMinute, setEndMinute] = useState(activitySessionData?.submitEndMinute || -1)

  const { imageObjectMap, documentObjectMap, toggleImageDelete, addFiles, toggleDocumentDelete } = useImageAndDocument({
    images: activitySessionData?.images,
    documents: activitySessionData?.files,
  })

  const { isUploadLoading, handleUploadFile } = useFileUpload()

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RequestCreateActivitySessionDto>({
    defaultValues: {
      type: ActivityType.POST,
    },
  })

  const { mutateAsync: createActivitySession, isLoading: createMutateLoading } = useActivitySessionCreate()

  const { mutateAsync: updateActivitySession, isLoading: updateMutateLoading } = useActivitySessionUpdate()

  const activitySessiontype = watch('type')
  const [content, setContent] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    if (activitySessionData) {
      setValue('title', activitySessionData.title)
      setValue('content', activitySessionData.content)
      setValue('surveyContent', activitySessionData.surveyContent)
      if (activitySessionData.surveyContent) setContent(JSON.parse(activitySessionData.surveyContent))
      setValue('isImage', activitySessionData.isImage)
      setValue('isFile', activitySessionData.isFile)
      setValue('isFileRequired', activitySessionData.isFileRequired)
      setValue('isContent', activitySessionData.isContent)
      setValue('isContentRequired', activitySessionData.isContentRequired)
      setValue('activityv3Id', activitySessionData.activityv3Id)
      setValue('type', activitySessionData.type)
      setValue(
        'startDate',
        activitySessionData.startDate ? format(new Date(activitySessionData.startDate), "yyyy-MM-dd'T'HH:mm") : '',
      )
      setValue(
        'endDate',
        activitySessionData.endDate ? format(new Date(activitySessionData.endDate), "yyyy-MM-dd'T'HH:mm") : '',
      )
      setDisableStartDate(!activitySessionData?.startDate || activitySessionData?.startDate === '')
      setDisableEndDate(!activitySessionData?.endDate || activitySessionData?.endDate === '')
      setDisableSubmitDate(
        activitySessionData?.submitStartHour === -1 ||
          (activitySessionData.submitStartHour === 0 &&
            activitySessionData.submitStartMinute === 0 &&
            activitySessionData.submitEndHour === 0 &&
            activitySessionData.submitEndMinute === 0),
      )

      if (activitySessionData?.submitStartHour !== -1 && startHour === undefined)
        setStartHour(activitySessionData.submitStartHour)
      if (activitySessionData?.submitStartMinute !== -1 && startMinute === undefined)
        setStartMinute(activitySessionData.submitStartMinute)
      if (activitySessionData?.submitEndHour !== -1 && endHour === undefined)
        setEndHour(activitySessionData.submitEndHour)
      if (activitySessionData?.submitEndMinute !== -1 && endMinute === undefined)
        setEndMinute(activitySessionData.submitEndMinute)
    }
  }, [activitySessionData, setValue, endHour, endMinute, startHour, startMinute])

  const isLoading = createMutateLoading || updateMutateLoading || isUploadLoading

  const isFormValid = (() => {
    const type = watch('type')
    const title = watch('title')
    const isFile = watch('isFile')
    const isContent = watch('isContent')
    const startDate = watch('startDate')
    const endDate = watch('endDate')
    const submitEndHour = watch('submitEndHour')
    const submitEndMinute = watch('submitEndMinute')

    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        return false
      }
    }

    if (!disableSubmitDate) {
      if (submitEndHour === 0 && submitEndMinute === 0) {
        return false
      }
    }

    if (type && title) {
      if (type === ActivityType.POST) {
        return isFile || isContent
      }
      return true
    }
    return false
  })()

  return (
    <div className="col-span-6">
      {isLoading && <Blank />}
      <div className="h-screen-6 3xl:px-[208px] 3xl:pb-[128px] 3xl:pt-[64px] flex flex-col bg-gray-50 p-2 md:h-screen md:px-10 md:pt-10 md:pb-20">
        <div className="relative h-full">
          <div className="3xl:px-30 3xl:py-20 h-full overflow-y-auto bg-white p-2 md:px-10 md:py-5">
            <div className="flex w-full flex-col gap-2 bg-white pb-8">
              <div className="text-3xl font-bold">차시 {activitySessionData ? '수정' : '생성'}하기</div>
              <div className="text-18 font-normal text-[#444]">
                학생들에게 활동/활동보고서의 상세 내용을 안내할 수 있습니다.
              </div>
            </div>
            <div className="h-full min-w-2/3">
              <table className="w-full table-fixed">
                <tr className="h-14 border-t border-b border-[#AAAAAA] border-t-[#333333]">
                  <td className="w-52 py-3 font-bold whitespace-pre text-[#333333]">
                    <div className="flex gap-x-0.5">
                      <p>타입</p>
                      <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                    </div>
                  </td>
                  <td className="flex items-center space-x-4 py-3">
                    {Object.entries(ACTIVITY_SESSION_TYPE_KOR).map(([type, kor]) => (
                      <Label.row htmlFor={type} key={type}>
                        <Radio
                          key={type}
                          id={type}
                          checked={activitySessiontype === type}
                          {...register('type', {
                            required: !activitySessionData,
                            onChange: () => {
                              setValue('title', '')
                              setValue('content', '')
                              setValue('endDate', '')
                              setValue('isFile', false)
                              setValue('isFileRequired', false)
                              setValue('isContent', false)
                              setValue('isContentRequired', false)
                              setContent([])
                            },
                          })}
                          disabled={!!activitySessionData}
                        ></Radio>
                        <div>{kor}</div>
                      </Label.row>
                    ))}
                    <Label.Error children={errors.type?.message} />
                  </td>
                </tr>

                <tr className="border-gray-[#444] h-14 border-b py-3">
                  <td className="font-bold whitespace-pre text-[#333333]">
                    <div className="flex gap-x-0.5">
                      <p>제목</p>
                      <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                    </div>
                  </td>
                  <td className="py-3">
                    <TextInput
                      id="title"
                      placeholder="예) 모둠별 주제 선정 및 역할분담"
                      className="h-10 rounded-lg border border-[#CCCCCC]"
                      {...register('title', { required: true })}
                    />
                    <Label.Error children={errors.title?.message} />
                  </td>
                </tr>

                <tr className="border-gray-[#444] border-b">
                  <td className="h-14 py-3 font-bold whitespace-pre text-[#333333]">
                    <div className="flex gap-x-0.5">
                      <p>내용</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Textarea
                      id="content"
                      className="h-32 resize-none rounded-lg border border-[#CCCCCC]"
                      placeholder="차시에 대한 설명을 입력해 주세요."
                      {...register('content')}
                    />
                    <Label.Error children={errors.content?.message} />
                  </td>
                </tr>

                {activitySessiontype === ActivityType.POST && (
                  <tr className="border-gray-[#444] border-b">
                    <td className="h-14 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>과제 제출 방식</p>
                        <div className="h-1.5 w-1.5 overflow-hidden rounded-full bg-orange-500" />
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex h-10 items-center">
                        <div className="flex w-30 items-center gap-2">
                          <Checkbox id="isFile" {...register('isFile')} />
                          <label htmlFor="isFile">이미지/파일</label>
                        </div>
                        <div className="flex items-center">
                          <div className="text-neutral-500">필수 응답</div>
                          <ToggleSwitch
                            checked={watch('isFile') && watch('isFileRequired')}
                            {...register('isFileRequired')}
                            disabled={!watch('isFile')}
                          />
                        </div>
                      </div>
                      <div className="flex h-10 items-center">
                        <div className="flex w-30 items-center gap-2">
                          <Checkbox id="isContent" {...register('isContent')} />
                          <label htmlFor="isContent">내용 입력</label>
                        </div>
                        <div className="flex items-center">
                          <div className="text-neutral-500">필수 응답</div>
                          <ToggleSwitch
                            checked={watch('isContent') && watch('isContentRequired')}
                            {...register('isContentRequired')}
                            disabled={!watch('isContent')}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {(activitySessiontype === ActivityType.POST || activitySessiontype === ActivityType.SURVEY) && (
                  <tr className="border-gray-[#444] border-b">
                    <td className="h-14 py-3 font-bold whitespace-pre text-[#333333]">시작시간</td>
                    <td className="py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TextInput
                            id="startDate"
                            type="datetime-local"
                            className="h-10 w-60 rounded-lg border border-[#CCCCCC]"
                            disabled={disableStartDate}
                            {...register('startDate')}
                          />
                          <div>부터</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={disableStartDate}
                            onChange={() => setDisableStartDate(!disableStartDate)}
                          />
                          <Label.Text>시작시간 없음</Label.Text>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {(activitySessiontype === ActivityType.POST || activitySessiontype === ActivityType.SURVEY) && (
                  <tr className="border-gray-[#444] border-b">
                    <td className="h-14 py-3 font-bold whitespace-pre text-[#333333]">
                      <div className="flex gap-x-0.5">
                        <p>제출 시간대</p>
                      </div>
                    </td>
                    <td className="flex items-center space-x-2 py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex w-[275px] items-center space-x-2">
                          <span>
                            <TextInput
                              type="text"
                              maxLength={2}
                              className="focus:border-primary-800 my-1 inline h-8 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              disabled={disableSubmitDate}
                              value={startHour < 0 ? 0 : startHour}
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
                                if ((startHour || 0) > (endHour || 0)) {
                                  setEndHour((startHour || 0) + 1)
                                }
                                if (_startHour === endHour && (startMinute || 0) > (endMinute || 0)) {
                                  setEndMinute(startMinute || 0)
                                }
                              }}
                            />
                            <span className="mr-2 text-sm"> 시 </span>
                            <TextInput
                              type="text"
                              maxLength={2}
                              disabled={disableSubmitDate}
                              className="focus:border-primary-800 my-1 inline h-8 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              value={startMinute < 0 ? 0 : startMinute}
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
                                if (startHour === endHour && _startMinute > (endMinute || 0)) {
                                  setEndMinute(_startMinute)
                                }
                              }}
                            />
                            <span className="text-sm"> 분&nbsp;&nbsp;부터 </span>
                            <br />
                            <TextInput
                              type="text"
                              maxLength={2}
                              className="focus:border-primary-800 my-1 inline h-8 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              disabled={disableSubmitDate}
                              value={endHour < 0 ? 0 : endHour}
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
                                if ((startHour || 0) > _endHour) {
                                  setStartHour(_endHour)
                                }
                                if (startHour === _endHour && (startMinute || 0) > (endMinute || 0)) {
                                  setEndMinute(startMinute)
                                }
                              }}
                            />
                            <span className="mr-2 text-sm"> 시 </span>
                            <TextInput
                              type="text"
                              maxLength={2}
                              disabled={disableSubmitDate}
                              className="focus:border-primary-800 my-1 inline h-8 w-14 rounded-md border border-gray-200 px-4 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm"
                              value={endMinute < 0 ? 0 : endMinute}
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
                                if (startHour === endHour && (startMinute || 0) > _endMinute) {
                                  setStartMinute(_endMinute)
                                }
                              }}
                            />
                            <span className="text-sm"> 분&nbsp;&nbsp;까지 </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={disableSubmitDate}
                            onChange={() => setDisableSubmitDate(!disableSubmitDate)}
                          />
                          <Label.Text>제출 시간대 없음</Label.Text>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {(activitySessiontype === ActivityType.POST || activitySessiontype === ActivityType.SURVEY) && (
                  <tr className="border-gray-[#444] border-b">
                    <td className="h-14 py-3 font-bold whitespace-pre text-[#333333]">마감기한</td>
                    <td className="py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TextInput
                            id="endDate"
                            type="datetime-local"
                            className="h-10 w-60 rounded-lg border border-[#CCCCCC]"
                            disabled={disableEndDate}
                            {...register('endDate')}
                          />
                          <div>까지</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={disableEndDate} onChange={() => setDisableEndDate(!disableEndDate)} />
                          <Label.Text>마감기한 없음</Label.Text>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                <tr className="border-gray-[#444] border-b">
                  <td className="h-14 py-3 font-bold whitespace-pre text-[#333333]">첨부파일</td>
                  <td className="py-3">
                    {/* 이미지 */}
                    {[...imageObjectMap].length > 0 && (
                      <div className="grid w-full grid-flow-row grid-cols-6 gap-2 pb-2">
                        {[...imageObjectMap].map(([key, value]) => (
                          <ImageObjectComponentDel
                            key={key}
                            id={key}
                            imageObjet={value}
                            onDeleteClick={toggleImageDelete}
                          />
                        ))}
                      </div>
                    )}
                    {/* 문서 */}
                    {[...documentObjectMap].length > 0 && (
                      <div className="flex flex-col gap-1 pb-2">
                        {[...documentObjectMap].map(([key, value]) => (
                          <DocumentObjectComponentDel
                            key={key}
                            id={key}
                            documentObjet={value}
                            onDeleteClick={toggleDocumentDelete}
                          />
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      id="file-upload"
                      name="file-upload"
                      className="sr-only"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files
                        if (!files || files.length === 0) return
                        addFiles(files)
                      }}
                    />
                    <div className="flex items-center gap-4">
                      <label
                        className={`flex h-10 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CCCCCC] bg-gray-50`}
                        htmlFor="file-upload"
                      >
                        <Icon.Plus />
                      </label>
                      <p className="text-xs text-neutral-500">100MB 이하의 이미지/문서 파일을 첨부할 수 있습니다.</p>
                    </div>
                  </td>
                </tr>
              </table>
              {activitySessiontype === ActivityType.SURVEY && (
                <>
                  <div className="pt-6 pb-2">
                    <div className="flex items-center space-x-8 border-b border-b-[#333333]">
                      <div className="mb-2 text-xl font-bold">설문지 만들기</div>
                    </div>
                  </div>
                  <div className="mt-4 pb-10">
                    <SuperSurveyAddComponent className="w-full" setContent={(c) => setContent(c)} content={content} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="3xl:-bottom-20 absolute -bottom-14 left-0 w-full">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  className="h-12 w-40 rounded-lg border border-neutral-500 bg-white text-lg font-semibold"
                  onClick={() => setShowDialog(true)}
                >
                  취소
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  className="h-12 w-40 rounded-lg border border-orange-500 bg-white text-lg font-semibold text-orange-500 disabled:border-gray-500 disabled:text-gray-500"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!isFormValid}
                >
                  미리보기
                </Button>
                <Button
                  className="h-12 w-40 rounded-lg bg-orange-500 text-lg font-semibold text-white disabled:bg-gray-500"
                  disabled={!isFormValid}
                  onClick={handleSubmit(async (data) => {
                    // file image 처리
                    const imageFiles = [...imageObjectMap.values()]
                      .filter((value) => !value.isDelete && value.image instanceof File)
                      .map((value) => value.image) as File[]
                    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['activityv3/images'], imageFiles)
                    // url image 처리
                    const imageUrlNames = [...imageObjectMap.values()]
                      .filter((value) => !value.isDelete && typeof value.image === 'string')
                      .map((value) => value.image) as string[]
                    const allImageNames = [...imageUrlNames, ...imageFileNames]
                    // file document 처리
                    const documentFiles = [...documentObjectMap.values()]
                      .filter((value) => !value.isDelete && value.document instanceof File)
                      .map((value) => value.document) as File[]
                    const documentFileNames = await handleUploadFile(
                      UploadFileTypeEnum['activityv3/files'],
                      documentFiles,
                    )
                    const documentUrlNames = [...documentObjectMap.values()]
                      .filter((value) => !value.isDelete && typeof value.document === 'string')
                      .map((value) => value.document) as string[]
                    const allDocumentNames = [...documentUrlNames, ...documentFileNames]
                    const _data = {
                      ...data,
                      surveyContent: data.type === 'SURVEY' ? JSON.stringify(content) : '',
                      type: activitySessiontype,
                      images: allImageNames,
                      files: allDocumentNames,
                      activityv3Id: Number(activityv3Id),
                      startDate: disableStartDate ? '' : data.startDate,
                      endDate: disableEndDate ? '' : data.endDate,
                      submitStartHour: disableSubmitDate ? -1 : startHour || 0,
                      submitStartMinute: disableSubmitDate ? -1 : startMinute || 0,
                      submitEndHour: disableSubmitDate ? -1 : endHour || 0,
                      submitEndMinute: disableSubmitDate ? -1 : endMinute || 0,
                      isFile: !!data.isFile,
                      isContent: !!data.isContent,
                      isFileRequired: !!data.isFile && !!data.isFileRequired,
                      isContentRequired: !!data.isContent && !!data.isContentRequired,
                    }
                    if (activitySessionData) {
                      updateActivitySession({ id: activitySessionData.id, data: _data })
                        .then((data) => {
                          setToastMsg('차시가 수정되었습니다.')
                          push(`/teacher/activityv3/${activityv3Id}/session/${data.id}`)
                        })
                        .catch((error: Error) => setToastMsg(error.message))
                    } else {
                      createActivitySession({ data: _data })
                        .then(() => {
                          setToastMsg('차시가 추가되었습니다.')
                          push(`/teacher/activityv3/${activityv3Id}`) // 차시 추가 후 활동상세페이지로
                          // push(`/teacher/activityv3/${activityv3Id}/session/${data.id}`);
                        })
                        .catch((error: Error) => setToastMsg(error.message))
                    }
                  })}
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        </div>

        <SuperModal
          className="h-2/3 w-1/4 overflow-y-auto"
          modalOpen={previewOpen}
          setModalClose={() => setPreviewOpen(false)}
        >
          <div className="max-h-screen-12 flex flex-col lg:border-r lg:border-gray-300">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-gray-50 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">미리보기</span>
                <span className="text-14 ml-2 text-gray-600">학생에게 보여지는 화면입니다.</span>
              </div>
              <CloseButton onClick={() => setPreviewOpen(false)} />
            </div>
            <div className="h-full bg-gray-50 pb-2">
              <ActivitySessionTeacherView
                activitySession={
                  {
                    ...watch(),
                    ...(watch('type') === 'SURVEY' ? { surveyContent: JSON.stringify(content) } : {}),
                  } as ActivitySession
                }
                page="CREATE"
                dummyImages={imageObjectMap}
                dummyFiles={documentObjectMap}
              />
            </div>
          </div>
        </SuperModal>
        {showDialog && (
          <ConfirmDialog
            message="저장되지 않은 내용이 있습니다."
            description={`저장되지 않은 내용은 다시 불러올 수 없습니다. \n한번 더 확인해 주세요.`}
            confirmText="나가기"
            cancelText="취소"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  )
}
