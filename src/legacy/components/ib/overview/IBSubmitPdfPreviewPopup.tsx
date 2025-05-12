import PdfPreviewPopup from '@/legacy/components/common/PdfPreviewPopup'
import { useEffect, useState } from 'react'
import { modifyRppfPdf } from '@/legacy/util/ib_rppf_pdf'
import { modifyTkppfPdf } from '@/legacy/util/ib_tkppf_pdf'

interface Props {
  type: 'RPPF' | 'TKPPF'
  modalOpen: boolean
  setModalClose: () => void
  data: any
  noButton?: boolean
}

export default function IBSubmitPdfPreviewPopup({ type, modalOpen, setModalClose, data, noButton }: Props) {
  const [openPreview, setOpenPreview] = useState(false)
  const [pdfSrc, setPdfSrc] = useState<string | undefined>('')

  // PDF 파일 경로
  const pdfPath = type === 'RPPF' ? '/EE-RPPF.pdf' : '/TKPPF_en.pdf'

  useEffect(() => {
    const initializePDF = async () => {
      if (modalOpen) {
        const pdfBlob =
          type === 'RPPF' ? await modifyRppfPdf({ pdfPath, data }) : await modifyTkppfPdf({ pdfPath, data })
        const pdfURL = pdfBlob ? URL.createObjectURL(pdfBlob) : undefined
        setPdfSrc(pdfURL)
        setOpenPreview(true)
      }
    }
    initializePDF()
  }, [modalOpen])

  return (
    <>
      <PdfPreviewPopup
        modalOpen={openPreview}
        setModalClose={() => {
          setModalClose()
          setOpenPreview(false)
        }}
        title="미리보기"
        headerClassName="px-8"
        containerClassName="w-[848px] h-[800px] px-0"
        contentsClassName="w-full h-full px-8 bg-primary-gray-100"
        footerClassName="px-8"
        fileUrl={pdfSrc ?? ''}
        // TODO: 파일명 수정 필요: EE_응시코드_RPPF
        fileName={`${type === 'RPPF' ? 'EE' : 'TOK'}_T142_${type === 'RPPF' ? 'RPPF' : 'TKPPF'}`}
        noButton={noButton}
      />
    </>
  )
}
