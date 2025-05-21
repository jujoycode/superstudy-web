import { cn } from '@/utils/commonUtil'
import _ from 'lodash'
import { PropsWithChildren, useState } from 'react'

import { Icon } from '@/legacy/components/common/icons'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { isExcelFile } from '@/legacy/util/file'

interface ExamUpdateModalProps {
  modalOpen: boolean
  setModalClose: () => void
  width?: string
  ablePropragation?: boolean
  grade: number
  semester: number
  year: number
  class: number
  step: number
}

export function ExamUpdateModal({
  modalOpen,
  setModalClose,
  width = 'w-80',
  grade,
  semester,
  year,
  class: Klass,
  step,
  ablePropragation = false,
}: PropsWithChildren<ExamUpdateModalProps>) {
  const [uploading] = useState(false)

  const { documentObjectMap, toggleDocumentDelete, addFiles } = useImageAndDocument({})
  const documentFiles = [...documentObjectMap.values()]
    .filter((value) => !value.isDelete && value.document instanceof File)
    .map((value) => value.document) as File[]

  const validateAndAddFiles = (files: FileList) => {
    const invalidFiles = _.filter(files, (file) => {
      const fileName = file.name.split('.')[0]
      return !/^\d+-\d+$/.test(fileName) || !isExcelFile(file.name)
    })

    if (invalidFiles.length > 0) {
      alert('파일 이름이 "학년-반" 형식을 따르지 않거나 Excel 파일 형식이 아닌 파일이 있습니다.')
      return
    }

    const existingFileNames = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && value.document instanceof File)
      .map((value) => (value.document as File).name)

    const duplicateFiles = _.filter(files, (file) => existingFileNames.includes(file.name))

    if (duplicateFiles.length > 0) {
      alert('동일한 파일이 존재합니다.')
      return
    }

    addFiles(files)
  }

  return (
    <div
      className={`bg-littlegray fixed inset-0 z-60 flex h-screen w-full items-center justify-center ${
        modalOpen ? 'backdrop-blur-sm' : 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={`${width} relative h-[560px] rounded-lg bg-white shadow`}>
        <main className="flex h-full flex-col">
          <article className="flex flex-col gap-2 px-8 py-10 pb-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl">파일 수정</h1>
              <Icon.CloseFillGray onClick={() => setModalClose()} className="scale-110 cursor-pointer" />
            </div>
            <div className="pr-2">
              {year}학년도 {grade}학년 {semester}학기 {grade}학년 {Klass}반의&nbsp;
              {step === 1 ? '1차 지필' : step === 2 ? '2차 지필' : '종합 성적'} 성적 파일을 업로드해 주세요.
            </div>
          </article>

          <article className="flex flex-col">
            <div className="px-6 pb-3">
              {documentFiles.length > 0 ? (
                <div className="scroll-box flex w-full flex-col overflow-y-auto rounded-lg bg-white">
                  <div className="flex flex-wrap gap-2">
                    {documentFiles.map((value, key) => {
                      return (
                        <div className="w-full" key={key}>
                          <div
                            className={`flex h-12 w-full items-center justify-between rounded-lg border bg-white px-4 py-3`}
                          >
                            <div className={`flex h-8 items-center space-x-2 rounded-sm px-3 py-1`}>
                              <div className={`text-15 w-full break-words whitespace-pre-wrap`}>{value.name}</div>
                            </div>
                            <div className="text-lightpurple-4 flex min-w-max items-center justify-center bg-white px-2">
                              {!uploading && (
                                <div className="z-40 ml-2 block rounded-full text-center text-sm">
                                  <div
                                    className="flex h-full w-full cursor-pointer items-center justify-center text-white"
                                    onClick={() => toggleDocumentDelete(key)}
                                  >
                                    <Icon.Close className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="score-file"
                    name="score-file"
                    className="hidden"
                    onChange={(e) => {
                      e.preventDefault()
                      const files = e.target.files
                      if (!files || files.length === 0) return
                      validateAndAddFiles(files)
                    }}
                  />
                  <label
                    htmlFor="score-file"
                    className={cn(
                      'flex w-full items-center justify-center rounded-lg border border-dashed border-[#cccccc] py-4 text-lg text-[#222222] hover:bg-indigo-50',
                    )}
                  >
                    <Icon.Plus />
                    &nbsp;파일 선택
                  </label>
                </div>
              )}
            </div>
          </article>
          <div className="mt-auto flex w-full items-center">
            {uploading ? (
              <>
                <div className="flex w-full items-center gap-4">
                  <div className="grow flex-row"></div>
                  <button className="box-border rounded-lg border border-blue-600 px-10 py-3 text-lg font-bold text-blue-600">
                    업로드 취소
                  </button>
                </div>
              </>
            ) : (
              <button
                className={`h-16 w-full py-4 text-lg font-bold text-white ${
                  documentFiles.length === 0 ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600'
                }`}
                disabled={documentFiles.length === 0}
                //   onClick={handleUpload}
              >
                파일 업로드
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
