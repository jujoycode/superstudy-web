import loadImage from 'blueimp-load-image'
import imageCompression from 'browser-image-compression'
import { toJpeg } from 'html-to-image'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const getImageMeta = (url: string) => {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    img.onerror = () => {
      reject(new Error(`Could not load image url ${url}`))
    }
    img.src = url
  })
}

export const extractReactData = async (ref: any, fontEmbedCSS = '') => {
  if (!ref) {
    return null
  }
  try {
    const imgData = await toJpeg(ref, { quality: 1.0, fontEmbedCSS, includeQueryParams: true, cacheBust: false })
    if (!imgData) return
    await getImageMeta(imgData)
    return imgData
  } catch (e) {
    console.log('extractReactData error  : ', e)
  }
}

export const extractReactDataArray = async (ref: any[]) => {
  if (!ref) {
    return null
  }

  const imgDatas = []

  for (const ef of ref) {
    let imgData
    try {
      imgData = await toJpeg(ef, {
        quality: 1.0,
        fontEmbedCSS: '',
        includeQueryParams: true,
        cacheBust: false,
      })
      await getImageMeta(imgData)

      imgDatas.push(imgData)
    } catch (e) {
      console.log('extractReactDataArray error  : ', e)
    }
  }

  return imgDatas
}

// 추가하기는 했으나 사용은 안했음
export const makePdf = (ref: HTMLDivElement | null, filename: string) => {
  if (!ref) return

  const convertToPdf = async () => {
    const canvas = await html2canvas(ref)
    const image = canvas.toDataURL('image/jpeg', 1.0)

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const widthRatio = pageWidth / canvas.width
    const customHeight = canvas.height * widthRatio

    doc.addImage(image, 'JPEG', 0, 0, pageWidth, pageHeight)

    let heightLeft = customHeight
    let heightAdd = -pageHeight

    while (heightLeft >= pageHeight) {
      //pdf페이지 추가
      doc.addPage()
      //남은 이미지를 추가
      doc.addImage(image, 'png', 0, heightAdd, pageWidth, customHeight)
      //남은길이
      heightLeft -= pageHeight
      //남은높이
      heightAdd -= pageHeight
    }
    //문서저장
    doc.save(filename)
  }

  return convertToPdf()
}

export const getBlobByCanvas = (canvas: any) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob: any) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
      }
      resolve(blob)
    }, 'image/jpeg')
  })
}

export const getArrayBufferByFile = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('loadend', (e) => resolve(e.target?.result as ArrayBuffer))
    reader.addEventListener('error', reject)
    reader.readAsArrayBuffer(file)
  })
}

export interface extractImageDataReturnType {
  data: Uint8Array
  width: number | undefined
  height: number | undefined
  orientation: loadImage.ExifTagValue
}

export const extractImageData = async (filename: string): Promise<extractImageDataReturnType | null> => {
  if (!filename) {
    return null
  }
  try {
    const result = await loadImage(filename, {
      meta: true,
      orientation: true,
      canvas: true,
    })
    const blob = await getBlobByCanvas(result.image)
    const file = new File([blob], 'temp_file.jpeg', { type: blob.type })
    const compressedFile = await imageCompression(file, {
      initialQuality: 0.6,
    })
    const arrayBuffer = await getArrayBufferByFile(compressedFile)
    const unit8Array = new Uint8Array(arrayBuffer)
    const orientation = result.exif?.get('Orientation') || 1
    const isChangeWidthHeight = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8
    return {
      data: unit8Array,
      width: isChangeWidthHeight ? result.originalHeight : result.originalWidth,
      height: isChangeWidthHeight ? result.originalWidth : result.originalHeight,
      orientation,
    }
  } catch (e) {
    console.log('extractImageData error  : ', e)
  }
  return null
}

export const getPdfImageSize = (width: number, height: number) => {
  if (width === 0 || height === 0) return [0, 0]
  if (width >= height) {
    return [210, (210 * height) / width]
  }
  return [(297 * width) / height, 297]
}

export const getDoc = () => {
  const doc: any = new jsPDF('p', 'mm', 'a4', true)

  let pages = 0

  const addPage = async (imgData: any, type = 'PNG', width = 210, height = 297) => {
    if (pages !== 0) {
      await doc.addPage()
    }
    await doc.addImage(imgData, type, 0, 0, width, height, undefined, 'FAST')
    pages += 1
  }

  const download = async (fileName: string) => {
    doc.save(fileName)
  }

  return { doc, pages, addPage, download }
}
