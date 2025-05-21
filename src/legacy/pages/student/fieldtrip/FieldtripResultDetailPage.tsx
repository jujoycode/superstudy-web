import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { FieldtripPaper } from '@/legacy/components/fieldtrip/FieldtripPaper'
import { FieldtripSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSeparatePaper'
import { FieldtripSuburbsSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSuburbsSeparatePaper'
import { FieldtripSuburbsTextSeparatePaper } from '@/legacy/components/fieldtrip/FieldtripSuburbsTextSeparatePaper'
import { Constants } from '@/legacy/constants'
import { useFieldtripResultDetail } from '@/legacy/container/student-fieldtrip-result-detail'
import { UserContainer } from '@/legacy/container/user'
import { FieldtripStatus, Role } from '@/legacy/generated/model'
import { splitStringByUnicode } from '@/legacy/util/fieldtrip'
import { isPdfFile } from '@/legacy/util/file'
import { getNickName } from '@/legacy/util/status'

export function FieldtripResultDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { push } = useHistory()
  const { me } = UserContainer.useContext()

  const { isLoading, isError, resendAlimtalk, fieldtrip, errorMessage } = useFieldtripResultDetail({
    id: Number(id),
  })

  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)

  const images = fieldtrip?.resultFiles.filter((image) => !isPdfFile(image)) || []

  const viewerImages: ImageDecorator[] = []
  for (const image of images) {
    if (isPdfFile(image) == false) {
      viewerImages.push({
        src: `${Constants.imageUrl}${image}`,
      })
    }
  }

  let content = []

  try {
    content = JSON.parse(fieldtrip?.resultText || '[]')
  } catch (err) {
    console.log(err)
  }

  const [resultTextPages, setResultTextPages] = useState<string[]>([])

  const separateResultText = (resultText: string | undefined, maxLine = 21, charsOfLine = 42) => {
    if (resultText) {
      resultText = resultText.replace(/\n{2,}/g, '\n') // 줄바꿈하나로 합치기
      resultText += '\n'

      const sentences = resultText.split('\n')

      const lines: string[][] = []

      sentences.map((str) => {
        const chunks = splitStringByUnicode(str, charsOfLine)
        lines.push(chunks)
      })

      let textPage1 = ''
      let textPage2 = ''

      let lineIndexLength = 0

      lines.forEach((lineArr) => {
        lineArr.forEach((line) => {
          if (lineIndexLength < maxLine) {
            textPage1 += line
          } else {
            textPage2 += line
          }
          lineIndexLength += 1
        })
        if (lineIndexLength < maxLine) {
          textPage1 += '\n'
        } else {
          textPage2 += '\n'
        }
      })

      setResultTextPages((pages) => pages.concat(textPage1))
      if (textPage2) {
        separateResultText(textPage2, 28, 40)
      }
    }
  }
  useEffect(() => {
    separateResultText(fieldtrip?.resultText)
  }, [fieldtrip])

  let homeplans: string[] = []
  const resultFilesWithTwo: string[][] = []

  try {
    if (fieldtrip?.type === 'HOME') {
      const _content = JSON.parse(fieldtrip?.resultText || '[]')
      content = _content[0]
      if (content.subject1) {
        homeplans = _content?.slice(1)
      } else {
        const subContent = _content?.slice(5)
        homeplans = Array.from({ length: Math.ceil(subContent.length / 10) }, (_, index) =>
          subContent.slice(index * 10, index * 10 + 10),
        )
      }
    }
  } catch (err) {
    console.log(err)
  }

  try {
    if (fieldtrip?.resultFiles instanceof Array) {
      let chunk = []

      for (let i = 0; i < fieldtrip?.resultFiles?.length; i++) {
        chunk.push(fieldtrip?.resultFiles[i])
        if (i % 2 === 1) {
          resultFilesWithTwo.push(chunk)
          chunk = []
        }
      }
      if (chunk.length > 0) {
        resultFilesWithTwo.push(chunk)
      }
    }
  } catch (err) {
    console.log(err)
  }

  return (
    <>
      {isLoading && <Blank />}
      {isError && <ErrorBlank />}
      {isLoading && <Blank />}
      <TopNavbar
        title="체험학습 결과보고서 상세"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />

      {fieldtrip?.fieldtripResultStatus === 'RETURNED' && (
        <div className="bg-brand-5 flex items-center justify-between rounded-lg px-5 py-2">
          <div className="text-primary-800 text-sm">{fieldtrip?.notApprovedReason}</div>
          <div className="text-red-500">반려 이유</div>
        </div>
      )}

      <div className="w-full bg-white p-5">
        <FieldtripPaper
          school={me?.school}
          fieldtrip={fieldtrip}
          content={content}
          type="결과보고서"
          resultTextPage1={resultTextPages[0]}
        />
      </div>

      {fieldtrip?.type === 'HOME' && (
        <>
          {homeplans?.map((content: string, i: number) => (
            <div key={i} className="w-full bg-white p-5">
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

      {fieldtrip?.type === 'SUBURBS' && resultTextPages.length > 0 && (
        <>
          {resultTextPages.slice(1).map((el: string, i: number) => (
            <div key={i} className="w-full bg-white p-5">
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
          {resultFilesWithTwo.map((el: string[], i: number) => (
            <div key={i} className="w-full bg-white p-5">
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

      <Section>
        {fieldtrip?.type === 'SUBURBS' && (
          <>
            {me?.role === Role.PARENT && fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM && (
              <Button.lg
                children="승인하기"
                onClick={() => push(`/fieldtrip/result/approve/${fieldtrip?.id}`)}
                className={'bg-primary-800 text-white'}
              />
            )}

            {(fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM ||
              fieldtrip?.fieldtripResultStatus === FieldtripStatus.RETURNED ||
              fieldtrip?.nextResultApprover === 'resultApprover1') && (
              <Button.lg
                children="수정하기"
                onClick={() => push(`/student/fieldtrip/add/report/suburbs/${fieldtrip.id}`)}
                className={'bg-yellow-500 text-white'}
              />
            )}
            {me?.role != Role.PARENT && fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM && (
              <Button.lg
                children="알림톡 재전송하기"
                onClick={() => resendAlimtalk()}
                className="bg-blue-500 text-white"
              />
            )}
            <div className="text-red-500">{errorMessage}</div>
          </>
        )}
        {fieldtrip?.type === 'HOME' && (
          <>
            {me?.role === Role.PARENT && fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM && (
              <Button.lg
                children="승인하기"
                onClick={() => push(`/fieldtrip/result/approve/${fieldtrip?.id}`)}
                className={'bg-primary-800 text-white'}
              />
            )}

            {(fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM ||
              fieldtrip?.fieldtripResultStatus === FieldtripStatus.RETURNED ||
              fieldtrip?.nextResultApprover === 'resultApprover1') && (
              <Button.lg
                children="수정하기"
                onClick={() => push(`/student/fieldtrip/add/report/home/${fieldtrip.id}`)}
                className={'bg-yellow-500 text-white'}
              />
            )}
            {me?.role != Role.PARENT && fieldtrip?.fieldtripResultStatus === FieldtripStatus.BEFORE_PARENT_CONFIRM && (
              <Button.lg
                children="알림톡 재전송하기"
                onClick={() => resendAlimtalk()}
                className="bg-blue-500 text-white"
              />
            )}
            <div className="text-red-500">{errorMessage}</div>
          </>
        )}

        <br />

        <div className="h-32 w-full" />
      </Section>
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(_, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
      <div className="absolute">
        <PdfViewer isOpen={hasPdfModalOpen} fileUrl={''} onClose={() => setPdfModalOpen(false)} />
      </div>
    </>
  )
}
