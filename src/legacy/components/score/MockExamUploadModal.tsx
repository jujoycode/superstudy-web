import { cn } from '@/utils/commonUtil'
import _ from 'lodash'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'

import { Select } from '@/legacy/components/common'
import AlertDialog from '@/legacy/components/common/AlertDialog'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { Typography } from '@/legacy/components/common/Typography'
import { useStudentInsertMockScores } from '@/legacy/container/insert-exam-score'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { isExcelFile } from '@/legacy/util/file'

import SVGIcon from '../icon/SVGIcon'

interface ExamUploadModalProps {
  modalOpen: boolean
  setModalClose: () => void
  width?: string
  ablePropragation?: boolean
  grade: number
  year: number
}

type MOCKTYPE = 'preliminary' | 'tong' | 'daegeo' | 'univ' | ''
type MOCKMONTH = 3 | 5 | 6 | 7 | 9 | 10 | 11

const MONTHS: MOCKMONTH[] = [3, 5, 6, 7, 9, 10, 11]

const MOCKTYPES: { label: string; value: MOCKTYPE; subType?: string }[] = [
  { label: '파일 유형을 선택하세요.', value: '' },
  { label: '슈퍼스쿨', value: 'preliminary', subType: 'tentative' },
  { label: '대교협', value: 'daegeo', subType: 'download' },
  { label: '통', value: 'tong', subType: 'tentative' },
  { label: '유니브', value: 'univ', subType: 'tentative' },
]

export function MockExamUploadModal({
  modalOpen,
  setModalClose,
  width = 'w-80',
  grade,
  ablePropragation = false,
  year,
}: PropsWithChildren<ExamUploadModalProps>) {
  const [type, setType] = useState<MOCKTYPE>('')
  const [step, setStep] = useState<number>(0)
  const [month, setMonth] = useState<MOCKMONTH>(3)
  const [uploading, setUploading] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [errorAlertOpen, setErrorAlertOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { documentObjectMap, toggleDocumentDelete, addFiles, resetDocuments } = useImageAndDocument({})
  const { insertMockScore } = useStudentInsertMockScores()
  const documentFiles = [...documentObjectMap.values()]
    .filter((value) => !value.isDelete && value.document instanceof File)
    .map((value) => value.document) as File[]

  const validateAndAddFiles = (files: FileList) => {
    const invalidFiles = _.filter(files, (file) => !isExcelFile(file.name))

    if (invalidFiles.length > 0) {
      alert('Excel 파일 형식이 아닌 파일이 있습니다.')
      return
    }
    addFiles(files)
  }

  const handleMonthSelect = useCallback((month: MOCKMONTH) => {
    setMonth(month)
    setStep(1)
  }, [])

  useEffect(() => {
    resetDocuments()
  }, [step])

  const handleUpload = async () => {
    if (type === '') {
      return alert('파일 유형을 선택해주세요')
    }

    setUploading(true)
    let hasError = false
    try {
      await insertMockScore({
        file: documentFiles[0],
        grade,
        month,
        insertionYear: year,
        excelDataType: type,
      })
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
    setAlertOpen(!alertOpen)
  }

  const handleCancelUpload = () => {
    setDialogOpen(!dialogOpen)
    setUploading(false)
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
            <article className="flex h-full flex-col px-8 py-10">
              <div className="flex items-center justify-between pb-2">
                <h1 className="text-2xl">모의고사 시행 월을 선택해 주세요.</h1>
                <Icon.CloseFillGray onClick={() => setModalClose()} className="scale-110 cursor-pointer" />
              </div>
              <a
                href="https://kr.object.gov-ncloudstorage.com/superschool/storage/모의고사 양식(가채점입력).xlsx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 pb-10"
              >
                <SVGIcon.Link color="gray700" size={16} />
                <Typography variant="body3" className="text-gray-500">
                  슈퍼스쿨 모의고사 양식 다운로드
                </Typography>
              </a>
              <nav className="flex grow flex-col gap-3 overflow-y-auto">
                {MONTHS.map((month) => (
                  <button
                    key={month}
                    className="w-full rounded-lg border border-[#D9D9D9] p-4 text-lg"
                    onClick={() => handleMonthSelect(month)}
                  >
                    {month}월
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
                    <h1 className="text-2xl">{`${grade}학년 ${month}월 모의고사`}</h1>
                  </span>
                  <Icon.CloseFillGray onClick={() => setModalClose()} className="scale-110 cursor-pointer" />
                </div>
              </div>
              <div className="grow overflow-y-auto px-6 pb-3">
                {documentFiles.length > 0 ? (
                  <div className="scroll-box flex w-full flex-col gap-4 overflow-y-auto rounded-lg bg-white">
                    <Select.lg
                      value={type}
                      onChange={(e) => setType(e.target.value as MOCKTYPE)}
                      className="rounded-lg"
                      placeholder="파일 유형을 선택하세요."
                    >
                      {MOCKTYPES.map((mockType) => (
                        <option key={mockType.label} value={mockType.value}>
                          {mockType.label}
                        </option>
                      ))}
                    </Select.lg>
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
                      {/* <label
                        className={cn(
                          'flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#cccccc] text-15 text-[#222222] hover:bg-indigo-50',
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
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            validateAndAddFiles(files);
                          }}
                        />
                      </label> */}
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
              <div className="mt-auto flex w-full items-center">
                {uploading ? (
                  <>
                    <button
                      className="h-16 w-full border border-blue-600 py-4 text-lg font-bold text-blue-600"
                      // onClick={() => setDialogOpen(!dialogOpen)}
                    >
                      업로드 취소
                    </button>
                  </>
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
      {alertOpen && (
        <AlertDialog
          message="업로드가 완료되었습니다."
          description={`첨부한 파일의 업로드가<br/>정상적으로 완료되었습니다.`}
          confirmText="확인"
          onConfirm={setModalClose}
          theme="secondary"
        />
      )}
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
