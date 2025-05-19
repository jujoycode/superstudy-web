import React, { useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { useNotificationStore } from '@/stores/notification'
import { Constants } from '@/legacy/constants'
import { useStudentActivitySessionSaveOne } from '@/legacy/generated/endpoint'
import { ActivitySession, StudentActivitySession, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { checkFileSizeLimit100MB, isPdfFile } from '@/legacy/util/file'
import { Label, Textarea } from '../common'
import { Button } from '../common/Button'
import { FileUpload } from '../common/FileUpload'
import { Time } from '../common/Time'
import { DocumentObjectComponentDel } from '../DocumentObjectComponentDel'
import { ImageObjectComponent } from '../ImageObjectComponent'
import { SuperSurveyComponent } from '../survey/SuperSurveyComponent'

interface StudentActivitySessionSubmitViewProps {
  activitySession: ActivitySession
  studentActivitySession?: StudentActivitySession
  refetch: () => void
  readOnly?: boolean
}

export const StudentActivitySessionSubmitView: React.FC<StudentActivitySessionSubmitViewProps> = ({
  activitySession: activity,
  studentActivitySession: studentActivity,
  readOnly = false,
  refetch,
}) => {
  const now = new Date()
  const { setToast: setToastMsg } = useNotificationStore()
  const { mutate: saveStudentActivitySession } = useStudentActivitySessionSaveOne({
    mutation: {
      onSuccess: () => {
        setLoading(false)
        refetch()
      },
      onError: (error) => {
        setLoading(false)
        setToastMsg(error.message)
      },
    },
  })

  const [isLoading, setLoading] = useState(false)

  const [content, setContent] = useState(studentActivity?.content || '')

  const {
    imageObjectMap,
    documentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
  } = useImageAndDocument({ images: studentActivity?.images, documents: studentActivity?.files })

  const { handleUploadFile } = useFileUpload()

  const viewerImages: ImageDecorator[] = []
  if (activity?.images) {
    for (const image of activity.images) {
      if (isPdfFile(image) == false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  const isSubmitDate = !activity.startDate || now >= new Date(activity.startDate)
  const calculateIsSubmitHour = () => {
    const { submitStartHour, submitStartMinute, submitEndHour, submitEndMinute } = activity
    if (submitStartHour === -1 || submitStartMinute === -1 || submitEndHour === -1 || submitEndMinute === -1) {
      return true
    }
    if (submitStartHour === 0 && submitStartMinute === 0 && submitEndHour === 0 && submitEndMinute === 0) {
      return true
    }
    if (submitStartHour === null || submitStartMinute === null || submitEndHour === null || submitEndMinute === null) {
      return true
    }
    const start = new Date(now)
    start.setHours(submitStartHour, submitStartMinute, 0, 0)

    const end = new Date(now)
    end.setHours(submitEndHour, submitEndMinute, 0, 0)

    return now >= start && now < end
  }

  if (!isSubmitDate || !calculateIsSubmitHour()) {
    readOnly = true
  }

  const disabled = !!(
    (activity.isFile &&
      activity.isFileRequired &&
      [...imageObjectMap.values()].length === 0 &&
      [...documentObjectMap.values()].length === 0) ||
    (activity.isContent && activity.isContentRequired && content === '')
  )

  const handleSubmit = async () => {
    if (activity?.surveyContent) {
      const surveyContent = JSON.parse(activity.surveyContent)
      const contentJson = JSON.parse(content)

      let noAnswer = { id: 0, title: '' }

      surveyContent.map((element: any) => {
        if (element.required && noAnswer.id === 0) {
          if (contentJson[element.id.toString()] === undefined) {
            noAnswer = element
          }
        }
      })

      if (noAnswer.id) {
        setToastMsg(
          `${noAnswer.id}번 질문의 답변이 입력되지 않았습니다.\n${noAnswer.title.length >= 20 ? noAnswer.title.slice(0, 20) + '...' : noAnswer.title}`,
        )
        return
      }
    }

    await saveStudentActivitySession({
      params: { sessionId: activity.id },
      data: { content, images: [], files: [] },
    })
    refetch()
  }

  const getSubmitContentElement = () => {
    switch (activity?.type) {
      case 'SURVEY':
        return (
          <>
            <SuperSurveyComponent
              surveyContent={activity?.surveyContent || '[]'}
              setContent={(c: any) => setContent(JSON.stringify(c))}
              content={content ? JSON.parse(content) : {}}
              readOnly={readOnly}
            />
            <Button.lg
              className="filled-primary w-full"
              children="제출하기"
              disabled={!content || isLoading || readOnly}
              onClick={async () => {
                await handleSubmit()
              }}
            />
          </>
        )
      case 'NOTICE':
        return <></>
      case 'POST':
        return (
          <div className="flex flex-col space-y-2">
            {/* {activity?.isImage && (
              <div>
                <Label className="text-lg font-bold text-gray-800">이미지 업로드</Label>
                <div className="mt-5 w-full">
                  {[...imageObjectMap].map(([key, value]) => (
                    <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
                  ))}
                  <ImageUpload disabled={readOnly} accept=".pdf, .png, .jpeg, .jpg" onChange={handleImageAdd} />
                </div>
              </div>
            )} */}
            {activity?.isFile && (
              <div>
                <Label className="text-lg font-bold text-gray-800">파일 업로드</Label>

                <div className="py-2">
                  {[...imageObjectMap].map(([key, value]) => (
                    <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
                  ))}
                  {[...documentObjectMap].map(([key, value]) => (
                    <DocumentObjectComponentDel
                      key={key}
                      id={key}
                      documentObjet={value}
                      onDeleteClick={toggleDocumentDelete}
                    />
                  ))}
                </div>
                <FileUpload
                  disabled={readOnly}
                  onChange={(e) => {
                    if (!e.target.files || !e.target.files?.[0]) return
                    if (!checkFileSizeLimit100MB([...e.target.files])) {
                      return alert('100MB가 넘는 파일은 첨부할 수 없습니다.')
                    }

                    if (e.target.files[0]?.type.includes('image')) {
                      handleImageAdd(e)
                    } else {
                      handleDocumentAdd(e)
                    }
                  }}
                />
              </div>
            )}
            {activity?.isContent && (
              <>
                <div className="text-lg font-bold text-gray-800">내용 입력</div>
                <Textarea
                  disabled={readOnly}
                  placeholder="내용을 입력해주세요."
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-auto border"
                />
                <div className="flex items-center justify-end">
                  공백제외&nbsp;<span className="text-brand-1">{content.replace(/ /g, '').length}</span>&nbsp;자&nbsp;
                  공백포함&nbsp;
                  <span className="text-brand-1">{content.length}</span>&nbsp;자
                </div>
              </>
            )}
            {(!isSubmitDate || !calculateIsSubmitHour()) && (
              <div>
                {activity.startDate && (
                  <div className="text-brandblue-1 mt-3">
                    활동 시작 시간 : <Time date={activity.startDate} className="text-16 text-inherit" /> (
                    <Time date={activity.startDate} formatDistanceToNow className="text-16 text-inherit" />)
                  </div>
                )}
                {activity.submitStartHour !== -1 && (
                  <div className="text-brandblue-1 mt-3">
                    활동 시간대 : {activity.submitStartHour}시{' '}
                    {activity.submitStartMinute < 0 ? 0 : activity.submitStartMinute}분부터 {activity.submitEndHour}시{' '}
                    {activity.submitEndMinute < 0 ? 0 : activity.submitEndMinute}분까지
                  </div>
                )}
              </div>
            )}
            {!isSubmitDate ? (
              <Button.lg className="filled-gray-300 mt-4 w-full" children={'활동 시작 시간 전'} />
            ) : !calculateIsSubmitHour() ? (
              <Button.lg className="filled-gray-300 mt-4 w-full" children={'활동 시간대가 아닙니다'} />
            ) : (
              <Button.lg
                className="filled-primary w-full disabled:text-gray-500"
                children={isLoading ? '업로드 중...' : '제출하기'}
                disabled={disabled || isLoading || readOnly}
                onClick={async () => {
                  setLoading(true)
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

                  await saveStudentActivitySession({
                    params: { sessionId: activity.id },
                    data: { content, images: allImageNames, files: allDocumentNames },
                  })

                  return
                }}
              />
            )}
          </div>
        )
    }
  }

  return (
    <div className="px-2 py-4">
      {getSubmitContentElement()}
      <br />
    </div>
  )
}
