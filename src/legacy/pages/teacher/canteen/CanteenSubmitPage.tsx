import { ChangeEvent, useState } from 'react'
import clsx from 'clsx'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useLanguage } from '@/hooks/useLanguage'
import { Blank } from '@/legacy/components/common'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import { Constants } from '@/legacy/constants'
import { useTeacherCanteenSubmit } from '@/legacy/container/teacher-canteen-submit'
import { Canteen, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
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

  const handleSubmit = async () => {
    setLoading(true)
    await handleCanteenUpsert({
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

  if (loading) {
    return <Blank />
  }

  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black/50`}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (!target.closest('.allow-click')) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={`relative max-h-[800px] w-[632px] overflow-hidden rounded-xl bg-white px-8`}>
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">{t('meal_plan')}</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={refetch} className="cursor-pointer" />
        </div>

        <section className="flex flex-col gap-3 pt-4 pb-8">
          <div className="flex flex-row items-start gap-4">
            <span className="flex flex-1 flex-col gap-3">
              <Typography variant="title3" className="font-medium" children={t('lunch')} />
              <TextareaV2
                placeholder={`${t('enter_content')}`}
                value={lunch}
                onChange={(e) => setLunch(e.target.value)}
                className="h-40"
              />
            </span>
            <span className="flex flex-1 flex-col gap-3">
              <Typography variant="title3" className="font-medium" children={t('dinner')} />
              <TextareaV2
                placeholder={`${t('enter_content')}`}
                value={dinner}
                onChange={(e) => setDinner(e.target.value)}
                className="h-40"
              />
            </span>
          </div>
          {image && (
            <div className="border-dim-8 relative aspect-square h-20 w-20 rounded-lg border">
              <LazyLoadImage
                src={`${Constants.imageUrl}${image}`}
                alt=""
                loading="lazy"
                className="object-fit absolute h-full w-full rounded-lg"
              />
              <span className="absolute top-1 right-1 z-10 block" onClick={() => setImage('')}>
                <ColorSVGIcon.Close color="dimmed" size={24} />
              </span>
            </div>
          )}
        </section>

        <div
          className={clsx(
            'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-between gap-4 border-t bg-white/70 pt-6 pb-8 backdrop-blur-[20px]',
          )}
        >
          <label htmlFor="file-upload" className="allow-click cursor-pointer">
            <div className="border-primary-gray-400 text-primary-gray-900 active:border-primary-gray-100 active:bg-primary-gray-400 disabled:border-primary-gray-100 disabled:bg-primary-gray-200 disabled:text-primary-gray-400 flex h-10 min-w-[64px] items-center rounded-[6px] border px-3 text-[14px] font-medium disabled:cursor-not-allowed">
              이미지 첨부하기
            </div>
            <input
              type="file"
              id="file-upload"
              accept=".pdf, .png, .jpeg, .jpg"
              className="hidden"
              onChange={handleChangeImage}
            />
          </label>
          <ButtonV2
            type="button"
            variant="solid"
            color="orange800"
            size={48}
            onClick={() => handleSubmit()}
            disabled={lunch === '' && dinner === ''}
          >
            저장하기
          </ButtonV2>
        </div>
      </div>
    </div>
  )
}
