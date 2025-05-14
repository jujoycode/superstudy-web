import { format } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import { Blank } from '@/legacy/components/common'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { LayeredTabs, Tab } from '@/legacy/components/common/LayeredTabs'
import SelectBar from '@/legacy/components/common/SelectBar'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { ImageCard } from '@/legacy/components/ib/ImageCard'
import { IBDetailPlagiarimInspectResultBadge } from '@/legacy/components/ib/plagiarismInspect/IBDetailPlagiarimInspectResultBadge'
import { EvaluationList } from '@/legacy/components/ib/tok/teacher/EvaluationList'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import { useGetTokEvaluationInitialData } from '@/legacy/container/ib-evaluation'
import { useIBApproveComplete, useIBStatusRejectComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useThemeQuestionFindAll } from '@/legacy/container/ib-themequestion'
import { useexhibitionGetByIBId, useExhibitionUpdate } from '@/legacy/container/ib-tok-exhibition'
import { useGetIBPlagiarismInspectRatio } from '@/legacy/container/plagiarism-inspector'
import {
  CopykillerTargetTable,
  RequestExhibitionDto,
  ResponseCopykillerResponseDto,
  ResponseExhibitionDto,
  UploadFileTypeEnum,
} from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { usePolling } from '@/legacy/hooks/usePolling'
import { useSignedUrl } from '@/legacy/lib/query'
import { handleSingleBlobDownload } from '@/legacy/util/download-blob'
import { createTokExhibitionPdf } from '@/legacy/util/ib/tok-exhibition-pdf'
import { meState, schoolPropertiesState } from '@/stores'
import { useUserStore } from '@/stores2/user'

type tabType = 'feedback' | 'evaluation'

export const ExhibitionDetailPage = () => {
  const { push } = useHistory()
  const [plagiarismInspectData, setPlagiarismInspectData] = useState<{
    status: ResponseCopykillerResponseDto['completeStatus'] | null
    copyRatio: ResponseCopykillerResponseDto['copyRatio'] | null
    errorMessage: ResponseCopykillerResponseDto['errorMessage'] | null
    id: number | null
  } | null>(null)

  const { ibId: idParam, exhibitionId: exhibitionIdParam } = useParams<{ ibId: string; exhibitionId: string }>()
  const id = Number(idParam)
  const exhibitionId = Number(exhibitionIdParam)

  const [editMode, setEditMode] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [rejectExhibitionConfirmModalOpen, setRejectExhibitionConfirmModalOpen] = useState<boolean>(false)
  const [type, setType] = useState<tabType>('feedback')
  const { me } = useUserStore()
  const schoolProperties = useRecoilValue(schoolPropertiesState)
  const { data } = useexhibitionGetByIBId(id)

  // 표절 검사 활성화 여부
  const enabledPlagiarismInspect = !!schoolProperties?.find((property) => property.key === 'COPYKILLER_LICENSE_KEY')
    ?.value

  const [wordCounts, setWordCounts] = useState<{ [key: string]: number }>({
    target1: data?.wordCount1 ?? 0,
    target2: data?.wordCount2 ?? 0,
    target3: data?.wordCount3 ?? 0,
    introduction: data?.introductionWordCount ?? 0,
    conclusion: data?.conclusionWordCount ?? 0,
  })
  const [downloadMode, setDownloadMode] = useState<boolean>(false)

  const { data: evaluationData } = useGetTokEvaluationInitialData({
    ibId: id,
    type: 'EXHIBITION',
  })

  const { imageObjectMap, toggleImageDelete, addTargetFiles, setImageObjectMap } = useImageAndDocument({
    images: [data?.targetImage1, data?.targetImage2, data?.targetImage3].map((url) => url || ''),
  })
  const { handleUploadFile } = useFileUpload()
  const [alertMessage, setAlertMessage] = useState<{ text: string; action?: () => void } | null>(null)

  const { data: ibData, klassNum, isLoading, refetch } = useIBGetById(id)

  const permission = usePermission(ibData?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const { data: Questions } = useThemeQuestionFindAll('TOK_EXHIBITION')

  const { refetch: refetchPlagiarismInspectRatio } = useGetIBPlagiarismInspectRatio(
    CopykillerTargetTable.EXHIBITION,
    Number(id ?? 0),
    {
      query: {
        enabled: false, // 자동 호출 비활성화, 폴링으로만 실행
      },
    },
  )

  // 폴링 훅 사용
  usePolling<ResponseCopykillerResponseDto>({
    enabled: enabledPlagiarismInspect && !!data?.id,
    maxPollingCount: 20,
    fetchFn: refetchPlagiarismInspectRatio,
    onSuccess: (data) => {
      setPlagiarismInspectData({
        status: data.completeStatus,
        copyRatio: data.copyRatio,
        errorMessage: data.errorMessage,
        id: data.id,
      })
    },
    onError: (error) => {
      console.error('표절 검사 결과 확인 중 오류 발생:', error)
      setPlagiarismInspectData({
        status: 'F',
        copyRatio: null,
        errorMessage: '오류가 발생했습니다. 다시 시도해 주세요.',
        id: null,
      })
    },
    isComplete: (data) => data.completeStatus !== 'N',
  })

  const handleWordCountChange = (key: string, count: number) => {
    setWordCounts((prev) => {
      const updatedCounts = { ...prev }
      updatedCounts[key] = count
      return updatedCounts
    })
  }

  const { updateExhibition } = useExhibitionUpdate({
    onSuccess: () => {
      setAlertMessage({ text: `전시회가\n저장되었습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('전시회 수정 중 오류 발생:', error)
    },
  })

  // 활동종료 승인 api 호출
  const { approveIBProjectComplete } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage({ text: `전시회 종료를\n승인하였습니다` })
      refetch()
    },
    onError: (error) => {
      console.error('활동종료 승인 중 오류 발생:', error)
    },
  })

  // 완료 승인 대기 중일 때 평가 조회 api 호출
  const { data: evaluation } = useGetTokEvaluationInitialData(
    { ibId: id || 0, type: 'EXHIBITION' },
    {
      enabled: ibData?.status === 'WAIT_COMPLETE',
    },
  )

  // 최종 평가 점수
  const evaluationScore = evaluation?.evaluations?.find((evaluation) => evaluation.isFinal)?.score ?? null

  // 전시회 종료 반려 api 호출
  const { rejectIBProjectComplete } = useIBStatusRejectComplete({
    onSuccess: () => {
      setAlertMessage({ text: `전시회 종료 요청을\n반려하였습니다` })
      refetch()
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

  const { register, handleSubmit, watch, reset, setValue } = useForm<RequestExhibitionDto>({
    defaultValues: data,
  })

  const resetData = useCallback(() => {
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
  }, [data, reset, setWordCounts, setImageObjectMap])

  const onSubmit = async (ExhibitionData: RequestExhibitionDto) => {
    if (isLoading) return

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

  const totalWordCount = Object.values(wordCounts).reduce((acc, count) => acc + count, 0)

  const { data: image1 } = useSignedUrl(data?.targetImage1)
  const { data: image2 } = useSignedUrl(data?.targetImage2)
  const { data: image3 } = useSignedUrl(data?.targetImage3)

  const images = {
    image1,
    image2,
    image3,
  }

  const handleChange = (selectedType: tabType) => {
    setType(selectedType)
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
  }, [data, reset, resetData])

  if (me == null || data === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  const getUI = (type: tabType) => {
    switch (type) {
      case 'feedback':
        return (
          <div className="h-full w-full">
            <Feedback
              referenceId={exhibitionId}
              referenceTable="EXHIBITION"
              user={me}
              useTextarea={ibData?.status !== 'COMPLETE'}
            />
          </div>
        )
      case 'evaluation':
        return (
          <EvaluationList
            evaluationData={evaluationData}
            ibId={id}
            type="exhibition"
            ibStatus={ibData?.status}
            finalDisabled={!hasPermission}
          />
        )
    }
  }

  const createAndDownloadPdf = async () => {
    const pdfBytes = await createTokExhibitionPdf({ klassNum: klassNum || '', name: ibData?.leader.name || '' }, data)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    await handleSingleBlobDownload(blob, `TOK_전시회_${klassNum}_${ibData?.leader.name}_${data?.themeQuestion}.pdf`)
  }

  return (
    <div className="col-span-6">
      {isLoading && <Blank />}
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
                      진행상태: '/teacher/project',
                      'TOK 전시회': `/teacher/ib/tok/exhibition/${id}`,
                      '전시회 상세': `/teacher/ib/tok/exhibition/detail/${id}`,
                    }}
                  />
                </div>
                <div className="flex w-full items-start justify-between">
                  <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {ibData?.tokExhibitionPlan?.themeQuestion}
                  </Typography>
                  <div className="text-16 text-primary-orange-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                    {klassNum} · {ibData?.leader.name}
                  </div>
                </div>
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
                                  <Typography variant="title2" className="text-primary-orange-800 font-semibold">
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
                  <div className="flex flex-col">
                    <div className="border-b-primary-gray-100 flex flex-col items-start gap-1 border-b pb-6">
                      <div className="flex w-full flex-row items-center justify-between">
                        <Typography variant="title1" className="text-primary-gray-900">
                          {data.themeQuestion}
                        </Typography>

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
                    <div className="flex flex-col">
                      {[1, 2, 3].map((num) => {
                        const imageKey = `image${num}` as keyof typeof images
                        const targetContentKey = `targetContent${num}` as keyof ResponseExhibitionDto
                        const wordCountKey = `wordCount${num}` as keyof ResponseExhibitionDto
                        return (
                          <div key={num} className="border-t-primary-gray-100 flex flex-col gap-10 border-t py-10">
                            <div className="flex flex-col gap-4">
                              <Typography variant="title2" className="text-primary-gray-900">
                                대상&nbsp;
                                <span className="text-primary-orange-800">{num}</span>
                              </Typography>
                              {images[imageKey] && (
                                <LazyLoadImage
                                  crossOrigin="anonymous"
                                  src={images[imageKey]}
                                  alt="대상 이미지"
                                  loading="lazy"
                                  className="h-[294px] w-[392px] rounded-lg object-cover"
                                />
                              )}
                              <Typography variant="body1" className="text-primary-gray-900">
                                {data[targetContentKey]}
                              </Typography>
                              <Typography variant="caption" className="text-primary-gray-500">
                                단어수 <span className="text-primary-orange-800">{data[wordCountKey]}</span>
                              </Typography>
                            </div>
                          </div>
                        )
                      })}
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
                      <div className="border-t-primary-gray-100 flex flex-col gap-4 border-t py-10">
                        <Typography variant="title2" className="text-primary-gray-900">
                          Reference
                        </Typography>
                        <Typography variant="body1" className="text-primary-gray-900">
                          {data.reference}
                        </Typography>
                      </div>
                    </div>
                  </div>
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
                    <div className="flex w-full flex-row items-center justify-between">
                      <div className="flex flex-row items-center gap-2">
                        {/* {ibData?.status !== 'COMPLETE' && hasPermission && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={ibData?.status === 'WAIT_COMPLETE' || downloadMode}
                          >
                            수정
                          </ButtonV2>
                        )} */}
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

                      <IBDetailPlagiarimInspectResultBadge
                        id={plagiarismInspectData?.id ?? 0}
                        status={plagiarismInspectData?.status ?? null}
                        copyRatio={plagiarismInspectData?.copyRatio ?? null}
                        enabled={enabledPlagiarismInspect}
                        errorMessage={plagiarismInspectData?.errorMessage ?? ''}
                      />

                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => push(`/teacher/ib/tok/exhibition/${id}`, { type: 'EXHIBITION' })}
                        disabled={downloadMode}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </div>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <LayeredTabs.TwoDepth onChange={handleChange} value={type} fullWidth={true}>
                  <Tab value="feedback">
                    <p>진행기록</p>
                  </Tab>
                  <Tab value="evaluation">
                    <p>평가</p>
                  </Tab>
                </LayeredTabs.TwoDepth>
                {getUI(type)}
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
        floatingButton={
          hasPermission &&
          ((ibData?.status === 'WAIT_COMPLETE' && (
            <div>
              <div className="mx-auto flex w-[1280px] items-center justify-between">
                <Typography variant="caption2" className="text-primary-gray-400 flex items-center gap-1">
                  <SolidSVGIcon.Info color="gray400" size={16} />
                  전시회 평가 완료 후 전시회 종료 승인이 가능합니다.
                </Typography>
                <div className="flex items-center gap-4">
                  <ButtonV2
                    className="w-[200px]"
                    size={48}
                    variant="solid"
                    color="gray700"
                    onClick={() => setRejectExhibitionConfirmModalOpen(true)}
                  >
                    전시회 종료 반려
                  </ButtonV2>
                  <ButtonV2
                    className="w-[200px]"
                    size={48}
                    variant="solid"
                    color="orange800"
                    disabled={evaluationScore === null}
                    onClick={() => {
                      setIsOpen(true)
                    }}
                  >
                    전시회 종료 승인
                  </ButtonV2>
                </div>
              </div>
            </div>
          )) ||
            (ibData?.status === 'REJECT_COMPLETE' && (
              <div>
                <div className="mx-auto flex w-[1280px] items-center justify-center">
                  <ButtonV2 className="w-[416px]" size={48} variant="solid" color="gray700" disabled>
                    전시회 종료 반려
                  </ButtonV2>
                </div>
              </div>
            )) ||
            (ibData?.status === 'COMPLETE' && (
              <div>
                <div className="mx-auto flex w-[1280px] items-center justify-center">
                  <ButtonV2 className="w-[416px]" size={48} variant="solid" color="orange800" disabled>
                    전시회 종료 승인
                  </ButtonV2>
                </div>
              </div>
            )))
        }
      />
      {isOpen && (
        <AlertV2
          message={`전시회 종료를 승인하시겠습니까?`}
          description={'승인 시 학생의 활동이 완전히 종료되며\n학생의 제출물과 평가 및 지도의견 수정이 불가합니다.'}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            approveIBProjectComplete(Number(id))
            setIsOpen(!isOpen)
          }}
          onCancel={() => setIsOpen(!isOpen)}
        />
      )}

      {/* 전시회 종료 반려 Confirm Modal */}
      {rejectExhibitionConfirmModalOpen && (
        <AlertV2
          message={`전시회 종료 요청을 반려하시겠습니까?`}
          description={'보완이 필요한 진행기록에 보완사유를 남겨주세요.'}
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            // TODO: content 수정될 예정
            rejectIBProjectComplete(Number(id), {})
            setRejectExhibitionConfirmModalOpen(false)
          }}
          onCancel={() => setRejectExhibitionConfirmModalOpen(false)}
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
