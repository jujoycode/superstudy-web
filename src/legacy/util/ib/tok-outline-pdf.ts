import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PageSizes, rgb } from 'pdf-lib'

import { type ResponseIBTokOutlineDto } from '@/legacy/generated/model'

import { pxToPoint, drawSection } from '../pdf-lib'

export const createTokOutlinePdf = async (
  { klassNum, name }: { klassNum: string; name: string },
  data: ResponseIBTokOutlineDto,
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
  currentPage.drawText('아웃라인', {
    x: width / 2 - pxToPoint(60),
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
    title: '주제 질문',
    content: data?.themeQuestion || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = questionResult.lastY
  currentPage = questionResult.currentPage

  // 질문 설명 섹션 그리기
  const keywordResult = await drawSection({
    title: '핵심용어 (설명)',
    content: data?.keyword || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = keywordResult.lastY
  currentPage = keywordResult.currentPage

  // 주제 내용 섹션 그리기
  const contentResult = await drawSection({
    title: '본인이 이해한 주제의 내용은?',
    content: data?.content || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = contentResult.lastY
  currentPage = contentResult.currentPage

  // 라인 그리기
  currentPage.drawLine({
    start: { x: pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    end: { x: width - pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // ================================================
  // 지식영역1 섹션 그리기
  const knowledgeArea1Result = await drawSection({
    title: '지식영역1',
    content: data?.knowledgeArea1 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = knowledgeArea1Result.lastY
  currentPage = knowledgeArea1Result.currentPage

  // 지식영역1 주장 섹션 그리기
  const argument1Result = await drawSection({
    title: '지식주장',
    content: data?.argument1 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = argument1Result.lastY
  currentPage = argument1Result.currentPage

  // 지식영역1 주장 예시 섹션 그리기
  const argument1ExampleResult = await drawSection({
    title: '지식주장 예시',
    content: data?.argument1Example || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = argument1ExampleResult.lastY
  currentPage = argument1ExampleResult.currentPage

  // 지식영역1 반론 섹션 그리기
  const counterArgument1Result = await drawSection({
    title: '반론',
    content: data?.counterArgument1 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = counterArgument1Result.lastY
  currentPage = counterArgument1Result.currentPage

  // 지식영역1 반론 예시 섹션 그리기
  const counterArgument1ExampleResult = await drawSection({
    title: '반론 예시',
    content: data?.counterArgument1Example || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = counterArgument1ExampleResult.lastY
  currentPage = counterArgument1ExampleResult.currentPage

  // 라인 그리기
  currentPage.drawLine({
    start: { x: pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    end: { x: width - pxToPoint(64), y: currentYPosition + pxToPoint(30) },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // ================================================
  // 지식영역2 섹션 그리기
  const knowledgeArea2Result = await drawSection({
    title: '지식영역2',
    content: data?.knowledgeArea2 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = knowledgeArea2Result.lastY
  currentPage = knowledgeArea2Result.currentPage

  // 지식영역2 주장 섹션 그리기
  const argument2Result = await drawSection({
    title: '지식주장',
    content: data?.argument2 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = argument2Result.lastY
  currentPage = argument2Result.currentPage

  // 지식영역2 주장 예시 섹션 그리기
  const argument2ExampleResult = await drawSection({
    title: '지식주장 예시',
    content: data?.argument2Example || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = argument2ExampleResult.lastY
  currentPage = argument2ExampleResult.currentPage

  // 지식영역2 반론 섹션 그리기
  const counterArgument2Result = await drawSection({
    title: '반론',
    content: data?.counterArgument2 || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = counterArgument2Result.lastY
  currentPage = counterArgument2Result.currentPage

  // 지식영역2 반론 예시 섹션 그리기
  await drawSection({
    title: '반론 예시',
    content: data?.counterArgument2Example || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}
