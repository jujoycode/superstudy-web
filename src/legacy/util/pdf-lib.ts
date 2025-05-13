import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib'

import { Constants } from '@/legacy/constants'

/**
 * 픽셀(px)을 포인트(pt) 단위로 변환하는 함수
 * @param px - 변환할 픽셀 값
 * @param dpi - 디스플레이의 DPI (기본값: 96)
 * @returns 변환된 포인트 값
 */
const pxToPoint = (px: number, dpi = 96): number => {
  // 포인트 = 픽셀 * (72 / DPI)
  return px * (72 / dpi)
}

/**
 * 텍스트를 주어진 폰트, 폰트 크기, 최대 너비에 맞게 여러 줄로 분리하는 함수
 * @param text - 분리할 텍스트
 * @param font - 사용할 폰트 객체
 * @param fontSize - 폰트 크기
 * @param maxWidth - 한 줄의 최대 너비
 * @returns 분리된 텍스트 라인 배열
 */
const splitTextIntoLines = (text: string, font: any, fontSize: number, maxWidth: number) => {
  if (!text || text === '-') return ['-']

  // 먼저 사용자 입력 줄바꿈(\n)을 기준으로 분리
  const paragraphs = text.split('\n')
  const lines: string[] = []

  // 각 단락별로 처리
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      // 빈 줄 처리
      lines.push(' ') // 빈 줄도 공간을 차지하도록 처리
      continue
    }

    const words = paragraph.split(' ')
    let currentLine = ''

    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      // 현재 단어를 추가했을 때 너비 체크
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const testWidth = font.widthOfTextAtSize(testLine, fontSize)

      if (testWidth <= maxWidth) {
        currentLine = testLine
      } else {
        // 한 단어가 너무 길어 한 줄에 들어가지 않는 경우
        if (!currentLine) {
          // 문자 단위로 분할
          let charLine = ''
          for (let j = 0; j < word.length; j++) {
            const testChar = charLine + word[j]
            if (font.widthOfTextAtSize(testChar, fontSize) <= maxWidth) {
              charLine = testChar
            } else {
              lines.push(charLine)
              charLine = word[j]
            }
          }
          if (charLine) lines.push(charLine)
          currentLine = ''
        } else {
          // 일반적인 경우
          lines.push(currentLine)
          currentLine = word
        }
      }
    }

    if (currentLine) lines.push(currentLine)
  }

  return lines
}

/**
 * 여러 줄 텍스트를 그리고 사용된 높이를 반환하는 함수 (페이지 패딩 적용)
 * @param text - 그릴 텍스트
 * @param page - 현재 PDF 페이지 객체
 * @param options - 텍스트 그리기 옵션 객체
 * @param options.x - x 좌표
 * @param options.y - y 좌표 (시작 위치)
 * @param options.font - 사용할 폰트 객체
 * @param options.fontSize - 폰트 크기
 * @param options.maxWidth - 한 줄의 최대 너비
 * @param options.lineHeight - 줄 간격
 * @param options.pdfDoc - PDF 문서 객체 (새 페이지 생성용)
 * @param options.bottomPadding - 페이지 하단 패딩 (기본값: 40pt)
 * @returns 텍스트 블록의 총 높이와 마지막 Y 위치, 다음 페이지 참조
 */
const drawTextBlock = async (
  text: string,
  page: PDFPage,
  options: {
    x: number
    y: number
    font: PDFFont
    fontSize: number
    maxWidth: number
    lineHeight: number
    pdfDoc: PDFDocument
    bottomPadding: number
  },
) => {
  const { x, y, font, fontSize, maxWidth, lineHeight, pdfDoc, bottomPadding } = options

  // 텍스트를 여러 줄로 분리
  const lines = splitTextIntoLines(text, font, fontSize, maxWidth)

  // 각 줄을 그림
  let currentY = y
  let totalHeight = 0
  let currentPage = page

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 현재 줄이 하단 패딩을 침범하는지 확인
    if (currentY - lineHeight < bottomPadding) {
      // 새 페이지가 필요하고 PDF 문서가 제공된 경우
      if (pdfDoc) {
        // 새 페이지 생성
        currentPage = pdfDoc.addPage()
        const { height: pageHeight } = currentPage.getSize()
        currentY = pageHeight - pxToPoint(64) // 상단 패딩 적용
      } else {
        // pdfDoc이 제공되지 않았으면 그냥 그리기를 중단하고 높이 반환
        return { height: totalHeight, lastY: currentY, currentPage, needsNewPage: true }
      }
    }

    // 현재 줄 그리기
    currentPage.drawText(line, {
      x,
      y: currentY,
      size: fontSize,
      font,
    })

    // Y 위치 업데이트
    currentY -= lineHeight
    totalHeight += lineHeight
  }

  return {
    height: totalHeight,
    lastY: currentY,
    currentPage,
    needsNewPage: currentY < bottomPadding,
  }
}

/**
 * drawTextBlock 호출 후 페이지 관리를 위한 헬퍼 함수
 * @param text - 그릴 텍스트
 * @param yPosition - 시작 Y 좌표 위치
 * @param currentPage - 현재 PDF 페이지 객체
 * @param pdfDoc - PDF 문서 객체
 * @param pageWidth - 페이지 너비
 * @param options - 텍스트 그리기 옵션
 * @param options.font - 사용할 폰트 객체
 * @param options.fontSize - 폰트 크기
 * @param options.bottomPadding - 페이지 하단 패딩
 * @returns 마지막 Y 위치와 현재 페이지 객체를 포함하는 객체
 */
const drawTextAndManagePages = async ({
  text,
  yPosition,
  currentPage,
  pdfDoc,
  pageWidth,
  options,
}: {
  text: string
  yPosition: number
  currentPage: PDFPage
  pdfDoc: PDFDocument
  pageWidth: number
  options: {
    font: PDFFont
    fontSize: number
    bottomPadding: number
  }
}) => {
  const result = await drawTextBlock(text, currentPage, {
    x: pxToPoint(64),
    y: yPosition,
    font: options.font,
    fontSize: options.fontSize,
    maxWidth: pageWidth - pxToPoint(128),
    lineHeight: pxToPoint(24),
    pdfDoc: pdfDoc,
    bottomPadding: options.bottomPadding,
  })

  // 현재 페이지 업데이트 (중요: drawTextBlock에서 새 페이지를 생성했을 수 있음)
  currentPage = result.currentPage

  return { lastY: result.lastY, currentPage: result.currentPage }
}

/**
 * 파일을 ArrayBuffer로 변환하는 함수
 * @param file - 변환할 파일 객체
 * @returns Promise<ArrayBuffer> - 변환된 ArrayBuffer
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 이미지를 PDF 페이지에 추가하는 함수
 * @param page - 이미지를 추가할 PDF 페이지
 * @param image - 추가할 이미지 파일
 * @param options - 이미지 추가 옵션
 * @param options.x - 이미지 x 좌표 (기본값: 0)
 * @param options.y - 이미지 y 좌표 (기본값: 0)
 * @param options.width - 이미지 너비 (기본값: 자동 계산)
 * @param options.height - 이미지 높이 (기본값: 자동 계산)
 * @param options.fit - 페이지에 맞게 이미지 크기 조정 (기본값: false)
 * @returns Promise<{ width: number, height: number }> - 추가된 이미지의 너비와 높이
 */
const drawImageToPdf = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  image: File,
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    fit?: boolean
  } = {},
) => {
  const { x = 0, y = 0, fit = false } = options

  // 이미지 임베드
  const embeddedImage = await pdfDoc.embedJpg(await readFileAsArrayBuffer(image))

  // pdf-lib에서 이미지 타입에 따라 embedPng 또는 embedJpg를 사용하게 했지만, embedPng가 정상적으로 동작하지 않고, png 파일이어도 embedJpg 메서드가 동작하는 것을 발견해서 이미지 타입과 상관없이 embedJpg 메서드를 사용하도록 하였음. 추후 이미지 타입에 따른 문제가 되면 아래 주석을 해제해서 타입별로 메서드 사용하게 하면 됨.
  // 참고(embedPng): https://pdf-lib.js.org/docs/api/classes/pdfdocument#embedpng
  // 참고(embedJpg): https://pdf-lib.js.org/docs/api/classes/pdfdocument#embedjpg

  // let embeddedImage;
  // if (image.type === 'image/jpeg') {
  //   embeddedImage = await pdfDoc.embedJpg(await readFileAsArrayBuffer(image));
  // } else if (image.type === 'image/png') {
  //   embeddedImage = await pdfDoc.embedPng(await readFileAsArrayBuffer(image));
  // } else {
  //   throw new Error(`이미지 타입 ${image.type}은 지원되지 않습니다. PNG 또는 JPEG 형식만 사용할 수 있습니다.`);
  // }

  // 이미지 크기 계산
  const imgWidth = options.width || embeddedImage.width
  const imgHeight = options.height || embeddedImage.height

  // 페이지 크기
  const pageWidth = page.getSize().width
  const pageHeight = page.getSize().height

  // 이미지 크기 조정 (fit 옵션이 true인 경우)
  let finalWidth = imgWidth
  let finalHeight = imgHeight

  if (fit) {
    const widthRatio = pageWidth / imgWidth
    const heightRatio = pageHeight / imgHeight
    const ratio = Math.min(widthRatio, heightRatio)

    finalWidth = imgWidth * ratio
    finalHeight = imgHeight * ratio
  }

  // 이미지 그리기
  page.drawImage(embeddedImage, {
    x,
    y,
    width: finalWidth,
    height: finalHeight,
  })

  return { width: finalWidth, height: finalHeight }
}

/**
 * URL에서 이미지를 가져와 PDF 페이지에 추가하는 함수
 * @param pdfDoc - PDF 문서 객체
 * @param page - 이미지를 추가할 PDF 페이지
 * @param imageUrl - 이미지 URL
 * @param options - 이미지 추가 옵션
 * @returns Promise<{ width: number, height: number }> - 추가된 이미지의 너비와 높이
 */
const drawImageFromUrl = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  imageUrl: string,
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    fit?: boolean
  } = {},
) => {
  const { x = 0, y = 0, fit = false } = options

  // 이미지 데이터 가져오기
  const response = await fetch(`${Constants.imageUrl}${imageUrl}`)
  const imageData = await response.arrayBuffer()

  // pdf-lib에서 이미지 타입에 따라 embedPng 또는 embedJpg를 사용하게 했지만, embedPng가 정상적으로 동작하지 않고, png 파일이어도 embedJpg 메서드가 동작하는 것을 발견해서 이미지 타입과 상관없이 embedJpg 메서드를 사용하도록 하였음. 추후 이미지 타입에 따른 문제가 되면 아래 주석을 해제해서 타입별로 메서드 사용하게 하면 됨.
  // 참고(embedPng): https://pdf-lib.js.org/docs/api/classes/pdfdocument#embedpng
  // 참고(embedJpg): https://pdf-lib.js.org/docs/api/classes/pdfdocument#embedjpg

  // 이미지 타입 감지
  // const contentType = response.headers.get('content-type') || '';

  // 이미지 임베드
  const embeddedImage = await pdfDoc.embedJpg(imageData)
  // let embeddedImage;
  // if (
  //   contentType.includes('image/jpeg') ||
  //   imageUrl.toLowerCase().endsWith('.jpg') ||
  //   imageUrl.toLowerCase().endsWith('.jpeg')
  // ) {
  //   embeddedImage = await pdfDoc.embedJpg(imageData);
  // } else if (contentType.includes('image/png') || imageUrl.toLowerCase().endsWith('.png')) {
  //   console.log('png');
  //   embeddedImage = await pdfDoc.embedPng(imageData);
  //   console.log('embeddedImage', embeddedImage);
  // } else {
  //   throw new Error(`이미지 타입 ${contentType}은 지원되지 않습니다. PNG 또는 JPEG 형식만 사용할 수 있습니다.`);
  // }

  // 이미지 크기 계산
  const imgWidth = options.width || embeddedImage.width
  const imgHeight = options.height || embeddedImage.height

  // 페이지 크기
  const pageWidth = page.getSize().width
  const pageHeight = page.getSize().height

  // 이미지 크기 조정 (fit 옵션이 true인 경우)
  let finalWidth = imgWidth
  let finalHeight = imgHeight

  if (fit) {
    const widthRatio = pageWidth / imgWidth
    const heightRatio = pageHeight / imgHeight
    const ratio = Math.min(widthRatio, heightRatio)

    finalWidth = imgWidth * ratio
    finalHeight = imgHeight * ratio
  }

  // 이미지 그리기
  page.drawImage(embeddedImage, {
    x,
    y,
    width: finalWidth,
    height: finalHeight,
  })

  return { width: finalWidth, height: finalHeight }
}

/**
 * PDF에 섹션을 그리는 함수
 * @param title - 섹션 제목
 * @param content - 섹션 내용
 * @param yPosition - 시작 Y 좌표 위치
 * @param page - 현재 PDF 페이지 객체
 * @param options - 섹션 그리기 옵션
 * @param options.pdfDoc - PDF 문서 객체
 * @param options.width - 페이지 너비
 * @param options.titleFont - 제목에 사용할 폰트 객체
 * @param options.contentFont - 내용에 사용할 폰트 객체
 * @param options.titleFontSize - 제목 폰트 크기 (기본값: 12)
 * @param options.contentFontSize - 내용 폰트 크기 (기본값: 10)
 * @param options.titleMargin - 제목과 내용 사이 간격 (기본값: 30)
 * @param options.bottomPadding - 페이지 하단 패딩
 * @param options.sectionMargin - 섹션 간 간격 (기본값: 20)
 * @returns Promise<{ lastY: number, currentPage: PDFPage }> - 업데이트된 Y 좌표와 현재 페이지
 */
const drawSection = async ({
  title,
  content,
  yPosition,
  page,
  options,
}: {
  title: string
  content: string
  yPosition: number
  page: PDFPage
  options: {
    pdfDoc: PDFDocument
    width: number
    titleFont: PDFFont
    contentFont: PDFFont
    titleFontSize?: number
    contentFontSize?: number
    titleMargin?: number
    bottomPadding: number
    sectionMargin?: number
  }
}) => {
  const {
    pdfDoc,
    width,
    titleFont,
    contentFont,
    titleFontSize = 12,
    contentFontSize = 10,
    titleMargin = 30,
    bottomPadding,
    sectionMargin = 20,
  } = options

  // 섹션 제목 그리기
  page.drawText(title, {
    x: pxToPoint(64),
    y: yPosition,
    size: titleFontSize,
    font: titleFont,
  })

  // 제목과 내용 사이 간격
  const contentY = yPosition - pxToPoint(titleMargin)

  // 섹션 내용 그리기
  const result = await drawTextAndManagePages({
    text: content || '-',
    yPosition: contentY,
    currentPage: page,
    pdfDoc: pdfDoc,
    pageWidth: width,
    options: {
      font: contentFont,
      fontSize: contentFontSize,
      bottomPadding: bottomPadding,
    },
  })

  // 내용과 다음 섹션 사이 간격
  const updatedY = result.lastY - pxToPoint(sectionMargin)

  return {
    lastY: updatedY,
    currentPage: result.currentPage,
  }
}

/**
 * 이미지가 포함된 섹션을 그리는 함수
 * @param title - 섹션 제목
 * @param content - 섹션 내용
 * @param imageUrl - 이미지 URL
 * @param wordCount - 단어 수
 * @param yPosition - 시작 Y 좌표 위치
 * @param page - 현재 PDF 페이지 객체
 * @param options - 섹션 그리기 옵션
 * @param options.pdfDoc - PDF 문서 객체
 * @param options.width - 페이지 너비
 * @param options.height - 페이지 높이
 * @param options.topPadding - 페이지 상단 패딩
 * @param options.titleFont - 제목에 사용할 폰트 객체
 * @param options.contentFont - 내용에 사용할 폰트 객체
 * @param options.titleFontSize - 제목 폰트 크기 (기본값: 12)
 * @param options.contentFontSize - 내용 폰트 크기 (기본값: 10)
 * @param options.imageWidth - 이미지 너비 (기본값: 128)
 * @param options.imageHeight - 이미지 높이 (기본값: 128)
 * @param options.bottomPadding - 페이지 하단 패딩
 * @param options.sectionMargin - 섹션 간 간격 (기본값: 40)
 * @returns Promise<{ lastY: number, currentPage: PDFPage }> - 업데이트된 Y 좌표와 현재 페이지
 */
const drawSectionWithImage = async ({
  title,
  content,
  imageUrl,
  wordCount,
  yPosition,
  page,
  options,
}: {
  title: string
  content: string
  imageUrl: string
  wordCount: number
  yPosition: number
  page: PDFPage
  options: {
    pdfDoc: PDFDocument
    width: number
    height: number
    topPadding: number
    titleFont: PDFFont
    contentFont: PDFFont
    titleFontSize?: number
    contentFontSize?: number
    imageWidth?: number
    imageHeight?: number
    bottomPadding: number
    sectionMargin?: number
  }
}) => {
  const {
    pdfDoc,
    width,
    height,
    topPadding,
    titleFont,
    contentFont,
    titleFontSize = 12,
    contentFontSize = 10,
    imageWidth = 128,
    imageHeight = 128,
    bottomPadding,
    sectionMargin = 40,
  } = options

  // 최소 공간 체크 (이미지 + 여유공간)
  if (yPosition < pxToPoint(190)) {
    page = pdfDoc.addPage()
    yPosition = height - topPadding
  }

  // 제목과 단어수 함께 표시
  page.drawText(`${title} - 단어수: ${wordCount}`, {
    x: pxToPoint(64),
    y: yPosition,
    size: titleFontSize,
    font: titleFont,
  })

  // 제목과 이미지 사이 간격
  yPosition -= pxToPoint(30)

  // 이미지 처리
  if (imageUrl && imageUrl !== '-') {
    await drawImageFromUrl(pdfDoc, page, imageUrl, {
      x: pxToPoint(64),
      y: yPosition - pxToPoint(imageHeight),
      width: pxToPoint(imageWidth),
      height: pxToPoint(imageHeight),
    })

    // 이미지 높이만큼 Y 위치 조정
    yPosition -= pxToPoint(imageHeight)
  }

  // 이미지와 내용 사이 간격
  yPosition -= pxToPoint(30)

  // 내용 그리기
  const result = await drawTextAndManagePages({
    text: content || '-',
    yPosition: yPosition,
    currentPage: page,
    pdfDoc: pdfDoc,
    pageWidth: width,
    options: {
      font: contentFont,
      fontSize: contentFontSize,
      bottomPadding: bottomPadding,
    },
  })

  // 다음 섹션과의 간격 추가
  return {
    lastY: result.lastY - pxToPoint(sectionMargin),
    currentPage: result.currentPage,
  }
}

export {
  pxToPoint,
  drawTextBlock,
  drawTextAndManagePages,
  readFileAsArrayBuffer,
  drawImageToPdf,
  drawImageFromUrl,
  drawSection,
  drawSectionWithImage,
}
