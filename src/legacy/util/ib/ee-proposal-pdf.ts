import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PageSizes } from 'pdf-lib'

import { type ResponseIBProposalDto } from '@/legacy/generated/model'

import { pxToPoint, drawSection } from '../pdf-lib'

export const createEeProposalPdf = async (
  { klassNum, name }: { klassNum: string; name: string },
  data: ResponseIBProposalDto,
) => {
  const pdfDoc = await PDFDocument.create()

  // fontkit 등록
  pdfDoc.registerFontkit(fontkit)

  // 폰트 파일 로드 및 임베드
  const dotSansFontBytes = await fetch('/fonts/42dotSans-VariableFont_wght.ttf').then((res) => res.arrayBuffer())
  const customDotSansFont = await pdfDoc.embedFont(dotSansFontBytes)

  const nanumGothicBoldFontBytes = await fetch('/fonts/NanumGothicBold.ttf').then((res) => res.arrayBuffer())
  const customNanumGothicBoldFont = await pdfDoc.embedFont(nanumGothicBoldFontBytes)

  const page = pdfDoc.addPage(PageSizes.A4)

  // 페이지 크기 가져오기
  const { width, height } = page.getSize()

  // 패딩 설정
  const TOP_PADDING = pxToPoint(64)
  const BOTTOM_PADDING = pxToPoint(64)

  let currentPage = page
  let currentYPosition = height - TOP_PADDING

  // 제목 그리기
  const title = '제안서'
  // 해당 텍스트의 특정 폰트, 크기에서의 너비 계산
  const titleWidth = customDotSansFont.widthOfTextAtSize(title, 24)

  currentPage.drawText(title, {
    x: width / 2 - titleWidth / 2,
    y: currentYPosition,
    size: 24,
    font: customNanumGothicBoldFont,
  })

  // 제목과 학년 이름 사이 간격
  currentYPosition -= pxToPoint(36)

  // 학년 반 이름 문자열 생성
  const text = `${klassNum} · ${name}`

  // 해당 텍스트의 특정 폰트, 크기에서의 너비 계산
  const textWidth = customDotSansFont.widthOfTextAtSize(text, 12)

  // 우측 정렬을 위한 시작점 계산
  const rightAlignedX = width - pxToPoint(64) - textWidth

  // 학년 반 이름 그리기
  currentPage.drawText(text, {
    x: rightAlignedX,
    y: currentYPosition,
    size: 12,
    font: customDotSansFont,
  })

  // 학년 반 이름과 질문 사이 간격
  currentYPosition -= pxToPoint(60)

  // 섹션 옵션 설정
  const sectionOptions = {
    pdfDoc: pdfDoc,
    width: width,
    titleFont: customNanumGothicBoldFont,
    contentFont: customDotSansFont,
    bottomPadding: BOTTOM_PADDING,
  }

  // 과목 섹션 그리기
  const subjectResult = await drawSection({
    title: '과목',
    content: data?.subject || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = subjectResult.lastY
  currentPage = subjectResult.currentPage

  // 세부 카테고리 섹션 그리기
  const categoryResult = await drawSection({
    title: '세부 카테고리',
    content: data?.category || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = categoryResult.lastY
  currentPage = categoryResult.currentPage

  // 모델 논문 섹션 그리기
  const modelPaperResult = await drawSection({
    title: '모델 논문',
    content: data?.modelPaper || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = modelPaperResult.lastY
  currentPage = modelPaperResult.currentPage

  // 모델 논문 요약 섹션 그리기
  const modelPaperSummaryResult = await drawSection({
    title: '모델 논문 요약',
    content: data?.modelPaperSummary || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = modelPaperSummaryResult.lastY
  currentPage = modelPaperSummaryResult.currentPage

  // 연구 주제 섹션 그리기
  const researchTopicResult = await drawSection({
    title: '연구 주제',
    content: data?.researchTopic || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = researchTopicResult.lastY
  currentPage = researchTopicResult.currentPage

  // 연구 질문 섹션 그리기
  const researchQuestionResult = await drawSection({
    title: '연구 질문',
    content: data?.researchQuestion || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = researchQuestionResult.lastY
  currentPage = researchQuestionResult.currentPage

  // 연구의 필요성 섹션 그리기
  const researchNeedResult = await drawSection({
    title: '연구의 필요성',
    content: data?.researchNeed || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = researchNeedResult.lastY
  currentPage = researchNeedResult.currentPage

  // 연구 방법 섹션 그리기
  await drawSection({
    title: '연구 방법',
    content: data?.researchMethod || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}
