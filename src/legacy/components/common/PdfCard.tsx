import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { cn } from '@/utils/commonUtil'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { useLanguage } from '@/legacy/hooks/useLanguage'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfCardProps {
  fileUrl?: string
  visibleButton: boolean
  onClick?: () => void
  cardType?: boolean
}

export function PdfCard({ fileUrl, visibleButton, onClick, cardType }: PdfCardProps) {
  const [pageSize, setPageSize] = useState({ width: 200, height: 300 })
  const divRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    function updatePageSize() {
      const pageWidth = divRef.current?.clientWidth ?? 0
      const pageHeight = divRef.current?.clientHeight ?? 0 // A4 용지 비율 3:2로 설정
      setPageSize({ width: pageWidth, height: pageHeight })
    }
    updatePageSize()
    window.addEventListener('resize', updatePageSize)
    return () => window.removeEventListener('resize', updatePageSize)
  }, [])

  // useMemo 훅을 사용하여 최적화
  const documentComponent = useMemo(() => {
    return (
      <Document file={fileUrl}>
        {cardType ? (
          <Page height={pageSize.height} pageNumber={1} renderTextLayer={false} />
        ) : (
          <Page
            height={divRef.current?.clientHeight}
            width={divRef.current?.clientWidth}
            pageNumber={1}
            renderTextLayer={false}
          />
        )}
      </Document>
    )
  }, [fileUrl, pageSize.height, divRef.current?.clientHeight, divRef.current?.clientWidth])

  return (
    <>
      {
        <div
          ref={divRef}
          className={cn(
            'h-full rounded-sm object-cover',
            cardType ? 'absolute flex w-full items-center justify-center' : 'relative',
          )}
        >
          {documentComponent}
          <button
            children={t('view_details')}
            hidden={!visibleButton}
            onClick={onClick}
            className="bg-primary-50 text-primary-800 absolute z-2 w-full items-center rounded-md px-4 py-2 text-sm focus:outline-hidden"
          />
        </div>
      }
    </>
  )
}
