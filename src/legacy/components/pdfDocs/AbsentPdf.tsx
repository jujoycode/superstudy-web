import { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'

import { Constants } from '@/legacy/constants'
import { Absent } from '@/legacy/generated/model'
import { AbsentEvidenceType, AbsentPaperType } from '@/legacy/types'

import { AbsentPaper } from '../absent/AbsentPaper'
import { ParentConfirmPaper } from '../absent/ParentConfirmPaper'
import { TeacherConfirmPaper } from '../absent/TeacherConfirmPaper'

interface AbsentPdfProps {
  orderBy: number
  absent: Absent
  extractReactData: (orderBy: number, ref: any, type: AbsentPaperType, absent: Absent) => Promise<null | undefined>
  extractArrayData: (orderBy: number, ref: any[], type: AbsentPaperType, absent: Absent) => Promise<null | undefined>
  extractImageData: (orderBy: number, absent: Absent, type: AbsentPaperType) => void
  nextExtractPdfData: () => void
  isDownload: boolean
}

export function AbsentPdf({
  orderBy,
  absent,
  extractReactData,
  extractArrayData,
  extractImageData,
  isDownload,
  nextExtractPdfData,
}: AbsentPdfProps) {
  const absentPaperRef = useRef(null)
  const pdfPaperRefs = useRef<any[]>([])
  const parentConfirmPaperRef = useRef(null)
  const teacherConfirmPaperRef = useRef(null)
  const pdf2PaperRefs = useRef<any[]>([])
  const imageRef = useRef<HTMLImageElement | null>(null)
  const image2Ref = useRef<HTMLImageElement | null>(null)

  //console.log('pdf2PaperRefs', pdf2PaperRefs);

  const [numPages, setNumPages] = useState(0)

  const _downloadPdf = async () => {
    if (absentPaperRef.current) {
      await extractReactData(orderBy, absentPaperRef.current, AbsentPaperType.ABSENT, absent)
      await extractArrayData(orderBy, pdfPaperRefs.current, AbsentPaperType.PDF, absent)
      pdf2PaperRefs.current?.length &&
        (await extractArrayData(orderBy, pdf2PaperRefs.current, AbsentPaperType.PDF, absent))

      if (
        (absent.evidenceType === AbsentEvidenceType.PARENT || absent.evidenceType2 === AbsentEvidenceType.PARENT) &&
        parentConfirmPaperRef.current
      ) {
        await extractReactData(orderBy, parentConfirmPaperRef.current, AbsentPaperType.PARENT, absent)
      }

      if (
        (absent.evidenceType === AbsentEvidenceType.TEACHER || absent.evidenceType2 === AbsentEvidenceType.TEACHER) &&
        teacherConfirmPaperRef.current
      ) {
        await extractReactData(orderBy, teacherConfirmPaperRef.current, AbsentPaperType.TEACHER, absent)
      }

      if (absent?.evidenceFiles?.length || absent?.evidenceFiles2?.length) {
        //console.log('image download');
        await extractImageData(orderBy, absent, AbsentPaperType.IMAGE)
      }
      nextExtractPdfData()
    }
  }

  useEffect(() => {
    if (absent && isDownload) {
      _downloadPdf()
    }
  }, [absent, isDownload])

  const getUrl = (fileName: string) => {
    let url = ''

    if (fileName.includes('blob')) {
      const index = fileName.indexOf('?')

      if (index !== -1) {
        url = fileName.substring(0, index) // 0부터 ? 이전까지 문자열 추출
      } else {
        url = fileName
      }
    } else {
      url = Constants.imageUrl + fileName
    }

    return url
  }

  if (!absent) {
    return null
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (
    <>
      <div className="h-[1100px] w-[778px] overflow-hidden bg-white">
        <AbsentPaper absent={absent} ref={absentPaperRef} />
      </div>
      {(absent.evidenceType === AbsentEvidenceType.TEACHER || absent.evidenceType2 === AbsentEvidenceType.TEACHER) && (
        <div className="h-[1100px] w-[778px] overflow-hidden bg-white">
          {' '}
          <TeacherConfirmPaper absent={absent} ref={teacherConfirmPaperRef} />{' '}
        </div>
      )}

      {(absent.evidenceType === AbsentEvidenceType.PARENT || absent.evidenceType2 === AbsentEvidenceType.PARENT) && (
        <div className="h-[1100px] w-[778px] overflow-hidden bg-white">
          {' '}
          <ParentConfirmPaper absent={absent} ref={parentConfirmPaperRef} />{' '}
        </div>
      )}

      {absent?.evidenceFiles?.length &&
        absent.evidenceFiles.map(
          (evidenceFile) =>
            evidenceFile &&
            (evidenceFile.split('.').pop()?.toLowerCase() === 'pdf' ? (
              <Document
                file={getUrl(evidenceFile)} // 여기는 가지고 계신 pdf 주소
                onLoadSuccess={onDocumentLoadSuccess}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={index}
                    ref={(el) => pdfPaperRefs.current !== null && (pdfPaperRefs.current[index] = el)}
                    className="h-[1100px] w-[778px] overflow-hidden bg-white"
                  >
                    <Page
                      width={778}
                      height={1100}
                      //key={index}
                      pageNumber={index + 1}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="h-[1100px] w-[778px] overflow-hidden bg-white">
                <img className="object-cover" ref={imageRef} src={`${Constants.imageUrl}${evidenceFile}`} alt="" />
              </div>
            )),
        )}

      {absent?.evidenceFiles2?.length &&
        absent.evidenceFiles2.map(
          (evidenceFile) =>
            evidenceFile &&
            (evidenceFile.split('.').pop()?.toLowerCase() === 'pdf' ? (
              <Document
                file={getUrl(evidenceFile)} // 여기는 가지고 계신 pdf 주소
                onLoadSuccess={onDocumentLoadSuccess}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={index}
                    ref={(el) => pdf2PaperRefs.current !== null && (pdf2PaperRefs.current[index] = el)}
                    className="h-[1100px] w-[778px] overflow-hidden bg-white"
                  >
                    <Page
                      width={778}
                      height={1100}
                      //key={index}
                      pageNumber={index + 1}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="h-[1100px] w-[778px] overflow-hidden bg-white">
                <img className="object-cover" ref={image2Ref} src={`${Constants.imageUrl}${evidenceFile}`} alt="" />
              </div>
            )),
        )}
    </>
  )
}
