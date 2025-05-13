import { Box, LinearProgress, LinearProgressProps, Typography } from '@mui/material'
import clsx from 'clsx'
import _ from 'lodash'
import { useState } from 'react'

import { useHistory } from '@/hooks/useHistory'
import AlertDialog from '@/legacy/components/common/AlertDialog'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { useInsertScoreBatch } from '@/legacy/container/insert-exam-score'
import { validateAndExtract } from '@/legacy/util/exam-score'
import { isExcelFile } from '@/legacy/util/file'
import { getThisYear } from '@/legacy/util/time'

import superstudyLogo from '@/assets/images/logo.png'
import neisLogo from '@/assets/images/neis.png'

interface LinearProgressWithLabelProps extends LinearProgressProps {
  value: number
  uploadedCount: number
  totalCount: number
}

function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  const { value, uploadedCount, totalCount, ...rest } = props
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" value={value} {...rest} />
      </Box>
      <Box minWidth={70} display={'flex'} gap={0.5} marginX={2}>
        <Typography variant="h6" color="text.primary">{`${Math.round(value)}%`}</Typography>
        <Typography variant="h6" color="text.secondary">{`(${uploadedCount}/${totalCount})`}</Typography>
      </Box>
    </Box>
  )
}

interface BatcbUploadComponentProps {
  documentObjectMap: Map<any, any>
  toggleDocumentDelete: (key: any) => void
  addFiles: (files: FileList) => void
  schoolId: number | undefined
  resetDocuments: () => void
}

export const BatcbUploadComponent: React.FC<BatcbUploadComponentProps> = ({
  documentObjectMap,
  toggleDocumentDelete,
  addFiles,
  schoolId,
  resetDocuments,
}) => {
  const [isDragIn, setDragIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ name: string; uploaded: boolean }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const { push } = useHistory()
  const { insertScoreBatch } = useInsertScoreBatch()

  const documentFiles = [...documentObjectMap.values()]
    .filter((value) => !value.isDelete && value.document instanceof File)
    .map((value) => value.document) as File[]

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    validateAndAddFiles(files)
  }

  const validateAndAddFiles = (files: FileList) => {
    const normalizedName = (name: string) => name.normalize('NFC')
    const extractGradeClass = (fileName: string) => {
      const match = fileName.match(/^(\d+-\d+)/) // "2-4"와 같은 학년-반 형태 추출
      return match ? match[1] : null
    }

    // 파일 유효성 검증
    const invalidFiles = _.filter(files, (file) => {
      const fileNameWithoutExtension = normalizedName(file.name.split('.')[0])
      const gradeClass = extractGradeClass(fileNameWithoutExtension) // 학년-반 정보 추출
      const isValidFormat = !!gradeClass // 학년-반 정보가 존재하는지 확인
      return !isValidFormat || !isExcelFile(file.name) // 유효한 형식이 아니거나 Excel 파일이 아닌 경우
    })

    if (invalidFiles.length > 0) {
      alert('파일 이름이 "n-n-종합" 형식을 따르지 않거나 .XLSX 파일 형식이 아닌 파일이 있습니다.')
      setLoading(false)
      return
    }

    const existingFileNames = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && value.document instanceof File)
      .map((value) => (value.document as File).name)

    const duplicateFiles = _.filter(files, (file) => existingFileNames.includes(file.name))

    if (duplicateFiles.length > 0) {
      alert('동일한 파일이 존재합니다.')
      setLoading(false)
      return
    }

    addFiles(files)
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!documentFiles.length) {
      alert('업로드할 파일이 없습니다.')
      return
    }

    if (!schoolId) {
      alert('학교 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setUploading(true)
    setProgress(5)
    setUploadStatus(documentFiles.map((file) => ({ name: file.name, uploaded: false })))
    try {
      await uploadFilesWithProgress(documentFiles)
    } catch (error: any) {
      alert(`업로드 실패: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelUpload = () => {
    setDialogOpen(!dialogOpen)
    setUploading(false)
    setProgress(0)
    setUploadStatus([])
  }

  const uploadFilesWithProgress = async (files: File[]) => {
    const validFiles = validateAndExtract(files, Number(getThisYear()))
    if (validFiles.length === 0) return

    let successCount = 0
    for (const file of validFiles) {
      try {
        await insertScoreBatch(file)
        successCount++
        setProgress(parseFloat(((successCount / validFiles.length) * 100).toFixed(2)))
        setUploadStatus((prevStatus) =>
          prevStatus.map((status) => (status.name === file.file.name ? { ...status, uploaded: true } : status)),
        )
      } catch (error: any) {
        console.error(error.message)
      }
    }
    setAlertOpen(!alertOpen)
    setUploading(false)
  }

  const uploadedCount = uploadStatus.filter((status) => status.uploaded).length

  return (
    <>
      <div className="flex flex-row items-center justify-between pb-5">
        <div className="flex flex-row items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#0066ff]" />
          <h1 className="text-[22px] font-semibold text-[#111111]">데이터 세팅</h1>
        </div>
        {documentFiles.length === 0 && (
          <label
            htmlFor="score-file"
            className={`h-10 min-w-[120px] cursor-pointer rounded-lg border border-[#0066ff] bg-[#0066ff] px-3 py-2 text-center text-[15px] font-bold text-white`}
          >
            파일 업로드
          </label>
        )}
      </div>
      {documentFiles.length > 0 ? (
        <div className="h-screen-20 relative rounded-lg bg-white">
          <div className="h-5/6 overflow-y-scroll">
            <div className="flex flex-wrap gap-6 p-8">
              {_.chain([...documentObjectMap.values()])
                .sortBy((value) => {
                  if (typeof value.document === 'string') return Infinity
                  const fileName = value.document.name.split('.')[0].normalize('NFC')
                  const match = fileName.match(/^(\d+)-(\d+)-/) // "2-4-..." 형태에서 학년과 반 추출
                  if (match) {
                    const grade = parseInt(match[1], 10)
                    const classNumber = parseInt(match[2], 10)
                    return grade * 100 + classNumber // 학년과 반 기준으로 정렬
                  }
                  return Infinity
                })
                .groupBy((value) => {
                  if (typeof value.document === 'string') return '기타'
                  const fileName = value.document.name.split('.')[0].normalize('NFC')
                  const match = fileName.match(/^(\d+)-/) // "2-..." 형태에서 학년 추출
                  return match ? `${match[1]}학년` : '기타' // 그룹화: "2학년"
                })
                .map((files, grade) => (
                  <div key={grade} className="w-full">
                    <h6 className="text-xl font-semibold">{grade}</h6>
                    <div className="grid grid-cols-4 gap-6 p-2">
                      {files.map((value, key) => {
                        if (value.isDelete) {
                          return null
                        }
                        const isUploaded = uploadStatus.find(
                          (status) => status.name === (value.document instanceof File ? value.document.name : ''),
                        )?.uploaded
                        return (
                          <div className="min-w-1/4-4" key={key}>
                            <div
                              className={`flex h-12 w-full items-center justify-between rounded-lg border ${
                                isUploaded ? 'bg-neutral-100 text-[#aaaaaa]' : 'bg-white'
                              } px-4 py-3`}
                            >
                              <div className={`flex h-8 items-center space-x-2 rounded px-3 py-1`}>
                                {typeof value.document === 'string' ? (
                                  <></>
                                ) : (
                                  <div className={`text-15 w-full break-words whitespace-pre-wrap`}>
                                    {value.document.name}
                                  </div>
                                )}
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
                ))
                .value()}
            </div>
          </div>
          <div
            className={`flex h-1/6 w-full items-center gap-2 border-t border-t-neutral-200 px-10 ${
              uploading ? 'justify-end' : 'justify-between'
            }`}
          >
            {uploading ? (
              <>
                <div className="flex w-full items-center gap-4">
                  <div className="flex-grow flex-row">
                    <LinearProgressWithLabel
                      value={progress}
                      uploadedCount={uploadedCount}
                      totalCount={documentFiles.length}
                    />
                  </div>
                  <button
                    className="box-border rounded-lg border border-blue-600 px-10 py-3 text-lg font-bold text-blue-600"
                    onClick={() => setDialogOpen(!dialogOpen)}
                  >
                    업로드 취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <button
                    className="box-border rounded-lg border border-blue-600 bg-blue-600 px-10 py-3 text-lg font-bold text-white"
                    onClick={() => resetDocuments()}
                  >
                    취소
                  </button>
                </div>
                <div className="flex gap-2">
                  <label
                    className="box-border cursor-pointer rounded-lg border border-blue-600 px-10 py-3 text-lg font-bold text-blue-600"
                    htmlFor="score-file"
                  >
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
                        validateAndAddFiles(files)
                      }}
                    />
                  </label>
                  <button
                    className="box-border rounded-lg border border-blue-600 bg-blue-600 px-10 py-3 text-lg font-bold text-white"
                    onClick={handleUpload}
                  >
                    파일 업로드
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id="score-file"
            name="score-file"
            accept=".xlsx"
            className="sr-only"
            multiple
            onChange={(e) => {
              const files = e.target.files
              if (!files || files.length === 0) return
              validateAndAddFiles(files)
            }}
          />
          <label
            htmlFor="score-file"
            className={clsx(
              'block w-full cursor-pointer rounded-lg border-t border-t-[#dddddd] py-20 text-center hover:bg-indigo-50',
              isDragIn ? 'bg-indigo-50' : 'bg-indigo-50',
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setDragIn(false)
            }}
            onDragEnter={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setDragIn(true)
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-row items-center gap-4">
                <div>
                  <img className="mx-auto" src={neisLogo} alt="" />
                </div>
                <Icon.FillArrow className="-rotate-90" />
                <div>
                  <img className="mx-auto" src={superstudyLogo} alt="" />
                </div>
              </div>
              <h6 className="pt-4 text-xl font-bold text-zinc-800">
                나이스에서 다운로드 받은 교과학습발달상황 파일을 업로드 해 주세요.
              </h6>
              <p className="flex items-center pt-2 text-neutral-500">
                {`1) 나이스에서 다음 경로를 따라서`}&nbsp;
                <p className="flex items-center text-blue-600">
                  <p className="font-bold">
                    {'학급담임 > 학교생활기록부 > 학생부 항목별 조회 > 교과학습발달상황 > 조회'}, &nbsp;&#39;XLS
                    data&#39;
                  </p>
                  &nbsp;로 다운로드
                </p>
                해 주세요.
              </p>
              <p className="flex items-center pt-2 text-neutral-500">
                {`2)`}
                &nbsp;다운로드 받은 파일명을 다음과 같은 형태로 수정후에 업로드 해 주세요.&nbsp; ( 2학년 4반 종합성적의
                경우,&nbsp;<p className="font-bold text-blue-600">{'2-4-종합'}</p>&nbsp;)
              </p>
              <p className="flex items-center pt-2 pb-4 text-neutral-500">
                {`3) 파일은 .xlsx 형식만 업로드 할 수 있으며, 다중 선택 가능합니다.`}
              </p>
              <img
                src={'https://kr.object.gov-ncloudstorage.com/superschool/storage/material/score/neisflow2.png'}
                className="rounded-lg object-cover"
              />
            </div>
          </label>
        </div>
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
      {alertOpen && (
        <AlertDialog
          message="업로드가 완료되었습니다."
          description={`첨부한 파일의 업로드가<br/>정상적으로 완료되었습니다.`}
          confirmText="확인"
          onConfirm={() => {
            push('/admin/score')
            setAlertOpen(!alertOpen)
            window.location.reload()
          }}
          theme="secondary"
        />
      )}
    </>
  )
}
