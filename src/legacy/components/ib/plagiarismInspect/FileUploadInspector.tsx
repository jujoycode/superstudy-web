import { useState } from 'react'

import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Typography } from '@/legacy/components/common/Typography'
import ColorSVGIcon from '@/legacy/components/icon/ColorSVGIcon'
import SolidSVGIcon from '@/legacy/components/icon/SolidSVGIcon'
import SVGIcon from '@/legacy/components/icon/SVGIcon'
import { useGetPlagiarismInspectResult, usePlagiarismUpload } from '@/legacy/container/plagiarism-inspector'
import type { ResponseCopykillerResponseDto } from '@/legacy/generated/model'
import { UploadFileTypeEnum } from '@/legacy/generated/model/uploadFileTypeEnum'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { usePolling } from '@/legacy/hooks/usePolling'

import LoadingPopup from './LoadingPopup'

interface FileUploadInspectorProps {
  fileData: File
  handleBack: () => void
}

export default function FileUploadInspector({ fileData, handleBack }: FileUploadInspectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [resultData, setResultData] = useState<ResponseCopykillerResponseDto | null>(null)
  const [shouldPollResult, setShouldPollResult] = useState(false)
  const [loadingPopupStatus, setLoadingPopupStatus] = useState<'N' | 'Y' | 'F'>('N')

  const { handleUploadFile } = useFileUpload()

  const { uploadPlagiarism, isLoading: uploadLoading } = usePlagiarismUpload({
    onSuccess: (data: ResponseCopykillerResponseDto) => {
      setIsLoading(true)
      setResultData(data)
      setShouldPollResult(true)
      setLoadingPopupStatus(data.completeStatus)
    },
    onError: (error) => {
      console.error('표절 검사 업로드 실패:', error)
      setLoadingPopupStatus('F')
    },
  })

  const { refetch } = useGetPlagiarismInspectResult(resultData?.id ?? 0, {
    query: {
      enabled: false, // 자동 호출 비활성화, 폴링으로만 실행
    },
  })

  // 폴링 훅 사용
  const { isPolling, stopPolling } = usePolling<ResponseCopykillerResponseDto>({
    enabled: shouldPollResult,
    maxPollingCount: 20,
    fetchFn: refetch,
    onSuccess: (data) => {
      setResultData(data)
      if (data.completeStatus === 'Y') {
        setIsLoading(false)
        setLoadingPopupStatus('Y')
        window.location.reload() // 로딩 끝나면 새로고침해서 결과목록 페이지로 이동
      } else {
        setLoadingPopupStatus('F')
      }
    },
    onError: (error) => {
      console.error('표절 검사 결과 확인 중 오류 발생:', error)
      setLoadingPopupStatus('F')
    },
    isComplete: (data) => data.completeStatus !== 'N',
  })

  const handleSubmit = async () => {
    const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/copykiller/files'], [fileData])

    uploadPlagiarism({
      data: {
        title: fileData.name,
        files: [documentFileNames[0]],
      },
    })
  }

  return (
    <div className="flex w-full flex-col">
      <div className="m-auto w-[632px]">
        <div className="mb-3 flex justify-end">
          <Breadcrumb
            data={{
              '파일 업로드': '',
            }}
          />
        </div>
        <Typography variant="heading" className="mb-16">
          파일 업로드
        </Typography>
        <Typography variant="title2" className="text-primary-gray-900 mb-4">
          첨부파일 확인
        </Typography>
        <div className="border-primary-gray-200 mb-3 flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-4">
          <SVGIcon.LinkV2 size={16} weight="bold" color="gray700" />
          <Typography variant="body2" className="text-primary-gray-900 w-[544px]">
            {fileData.name}
          </Typography>
          <ColorSVGIcon.Close className="cursor-pointer" color="dimmed" size={24} onClick={() => handleBack()} />
        </div>
        <Typography variant="caption2" className="text-primary-gray-500 flex items-start gap-1">
          <SolidSVGIcon.Info color="gray400" size={16} />
          hwp, doc, docx, xls, xlsx, ppt, pptx, pdf 형식만 업로드 가능합니다.
          <br />
          (최대 100MB)
        </Typography>
        <div className="mt-12 flex justify-between">
          <ButtonV2 variant="solid" color="gray100" size={48} className="w-[80px]" onClick={() => handleBack()}>
            취소
          </ButtonV2>
          <ButtonV2
            variant="solid"
            color="orange800"
            size={48}
            className="w-[88px]"
            onClick={() => {
              handleSubmit()
            }}
          >
            검사하기
          </ButtonV2>
        </div>
      </div>
      <LoadingPopup
        modalOpen={isLoading || uploadLoading}
        status={loadingPopupStatus}
        setModalClose={() => {
          setIsLoading(false)
          stopPolling()
          setShouldPollResult(false)
        }}
        cause={resultData?.errorMessage ?? ''}
      />
    </div>
  )
}
