import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Fieldtrip } from 'src/generated/model';
import { meState } from 'src/store';
import { FieldtripPaperType } from 'src/types';
import { splitStringByUnicode } from 'src/util/fieldtrip';
import { getNickName } from 'src/util/status';
import { FieldtripPaper } from '../fieldtrip/FieldtripPaper';
import { FieldtripSeparatePaper } from '../fieldtrip/FieldtripSeparatePaper';
import { FieldtripSuburbsSeparatePaper } from '../fieldtrip/FieldtripSuburbsSeparatePaper';
import { FieldtripSuburbsTextSeparatePaper } from '../fieldtrip/FieldtripSuburbsTextSeparatePaper';

interface FieldtripPdfProps {
  orderBy: number;
  fieldtrip: Fieldtrip;
  extractReactData: (
    orderBy: number,
    ref: any,
    type: FieldtripPaperType,
    fieldtrip: Fieldtrip,
  ) => Promise<null | undefined>;
  extractArrayData: (
    orderBy: number,
    ref: any[],
    type: FieldtripPaperType,
    fieldtrip: Fieldtrip,
  ) => Promise<null | undefined>;
  nextExtractPdfData: () => void;
  isDownload: boolean;
}

export function FieldtripPdf({
  orderBy,
  fieldtrip,
  extractReactData,
  extractArrayData,
  isDownload,
  nextExtractPdfData,
}: FieldtripPdfProps) {
  const me = useRecoilValue(meState);

  const fidletripPaperRef = useRef(null);
  const separatePaperRefs = useRef<any[]>([]);
  const separateImagePaperRefs = useRef<any[]>([]);
  const fidletripResultPaperRef = useRef(null);
  const separateResultPaperRefs = useRef<any[]>([]);
  const separateResultImagePaperRefs = useRef<any[]>([]);

  const [resultTextPages, setResultTextPages] = useState<string[]>([]);
  const resultFilesWithTwo: any = [];
  const applyFilesWithTwo: any = [];

  let homeplans: any = [];
  let homeresult: any = [];
  let resultText;

  const separateResultText = (resultText: string | undefined, maxLine = 21, charsOfLine = 42) => {
    if (resultText) {
      resultText = resultText.replace(/\n{2,}/g, '\n'); // 줄바꿈하나로 합치기
      resultText += '\n';

      const sentences = resultText.split('\n');

      const lines: string[][] = [];

      sentences.map((str) => {
        const chunks = splitStringByUnicode(str, charsOfLine);
        lines.push(chunks);
      });

      let textPage1 = '';
      let textPage2 = '';

      let lineIndexLength = 0;

      lines.forEach((lineArr) => {
        lineArr.forEach((line) => {
          if (lineIndexLength < maxLine) {
            textPage1 += line;
          } else {
            textPage2 += line;
          }
          lineIndexLength += 1;
        });
        if (lineIndexLength < maxLine) {
          textPage1 += '\n';
        } else {
          textPage2 += '\n';
        }
      });

      setResultTextPages((pages) => pages.concat(textPage1));
      if (textPage2) {
        separateResultText(textPage2, 28, 40);
      }
    }
  };
  useEffect(() => {
    separateResultText(fieldtrip?.resultText);
  }, [fieldtrip]);

  try {
    if (fieldtrip?.applyFiles instanceof Array) {
      let chunk = [];

      for (let i = 0; i < fieldtrip?.applyFiles?.length; i++) {
        chunk.push(fieldtrip?.applyFiles[i]);
        if (i % 2 === 1) {
          applyFilesWithTwo.push(chunk);
          chunk = [];
        }
      }
      if (chunk.length > 0) {
        applyFilesWithTwo.push(chunk);
      }
    }
  } catch (err) {
    console.log(err);
  }

  try {
    if (fieldtrip?.resultFiles instanceof Array) {
      let chunk = [];

      for (let i = 0; i < fieldtrip?.resultFiles?.length; i++) {
        chunk.push(fieldtrip?.resultFiles[i]);
        if (i % 2 === 1) {
          resultFilesWithTwo.push(chunk);
          chunk = [];
        }
      }
      if (chunk.length > 0) {
        resultFilesWithTwo.push(chunk);
      }
    }
  } catch (err) {
    console.log(err);
  }

  try {
    if (fieldtrip?.type === 'HOME') {
      const content = JSON.parse(fieldtrip?.content || '[]');
      if (content[0].subject1) {
        homeplans = content?.slice(1);
      } else {
        const subContent = content?.slice(5);
        homeplans = Array.from({ length: Math.ceil(subContent.length / 10) }, (_, index) =>
          subContent.slice(index * 10, index * 10 + 10),
        );
      }

      const _resultText = JSON.parse(fieldtrip?.resultText || '[]');
      resultText = _resultText[0];
      if (resultText.subject1) {
        homeresult = _resultText?.slice(1);
      } else {
        const subResult = _resultText?.slice(5);
        homeresult = Array.from({ length: Math.ceil(subResult.length / 10) }, (_, index) =>
          subResult.slice(index * 10, index * 10 + 10),
        );
      }
    }
  } catch (err) {
    console.log(err);
  }

  const _downloadPdf = async () => {
    if (fidletripPaperRef.current) {
      await extractReactData(orderBy, fidletripPaperRef.current, FieldtripPaperType.APPLICATION, fieldtrip);
      if (fieldtrip?.type === 'HOME' && separatePaperRefs.current) {
        await extractArrayData(orderBy, separatePaperRefs.current, FieldtripPaperType.APPLICATIONSEPARATE, fieldtrip);
      }
      if (fieldtrip?.type === 'SUBURBS' && separateImagePaperRefs.current) {
        await extractArrayData(orderBy, separateImagePaperRefs.current, FieldtripPaperType.APPLICATIONIMAGE, fieldtrip);
      }

      await extractReactData(orderBy, fidletripResultPaperRef.current, FieldtripPaperType.RESULT, fieldtrip);
      if (fieldtrip?.type === 'HOME' && separateResultPaperRefs.current) {
        await extractArrayData(orderBy, separateResultPaperRefs.current, FieldtripPaperType.RESULTSEPARATE, fieldtrip);
      }
      if (fieldtrip?.type === 'SUBURBS' && separateResultPaperRefs.current) {
        await extractArrayData(orderBy, separateResultPaperRefs.current, FieldtripPaperType.RESULTSEPARATE, fieldtrip);
      }
      if (fieldtrip?.type === 'SUBURBS' && separateResultImagePaperRefs.current) {
        await extractArrayData(
          orderBy,
          separateResultImagePaperRefs.current,
          FieldtripPaperType.RESULTIMAGE,
          fieldtrip,
        );
      }

      nextExtractPdfData();
    }
  };

  useEffect(() => {
    if (fieldtrip && isDownload) {
      _downloadPdf();
    }
  }, [fieldtrip, isDownload]);

  if (!fieldtrip) {
    return null;
  }

  return (
    <>
      {/* 신청서 영역 */}
      <div ref={fidletripPaperRef} className="h-[1100px] w-[778px] bg-white ">
        <FieldtripPaper school={me?.school} fieldtrip={fieldtrip} type="신청서" />
      </div>
      {fieldtrip?.type === 'HOME' && (
        <>
          {homeplans?.map((content: any, i: number) => (
            <div
              key={i}
              ref={(el) => separatePaperRefs.current !== null && (separatePaperRefs.current[i] = el)}
              className="h-[1100px] w-[778px] bg-white "
            >
              <FieldtripSeparatePaper
                studentName={fieldtrip?.student?.name + getNickName(fieldtrip?.student?.nickName)}
                studentGradeKlass={fieldtrip?.studentGradeKlass + ' ' + fieldtrip?.studentNumber + '번'}
                fieldtrip={fieldtrip}
                index={i + 1}
                content={content}
                type="신청서"
              />
            </div>
          ))}
        </>
      )}
      {fieldtrip?.type === 'SUBURBS' && (
        <>
          {applyFilesWithTwo.map((el: any, i: number) => (
            <div
              key={i}
              ref={(el) => separateImagePaperRefs.current !== null && (separateImagePaperRefs.current[i] = el)}
              className="h-[1100px] w-[778px] bg-white p-15"
            >
              <FieldtripSuburbsSeparatePaper
                studentName={(fieldtrip?.student?.name || '') + getNickName(fieldtrip?.student?.nickName)}
                fieldtrip={fieldtrip}
                resultFile1={el[0]}
                resultFile2={el[1]}
                title="신청서"
              />
            </div>
          ))}
        </>
      )}

      {/* 결과보고서 영역 */}
      <div ref={fidletripResultPaperRef} className="h-[1100px] w-[778px] bg-white ">
        <FieldtripPaper
          school={me?.school}
          fieldtrip={fieldtrip}
          content={resultText}
          type="결과보고서"
          resultTextPage1={resultTextPages[0]}
          isPaper={true}
        />
      </div>
      {fieldtrip?.type === 'HOME' && (
        <>
          {homeresult?.map((content: any, i: number) => (
            <div
              key={i}
              ref={(el) => separateResultPaperRefs.current !== null && (separateResultPaperRefs.current[i] = el)}
              className="h-[1100px] w-[778px] bg-white "
            >
              <FieldtripSeparatePaper
                studentName={fieldtrip?.student?.name + getNickName(fieldtrip?.student?.nickName)}
                studentGradeKlass={fieldtrip?.studentGradeKlass + ' ' + fieldtrip?.studentNumber + '번'}
                fieldtrip={fieldtrip}
                index={i + 1}
                content={content}
                type="결과보고서"
              />
            </div>
          ))}
        </>
      )}

      {fieldtrip?.type === 'SUBURBS' && resultTextPages.length > 1 && (
        <>
          {resultTextPages.slice(1).map((el: any, i: number) => (
            <div
              key={i}
              ref={(el) => separateResultPaperRefs.current !== null && (separateResultPaperRefs.current[i] = el)}
              className="h-[1100px] w-[778px] bg-white p-5"
            >
              <FieldtripSuburbsTextSeparatePaper
                studentName={fieldtrip?.student?.name || ''}
                fieldtrip={fieldtrip}
                resultTextPage={el}
              />
            </div>
          ))}
        </>
      )}
      {fieldtrip?.type === 'SUBURBS' && (
        <>
          {resultFilesWithTwo.map((el: any, i: number) => (
            <div
              key={i}
              ref={(el) =>
                separateResultImagePaperRefs.current !== null && (separateResultImagePaperRefs.current[i] = el)
              }
              className="h-[1100px] w-[778px] bg-white p-12"
            >
              <FieldtripSuburbsSeparatePaper
                studentName={(fieldtrip?.student?.name || '') + getNickName(fieldtrip?.student?.nickName)}
                fieldtrip={fieldtrip}
                resultFile1={el[0]}
                resultFile2={el[1]}
              />
            </div>
          ))}
        </>
      )}
    </>
  );
}
