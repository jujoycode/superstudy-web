import clsx from 'clsx'
import PlagiarismInspect from '@/legacy/components/ib/plagiarismInspect/PlagiarismInspect'
import FileUploadInspector from '@/legacy/components/ib/plagiarismInspect/FileUploadInspector'
import { useState } from 'react'
import InputInspector from '@/legacy/components/ib/plagiarismInspect/InputInspector'
import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'
import { Blank } from '@/legacy/components/common'
interface PlagiarismInspectPageProps {
  showInspector: boolean
  selectedType: 'upload' | 'input' | null
  data: ResponseCopykillerResponseDto[]
  onShowInspector: (type: 'upload' | 'input') => void
  onBack: () => void
  onFileUpload: (files: File[]) => void
  isLoading: boolean
}

function PlagiarismInspectPage({
  showInspector,
  selectedType,
  data,
  onShowInspector,
  onBack,
  onFileUpload,
  isLoading,
}: PlagiarismInspectPageProps) {
  // 파일 데이터 상태 관리
  const [fileData, setFileData] = useState<File[]>([])

  // 파일 업로드 처리 함수
  const handleFileUpload = (files: File[]) => {
    setFileData(files)
    onFileUpload(files) // 부모 컴포넌트에 파일 데이터 전달
  }

  return (
    <div className="col-span-6 w-full">
      {isLoading ? (
        <Blank />
      ) : (
        <>
          {showInspector ? (
            <div className="w-full py-16">
              {selectedType === 'upload' ? (
                <FileUploadInspector fileData={fileData[0]} handleBack={onBack} />
              ) : (
                <InputInspector handleBack={onBack} />
              )}
            </div>
          ) : (
            <div className="flex flex-grow flex-col">
              <div
                className={clsx(
                  'flex h-full gap-4',
                  data.length > 0 ? 'pt-10' : 'pt-20',
                  data.length > 0 || 'justify-center',
                )}
              >
                <PlagiarismInspect data={data} onInspectorClick={onShowInspector} onFileUpload={handleFileUpload} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PlagiarismInspectPage
