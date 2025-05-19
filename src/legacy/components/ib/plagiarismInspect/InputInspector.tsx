import { useState } from 'react'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Input } from '@/legacy/components/common/Input'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { usePlagiarismUpload, useGetPlagiarismInspectResult } from '@/legacy/container/plagiarism-inspector'
import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'
import { usePolling } from '@/legacy/hooks/usePolling'

import LoadingPopup from './LoadingPopup'

interface InputInspectorProps {
  handleBack: () => void
}

export default function InputInspector({ handleBack }: InputInspectorProps) {
  const [data, setData] = useState({
    title: '',
    content: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [resultData, setResultData] = useState<ResponseCopykillerResponseDto | null>(null)
  const [shouldPollResult, setShouldPollResult] = useState(false)
  const [loadingPopupStatus, setLoadingPopupStatus] = useState<'N' | 'Y' | 'F'>('N')

  const handleChange = (field: 'title' | 'content', value: string) => {
    setData({ ...data, [field]: value })
  }

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
  const { stopPolling } = usePolling<ResponseCopykillerResponseDto>({
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

  const handleSubmit = () => {
    uploadPlagiarism({
      data: {
        title: data.title,
        content: data.content,
      },
    })
  }

  return (
    <div className="flex w-full flex-col">
      <div className="m-auto w-[632px]">
        <div className="mb-3 flex justify-end">
          <Breadcrumb
            data={{
              '직접 입력': '',
            }}
          />
        </div>
        <Typography variant="heading" className="mb-16">
          직접 입력
        </Typography>
        <Typography variant="title2" className="mb-4 text-gray-900">
          검사내용 입력
        </Typography>
        <Input.Basic
          placeholder="제목을 입력해주세요"
          onChange={(e) => handleChange('title', e.target.value)}
          size={48}
          className="mb-3 font-medium text-gray-900"
        />
        <TextareaV2
          showLength
          displayMaxLength={30000}
          placeholder="내용을 입력해주세요"
          onChange={(e) => handleChange('content', e.target.value)}
          className="h-[480px] bg-white"
        />

        <div className="mt-12 flex justify-between">
          <ButtonV2 variant="solid" color="gray100" size={48} className="w-[80px]" onClick={() => handleBack()}>
            취소
          </ButtonV2>
          <ButtonV2
            variant="solid"
            color="orange800"
            size={48}
            className="w-[88px]"
            disabled={
              data.title.length === 0 ||
              data.content.length === 0 ||
              (!!data.content.length && data.content.length > 30000)
            }
            onClick={handleSubmit}
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
