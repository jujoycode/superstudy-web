export const handleSingleBlobDownload = async (blob: Blob, fileName: string) => {
  try {
    // Blob URL 생성
    const url = window.URL.createObjectURL(blob)

    // 다운로드 링크 생성
    const link = document.createElement('a')
    link.href = url
    link.download = fileName

    // 다운로드 트리거
    document.body.appendChild(link)
    link.click()

    // 정리
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('다운로드 실패:', error)
    throw error
  }
}
