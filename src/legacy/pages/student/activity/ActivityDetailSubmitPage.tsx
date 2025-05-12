import { useEffect, useState } from 'react'
import { Divider, Label, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FileUpload } from '@/legacy/components/common/FileUpload'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { Time } from '@/legacy/components/common/Time'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useStudentActivityDetailSubmit } from '@/legacy/container/student-activity-detail-submit'
import { Activity, RequestUpdateStudentActivityDto, StudentActivity } from '@/legacy/generated/model'

interface ActivityDetailSubmitPageProps {
  studentActivity?: StudentActivity
  activity?: Activity
  setReadState: () => void
  setLoading: (state: boolean) => void
}

export function ActivityDetailSubmitPage({
  studentActivity,
  activity,
  setReadState,
  setLoading,
}: ActivityDetailSubmitPageProps) {
  if (!studentActivity) {
    return null
  }

  const {
    imageObjectMap,
    documentObjectMap,
    handleStudentActivityUpdate,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    uploadFiles,
  } = useStudentActivityDetailSubmit(studentActivity, setReadState, setLoading)

  const [content, setContent] = useState(studentActivity?.content || '')
  const [summary, setSummary] = useState(studentActivity?.summary || '')

  useEffect(() => {
    if (studentActivity?.content) {
      setContent(studentActivity?.content)
    } else if (activity) {
      const activityContent = localStorage.getItem('activityContent')
      const activityId = localStorage.getItem('activityId')
      if (activityContent && String(activity.id) === activityId) {
        setContent(activityContent)
      }
    }
  }, [])

  useEffect(() => {
    if (activity && content) {
      localStorage.setItem('activityId', String(activity.id))
      localStorage.setItem('activityContent', content)
    }
  }, [activity, content])

  const updateSA = async () => {
    handleStudentActivityUpdate(studentActivity?.id || 0, {
      activityId: activity?.id,
      content: content.length ? content : ' ',
      isSubmitted: true,
      summary,
    } as RequestUpdateStudentActivityDto)
  }

  if (activity?.type === 'SURVEY') {
    return (
      <div className="flex flex-col items-stretch space-y-2 bg-gray-50 px-5 py-4">
        {activity?.isRecord && (
          <div className="w-full px-4">
            <Label children="활동요약" htmlFor="textarea1" />
            <div className="text-base font-semibold text-gray-600">{activity.explainText}</div>
            <textarea
              id="textarea1"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="focus:border-brand-1 block h-48 w-full rounded-md border border-gray-200 px-4 py-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        )}
        {/* <SurveyComponent
          content={activity?.content || '{}'}
          updateSA={() => {
            updateSA();
          }}
          setContent={(c: string) => setContent(JSON.stringify(c))}
          uploadFiles={(files: File[]) => {
            return uploadFiles(files);
          }}
          value={content || '[]'}
        /> */}
      </div>
    )
  }

  const buttonDisabled = !documentObjectMap.size && !imageObjectMap.size && !content

  return (
    <>
      <div className="flex flex-col items-stretch space-y-4 bg-gray-50 px-5 py-4">
        {activity?.isRecord && (
          <div className="w-full px-4">
            <Label children="활동요약" htmlFor="textarea1" />
            <div className="text-base font-semibold text-gray-600">{activity.explainText}</div>
            <textarea
              id="textarea1"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="focus:border-brand-1 block h-48 w-full rounded-md border border-gray-200 px-4 py-2 placeholder-gray-400 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        )}
        {activity?.isImage && (
          <div>
            <Label className="text-lg font-bold text-gray-800">이미지 업로드</Label>
            <div className="mt-5 w-full">
              {[...imageObjectMap].map(([key, value]) => (
                <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
              ))}
              <ImageUpload accept=".pdf, .png, .jpeg, .jpg" onChange={handleImageAdd} />
            </div>
          </div>
        )}
        {activity?.isFile && (
          <div>
            <Label className="text-lg font-bold text-gray-800">파일 업로드</Label>
            <FileUpload onChange={handleDocumentAdd}>
              {[...documentObjectMap].map(([key, value]) => (
                <DocumentObjectComponent
                  key={key}
                  id={key}
                  documentObjet={value}
                  onDeleteClick={toggleDocumentDelete}
                />
              ))}
            </FileUpload>
          </div>
        )}
        {activity?.isContent && (
          <>
            <div className="text-lg font-bold text-gray-800">내용 입력</div>
            <Textarea
              placeholder="내용을 입력해주세요. 작성된 활동기록부는 담당 선생님께만 노출됩니다."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-auto border"
            />
          </>
        )}
        <Divider />
        {studentActivity?.isSubmitted && (
          <div className="text-brandblue-1 mt-3">
            제출 완료 일시 : <Time date={studentActivity.updatedAt} className="text-16 text-inherit" /> (
            <Time date={studentActivity.updatedAt} formatDistanceToNow className="text-16 text-inherit" />)
          </div>
        )}
        <Button.lg
          children={studentActivity?.isSubmitted ? '수정하기' : '제출하기'}
          disabled={buttonDisabled}
          onClick={() => {
            setLoading(true)
            updateSA()
          }}
          className="filled-primary"
        />
        <br />
      </div>
    </>
  )
}
