import { useEffect, useRef, useState } from 'react'
import { Constants } from '@/legacy/constants'
import { ResponseNewsletterDetailDto } from '@/legacy/generated/model'
import { NewsletterPaper } from '../newsletter/NewsletterPaper'
import { AbsentPaperType } from '@/legacy/types'

interface NewsletterPdfProps {
  orderBy: number
  newsletter?: ResponseNewsletterDetailDto
  studentNewsletter: any
  submitPerson: any
  extractReactData: (orderBy: number, ref: any, type: AbsentPaperType, submitPerson: any) => Promise<null | undefined>
  extractArrayData: (orderBy: number, ref: any[], type: AbsentPaperType, submitPerson: any) => Promise<null | undefined>
  extractImageData: (orderBy: number, submitPerson: any, type: AbsentPaperType) => void
  nextExtractPdfData: () => void
  isDownload: boolean
}

export function NewsletterPdf({
  orderBy,
  newsletter,
  studentNewsletter,
  submitPerson,
  extractReactData,
  extractArrayData,
  isDownload,
  nextExtractPdfData,
}: NewsletterPdfProps) {
  const newsletterPaperRef = useRef(null)
  const pdfPaperRefs = useRef<any[]>([])

  const _downloadPdf = async () => {
    if (newsletterPaperRef.current) {
      await extractReactData(orderBy, newsletterPaperRef.current, AbsentPaperType.ABSENT, newsletter)
      //await extractArrayData(orderBy, pdfPaperRefs.current, AbsentPaperType.PDF, newsletter);

      nextExtractPdfData()
    }
  }

  useEffect(() => {
    if (newsletter && isDownload) {
      _downloadPdf()
    }
  }, [newsletter, isDownload])

  if (!newsletter) {
    return null
  }

  return (
    <>
      <div className="h-[1100px] w-[778px] overflow-hidden bg-white">
        <NewsletterPaper newsletter={newsletter} studentNewsletter={studentNewsletter} ref={newsletterPaperRef} />
      </div>
    </>
  )
}
