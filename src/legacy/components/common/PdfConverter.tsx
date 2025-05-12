/**
 * iframe을 이용해 특정 웹페이지를 PDF로 변환해 저장 가능하게 하는 컴포넌트
 */

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Blank } from './Blank';
import { BlobDownloadItem, handleBatchBlobDownload } from 'src/hooks/useBatchDownload';
import { handleSingleBlobDownload } from 'src/util/download-blob';

interface PdfConverterProps {
  url: string | string[];
  targetElementId: string;
  saveFileName: string | string[];
  saveZipFileName?: string;
  groupBy?: { [key: string]: number[] }; // zip 파일 내 파일 그룹화
  onFinish: () => void;
}

function PdfConverter({
  url,
  targetElementId,
  saveFileName,
  saveZipFileName = 'zip',
  groupBy,
  onFinish,
}: PdfConverterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fullUrl = Array.isArray(url)
    ? url.map((u) => `${window.location.origin}${u}`)
    : `${window.location.origin}${url}`;

  /**
   * 테일윈드 이미지 스타일 오버라이딩
   * html2canvas 라이브러리 사용 시 텍스트가 밀리는 이슈 해결을 위해 추가
   *
   * 참고 1: https://github.com/niklasvh/html2canvas/issues/2775#issuecomment-1204988157
   * 참고 2: https://velog.io/@rainlee/%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%BA%A1%EC%B2%98-%EC%9D%B4%EC%8A%88-%ED%98%B9%EC%8B%9C-%ED%85%8C%EC%9D%BC%EC%9C%88%EB%93%9C-%EC%93%B0%EC%84%B8%EC%9A%94
   */
  const overridingTailwindImgStyle = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      img {
        display: inline-block;
      }
    `;

    return styleElement;
  };

  const waitForElement = async (document: Document, elementId: string, maxAttempts = 50): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkElement = () => {
        attempts++;
        const element = document.getElementById(elementId);

        if (element) {
          resolve(element);
        } else if (attempts >= maxAttempts) {
          reject(new Error(`${elementId} 요소를 찾을 수 없습니다. (${maxAttempts}회 시도)`));
        } else {
          setTimeout(checkElement, 100); // 100ms 간격으로 재시도
        }
      };

      checkElement();
    });
  };

  const convertToPdf = async () => {
    const styleEl = overridingTailwindImgStyle();
    document.head.appendChild(styleEl);

    try {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) {
        throw new Error('iframe이 로드되지 않았습니다.');
      }

      // iframe 내부 페이지가 완전히 로드될 때까지 대기
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('페이지 로드 타임아웃'));
        }, 10000);

        if (iframe.contentWindow?.document.readyState === 'complete') {
          clearTimeout(timeoutId);
          resolve();
        } else {
          iframe.contentWindow?.addEventListener(
            'load',
            () => {
              clearTimeout(timeoutId);
              resolve();
            },
            { once: true },
          );
        }
      });

      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        throw new Error('iframe 문서를 찾을 수 없습니다.');
      }

      // 대상 요소를 찾을 때까지 대기
      const targetElement = await waitForElement(iframeDocument, targetElementId);
      console.log(`${targetElementId} 요소를 찾았습니다.`);

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const padding = 10; // 10mm 패딩 추가
      const availableWidth = pdfWidth - 2 * padding;
      const availableHeight = pdfHeight - 2 * padding;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      // 중앙 정렬을 위한 x, y 좌표 계산
      const x = padding + (availableWidth - finalWidth) / 2;
      const y = padding + (availableHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      return pdf.output('blob');
    } catch (error) {
      console.error('PDF 변환 중 오류 발생:', error);
      throw error; // 오류를 상위로 전파
    } finally {
      styleEl.remove();
    }
  };

  const processAllUrls = async () => {
    if (isLoading) return; // 이미 처리 중이면 중복 실행 방지
    const pdfBlobs: BlobDownloadItem[] = [];
    try {
      setIsLoading(true);

      const fileNames = Array.isArray(saveFileName) ? saveFileName : [saveFileName];

      for (let i = 0; i < fullUrl.length; i++) {
        // iframe 로드 및 PDF 변환을 순차적으로 처리
        const pdfBlob = await loadUrlAndConvertToPdf(fullUrl[i], i);
        pdfBlobs.push({
          blob: pdfBlob,
          fileName: fileNames[i],
          group: groupBy ? Object.keys(groupBy).find((key) => groupBy[key].includes(i)) : undefined,
        });
      }

      // 모든 PDF 변환이 완료된 후 압축 다운로드
      await handleBatchBlobDownload(pdfBlobs, saveZipFileName);
    } catch (error) {
      console.error('PDF 변환 실패:', error);
    } finally {
      setIsLoading(false);
      setCurrentIndex(0);
      onFinish();
    }
  };

  const handleSingleUrl = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await convertToPdf();
      await handleSingleBlobDownload(pdfBlob, saveFileName as string);
    } finally {
      setIsLoading(false);
      onFinish?.();
    }
  };

  const handleIframeLoad = async () => {
    // url의 개수가 2개 이상일 때
    if (Array.isArray(fullUrl) && fullUrl.length > 1) {
      // 첫 번째 iframe 로드 시에만 전체 프로세스 시작
      if (currentIndex === 0 && !isLoading) {
        await processAllUrls();
      }
    } else {
      // 단일 URL 처리
      if (!isLoading) {
        await handleSingleUrl();
      }
    }
  };

  const loadUrlAndConvertToPdf = async (targetUrl: string, index: number): Promise<Blob> => {
    // 1. iframe 로드 완료 대기
    await new Promise<void>((resolve) => {
      if (iframeRef.current) {
        const handleLoad = () => {
          iframeRef.current?.removeEventListener('load', handleLoad);
          resolve();
        };

        iframeRef.current.addEventListener('load', handleLoad);
        setCurrentIndex(index);
        iframeRef.current.src = targetUrl;
      }
    });

    // 2. 로드 완료 후 잠시 대기 (안정성을 위해)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. PDF 변환
    return await convertToPdf();
  };

  return (
    <div>
      {isLoading && <Blank />}
      {/* 배열일 경우 배열의 길이만큼 반복하여 프레임 생성 */}
      {((Array.isArray(fullUrl) && currentIndex < fullUrl.length) || !Array.isArray(fullUrl)) && (
        <iframe
          ref={iframeRef}
          src={Array.isArray(fullUrl) ? fullUrl[currentIndex] : fullUrl}
          onLoad={handleIframeLoad}
          className="absolute left-[9999px] top-0 h-[600px] w-full"
        />
      )}
    </div>
  );
}

export default PdfConverter;
