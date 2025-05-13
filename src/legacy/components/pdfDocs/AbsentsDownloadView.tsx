import loadImage from 'blueimp-load-image'
import imageCompression from 'browser-image-compression'
import { toJpeg } from 'html-to-image'
import { t } from 'i18next'
import { jsPDF } from 'jspdf'
import { filter, find, groupBy, map } from 'lodash'
import { useRef, useState } from 'react'
import { Select } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Constants } from '@/legacy/constants'
import { Absent } from '@/legacy/generated/model'
import { AbsentEvidenceType, AbsentPaperType } from '@/legacy/types'
import {
  extractReactData,
  getArrayBufferByFile,
  getBlobByCanvas,
  getImageMeta,
  getPdfImageSize,
} from '@/legacy/util/pdf'

import { AbsentPdf } from '@/legacy/pages/teacher/absentPdf'

interface AbsentsDownloadViewProps {
  absents?: Absent[]
  fileName: string
  setCsvData: (b: boolean) => void
  isCsvData: boolean
}

interface ReactPdfData {
  id: number
  orderBy: number
  data: string | Uint8Array
  type: AbsentPaperType
  width?: number
  height?: number
  evidenceType: AbsentEvidenceType
  orientation?: number
}

export function AbsentsDownloadView({ absents = [], fileName, setCsvData, isCsvData }: AbsentsDownloadViewProps) {
  const [open, setOpen] = useState(false)
  const docRef = useRef<jsPDF>(null)
  const [withEvidence, setWithEvidence] = useState(false)
  const [isExtractData, setIsExtractData] = useState(false)
  const [extractDataCount, setExtractDataCount] = useState(-1)
  const [isProcessPdf, setIsProcessPdf] = useState(false)
  const [prodcessPdfCount, setIsProcessPdfCount] = useState(0)
  const reactPdfDatas = useRef<ReactPdfData[]>([])

  const [pdfQuality, setPdfQuality] = useState(0.8)

  const _initState = () => {
    setIsExtractData(false)
    setExtractDataCount(-1)
    setIsProcessPdf(false)
    setIsProcessPdfCount(0)
  }

  const _addImageToPdf = async (imageData: ReactPdfData) => {
    if (!docRef.current || !imageData.width || !imageData.height) {
      return null
    }
    const { width: imageWidth, height: imageHeight, data } = imageData
    const [width, height] = getPdfImageSize(imageWidth, imageHeight)
    //console.log('_addImageToPdf', 'width', width, 'height', height);
    try {
      docRef.current.addImage(data, 'JPEG', 0, 0, width, height, undefined, 'FAST')
      docRef.current.addPage()
    } catch (e) {
      console.log('_addImageToPdf error  : ', e)
      console.log('_addImageToPdf data  : ', data)
      console.log('_addImageToPdf imageData  : ', imageData)
    }
  }

  const addReactToPdf = async (reactData: ReactPdfData) => {
    if (!docRef.current) {
      return null
    }
    try {
      docRef.current.addImage(reactData.data, 'JPEG', -3, 0, 210, 297, undefined, 'FAST')
      docRef.current.addPage()
    } catch (e) {
      console.log('addReactToPdf error  : ', e)
      console.log('addReactToPdf error reactData : ', reactData)
    }
  }

  const _extractReactData = async (orderBy: number, ref: any, type: AbsentPaperType, absent: Absent) => {
    const imgData = await extractReactData(ref)
    if (imgData) {
      reactPdfDatas.current.push({
        id: absent.id,
        orderBy,
        data: imgData,
        type,
        evidenceType: absent.evidenceType as AbsentEvidenceType,
      })
      console.log('reactPdfDatas', reactPdfDatas.current.length, '_extractReactData')
    }
    return undefined
  }

  const extractImageData = async (orderBy: number, absent: Absent, type: AbsentPaperType) => {
    const { id, evidenceFiles, evidenceFiles2 } = absent

    if ((!evidenceFiles?.length && !evidenceFiles2?.length) || !id) {
      return null
    }

    for (const ef of evidenceFiles) {
      if (ef.split('.').pop()?.toLowerCase() !== 'pdf') {
        try {
          const evidenceFile = `${Constants.imageUrl}${ef}`
          //@ts-ignore
          const result = await loadImage(evidenceFile, {
            meta: true,
            orientation: true,
            canvas: true,
          })
          //console.log('evidenceFile : ', evidenceFile);
          //console.log('result : ', result);
          const blob = await getBlobByCanvas(result.image)
          const file = new File([blob], 'temp_file.jpeg', { type: blob.type })
          const compressedFile = await imageCompression(file, { initialQuality: pdfQuality })
          const arrayBuffer = await getArrayBufferByFile(compressedFile)
          const unit8Array = new Uint8Array(arrayBuffer)
          const orientation = result.exif?.get('Orientation') || 1
          const isChangeWidthHeight = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8
          //console.log('orientation : ', orientation);
          //console.log('isChangeWidthHeight : ', isChangeWidthHeight);
          reactPdfDatas.current.push({
            id,
            orderBy,
            data: unit8Array,
            type,
            width: isChangeWidthHeight ? result.originalHeight : result.originalWidth,
            height: isChangeWidthHeight ? result.originalWidth : result.originalHeight,
            evidenceType: absent.evidenceType as AbsentEvidenceType,
            orientation: orientation as number,
          })
          console.log('reactPdfDatas', reactPdfDatas.current.length, 'extractImageData')
        } catch (e) {
          console.log('extractImageData error  : ', e)
          console.log('extractImageData error evidenceFile : ', ef)
        } finally {
        }
      }
    }
    for (const ef of evidenceFiles2) {
      if (ef.split('.').pop()?.toLowerCase() !== 'pdf') {
        try {
          const evidenceFile = `${Constants.imageUrl}${ef}`
          //@ts-ignore
          const result = await loadImage(evidenceFile, {
            meta: true,
            orientation: true,
            canvas: true,
          })
          //console.log('evidenceFile : ', evidenceFile);
          //console.log('result : ', result);
          const blob = await getBlobByCanvas(result.image)
          const file = new File([blob], 'temp_file.jpeg', { type: blob.type })
          const compressedFile = await imageCompression(file, { initialQuality: pdfQuality })
          const arrayBuffer = await getArrayBufferByFile(compressedFile)
          const unit8Array = new Uint8Array(arrayBuffer)
          const orientation = result.exif?.get('Orientation') || 1
          const isChangeWidthHeight = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8
          //console.log('orientation : ', orientation);
          //console.log('isChangeWidthHeight : ', isChangeWidthHeight);
          reactPdfDatas.current.push({
            id,
            orderBy,
            data: unit8Array,
            type,
            width: isChangeWidthHeight ? result.originalHeight : result.originalWidth,
            height: isChangeWidthHeight ? result.originalWidth : result.originalHeight,
            evidenceType: absent.evidenceType2 as AbsentEvidenceType,
            orientation: orientation as number,
          })
          console.log('reactPdfDatas', reactPdfDatas.current.length, 'extractImageData')
        } catch (e) {
          console.log('extractImageData error  : ', e)
          console.log('extractImageData error evidenceFile : ', ef)
        } finally {
        }
      }
    }
  }

  const extractReactDataArray = async (orderBy: number, ref: any[], type: AbsentPaperType, absent: Absent) => {
    if (!ref) {
      return null
    }

    for (const ef of ref) {
      if (ef) {
        let imgData
        try {
          imgData = await toJpeg(ef, {
            quality: pdfQuality,
            fontEmbedCSS: '',
            includeQueryParams: true,
            cacheBust: false,
          })
          await getImageMeta(imgData)
          reactPdfDatas.current.push({
            id: absent.id,
            orderBy,
            data: imgData,
            type,
            evidenceType: absent.evidenceType as AbsentEvidenceType,
          })
          console.log('reactPdfDatas', reactPdfDatas.current.length, 'extractImageData')
        } catch (e) {
          console.log('extractReactData error  : ', e)
          console.log('extractReactData error type : ', type)
          console.log('extractReactData error fieldtrip : ', absent)
          console.log('extractReactData error imgData : ', imgData)
        } finally {
          // if (type === FieldtripPaperType.RESULT) {
          //   _nextExtractPdfData();
          // }
        }
      }
    }
  }

  const _finishDownloadPdf = () => {
    setIsExtractData(false)
    setIsProcessPdf(true)
    docRef.current = new jsPDF('p', 'mm', 'a4')
    console.log(
      '_finishDownloadPdf',
      reactPdfDatas.current.length,
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    )
    const groupbyPdfDatas = groupBy(reactPdfDatas.current, 'orderBy')
    map(groupbyPdfDatas, (pdfDatas) => {
      const absentData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.ABSENT)
      const parentData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.PARENT)
      const teacherData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.TEACHER)
      const imageDatas = filter(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.IMAGE)
      const attachedPdfDatas = filter(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.PDF)
      if (absentData && (parentData || teacherData || imageDatas || attachedPdfDatas)) {
        addReactToPdf(absentData)

        if (withEvidence) {
          parentData && addReactToPdf(parentData)

          teacherData && addReactToPdf(teacherData)

          attachedPdfDatas?.length && map(attachedPdfDatas, (pdf) => addReactToPdf(pdf))

          imageDatas?.length && map(imageDatas, (image) => _addImageToPdf(image))
        }
      }

      setIsProcessPdfCount((prev) => prev + 1)
    })
    docRef.current.deletePage(docRef.current.getNumberOfPages())
    docRef.current.save(`${fileName}.pdf`)
    setIsProcessPdf(false)
  }

  const _nextExtractPdfData = () => {
    if (!absents) {
      return null
    }
    if (extractDataCount === absents.length - 1) {
      setExtractDataCount((prev) => prev + 1)
      _finishDownloadPdf()
    }
    if (extractDataCount >= absents.length - 1) {
      return
    }
    setExtractDataCount((prev) => prev + 1)
  }

  const _getProgress = () => {
    if (!absents || !reactPdfDatas.current) {
      return 0
    }

    if (isExtractData) {
      return (extractDataCount / absents.length) * 100
    }

    if (isProcessPdf) {
      return (prodcessPdfCount / reactPdfDatas.current.length) * 100
    }
    return 0
  }

  return (
    <>
      {open && (
        <div className="bg-littleblack fixed inset-0 z-100 m-0 h-screen w-full overflow-y-scroll">
          <div className="flex h-full w-full items-start">
            <div className="py-6">
              <div className="mb-2 flex w-screen items-center justify-center">
                <div
                  className="fixed top-7 right-16 cursor-pointer text-3xl font-bold text-white"
                  onClick={() => {
                    setOpen(false)
                    _initState()
                  }}
                >
                  닫기
                </div>
                <div className="min-w-max">
                  {(isExtractData || isProcessPdf) && (
                    <>
                      <div id="progressOuterMax" className="relative mb-2 min-w-100 bg-[#ECEEEF] p-0">
                        <div
                          id="barStatus"
                          style={{ height: '15px', backgroundColor: '#2d7bb7', width: `${_getProgress()}%` }}
                        />
                      </div>

                      {isExtractData && (
                        <div className="text-brand-1 py-2 text-center font-bold">
                          {`${extractDataCount < 0 ? 0 : extractDataCount} / ${absents.length} 데이터 추출중입니다.`}
                        </div>
                      )}
                      {isProcessPdf && (
                        <div className="text-brand-1 py-2 text-center font-bold">
                          {`${prodcessPdfCount < 0 ? 0 : reactPdfDatas.current.length} / ${
                            absents.length
                          } 데이터 처리중입니다.`}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex w-full items-center justify-center space-x-2">
                    <Select.lg
                      placeholder="화질선택"
                      value={pdfQuality}
                      onChange={(e) => {
                        setPdfQuality(Number(e.target.value))
                      }}
                    >
                      <option value={0.3}>{'저화질'}</option>
                      <option value={0.8}>{'보통화질'}</option>
                      <option value={1.0}>{'고화질'}</option>
                    </Select.lg>
                    <Button.lg
                      children="전체서류 PDF 내보내기"
                      disabled={isExtractData || isProcessPdf}
                      onClick={() => {
                        reactPdfDatas.current = []
                        setWithEvidence(true)
                        setIsExtractData(true)
                        setExtractDataCount(0)
                      }}
                      className="filled-primary z-[1000]"
                    />

                    <Button.lg
                      children="증빙서류 미포함 PDF 내보내기"
                      disabled={isExtractData || isProcessPdf}
                      onClick={() => {
                        reactPdfDatas.current = []
                        setWithEvidence(false)
                        setIsExtractData(true)
                        setExtractDataCount(0)
                      }}
                      style={{ zIndex: 1000 }}
                      className="filled-primary ml-2"
                    />
                  </div>
                  <div className="py-2 text-center text-lg text-white">
                    *{absents.length} 장의 결석계 서류를 다운로드합니다.
                    <br />
                    서류양이 많을 경우 다운로드가 최대 수 분까지 지연될 수 있습니다. <br />
                    {t(`absentTitle`, '결석신고서')} 화면 상단에서 날짜 범위를 좁혀 원하는 서류만 선택하면 다운로드
                    속도가 빨라집니다.`
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-center space-x-2">
                {map(
                  absents,
                  (absent, index) =>
                    extractDataCount - 5 <= index &&
                    index <= extractDataCount + 5 && (
                      <AbsentPdf
                        key={absent.id}
                        orderBy={index}
                        absent={absent}
                        extractReactData={_extractReactData}
                        extractArrayData={extractReactDataArray}
                        extractImageData={extractImageData}
                        nextExtractPdfData={_nextExtractPdfData}
                        isDownload={index === extractDataCount}
                      />
                    ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Button.lg
        children="PDF"
        onClick={() => {
          //alert('승인 완료된 결석계만 다운로드됩니다. 계속 진행하시겠습니까?');
          !isCsvData && setCsvData(true)
          setOpen(true)
        }}
        className="filled-blue"
      />
    </>
  )
}
