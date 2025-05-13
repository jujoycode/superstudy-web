import clsx from 'clsx'
import { useState } from 'react'

import { Blank } from '@/legacy/components/common'
import { Typography } from '@/legacy/components/common/Typography'
import IBLayout from '@/legacy/components/ib/IBLayout'
import FileUploadInspector from '@/legacy/components/ib/plagiarismInspect/FileUploadInspector'
import InputInspector from '@/legacy/components/ib/plagiarismInspect/InputInspector'
import PlagiarismInspect from '@/legacy/components/ib/plagiarismInspect/PlagiarismInspect'
import { useGetPlagiarismInspectList } from '@/legacy/container/plagiarism-inspector'
import { ResponseCopykillerResponseDto } from '@/legacy/generated/model'

function PlagiarismInspectPage() {
  const [showInspector, setShowInspector] = useState(false)
  const [selectedType, setSelectedType] = useState<'upload' | 'input' | null>(null)

  const { data: plagiarismInspectList = { items: [] as ResponseCopykillerResponseDto[] }, isLoading } =
    useGetPlagiarismInspectList()

  // 파일 데이터 상태 관리
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // 파일 업로드 핸들러
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  // 페이지에서 검사 화면으로 이동하는 핸들러
  const handleShowInspector = (type: 'upload' | 'input') => {
    setSelectedType(type)
    setShowInspector(true)
  }

  // 파일 업로드 화면에서 뒤로 돌아가는 핸들러
  const handleBack = () => {
    setShowInspector(false)
    setSelectedType(null)
  }

  return (
    <div className="col-span-6">
      {isLoading && <Blank />}
      {showInspector ? (
        <div className="w-full py-16">
          {selectedType === 'upload' ? (
            <FileUploadInspector fileData={uploadedFiles[0]} handleBack={handleBack} />
          ) : (
            <InputInspector handleBack={handleBack} />
          )}
        </div>
      ) : (
        <IBLayout
          className="bg-gray-50"
          topBgColor="bg-white"
          topContent={
            <div>
              <div className="w-full pt-16 pb-6">
                <Typography variant="heading" className="text-primary-gray-900">
                  표절률 검사
                </Typography>
              </div>
            </div>
          }
          bottomContent={
            <div className="flex flex-grow flex-col">
              <div
                className={clsx(
                  'flex h-full gap-4',
                  plagiarismInspectList.items.length > 0 ? 'pt-10' : 'pt-20',
                  plagiarismInspectList.items.length > 0 || 'justify-center',
                )}
              >
                <PlagiarismInspect
                  data={plagiarismInspectList.items}
                  onInspectorClick={handleShowInspector}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </div>
          }
          bottomBgColor={plagiarismInspectList.items.length > 0 ? 'bg-primary-gray-50' : 'bg-white'}
        />
      )}
    </div>
  )
}

export default PlagiarismInspectPage
