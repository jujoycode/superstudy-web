import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Linkify from 'react-linkify'
import { useParams } from 'react-router'

import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import SelectBar from '@/legacy/components/common/SelectBar'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { ImageCard } from '@/legacy/components/ib/ImageCard'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { Constants } from '@/legacy/constants'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { useexhibitionGetByIBId, useExhibitionSubmit, useExhibitionUpdate } from '@/legacy/container/ib-tok-exhibition'
import { RequestExhibitionDto, ResponseExhibitionDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { handleSingleBlobDownload } from '@/legacy/util/download-blob'
import { createTokExhibitionPdf } from '@/legacy/util/ib/tok-exhibition-pdf'
import { useUserStore } from '@/stores/user'

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
)

export const ExhibitionDetailPage = () => {
  const history = useHistory()
  const { id: idParam, exhibitionId: exhibitionIdParam } = useParams<{ id: string; exhibitionId: string }>()
  const id = Number(idParam)
  const exhibitionId = Number(exhibitionIdParam)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { data: IBData, klassNum, isLoading: isIBLoading } = useIBGetById(id)
  const { me } = useUserStore()
  const { data, isLoading, refetch } = useexhibitionGetByIBId(id)

  const [wordCounts, setWordCounts] = useState<{ [key: string]: number }>({
    target1: data?.wordCount1 ?? 0,
    target2: data?.wordCount2 ?? 0,
    target3: data?.wordCount3 ?? 0,
    introduction: data?.introductionWordCount ?? 0,
    conclusion: data?.conclusionWordCount ?? 0,
  })
  const { imageObjectMap, toggleImageDelete, addTargetFiles, setImageObjectMap } = useImageAndDocument({
    images: [data?.targetImage1, data?.targetImage2, data?.targetImage3].map((url) => url || ''),
  })
  const { handleUploadFile } = useFileUpload()
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)
  const [downloadMode, setDownloadMode] = useState<boolean>(false)

  const { data: Questions } = useThemeQuestionFindAll('TOK_EXHIBITION')

  const handleWordCountChange = (key: string, count: number) => {
    setWordCounts((prev) => {
      const updatedCounts = { ...prev }
      updatedCounts[key] = count
      return updatedCounts
    })
  }

  const totalWordCount = Object.values(wordCounts).reduce((acc, count) => acc + count, 0)

  const { updateExhibition, isLoading: isUpdateLoading } = useExhibitionUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `전시회가 \n저장되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 수정 중 오류 발생:', error)
    },
  })

  const { submitExhibition, isLoading: isSubmitLoading } = useExhibitionSubmit({
    onSuccess: () => {
      setAlertMessage({ text: `전시회 종료 승인을\n요청하였습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 승인 요청 중 오류 발생:', error)
    },
  })

  const transformedOptions =
    Questions?.flatMap((item) =>
      item.questions.map((question) => ({
        id: item.id,
        value: question,
        text: question,
      })),
    ) || []

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: {},
  } = useForm<RequestExhibitionDto>({
    defaultValues: data,
  })

  const resetData = () => {
    // 1. 폼 데이터를 초기 상태로 리셋
    reset(data)

    // 2. 각 대상별 단어 수 설정
    setWordCounts({
      target1: data?.wordCount1 ?? 0,
      target2: data?.wordCount2 ?? 0,
      target3: data?.wordCount3 ?? 0,
      introduction: data?.introductionWordCount ?? 0,
      conclusion: data?.conclusionWordCount ?? 0,
    })

    // 3. 이미지 맵 초기화를 위한 빈 Map 생성
    const imageMap = new Map()

    // 4. 각 대상 위치(1,2,3)에 대해 이미지 데이터 설정
    const targetImages = {
      1: data!.targetImage1,
      2: data!.targetImage2,
      3: data!.targetImage3,
    }

    // 5. 각 위치에 대해 이미지 맵 설정 (이미지가 없어도 위치는 유지)
    Object.entries(targetImages).forEach(([index, url]) => {
      imageMap.set(Number(index), {
        image: url || '', // url이 없으면 빈 문자열
        isDelete: false,
        targetKey: Number(index),
      })
    })

    // 6. 구성된 이미지 맵으로 상태 업데이트
    setImageObjectMap(imageMap)
  }

  const downloadPdf = async () => {
    setDownloadMode(true)

    try {
      await createAndDownloadPdf()
    } catch (error) {
      console.error('PDF 다운로드 중 오류 발생:', error)
    } finally {
      setDownloadMode(false)
    }
  }

  useEffect(() => {
    if (data) {
      resetData()
    }
  }, [data, reset])

  // 수정 버튼 클릭
  const onEdit = () => {
    setEditMode(true)
    resetData()
  }

  const onSubmit = async (ExhibitionData: RequestExhibitionDto) => {
    if (isUpdateLoading) return

    // 1. 새로 업로드할 파일들 수집
    const imageFiles = [...imageObjectMap.values()] // Map의 값들을 배열로 변환
      .filter((value) => !value.isDelete && value.image instanceof File) // 삭제되지 않은 새 파일만 필터링
      .map((value) => value.image) as File[] // 파일 객체만 추출

    // 2. 새 파일들 서버에 업로드
    const uploadedImageUrls = await handleUploadFile(UploadFileTypeEnum['ib/exhibition/images'], imageFiles)

    type TargetImageKey = 'targetImage1' | 'targetImage2' | 'targetImage3'
    // 3. 최종 이미지 URL을 저장할 객체 초기화
    const targetImageUrls = {
      targetImage1: '',
      targetImage2: '',
      targetImage3: '',
    }

    // 4. 각 위치(1,2,3)에 대해 이미지 처리
    ;[1, 2, 3].forEach((targetKey) => {
      const imageObj = imageObjectMap.get(targetKey)
      const key = `targetImage${targetKey}` as TargetImageKey

      if (imageObj && !imageObj.isDelete) {
        if (imageObj.image instanceof File) {
          // 새로 업로드된 파일
          const fileIndex = [...imageObjectMap.values()]
            .filter((value) => !value.isDelete && value.image instanceof File)
            .findIndex((value) => value.targetKey === targetKey)

          if (fileIndex !== -1) {
            targetImageUrls[key] = uploadedImageUrls[fileIndex]
          }
        } else if (imageObj.image) {
          // 기존 이미지 URL
          targetImageUrls[key] = imageObj.image
        }
      }
    })

    // 6. 최종 요청 데이터 구성
    const requestData: RequestExhibitionDto = {
      ...ExhibitionData, // 기존 폼 데이터
      ...targetImageUrls,
      wordCount1: wordCounts.target1,
      wordCount2: wordCounts.target2,
      wordCount3: wordCounts.target3,
      introductionWordCount: wordCounts.introduction,
      conclusionWordCount: wordCounts.conclusion,
    }

    // 7. API 호출 및 상태 업데이트
    updateExhibition({ id: exhibitionId, ibId: id, data: requestData })
    setEditMode(!editMode)
  }

  const themeQuestionValue = watch('themeQuestion')
  const referenceValue = watch('reference')

  function getImagesByTargetKey(targetKey: number) {
    return [...imageObjectMap.entries()]
      .filter(([_, obj]) => obj.targetKey === targetKey)
      .map(([key, obj]) => ({ ...obj, key }))
  }

  if (me == null || data === undefined) {
    return <IBBlank />
  }

  const isExhibitionComplete = (exhibition: ResponseExhibitionDto | undefined) => {
    if (!exhibition) return false

    return (
      !!exhibition.themeQuestion &&
      !!exhibition.targetContent1 &&
      !!exhibition.targetImage1 &&
      !!exhibition.wordCount1 &&
      !!exhibition.targetContent2 &&
      !!exhibition.targetImage2 &&
      !!exhibition.wordCount2 &&
      !!exhibition.targetContent3 &&
      !!exhibition.targetImage3 &&
      !!exhibition.wordCount3 &&
      !!exhibition.reference
    )
  }

  const createAndDownloadPdf = async () => {
    const pdfBytes = await createTokExhibitionPdf({ klassNum: klassNum || '', name: IBData?.leader.name || '' }, data)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    await handleSingleBlobDownload(blob, `TOK_전시회_${klassNum}_${IBData?.leader.name}_${data?.themeQuestion}.pdf`)
  }

  return (
    <div className="col-span-6">
      {(isLoading || isUpdateLoading || isSubmitLoading || isIBLoading) && <IBBlank />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="brown" size={24} type="solid_strong">
                      TOK
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      전시회
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/ib/student',
                      'TOK 전시회': `/ib/student/tok/exhibition/${id}`,
                      '전시회 상세': `/ib/student/tok/exhibition/${id}/detail/${exhibitionId}`,
                    }}
                  />
                </div>
                <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {data?.themeQuestion}
                </Typography>
              </div>
            </div>
          </div>
        }
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col rounded-xl bg-white p-6">
                {editMode ? (
                  <>
                    <div className="scroll-box flex flex-col overflow-auto pb-10">
                      <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2" className="font-semibold">
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
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2" className="font-semibold">
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
                        <div className="flex flex-col gap-10">
                          {[1, 2, 3].map((targetKey) => {
                            const targetContentField = `targetContent${targetKey}` as keyof RequestExhibitionDto
                            const targetContentValue = watch(targetContentField)

                            return (
                              <div key={targetKey} className="flex flex-col gap-4">
                                <div className="flex flex-row items-center">
                                  <Typography variant="title2" className="font-semibold">
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
                                {getImagesByTargetKey(targetKey).map((imgObj) => {
                                  if (imgObj.image === '') return null
                                  return (
                                    <div key={imgObj.key}>
                                      <ImageCard
                                        key={imgObj.key}
                                        id={imgObj.key}
                                        imageObjet={imgObj}
                                        onDeleteClick={(key) => {
                                          toggleImageDelete(key)
                                        }}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2" className="font-semibold">
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
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2" className="font-semibold">
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
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                        <div className="flex w-full flex-row items-center justify-between">
                          <Typography variant="title1">{data?.themeQuestion}</Typography>
                          <div className="text-12 flex flex-row items-center">
                            <p className="text-primary-gray-500">총 단어 수</p>&nbsp;
                            <p className="text-primary-orange-800 font-medium">{totalWordCount}</p>
                          </div>
                        </div>
                        <Typography variant="body3" className="text-primary-gray-500">
                          {format(new Date(data?.createdAt), 'yyyy.MM.dd')}
                        </Typography>
                      </div>
                      <div className="flex flex-col gap-10 pt-6 pb-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">서론</Typography>
                          </div>
                          <Typography variant="body1">{data?.introduction}</Typography>
                          <span className="flex flex-row items-center">
                            <Typography variant="caption" className="text-primary-gray-500">
                              단어수
                            </Typography>
                            &nbsp;
                            <Typography variant="caption" className="text-primary-orange-800 font-medium">
                              {data?.introductionWordCount}
                            </Typography>
                          </span>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">대상</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-orange-800">
                              1
                            </Typography>
                          </div>
                          {data?.targetImage1 && (
                            <div>
                              <LazyLoadImage
                                src={`${Constants.imageUrl}${data?.targetImage1}`}
                                alt="대상 1 첨부이미지"
                                crossOrigin="anonymous"
                                loading="lazy"
                                className="h-[294px] w-[392px] rounded-lg object-cover"
                              />
                            </div>
                          )}
                          <Typography variant="body1">{data?.targetContent1}</Typography>
                          <span className="flex flex-row items-center">
                            <Typography variant="caption" className="text-primary-gray-500">
                              단어수
                            </Typography>
                            &nbsp;
                            <Typography variant="caption" className="text-primary-orange-800 font-medium">
                              {data?.wordCount1}
                            </Typography>
                          </span>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">대상</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-orange-800">
                              2
                            </Typography>
                          </div>
                          {data?.targetImage2 && (
                            <div>
                              <LazyLoadImage
                                src={`${Constants.imageUrl}${data?.targetImage2}`}
                                alt="대상 1 첨부이미지"
                                crossOrigin="anonymous"
                                loading="lazy"
                                className="h-[294px] w-[392px] rounded-lg object-cover"
                              />
                            </div>
                          )}
                          <Typography variant="body1">{data?.targetContent2}</Typography>
                          <span className="flex flex-row items-center">
                            <Typography variant="caption" className="text-primary-gray-500">
                              단어수
                            </Typography>
                            &nbsp;
                            <Typography variant="caption" className="text-primary-orange-800 font-medium">
                              {data?.wordCount2}
                            </Typography>
                          </span>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">대상</Typography>&nbsp;
                            <Typography variant="title2" className="text-primary-orange-800">
                              3
                            </Typography>
                          </div>
                          {data?.targetImage3 && (
                            <div>
                              <LazyLoadImage
                                src={`${Constants.imageUrl}${data?.targetImage3}`}
                                alt="대상 1 첨부이미지"
                                crossOrigin="anonymous"
                                loading="lazy"
                                className="h-[294px] w-[392px] rounded-lg object-cover"
                              />
                            </div>
                          )}
                          <Typography variant="body1">{data?.targetContent3}</Typography>
                          <span className="flex flex-row items-center">
                            <Typography variant="caption" className="text-primary-gray-500">
                              단어수
                            </Typography>
                            &nbsp;
                            <Typography variant="caption" className="text-primary-orange-800 font-medium">
                              {data?.wordCount3}
                            </Typography>
                          </span>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-row items-center">
                            <Typography variant="title2">결론</Typography>
                          </div>
                          <Typography variant="body1">{data?.conclusion}</Typography>
                          <span className="flex flex-row items-center">
                            <Typography variant="caption" className="text-primary-gray-500">
                              단어수
                            </Typography>
                            &nbsp;
                            <Typography variant="caption" className="text-primary-orange-800 font-medium">
                              {data?.conclusionWordCount}
                            </Typography>
                          </span>
                        </div>
                      </div>
                      <div className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                        <div className="flex flex-col gap-4">
                          <Typography variant="title2">Reference</Typography>
                          <Linkify componentDecorator={urlDecorator}>{data.reference}</Linkify>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <footer className={`flex flex-row items-center justify-between`}>
                  {editMode ? (
                    <>
                      <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                        취소
                      </ButtonV2>
                      <div className="flex flex-row items-center gap-4">
                        <div className="text-12 flex flex-row items-center">
                          <p className="text-primary-gray-500">총 단어 수</p>&nbsp;
                          <p className="text-primary-orange-800 font-medium">{totalWordCount}</p>
                        </div>
                        <ButtonV2 size={40} variant="solid" color="orange100" onClick={handleSubmit(onSubmit)}>
                          저장하기
                        </ButtonV2>
                      </div>
                    </>
                  ) : (
                    <div className="flex w-full flex-row justify-between">
                      <div className="flex flex-row items-center gap-2">
                        {IBData?.status !== 'COMPLETE' && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={IBData?.status === 'WAIT_COMPLETE' || downloadMode}
                          >
                            수정
                          </ButtonV2>
                        )}
                        <ButtonV2
                          size={40}
                          variant="outline"
                          color="gray400"
                          onClick={downloadPdf}
                          disabled={downloadMode}
                        >
                          PDF 다운로드
                        </ButtonV2>
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/ib/student/tok/exhibition/${id}`, { type: 'EXHIBITION' })}
                        disabled={downloadMode}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </div>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1">진행기록</Typography>
                <Feedback
                  referenceId={exhibitionId}
                  referenceTable="EXHIBITION"
                  user={me}
                  useTextarea={IBData?.status !== 'COMPLETE'}
                />
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
        floatingButton={
          editMode
            ? null
            : data?.id &&
              IBData?.status !== 'COMPLETE' && (
                <div>
                  <div className="mx-auto flex w-[1280px] items-center justify-between">
                    <Typography variant="caption2" className="text-primary-gray-500 flex items-center gap-1">
                      <SolidSVGIcon.Info color="gray400" size={16} />세 가지 대상과 이에 대한 이미지, 설명, 레퍼런스를
                      모두 입력 및 추가하셔야 전시회 종료 승인 요청이 가능합니다.
                    </Typography>
                    <ButtonV2
                      variant="solid"
                      color="orange800"
                      size={48}
                      className="w-[200px]"
                      disabled={IBData?.status === 'WAIT_COMPLETE' || !isExhibitionComplete(data)}
                      onClick={() => setIsOpen(true)}
                    >
                      전시회 종료 승인요청
                    </ButtonV2>
                  </div>
                </div>
              )
        }
      />

      {isOpen && (
        <AlertV2
          message={`전시회 종료 승인을 요청하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            submitExhibition({ id: exhibitionId, ibId: id })
            setIsOpen(!isOpen)
          }}
          description={'승인요청을 하면 제출물에 대한 수정이 불가능합니다.\n수정할 내용이 없는지 확인해주세요.'}
          onCancel={() => setIsOpen(!isOpen)}
        />
      )}
      {alertMessage && (
        <AlertV2
          message={alertMessage.text}
          confirmText="확인"
          onConfirm={() => {
            if (alertMessage.action) alertMessage.action()
            setAlertMessage(null)
          }}
        />
      )}
    </div>
  )
}
