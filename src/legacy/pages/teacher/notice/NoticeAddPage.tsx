import { useRecoilValue } from 'recoil'
import { ErrorBlank } from '@/legacy/components'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { Blank, Label, Section, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { FileUpload } from '@/legacy/components/common/FileUpload'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useTeacherNoticeAdd } from '@/legacy/container/teacher-notice-add'
import { Code, Notice } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState } from '@/stores'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getExtOfFilename } from '@/legacy/util/file'

interface NoticeAddProps {
  noticeData?: Notice
  categoryData?: Code[]
}

export function NoticeAddPage({ noticeData, categoryData }: NoticeAddProps) {
  const meRecoil = useRecoilValue(meState)
  const { t } = useLanguage()

  const {
    notice,
    imageObjectMap,
    documentObjectMap,
    errorMessage,
    isLoading,
    submitButtonDisabled,
    toStudent,
    toParent,
    setNotice,
    handleImageAdd,
    handleDocumentAdd,
    toggleImageDelete,
    toggleDocumentDelete,
    handleSubmit,
    setToStudent,
    setToParent,
  } = useTeacherNoticeAdd(noticeData)

  const imageObjectMapPaths = (): string[] => {
    // imageObjectMap의 값들을 배열로 변환 후 filter와 map 함수를 사용하여 조건을 충족하는 imageObject의 image만 추출하여 string[]로 반환
    const pathsArray: string[] = Array.from(imageObjectMap.values())
      .filter((imageObject) => !imageObject.isDelete)
      .map((imageObject) => {
        if (typeof imageObject.image === 'string') {
          return imageObject.image
        } else {
          return URL.createObjectURL(imageObject.image) + '?ext=' + getExtOfFilename(imageObject.image.name)
        }
      })

    return pathsArray
  }

  const documentObjectMapPaths = (): string[] => {
    // imageObjectMap의 값들을 배열로 변환 후 filter와 map 함수를 사용하여 조건을 충족하는 imageObject의 image만 추출하여 string[]로 반환
    const pathsArray: string[] = Array.from(documentObjectMap.values())
      .filter((documentObject) => !documentObject.isDelete)
      .map((documentObject) => {
        if (typeof documentObject?.document === 'string') {
          return documentObject?.document
        } else {
          return documentObject.document.name
        }
      })

    return pathsArray
  }

  return (
    <div className="h-screen-8 md:h-screen-3">
      {isLoading && <Blank />}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      <div className="flex space-x-3">
        <div className="scroll-box md:h-screen-3 flex flex-col space-y-2 overflow-y-scroll">
          <Section>
            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('required_category')}
              </Label.Text>
              <Select.lg
                value={notice?.category}
                onChange={(e) => setNotice((prevState) => ({ ...prevState, category: e.target.value }) as Notice)}
              >
                <option selected hidden>
                  {t('selection')}
                  {/* 구분을 선택해주세요 */}
                </option>
                {categoryData?.map((el: Code) => (
                  <option id={el.name} value={el.name} key={el.name}>
                    {t(`${el.name}`)}
                  </option>
                ))}
              </Select.lg>
            </Label.col>

            {/* 전달 대상 선택 */}
            <Label.Text>
              *<span className="text-red-500">({t('required')})</span> {t('required_select_recipients')}
            </Label.Text>
            <>
              <div className="flex items-center space-x-4 px-4">
                <Checkbox
                  checked={toStudent}
                  onChange={() => {
                    setToStudent(!toStudent)
                    if (toStudent && !toParent) {
                      setToParent(true)
                    }
                  }}
                />
                <p>{t('student')}</p>
                <Checkbox
                  checked={toParent}
                  onChange={() => {
                    setToParent(!toParent)
                    if (!toStudent && toParent) {
                      setToStudent(true)
                    }
                  }}
                />
                <p>{t('parent')}</p>
              </div>
            </>

            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('title')}
              </Label.Text>
              <TextInput
                placeholder={`${t('enter_title')}`}
                value={notice?.title}
                onChange={(e) => setNotice((prevState) => ({ ...prevState, title: e.target.value }) as Notice)}
              />
            </Label.col>

            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('content')}
              </Label.Text>
              <Textarea
                placeholder={`${t('enter_content')}`}
                value={notice?.content}
                onChange={(e) => setNotice((prevState) => ({ ...prevState, content: e.target.value }) as Notice)}
                className="border"
              />
            </Label.col>
            <div>
              <Label.Text children={t('image')} />
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
                <ImageUpload accept=".pdf, .png, .jpeg, .jpg" onChange={handleImageAdd} />
              </div>
            </div>
            <div>
              <Label.Text children={t('file')} />
              <FileUpload onChange={handleDocumentAdd} className="mt-1">
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
          </Section>
        </div>
        <div className="scroll-box h-screen-3 hidden overflow-scroll py-4 md:block md:w-1/2">
          <div className="mb-3 text-lg font-bold">{t('preview')}</div>
          <div className="w-full rounded-lg border p-3">
            <FeedsDetail
              category1={notice?.category}
              category1Color="peach_orange"
              sendTo={
                (toStudent ? t('student') : '') + (toStudent && toParent ? '/' : '') + (toParent ? t('parent') : '')
              }
              sendToColor="gray-100"
              title={notice?.title}
              contentText={notice?.content}
              contentImages={imageObjectMapPaths()}
              contentFiles={documentObjectMapPaths()}
              writer={meRecoil?.name}
              createAt={DateUtil.formatDate(new Date(), DateFormat['YYYY.MM.DD HH:mm'])}
            />
          </div>
          <div className="mt-2">
            <Button.lg
              children={notice?.id ? t('edit_announcement') : t('register')}
              disabled={submitButtonDisabled}
              onClick={() => handleSubmit({ notice, imageObjectMap, documentObjectMap })}
              className="filled-primary mx-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
