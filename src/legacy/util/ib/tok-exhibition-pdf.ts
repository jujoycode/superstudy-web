import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PageSizes } from 'pdf-lib'

import type { ResponseExhibitionDto } from '@/legacy/generated/model'

import { pxToPoint, drawSection, drawSectionWithImage } from '../pdf-lib'

export const createTokExhibitionPdf = async (
  { klassNum, name }: { klassNum: string; name: string },
  data: ResponseExhibitionDto,
) => {
  const totalWordCount: number =
    data?.introductionWordCount + data?.wordCount1 + data?.wordCount2 + data?.wordCount3 + data?.conclusionWordCount

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
  currentPage.drawText('전시회', {
    x: width / 2 - pxToPoint(40),
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

  // 우측 정렬을 위한 시작점 계산 (페이지 오른쪽 여백에서 텍스트 너비만큼 왼쪽으로)
  const rightAlignedX = width - pxToPoint(64) - textWidth

  // 학년 반 이름 그리기
  currentPage.drawText(text, {
    x: rightAlignedX,
    y: currentYPosition,
    size: 12,
    font: customDotSansFont,
  })

  // 학년 반 이름과 총 단어 수 사이 간격
  currentYPosition -= pxToPoint(20)

  // 총 단어 수 문자열 생성
  const totalWordCountText = `총 단어수: ${totalWordCount}`
  const totalWordCountTextWidth = customDotSansFont.widthOfTextAtSize(totalWordCountText, 10)

  // 총 단어 수 문자열 우측 정렬
  const totalWordCountTextX = width - pxToPoint(64) - totalWordCountTextWidth

  // 총 단어 수 문자열 그리기
  currentPage.drawText(totalWordCountText, {
    x: totalWordCountTextX,
    y: currentYPosition,
    size: 10,
    font: customDotSansFont,
  })

  // 학년 반 이름과 서론 사이 간격
  currentYPosition -= pxToPoint(60)

  // 섹션 옵션 설정
  const sectionOptions = {
    pdfDoc: pdfDoc,
    width: width,
    titleFont: customNanumGothicBoldFont,
    contentFont: customDotSansFont,
    bottomPadding: BOTTOM_PADDING,
  }

  // 이미지 섹션 옵션 설정
  const imageSectionOptions = {
    pdfDoc: pdfDoc,
    width: width,
    height: height,
    topPadding: TOP_PADDING,
    titleFont: customNanumGothicBoldFont,
    contentFont: customDotSansFont,
    bottomPadding: BOTTOM_PADDING,
  }

  // 서론 섹션 그리기
  const introResult = await drawSection({
    title: `서론 - 단어수: ${data?.introductionWordCount}`,
    content: data?.introduction || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = introResult.lastY
  currentPage = introResult.currentPage

  // 대상1 섹션 (이미지 포함) 그리기
  const target1Result = await drawSectionWithImage({
    title: '대상1',
    content: data?.targetContent1 || '-',
    imageUrl: data?.targetImage1 || '',
    wordCount: data?.wordCount1,
    yPosition: currentYPosition,
    page: currentPage,
    options: imageSectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target1Result.lastY
  currentPage = target1Result.currentPage

  // 대상2 섹션 (이미지 포함) 그리기
  const target2Result = await drawSectionWithImage({
    title: '대상2',
    content: data?.targetContent2 || '-',
    imageUrl: data?.targetImage2 || '',
    wordCount: data?.wordCount2,
    yPosition: currentYPosition,
    page: currentPage,
    options: imageSectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target2Result.lastY
  currentPage = target2Result.currentPage

  // 대상3 섹션 (이미지 포함) 그리기
  const target3Result = await drawSectionWithImage({
    title: '대상3',
    content: data?.targetContent3 || '-',
    imageUrl: data?.targetImage3 || '',
    wordCount: data?.wordCount3,
    yPosition: currentYPosition,
    page: currentPage,
    options: imageSectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = target3Result.lastY
  currentPage = target3Result.currentPage

  // 결론 섹션 그리기
  const conclusionResult = await drawSection({
    title: `결론 - 단어수: ${data?.conclusionWordCount}`,
    content: data?.conclusion || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  // 현재 페이지와 Y 위치 업데이트
  currentYPosition = conclusionResult.lastY
  currentPage = conclusionResult.currentPage

  // Reference 섹션 그리기
  await drawSection({
    title: 'Reference',
    content: data?.reference || '-',
    yPosition: currentYPosition,
    page: currentPage,
    options: sectionOptions,
  })

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}
