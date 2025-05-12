import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { filter, find, groupBy, map } from 'lodash';
import { useRef, useState } from 'react';
import { Fieldtrip } from 'src/generated/model';
import { FieldtripPaperType } from 'src/types';
import { getImageMeta, getPdfImageSize } from 'src/util/pdf';
import { Select } from '../common';
import { Button } from '../common/Button';
import { FieldtripPdf } from './FieldtripPdf';

interface FieldtripsDownloadViewProps {
  fieldtrips?: Fieldtrip[];
  fileName: string;
  setCsvData: (b: boolean) => void;
  isCsvData: boolean;
}

interface ReactPdfData {
  id: number;
  orderBy: number;
  data: string | Uint8Array;
  type: FieldtripPaperType;
  width?: number;
  height?: number;
  orientation?: number;
}

export function FieldtripsDownloadView({
  fieldtrips = [],
  fileName,
  setCsvData,
  isCsvData,
}: FieldtripsDownloadViewProps) {
  const [open, setOpen] = useState(false);
  const docRef = useRef<jsPDF>();
  const [withEvidence, setWithEvidence] = useState(false);
  const [isExtractData, setIsExtractData] = useState(false);
  const [extractDataCount, setExtractDataCount] = useState(-1);
  const [isProcessPdf, setIsProcessPdf] = useState(false);
  const [prodcessPdfCount, setIsProcessPdfCount] = useState(0);
  const reactPdfDatas = useRef<ReactPdfData[]>([]);

  const [pdfQuality, setPdfQuality] = useState(0.8);

  const _initState = () => {
    setIsExtractData(false);
    setExtractDataCount(-1);
    setIsProcessPdf(false);
    setIsProcessPdfCount(0);
  };

  const _addImageToPdf = async (imageData: ReactPdfData) => {
    if (!docRef.current || !imageData.width || !imageData.height) {
      return null;
    }
    const { width: imageWidth, height: imageHeight, data } = imageData;
    const [width, height] = getPdfImageSize(imageWidth, imageHeight);
    console.log('_addImageToPdf', 'width', width, 'height', height);
    try {
      docRef.current.addImage(data, 'JPEG', 0, 0, width, height, undefined, 'FAST');
      docRef.current.addPage();
    } catch (e) {
      console.log('_addImageToPdf error  : ', e);
      console.log('_addImageToPdf data  : ', data);
      console.log('_addImageToPdf imageData  : ', imageData);
    }
  };

  const addReactToPdf = async (reactData: ReactPdfData) => {
    if (!docRef.current) {
      return null;
    }
    try {
      docRef.current.addImage(reactData.data, 'JPEG', -3, 0, 210, 297, undefined, 'FAST');
      docRef.current.addPage();
    } catch (e) {
      console.log('addReactToPdf error  : ', e);
      console.log('addReactToPdf error reactData : ', reactData);
    }
  };

  const extractReactData = async (orderBy: number, ref: any, type: FieldtripPaperType, fieldtrip: Fieldtrip) => {
    if (!ref) {
      return null;
    }
    let imgData;
    try {
      imgData = await toJpeg(ref, { quality: pdfQuality, fontEmbedCSS: '', cacheBust: true });
      await getImageMeta(imgData);
      reactPdfDatas.current.push({
        id: fieldtrip.id,
        orderBy,
        data: imgData,
        type,
      });
    } catch (e) {
      console.log('extractReactData error  : ', e);
      console.log('extractReactData error type : ', type);
      console.log('extractReactData error fieldtrip : ', fieldtrip);
      console.log('extractReactData error imgData : ', imgData);
    } finally {
      // if (type === FieldtripPaperType.RESULT) {
      //   _nextExtractPdfData();
      // }
    }
  };

  const extractReactDataArray = async (orderBy: number, ref: any[], type: FieldtripPaperType, fieldtrip: Fieldtrip) => {
    if (!ref) {
      return null;
    }

    for (const ef of ref) {
      let imgData;
      try {
        imgData = await toJpeg(ef, {
          quality: pdfQuality,
          fontEmbedCSS: '',
          includeQueryParams: true,
          cacheBust: false,
        });
        await getImageMeta(imgData);
        reactPdfDatas.current.push({
          id: fieldtrip.id,
          orderBy,
          data: imgData,
          type,
        });
      } catch (e) {
        console.log('extractReactData error  : ', e);
        console.log('extractReactData error type : ', type);
        console.log('extractReactData error fieldtrip : ', fieldtrip);
        console.log('extractReactData error imgData : ', imgData);
      } finally {
        // if (type === FieldtripPaperType.RESULT) {
        //   _nextExtractPdfData();
        // }
      }
    }
  };

  const _finishDownloadPdf = () => {
    setIsExtractData(false);
    setIsProcessPdf(true);
    docRef.current = new jsPDF('p', 'mm', 'a4');
    const groupbyPdfDatas = groupBy(reactPdfDatas.current, 'orderBy');
    map(groupbyPdfDatas, (pdfDatas) => {
      const applicationData = find(pdfDatas, (pdfData) => pdfData.type === FieldtripPaperType.APPLICATION);
      const applicationSeparateData = filter(
        pdfDatas,
        (pdfData) => pdfData.type === FieldtripPaperType.APPLICATIONSEPARATE,
      );
      const applyImageDatas = filter(pdfDatas, (pdfData) => pdfData.type === FieldtripPaperType.APPLICATIONIMAGE);

      const resultData = find(pdfDatas, (pdfData) => pdfData.type === FieldtripPaperType.RESULT);
      const resultSeparateData = filter(pdfDatas, (pdfData) => pdfData.type === FieldtripPaperType.RESULTSEPARATE);
      const imageDatas = filter(pdfDatas, (pdfData) => pdfData.type === FieldtripPaperType.RESULTIMAGE);

      applicationData && addReactToPdf(applicationData);
      applicationSeparateData?.length && map(applicationSeparateData, (page) => addReactToPdf(page));
      if (withEvidence) {
        applyImageDatas?.length && map(applyImageDatas, (image) => addReactToPdf(image));
      }

      resultData && addReactToPdf(resultData);
      resultSeparateData?.length && map(resultSeparateData, (page) => addReactToPdf(page));

      if (withEvidence) {
        imageDatas?.length && map(imageDatas, (image) => addReactToPdf(image));
      }

      setIsProcessPdfCount((prev) => prev + 1);
    });
    docRef.current.deletePage(docRef.current.getNumberOfPages());
    docRef.current.save(`${fileName}.pdf`);
    setIsProcessPdf(false);
  };

  const _nextExtractPdfData = () => {
    if (!fieldtrips) {
      return null;
    }
    if (extractDataCount === fieldtrips.length - 1) {
      setExtractDataCount((prev) => prev + 1);
      _finishDownloadPdf();
    }
    if (extractDataCount >= fieldtrips.length - 1) {
      return;
    }
    setExtractDataCount((prev) => prev + 1);
  };

  const _getProgress = () => {
    if (!fieldtrips || !reactPdfDatas.current) {
      return 0;
    }

    if (isExtractData) {
      return (extractDataCount / fieldtrips.length) * 100;
    }

    if (isProcessPdf) {
      return (prodcessPdfCount / reactPdfDatas.current.length) * 100;
    }
    return 0;
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-100 m-0 h-screen w-full overflow-y-scroll bg-littleblack">
          <div className="flex h-full w-full items-start">
            <div className="py-6">
              <div className="mb-2 flex w-screen items-center justify-center">
                <div
                  className="fixed right-16 top-7 cursor-pointer text-3xl font-bold text-white"
                  onClick={() => {
                    setOpen(false);
                    _initState();
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
                        <div className="py-2 text-center font-bold text-brand-1">
                          {`${extractDataCount < 0 ? 0 : extractDataCount} / ${fieldtrips.length} 데이터 추출중입니다.`}
                        </div>
                      )}
                      {isProcessPdf && (
                        <div className="py-2 text-center font-bold text-brand-1">
                          {`${prodcessPdfCount < 0 ? 0 : reactPdfDatas.current.length} / ${
                            fieldtrips.length
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
                        setPdfQuality(Number(e.target.value));
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
                        reactPdfDatas.current = [];
                        setWithEvidence(true);
                        setIsExtractData(true);
                        setExtractDataCount(0);
                      }}
                      className="filled-primary z-[1000]"
                    />

                    <Button.lg
                      children="증빙서류 미포함 PDF 내보내기"
                      disabled={isExtractData || isProcessPdf}
                      onClick={() => {
                        reactPdfDatas.current = [];
                        setWithEvidence(false);
                        setIsExtractData(true);
                        setExtractDataCount(0);
                      }}
                      style={{ zIndex: 1000 }}
                      className="filled-primary ml-2"
                    />
                  </div>
                  <div className="py-2 text-center text-lg text-white">
                    *{fieldtrips.length} 건의 체험학습 서류를 다운로드합니다.
                    <br />
                    서류양이 많을 경우 다운로드가 최대 수 분까지 지연될 수 있습니다. <br />
                    체험학습 화면 상단에서 날짜 범위를 좁혀 원하는 서류만 선택하면 다운로드 속도가 빨라집니다.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2">
                {map(
                  fieldtrips,
                  (fieldtrip, index) =>
                    extractDataCount - 5 <= index &&
                    index <= extractDataCount + 5 && (
                      <FieldtripPdf
                        key={fieldtrip.id}
                        orderBy={index}
                        fieldtrip={fieldtrip}
                        extractReactData={extractReactData}
                        extractArrayData={extractReactDataArray}
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
          //alert('결과보고서까지 승인 완료된 체험학습 서류만 다운로드됩니다. 계속 진행하시겠습니까?');
          !isCsvData && setCsvData(true);
          setOpen(true);
        }}
        className="filled-blue w-full"
      />
    </>
  );
}
