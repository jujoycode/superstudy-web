import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRecoilValue } from 'recoil'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import SelectBar from '@/legacy/components/common/SelectBar'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { useExhibitionCreate } from '@/legacy/container/ib-tok-exhibition'
import { RequestExhibitionDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { meState } from '@/stores'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '../../icon/ColorSVGIcon'
import { ImageCard } from '../ImageCard'

interface IbExhibitionProps {
  modalOpen: boolean
  setModalClose: () => void
  size?: 'medium' | 'large'
  handleBack?: () => void
  onSuccess: (data?: any) => void
  ibId: number
  ablePropragation?: boolean
}

export function IbExhibition({
  modalOpen,
  setModalClose,
  handleBack,
  ibId,
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbExhibitionProps>) {
  const me = useRecoilValue(meState)
  const [wordCounts, setWordCounts] = useState<{ [key: string]: number }>({
    target1: 0,
    target2: 0,
    target3: 0,
    introduction: 0,
    conclusion: 0,
  })

  const { imageObjectMap, toggleImageDelete, addTargetFiles } = useImageAndDocument({})
  const { handleUploadFile } = useFileUpload()

  const handleWordCountChange = (key: string, count: number) => {
    setWordCounts((prev) => {
      const updatedCounts = { ...prev }
      updatedCounts[key] = count
      return updatedCounts
    })
  }

  const totalWordCount = Object.values(wordCounts).reduce((acc, count) => acc + count, 0)

  const { createExhibition, isLoading } = useExhibitionCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('전시회 생성 중 오류 발생:', error)
    },
  })

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequestExhibitionDto>()

  const { data: Questions, isLoading: isFetching } = useThemeQuestionFindAll('TOK_EXHIBITION')

  const transformedOptions =
    Questions?.flatMap((item) =>
      item.questions.map((question, index) => ({
        id: index,
        value: question,
        text: question,
      })),
    ) || []

  const onSubmit = async (data: RequestExhibitionDto) => {
    if (!me?.id) {
      console.error('Leader ID가 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    if (isLoading) {
      return
    }

    const imageFiles = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[]

    const uploadedImageUrls = await handleUploadFile(UploadFileTypeEnum['ib/exhibition/images'], imageFiles)
    const existingImageUrls = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[]
    const combinedImageUrls = [...existingImageUrls, ...uploadedImageUrls]

    const targetImageFields = [`targetImage1`, `targetImage2`, `targetImage3`] as const
    const targetImageUrls = targetImageFields.reduce(
      (acc, field, index) => {
        acc[field] = combinedImageUrls[index] || ''
        return acc
      },
      {} as Pick<RequestExhibitionDto, 'targetImage1' | 'targetImage2' | 'targetImage3'>,
    )

    const requestData: RequestExhibitionDto = {
      ...data,
      ...targetImageUrls,
      wordCount1: wordCounts.target1,
      wordCount2: wordCounts.target2,
      wordCount3: wordCounts.target3,
      introductionWordCount: wordCounts.introduction,
      conclusionWordCount: wordCounts.conclusion,
    }

    createExhibition({ id: ibId, data: requestData })
  }

  function getImagesByTargetKey(targetKey: number) {
    return [...imageObjectMap.values()].filter((obj) => obj.targetKey === targetKey && !obj.isDelete)
  }

  const themeQuestionValue = watch('themeQuestion')
  const referenceValue = watch('reference')

  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          const target = e.target as HTMLElement
          if (!target.closest('.allow-click')) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
      }}
    >
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white`}>
        {isLoading && <IBBlank type="section-opacity" />}
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pt-8 pb-6 backdrop-blur-[20px]">
          <Typography variant="title1">전시회 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="scroll-box flex max-h-[608px] flex-col overflow-auto pt-4 pb-8">
          <div className="flex flex-col gap-3 px-8 pb-8">
            <div className="flex flex-row items-center">
              <Typography variant="title3" className="font-semibold">
                질문 선택
              </Typography>
            </div>
            <SelectBar
              key={themeQuestionValue}
              options={transformedOptions}
              size={40}
              placeholder="질문을 선택하세요"
              dropdownWidth="w-full"
              onChange={(value) => setValue('themeQuestion', value)}
              value={themeQuestionValue}
              // {...register(`themeQuestion` as const)}
            />
          </div>
          <div className="border-t-primary-gray-100 flex flex-col gap-3 border-t px-8 py-8">
            <Typography variant="title3" className="font-semibold">
              서론
            </Typography>
            <TextareaV2
              showWordCount={true}
              onWordCountChange={(count) => handleWordCountChange('introduction', count)}
              placeholder="내용을 입력해주세요."
              className="h-[308px]"
              readonlyBackground="bg-primary-gray-100"
              value={watch('introduction')}
              {...register(`introduction` as const)}
            />
          </div>
          <div className="flex flex-col">
            {[1, 2, 3].map((targetKey) => {
              const targetContentField = `targetContent${targetKey}` as keyof RequestExhibitionDto
              const targetContentValue = watch(targetContentField)

              return (
                <div key={targetKey} className="border-t-primary-gray-100 flex flex-col gap-3 border-t px-8 py-8">
                  <div className="flex flex-row items-center">
                    <Typography variant="title3" className="font-semibold">
                      대상
                    </Typography>
                    &nbsp;
                    <Typography variant="title3" className="text-primary-orange-800 font-semibold">
                      {targetKey}
                    </Typography>
                  </div>
                  <div className="relative">
                    <TextareaV2
                      showWordCount={true}
                      onWordCountChange={(count) => handleWordCountChange(`target${targetKey}`, count)}
                      placeholder="내용을 입력해주세요."
                      className="h-[308px]"
                      readonlyBackground="bg-primary-gray-100"
                      value={targetContentValue}
                      {...register(targetContentField)}
                    />
                    <label
                      htmlFor={`file-upload-${targetKey}`}
                      className="allow-click absolute right-4 bottom-4 z-30 cursor-pointer"
                    >
                      <div className="border-primary-gray-400 text-primary-gray-900 active:border-primary-gray-100 active:bg-primary-gray-400 disabled:border-primary-gray-100 disabled:bg-primary-gray-200 disabled:text-primary-gray-400 flex h-8 items-center rounded-md border px-3 text-[14px] font-medium disabled:cursor-not-allowed">
                        이미지 첨부하기
                      </div>
                      <input
                        type="file"
                        id={`file-upload-${targetKey}`}
                        accept="image/*"
                        name="file-upload"
                        className="hidden"
                        onChange={(e) => {
                          e.preventDefault()
                          const files = e.target.files
                          if (!files) return
                          addTargetFiles(files, targetKey)
                        }}
                      />
                    </label>
                  </div>
                  {getImagesByTargetKey(targetKey).map((imgObj, idx) => (
                    <ImageCard key={idx} id={idx} imageObjet={imgObj} onDeleteClick={toggleImageDelete} />
                  ))}
                </div>
              )
            })}
          </div>
          <div className="border-t-primary-gray-100 flex flex-col gap-3 border-t px-8 py-8">
            <Typography variant="title3" className="font-semibold">
              결론
            </Typography>
            <TextareaV2
              showWordCount={true}
              onWordCountChange={(count) => handleWordCountChange('conclusion', count)}
              placeholder="내용을 입력해주세요."
              className="h-[308px]"
              readonlyBackground="bg-primary-gray-100"
              value={watch('conclusion')}
              {...register(`conclusion` as const)}
            />
          </div>
          <div className="border-t-primary-gray-100 flex flex-col gap-3 border-t px-8 pt-8">
            <div className="flex flex-row items-center">
              <Typography variant="title3" className="font-semibold">
                Reference
              </Typography>
            </div>
            <TextareaV2
              placeholder="내용을 입력해주세요."
              className="h-[308px]"
              readonlyBackground="bg-primary-gray-100"
              value={referenceValue}
              {...register(`reference` as const)}
            />
          </div>
        </div>

        <div
          className={
            'border-t-primary-gray-100 sticky bottom-0 flex h-[104px] justify-between gap-4 border-t bg-white/70 px-8 pt-6 pb-8 backdrop-blur-[20px]'
          }
        >
          <div className="text-12 flex flex-row items-center">
            <p className="text-primary-gray-500">총 단어 수</p>&nbsp;
            <p className="text-primary-orange-800 font-medium">{totalWordCount}</p>
          </div>
          <div className="flex gap-3">
            <ButtonV2
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={!themeQuestionValue}
            >
              저장하기
            </ButtonV2>
          </div>
        </div>
      </div>
    </div>
  )
}
