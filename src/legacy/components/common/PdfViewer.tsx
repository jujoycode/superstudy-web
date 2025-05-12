import { HTMLAttributes, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useWindowSize } from 'src/util/hooks';

import 'react-pdf/dist/esm/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfViewerProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  fileUrl?: string;
  onClose: () => void;
}

export function PdfViewer({ fileUrl, isOpen, onClose, ...props }: PdfViewerProps) {
  const windowSize = useWindowSize();
  const divRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  return (
    <>
      <div
        {...props}
        className={`${
          isOpen
            ? 'z-100 scale-100 opacity-100 duration-100 ease-in'
            : 'hidden scale-95 opacity-0 duration-200 ease-out'
        } fixed inset-x-0 top-0 origin-top-right transform p-2 transition`}
      >
        <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="px-1 pb-6 pt-5">
            <div className="flex items-center justify-between">
              <div className="-mr-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={() => onClose()}
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div ref={divRef} className="scroll-box h-screen-6 overflow-y-auto border-2">
              <Document
                file={fileUrl} // 여기는 가지고 계신 pdf 주소
                onLoadSuccess={onDocumentLoadSuccess}
              >
                {/* height, width는 number 타입으로 vh, %는 먹지 않습니다. */}
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    width={divRef.current?.clientWidth}
                    //height={windowSize.height}
                    key={index}
                    pageNumber={index + 1}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
