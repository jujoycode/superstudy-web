import { Constants } from '@/legacy/constants'

export const checkFileSizeLimit100MBex = (files: FileList | null) => {
  if (files) {
    let totalSize = 0
    for (const file of files) {
      totalSize += file.size
    }
    return totalSize <= 100 * 1024 * 1024
  }

  return true
}

export const checkFileSizeLimit100MB = (files: (File | null | undefined)[]) => {
  const totalSize = files.reduce((acc, file) => {
    if (file === null || file === undefined) {
      return acc
    }
    if (file instanceof File) {
      return acc + file.size
    }
    return acc
  }, 0)
  return totalSize <= 100 * 1024 * 1024
}

export const getFileNameFromUrl = (url: string) => {
  return url.lastIndexOf('/') >= 0 ? url.slice(url.lastIndexOf('/') + 15) : url
}

export const getFileNameFromUrlToAnn = (url: string) => {
  return url.lastIndexOf('/') >= 0 ? url.slice(url.lastIndexOf('/') + 1) : url
}

export const isPdfFile = (fileName: string) => {
  const _lastDot = fileName.lastIndexOf('.')

  // 확장자 명만 추출한 후 소문자로 변경
  const _fileExt = fileName.substring(_lastDot, fileName.length).toLowerCase()
  if (_fileExt === '.pdf') {
    return true
  } else {
    return false
  }
}

export const isImageFile = (fileName: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const _lastDot = fileName.lastIndexOf('.')

  if (_lastDot === -1) return false // 파일명에 확장자가 없는 경우

  // 확장자 명만 추출한 후 소문자로 변경
  const _fileExt = fileName.substring(_lastDot).toLowerCase()
  return imageExtensions.includes(_fileExt)
}

export const getExtOfFilename = (fileName: string) => {
  const _lastDot = fileName.lastIndexOf('.')

  // 확장자 명만 추출한 후 소문자로 변경
  return fileName.substring(_lastDot, fileName.length).toLowerCase()
}

export const getUrlFromFile = (fileName: string) => {
  let url = ''

  if (fileName.includes('blob')) {
    const index = fileName.indexOf('?')

    if (index !== -1) {
      url = fileName.substring(0, index) // 0부터 ? 이전까지 문자열 추출
    } else {
      url = fileName
    }
  } else {
    url = Constants.imageUrl + fileName
  }

  return url
}

export const handleDownload = async (fileUrl: string, fileName?: string) => {
  try {
    // 이미지를 fetch로 가져와서 Blob으로 변환
    const response = await fetch(fileUrl)
    const blob = await response.blob()

    // Blob URL 생성
    const url = window.URL.createObjectURL(blob)

    // 다운로드 링크 생성 및 다운로드 실행
    const link = document.createElement('a')
    link.href = url

    if (fileName) {
      link.setAttribute('download', fileName) // 다운로드될 파일명 커스텀 지정
    } else {
      link.setAttribute('download', getFileNameFromUrl(fileUrl)) // url을 통해 다운로드될 파일명 지정
    }
    document.body.appendChild(link)
    link.click()

    // 다운로드 후 링크를 제거하여 메모리 해제
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('이미지 다운로드 중 오류 발생:', error)
  }
}

export const isExcelFile = (fileName: string) => {
  const _lastDot = fileName.lastIndexOf('.')
  // 확장자 명만 추출한 후 소문자로 변경
  const _fileExt = fileName.substring(_lastDot, fileName.length).toLowerCase()
  if (_fileExt === '.xlsx' || _fileExt === 'xls') {
    return true
  } else {
    return false
  }
}
