import * as loadImage from 'blueimp-load-image';
import imageCompression from 'browser-image-compression';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { filter, find, groupBy, map } from 'lodash';
import { useRef, useState } from 'react';
import { Constants } from 'src/constants';
import { UserContainer } from 'src/container/user';
import { ResponseNewsletterDetailDto } from 'src/generated/model';
import { AbsentPaperType } from 'src/types';
import { getArrayBufferByFile, getBlobByCanvas, getImageMeta } from 'src/util/pdf';
import { Select } from '../common';
import { Button } from '../common/Button';
import { NewsletterPdf } from './NewsletterPdf';

interface NewslettersDownloadViewProps {
  newsletter?: ResponseNewsletterDetailDto;
  studentNewsletter: any;
  submitPerson: any;
  nowDate: string;
  setCsvData: (b: boolean) => void;
  isCsvData: boolean;
}

interface ReactPdfData {
  id: number;
  orderBy: number;
  data: string | Uint8Array;
  type: AbsentPaperType;
  width?: number;
  height?: number;
  orientation?: number;
}

export function NewslettersDownloadView({
  newsletter,
  studentNewsletter,
  submitPerson,
  nowDate,
  setCsvData,
  isCsvData,
}: NewslettersDownloadViewProps) {
  const [open, setOpen] = useState(false);
  const docRef = useRef<jsPDF>();
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

  const extractReactData = async (orderBy: number, ref: any, type: AbsentPaperType, submitPerson: any) => {
    if (!ref) {
      return null;
    }
    let imgData;
    try {
      imgData = await toJpeg(ref, { quality: pdfQuality, fontEmbedCSS: '' });
      await getImageMeta(imgData);
      reactPdfDatas.current.push({
        id: submitPerson.id,
        orderBy,
        data: imgData,
        type,
      });
    } catch (e) {
      console.log('extractReactData error  : ', e);
      console.log('extractReactData error type : ', type);
      console.log('extractReactData error submitPerson : ', submitPerson);
      console.log('extractReactData error imgData : ', imgData);
    } finally {
      if (type === AbsentPaperType.PARENT || type === AbsentPaperType.TEACHER) {
        _nextExtractPdfData();
      }
    }
  };

  const extractImageData = async (orderBy: number, studentNewsletter: any, type: AbsentPaperType) => {
    console.log('extractImageData');
    const { id, evidenceFiles } = studentNewsletter;

    if (!evidenceFiles?.length || !id) {
      return null;
    }

    for (const ef of evidenceFiles) {
      if (ef.split('.').pop()?.toLowerCase() !== 'pdf') {
        try {
          const evidenceFile = `${Constants.imageUrl}${ef}`;
          //@ts-ignore
          const result = await loadImage(evidenceFile, {
            meta: true,
            orientation: true,
            canvas: true,
          });
          console.log('evidenceFile : ', evidenceFile);
          console.log('result : ', result);
          const blob = await getBlobByCanvas(result.image);
          const file = new File([blob], 'temp_file.jpeg', { type: blob.type });
          const compressedFile = await imageCompression(file, { initialQuality: pdfQuality });
          const arrayBuffer = await getArrayBufferByFile(compressedFile);
          const unit8Array = new Uint8Array(arrayBuffer);
          const orientation = result.exif?.get('Orientation') || 1;
          const isChangeWidthHeight = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8;
          console.log('orientation : ', orientation);
          console.log('isChangeWidthHeight : ', isChangeWidthHeight);
          reactPdfDatas.current.push({
            id,
            orderBy,
            data: unit8Array,
            type,
            width: isChangeWidthHeight ? result.originalHeight : result.originalWidth,
            height: isChangeWidthHeight ? result.originalWidth : result.originalHeight,
            //evidenceType: absent.evidenceType as AbsentEvidenceType,
            orientation,
          });
        } catch (e) {
          console.log('extractImageData error  : ', e);
          console.log('extractImageData error evidenceFile : ', ef);
        } finally {
        }
      }
    }
    _nextExtractPdfData();
  };

  const extractReactDataArray = async (orderBy: number, ref: any[], type: AbsentPaperType, submitPerson: any) => {
    if (!ref) {
      return null;
    }
    for (const ef of ref) {
      if (ef) {
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
            id: submitPerson.id,
            orderBy,
            data: imgData,
            type,
            //evidenceType: absent.evidenceType as AbsentEvidenceType,
          });
        } catch (e) {
          console.log('extractReactData error  : ', e);
          console.log('extractReactData error type : ', type);
          console.log('extractReactData error submitPerson : ', submitPerson);
          console.log('extractReactData error imgData : ', imgData);
        } finally {
          // if (type === FieldtripPaperType.RESULT) {
          //   _nextExtractPdfData();
          // }
        }
      }
    }
  };

  const _finishDownloadPdf = () => {
    console.log('_finishDownloadPdf');
    setIsExtractData(false);
    setIsProcessPdf(true);
    docRef.current = new jsPDF('p', 'mm', 'a4');
    const groupbyPdfDatas = groupBy(reactPdfDatas.current, 'orderBy');
    map(groupbyPdfDatas, (pdfDatas) => {
      const submitData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.ABSENT);
      // const absentData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.ABSENT);
      // const parentData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.PARENT);
      // const teacherData = find(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.TEACHER);
      const imageDatas = filter(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.IMAGE);
      const attachedPdfDatas = filter(pdfDatas, (pdfData) => pdfData.type === AbsentPaperType.PDF);
      if (submitData && (imageDatas || attachedPdfDatas)) {
        addReactToPdf(submitData);
      }

      setIsProcessPdfCount((prev) => prev + 1);
    });
    docRef.current.deletePage(docRef.current.getNumberOfPages());
    docRef.current.save(`가정통신문 ${nowDate}.pdf`);
    setIsProcessPdf(false);
  };

  const _nextExtractPdfData = () => {
    if (!studentNewsletter) {
      return null;
    }

    if (extractDataCount === studentNewsletter.length - 1) {
      setExtractDataCount((prev) => prev + 1);
      _finishDownloadPdf();
    }
    if (extractDataCount >= studentNewsletter.length - 1) {
      return;
    }
    setExtractDataCount((prev) => prev + 1);
  };

  const _getProgress = () => {
    if (!studentNewsletter || !reactPdfDatas.current) {
      return 0;
    }

    if (isExtractData) {
      return (extractDataCount / studentNewsletter.length) * 100;
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
                          {`${
                            extractDataCount < 0 ? 0 : extractDataCount
                          } / ${studentNewsletter?.length} 데이터 추출중입니다.`}
                        </div>
                      )}
                      {isProcessPdf && (
                        <div className="py-2 text-center font-bold text-brand-1">
                          {`${
                            prodcessPdfCount < 0 ? 0 : reactPdfDatas.current.length
                          } / ${studentNewsletter?.length} 데이터 처리중입니다.`}
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
                        //setWithEvidence(true);
                        setIsExtractData(true);
                        setExtractDataCount(0);
                      }}
                      className="filled-primary z-[1000]"
                    />
                  </div>
                  <div className="py-2 text-center text-lg text-white">
                    *{studentNewsletter?.length} 장의 가정통신문 설문 서류를 다운로드합니다.
                    <br />
                    <b className="text-primary-orange-800">웹페이지 비율을 100%</b>로 조정 후, 다운로드를 진행해야 학생
                    및 학부모 서명이 정상적으로 보여집니다.
                    <br />
                    서류양이 많을 경우 다운로드가 최대 수 분까지 지연될 수 있습니다. <br />
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-center space-x-2">
                {map(
                  submitPerson,
                  (submitPerson, index: number) =>
                    (index < studentNewsletter.length || (0 <= index && index < extractDataCount)) && (
                      <NewsletterPdf
                        //key={studentNewsletter.id}
                        orderBy={index}
                        newsletter={newsletter}
                        studentNewsletter={studentNewsletter[index]}
                        submitPerson={submitPerson}
                        extractReactData={extractReactData}
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
          !isCsvData && setCsvData(true);
          setOpen(true);
        }}
        className="filled-blue"
      />
    </>
  );
}
