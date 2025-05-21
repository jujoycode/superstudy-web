import { cn } from '@/utils/commonUtil'
import _ from 'lodash'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'

import AlertDialog from '@/legacy/components/common/AlertDialog'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { useInsertScoreBatch, useStudentInsertTestScores } from '@/legacy/container/insert-exam-score'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { validateAndExtract, validateAndExtractMock } from '@/legacy/util/exam-score'
import { isExcelFile } from '@/legacy/util/file'

interface ExamUploadModalProps {
  modalOpen: boolean
  setModalClose: () => void
  width?: string
  ablePropragation?: boolean
  grade: number
  semester: number
  year: number
}

type IBProjectItem = {
  label: string
  name: 1 | 2 | 3
}

const IBProjects: IBProjectItem[] = [
  {
    label: '1차 지필',
    name: 1,
  },
  {
    label: '2차 지필',
    name: 2,
  },
  {
    label: '종합 성적',
    name: 3,
  },
]

export function ExamUploadModal({
  modalOpen,
  setModalClose,
  width = 'w-80',
  grade,
  semester,
  year,
  ablePropragation = false,
}: PropsWithChildren<ExamUploadModalProps>) {
  const [type, setType] = useState<IBProjectItem['name'] | undefined>()
  const [step, setStep] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [errorAlertOpen, setErrorAlertOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ name: string; uploaded: boolean }[]>([])

  const { insertTestScore } = useStudentInsertTestScores()
  const { insertScoreBatch } = useInsertScoreBatch()
  const { documentObjectMap, toggleDocumentDelete, addFiles, resetDocuments } = useImageAndDocument({})
  const documentFiles = [...documentObjectMap.values()]
    .filter((value) => !value.isDelete && value.document instanceof File)
    .map((value) => value.document) as File[]

  const validateAndAddFiles = (files: FileList, type: number | undefined) => {
    if (type === undefined) {
      alert('성적 유형을 선택해주세요.')
      return
    }

    const normalizedName = (name: string) => name.normalize('NFC')

    const invalidFiles = _.filter(files, (file) => {
      const fileNameWithoutExtension = normalizedName(file.name.split('.')[0])
      if (!isExcelFile(file.name)) return true

      if (type === 1 || type === 2) {
        // "2-4-1-1", "2-4-1-2" 유효성 검증
        const isValidFormat = /^\d+-\d+-\d+-\d+$/.test(fileNameWithoutExtension)
        return !isValidFormat
      } else if (type === 3) {
        // "2-4-1-종합" 유효성 검증
        const isValidFormat = /^\d+-\d+-[^()]*$/.test(fileNameWithoutExtension)
        return !isValidFormat
      }
      return true
    })

    if (invalidFiles.length > 0) {
      alert('파일 이름 형식이 올바르지 않거나 .XLSX 파일 형식이 아닌 파일이 있습니다.')
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

  const handleTypeSelect = useCallback((name: IBProjectItem['name']) => {
    setType(name)
    setStep(1)
  }, [])

  useEffect(() => {
    resetDocuments()
  }, [step])

  const handleUpload = async () => {
    if (!type) {
      alert('성적 유형을 선택해주세요.')
      return
    }

    setUploading(true)
    let hasError = false

    setUploadStatus(documentFiles.map((file) => ({ name: file.name, uploaded: false })))
    try {
      if (type === 1 || type === 2) {
        const validFiles = validateAndExtractMock(documentFiles, semester, type, year)
        if (validFiles.length === 0) return

        for (const file of validFiles) {
          try {
            await insertTestScore(file)
            setUploadStatus((prevStatus) =>
              prevStatus.map((status) => (status.name === file.file.name ? { ...status, uploaded: true } : status)),
            )
          } catch (error: any) {
            console.error(error.message)
            hasError = true
          }
        }
      } else if (type === 3) {
        const validFiles = validateAndExtract(documentFiles, year)
        if (validFiles.length === 0) return

        for (const file of validFiles) {
          try {
            await insertScoreBatch(file)
            setUploadStatus((prevStatus) =>
              prevStatus.map((status) => (status.name === file.file.name ? { ...status, uploaded: true } : status)),
            )
          } catch (error: any) {
            console.error(error.message)
            hasError = true
          }
        }
      }
    } catch (error) {
      console.error(error)
      hasError = true
    } finally {
      setUploading(false)
      if (hasError) {
        setErrorAlertOpen(true)
      } else {
        setAlertOpen(true)
      }
    }
  }

  const handleCancelUpload = () => {
    setDialogOpen(!dialogOpen)
    setUploading(false)
    setUploadStatus([])
  }

  return (
    <div
      className={`bg-littlegray fixed inset-0 z-60 flex h-screen w-full items-center justify-center ${
        modalOpen ? 'backdrop-blur-xs' : 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div className={`${width} relative h-[560px] rounded-lg bg-white shadow`}>
        <main className="h-full">
          {step === 0 && (
            <article className="px-8 py-10">
              <div className="flex items-center justify-between pb-10">
                <h1 className="text-2xl">성적파일 등록</h1>
                <Icon.CloseFillGray onClick={() => setModalClose()} className="scale-110 cursor-pointer" />
              </div>
              <nav className="flex flex-col gap-3">
                {IBProjects.map((project) => (
                  <button
                    key={project.name}
                    className="w-full rounded-lg border border-[#D9D9D9] p-4 text-lg"
                    onClick={() => handleTypeSelect(project.name)}
                  >
                    {project.label}
                  </button>
                ))}
              </nav>
            </article>
          )}
          {step === 1 && (
            <article className="flex h-full flex-col">
              <div className="flex flex-col px-6 py-10 pb-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Icon.Back onClick={() => setStep(0)} className="cursor-pointer" />
                    <h1 className="text-2xl">
                      {type === 3
                        ? `${grade}학년 ${IBProjects.find((item) => item.name === type)?.label}`
                        : `${grade}학년 ${semester}학기 ${
                            type && IBProjects.find((item) => item.name === type)?.label
                          }`}
                    </h1>
                  </span>
                  <Icon.CloseFillGray onClick={() => setModalClose()} className="scale-110 cursor-pointer" />
                </div>
                <div className="flex flex-col pt-2">
                  <p>
                    <b className="font-bold text-blue-600">
                      다운로드 받은 파일명을 수정후에 (ex.
                      {type === 3 ? `${grade}-1-종합` : `${grade}-2-${semester}-${type}`}) 업로드
                    </b>
                    해주세요. (파일명을 통한 학급 구분 시 오류가 발생할 수 있습니다.)
                  </p>
                  {type === 3 ? (
                    <p>{`예) 2학년 1반 교과학습발달상황 : 2-1-종합`}</p>
                  ) : (
                    <p>{`예) 2학년 1반 2학기 2차 지필평가 : 2-1-2-2`}</p>
                  )}
                </div>
              </div>
              <div className="grow overflow-y-auto px-6 pb-3">
                {documentFiles.length > 0 ? (
                  <div className="scroll-box flex w-full flex-col overflow-y-auto rounded-lg bg-white">
                    <div className="flex flex-wrap gap-2">
                      {documentFiles.map((value, key) => {
                        const isUploaded = uploadStatus.find((status) => status.name === value.name)?.uploaded
                        return (
                          <div className="w-full" key={key}>
                            <div
                              className={`flex h-12 w-full items-center justify-between rounded-lg border ${
                                isUploaded ? 'bg-neutral-100 text-[#aaaaaa]' : 'bg-white'
                              } px-4 py-3`}
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
                      {!uploading && (
                        <label
                          className={cn(
                            'text-15 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#cccccc] text-[#222222] hover:bg-indigo-50',
                          )}
                          htmlFor="score-file"
                        >
                          <Icon.Plus />
                          파일 추가하기
                          <input
                            type="file"
                            id="score-file"
                            name="score-file"
                            className="sr-only"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files
                              if (!files || files.length === 0) return
                              validateAndAddFiles(files, type)
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="score-file"
                      name="score-file"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        e.preventDefault()
                        const files = e.target.files
                        if (!files || files.length === 0) return
                        validateAndAddFiles(files, type)
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
              <div className="mt-auto flex w-full items-center">
                {uploading ? (
                  <button
                    className={`h-16 w-full border border-blue-600 py-4 text-lg font-bold text-blue-600`}
                    onClick={() => setDialogOpen(!dialogOpen)}
                  >
                    업로드 취소
                  </button>
                ) : (
                  <button
                    className={`h-16 w-full py-4 text-lg font-bold text-white ${
                      documentFiles.length === 0 ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600'
                    }`}
                    disabled={documentFiles.length === 0}
                    onClick={handleUpload}
                  >
                    파일 업로드
                  </button>
                )}
              </div>
            </article>
          )}
        </main>
      </div>
      {dialogOpen && (
        <ConfirmDialog
          cancelText="취소"
          description={`업로드를 그만 하시려면 확인 버튼을,<br/>다시 진행 하시려면 취소 버튼을 눌러주세요.`}
          confirmText="확인"
          message="업로드를 취소하시겠습니까?"
          onCancel={() => setDialogOpen(!dialogOpen)}
          onConfirm={() => handleCancelUpload()}
          theme="secondary"
        />
      )}

      {alertOpen && (
        <AlertDialog
          message="업로드가 완료되었습니다."
          description={`첨부한 파일의 업로드가<br/>정상적으로 완료되었습니다.`}
          confirmText="확인"
          onConfirm={setModalClose}
          theme="secondary"
        />
      )}

      {errorAlertOpen && (
        <AlertDialog
          message="업로드 실패"
          description="파일 업로드 중 오류가 발생했습니다.<br/>파일을 확인해주세요."
          confirmText="확인"
          onConfirm={() => setErrorAlertOpen(false)}
          theme="primary"
        />
      )}
    </div>
  )
}
