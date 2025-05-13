import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PageSizes, rgb } from 'pdf-lib'

import { type ResponseIBTokExhibitionPlanDto } from '@/legacy/generated/model'

import { pxToPoint, drawSection } from '../pdf-lib'

export const createTokExhibitionPlanPdf = async (
  { klassNum, name }: { klassNum: string; name: string },
  data: ResponseIBTokExhibitionPlanDto,
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
  currentPage.drawText('전시회 기획안', {
    x: width / 2 - pxToPoint(95),
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

  // 질문 섹션 그리기
  const questionResult = await drawSection({
    title: '질문',
    content: data?.themeQuestion || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = questionResult.lastY
  currentPage = questionResult.currentPage

  // 질문 설명 섹션 그리기
  const descriptionResult = await drawSection({
    title: '질문 설명',
    content: data?.description || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = descriptionResult.lastY
  currentPage = descriptionResult.currentPage

  // 지식영역 섹션 그리기
  const knowledgeAreaResult = await drawSection({
    title: '지식영역',
    content: data?.knowledgeArea?.join(', ') || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = knowledgeAreaResult.lastY
  currentPage = knowledgeAreaResult.currentPage

  // 라인 그리기
  currentPage.drawLine({
    start: { x: pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    end: { x: width - pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // ================================================
  // 대상1 섹션 그리기
  const target1Result = await drawSection({
    title: '대상1',
    content: data?.target1 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target1Result.lastY
  currentPage = target1Result.currentPage

  // 대상1 연관 개념 렌즈 섹션 그리기
  const target1RelatedConceptResult = await drawSection({
    title: '연관 개념 렌즈',
    content: data?.conceptualLens1 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target1RelatedConceptResult.lastY
  currentPage = target1RelatedConceptResult.currentPage

  // 대상1 Knowledge Frame 섹션 그리기
  const target1KnowledgeFrameResult = await drawSection({
    title: 'Knowledge Frame',
    content: data?.knowledgeFrame1 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target1KnowledgeFrameResult.lastY
  currentPage = target1KnowledgeFrameResult.currentPage

  // 라인 그리기
  currentPage.drawLine({
    start: { x: pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    end: { x: width - pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // ================================================
  // 대상2 섹션 그리기
  const target2Result = await drawSection({
    title: '대상2',
    content: data?.target2 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target2Result.lastY
  currentPage = target2Result.currentPage

  // 대상2 연관 개념 렌즈 섹션 그리기
  const target2RelatedConceptResult = await drawSection({
    title: '연관 개념 렌즈',
    content: data?.conceptualLens2 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target2RelatedConceptResult.lastY
  currentPage = target2RelatedConceptResult.currentPage

  // 대상2 Knowledge Frame 섹션 그리기
  const target2KnowledgeFrameResult = await drawSection({
    title: 'Knowledge Frame',
    content: data?.knowledgeFrame2 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target2KnowledgeFrameResult.lastY
  currentPage = target2KnowledgeFrameResult.currentPage

  // 라인 그리기
  currentPage.drawLine({
    start: { x: pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    end: { x: width - pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // ================================================
  // 대상3 섹션 그리기
  const target3Result = await drawSection({
    title: '대상3',
    content: data?.target3 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target3Result.lastY
  currentPage = target3Result.currentPage

  // 대상3 연관 개념 렌즈 섹션 그리기
  const target3RelatedConceptResult = await drawSection({
    title: '연관 개념 렌즈',
    content: data?.conceptualLens3 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target3RelatedConceptResult.lastY
  currentPage = target3RelatedConceptResult.currentPage

  // 대상3 Knowledge Frame 섹션 그리기
  const target3KnowledgeFrameResult = await drawSection({
    title: 'Knowledge Frame',
    content: data?.knowledgeFrame3 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target3KnowledgeFrameResult.lastY
  currentPage = target3KnowledgeFrameResult.currentPage

  // 라인 그리기
  currentPage.drawLine({
    start: { x: pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    end: { x: width - pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // ================================================
  // Commentary 섹션 그리기
  const commentaryData = data?.commentary.map((commentary) => {
    return `${data[commentary.targetKey as keyof ResponseIBTokExhibitionPlanDto]}: ${commentary.checkedAttributes.join(', ')}`
  })

  await drawSection({
    title: 'Commentary 구성',
    content: commentaryData?.join('\n') || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}
