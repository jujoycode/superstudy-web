import { useEffect, useRef } from 'react'
import { ResponseNewsletterDetailDto } from '@/legacy/generated/model'
import { AbsentPaperType } from '@/legacy/types'

import { NewsletterPaper } from '../newsletter/NewsletterPaper'

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
  extractReactData,
  isDownload,
  nextExtractPdfData,
}: NewsletterPdfProps) {
  const newsletterPaperRef = useRef(null)

  const _downloadPdf = async () => {
    if (newsletterPaperRef.current) {
      await extractReactData(orderBy, newsletterPaperRef.current, AbsentPaperType.ABSENT, newsletter)
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
