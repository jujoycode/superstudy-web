import { format } from 'date-fns'
import { ChangeEvent, useState } from 'react'

import { Blank, Label, Section, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { Constants } from '@/legacy/constants'
import { useTeacherCanteenSubmit } from '@/legacy/container/teacher-canteen-submit'
import { Canteen, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { checkFileSizeLimit100MB } from '@/legacy/util/file'
import { makeDateToString } from '@/legacy/util/time'
import { Validator } from '@/legacy/util/validator'

interface CanteenSubmitPageProps {
  selectedDate: Date
  canteenData?: Canteen
  refetch: () => void
}

export function CanteenSubmitPage({ selectedDate, canteenData, refetch }: CanteenSubmitPageProps) {
  const { handleCanteenUpsert } = useTeacherCanteenSubmit(refetch)
  const { handleUploadFile } = useFileUpload()
  const { t } = useLanguage()

  const [image, setImage] = useState(canteenData?.image ?? '')
  const [lunch, setLunch] = useState(canteenData?.lunch ?? '')
  const [dinner, setDinner] = useState(canteenData?.dinner ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    handleCanteenUpsert({
      lunch,
      dinner,
      date: makeDateToString(selectedDate),
      image,
    }).then(() => setLoading(false))
  }

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    if (!Validator.fileNameRule(selectedImageFiles[0].name)) {
      alert('특수문자(%, &, ?, ~, +)가 포함된 파일명은 사용할 수 없습니다.')
      return
    }

    if (!checkFileSizeLimit100MB([selectedImageFiles[0]])) {
      alert('한번에 최대 100MB까지만 업로드 가능합니다.')
      return
    }

    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['test/canteens/images'], [selectedImageFiles[0]])

    setImage(imageFileNames[0])
  }

  return (
    <div className="border-grey-6 relative h-screen w-full border-l bg-white">
      {loading && <Blank reversed />}
      <div className="h-screen overflow-y-scroll">
        <div className="border-grey-6 flex w-full items-center justify-between border-b px-6 py-4">
          <div className="text-xl font-bold">
            {t('language') === 'ko'
              ? `${selectedDate?.getFullYear()}년 ${selectedDate?.getMonth() + 1}월 ${selectedDate?.getDate()}일`
              : format(selectedDate, 'MMM d, yyyy')}
          </div>
          <div className="border-grey-6 invisible cursor-pointer rounded border px-4 py-2 text-gray-700">수정</div>
        </div>
        <Section>
          {image && (
            <span className="absolute top-25 right-8 z-40 block h-6 w-6 rounded-full bg-red-700 ring-2 ring-white">
              <div
                className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                onClick={() => {
                  setImage('')
                }}
                style={{ transform: 'translate(0.1px, 0.1px)' }}
              >
                X
              </div>
            </span>
          )}
          <ImageUpload accept=".pdf, .png, .jpeg, .jpg" onChange={handleChangeImage}>
            {image && <img src={`${Constants.imageUrl}${image}`} className="aspect-5/3 rounded object-cover" alt="" />}
          </ImageUpload>

          <div className="flex gap-2">
            <Label.col className="flex-1">
              <Label.Text children={t('lunch')} />
              <Textarea
                placeholder={`${t('enter_content')}`}
                value={lunch}
                onChange={(e) => setLunch(e.target.value)}
              />
            </Label.col>
            <Label.col className="flex-1">
              <Label.Text children={t('dinner')} />
              <Textarea
                placeholder={`${t('enter_content')}`}
                value={dinner}
                onChange={(e) => setDinner(e.target.value)}
                className="border"
              />
            </Label.col>
          </div>
        </Section>
        <div className="my-6">
          <Button.lg children={t('save')} onClick={() => handleSubmit()} className="filled-primary mx-auto w-[70%]" />
        </div>
      </div>
    </div>
  )
}
