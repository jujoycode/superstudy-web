import { PopupModal } from 'src/components/PopupModal';
import { Document, Page, pdfjs } from 'react-pdf';
import { useRef, useState } from 'react';
import { ButtonV2 } from './ButtonV2';
import { saveAs } from 'file-saver';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfPreviewPopupProps {
  modalOpen: boolean;
  setModalClose: () => void;
  title: string;
  fileUrl: string;
  headerClassName?: string;
  containerClassName?: string;
  contentsClassName?: string;
  footerClassName?: string;
  fileName: string;
  noButton?: boolean;
}

export default function PdfPreviewPopup({
  modalOpen,
  setModalClose,
  fileUrl,
  headerClassName,
  containerClassName,
  contentsClassName,
  footerClassName,
  title,
  fileName,
  noButton = false,
}: PdfPreviewPopupProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // PDF 다운로드
  const download = (url: string, fileName: string) => {
    saveAs(url, fileName);
  };

  return (
    <PopupModal
      modalOpen={modalOpen}
      setModalClose={setModalClose}
      headerClassName={headerClassName}
      containerClassName={containerClassName}
      contentsClassName={contentsClassName}
      footerClassName={footerClassName}
      title={title}
      footerButtons={
        !noButton && (
          <ButtonV2 variant="solid" size={48} color="gray700" onClick={() => download(fileUrl, fileName)}>
            PDF 다운로드
          </ButtonV2>
        )
      }
    >
      <div ref={divRef} className="scroll-box h-full w-full overflow-y-auto bg-primary-gray-100 pb-2 pt-8">
        <Document
          file={fileUrl} // 여기는 가지고 계신 pdf 주소
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {/* height, width는 number 타입으로 vh, %는 먹지 않습니다. */}
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              width={divRef.current?.clientWidth}
              key={index}
              pageNumber={index + 1}
              renderAnnotationLayer={false}
              className="mb-6 shadow-[0_8px_20px_0_rgba(0,0,0,0.08)]"
            />
          ))}
        </Document>
      </div>
    </PopupModal>
  );
}
