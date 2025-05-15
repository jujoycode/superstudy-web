import JSZip from 'jszip'

import { Constants } from '@/legacy/constants'

/**
 * 여러 파일을 용량 제한을 두고 일괄 다운로드하는 함수
 *
 * 지정된 크기(기본값 1.5GB)로 ZIP 파일을 분할하여 안정적으로 대용량 다운로드를 처리합니다.
 * 메모리 부족 오류를 방지하고 다운로드 신뢰성을 높이기 위해 파일들을 여러 개의 ZIP으로 나누어
 * 순차적으로 처리합니다.
 *
 * @param {Object} params - 함수 매개변수
 * @param {string[]} params.files - 다운로드할 파일 URL 경로 배열
 * @param {string} params.baseFileName - 다운로드될 ZIP 파일의 기본 이름. 분할 시 `{baseFileName}_분할{n}.zip` 형식으로 저장됨
 * @param {Object} [params.options] - 다운로드 옵션
 * @param {number} [params.options.limitSizeBytes=1.5*1024*1024*1024] - 단일 ZIP 파일의 최대 크기(바이트 단위, 기본값 1.5GB)
 * @param {Function} [params.options.onProgress] - 진행 상황을 보고받을 콜백 함수
 * @param {number} params.options.onProgress.percentage - 전체 진행률(0-100)
 * @param {boolean} [params.options.onProgress.isError] - 오류 발생 여부를 나타내는 플래그
 * @param {string[]} [params.options.fileNames] - 각 파일의 이름을 지정할 수 있는 옵션
 *
 * @returns {Promise<void>} 모든 다운로드가 완료되면 해결되는 Promise
 *
 * @throws {Error} 파일 다운로드, 압축 또는 저장 과정에서 오류가 발생할 경우
 */
export const handleSizeLimitedBatchDownload = async ({
  files,
  baseFileName,
  options,
}: {
  files: string[]
  baseFileName: string
  options?: {
    limitSizeBytes?: number
    onProgress?: (info: { percentage: number; isError?: boolean }) => void
    fileNames?: string[]
  }
}): Promise<void> => {
  // 옵션 및 상수 설정
  const { limitSizeBytes = 1.5 * 1024 * 1024 * 1024, onProgress } = options || {}

  // 전체 작업 가중치 설정 - 정확한 수치를 잡을 수 없기에 임의로 설정한 수치임
  const WEIGHTS = { download: 70, processing: 30 }

  // 파일 정보 타입 정의
  type FileWithMeta = {
    url: string
    size: number
    blob?: Blob
    index: number
  }

  // 진행 상황 추적 변수
  let lastPercentage = -1

  /**
   * 진행 상황 업데이트 함수
   */
  const updateProgress = (phase: 'download' | 'processing', current: number, total: number): void => {
    if (!onProgress) return

    // 현재 단계의 진행률 계산
    const phasePercentage = Math.min(100, Math.round((current / total) * 100))

    // 전체 진행률 계산
    let totalPercentage = 0
    if (phase === 'download') {
      totalPercentage = Math.round((phasePercentage * WEIGHTS.download) / 100)
    } else {
      totalPercentage = WEIGHTS.download + Math.round((phasePercentage * WEIGHTS.processing) / 100)
    }

    // 중복 업데이트 방지
    if (totalPercentage === lastPercentage) return
    lastPercentage = totalPercentage

    // 진행률 정보 전달
    onProgress({ percentage: totalPercentage })
  }

  /**
   * 파일 다운로드 및 메타데이터 수집 함수
   */
  const downloadFiles = async (fileUrls: string[]): Promise<FileWithMeta[]> => {
    const filesWithSize: FileWithMeta[] = []
    updateProgress('download', 0, 100)

    for (let i = 0; i < fileUrls.length; i++) {
      const fileUrl = fileUrls[i]
      const url = `${Constants.imageUrl}${fileUrl}`

      updateProgress('download', (i * 100) / fileUrls.length, 100)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      filesWithSize.push({ url: fileUrl, size: blob.size, blob, index: i })
    }

    updateProgress('download', 100, 100)
    return filesWithSize
  }

  /**
   * 파일들을 크기 기준으로 그룹화하는 함수
   */
  const groupFilesBySize = (files: FileWithMeta[], maxSize: number): FileWithMeta[][] => {
    const groups: FileWithMeta[][] = []
    let currentGroup: FileWithMeta[] = []
    let currentSize = 0

    for (const file of files) {
      // 새 파일을 추가했을 때 그룹 크기 제한을 초과하면 새 그룹 시작
      if (currentSize + file.size > maxSize && currentGroup.length > 0) {
        groups.push([...currentGroup])
        currentGroup = []
        currentSize = 0
      }

      currentGroup.push(file)
      currentSize += file.size
    }

    // 마지막 그룹 추가
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  // 파일명 생성 및 중복 처리 함수
  const generateFileNameWithNumbering = (baseName: string, existingNames: Set<string>): string => {
    const lastDotIndex = baseName.lastIndexOf('.')
    const nameWithoutExt = lastDotIndex !== -1 ? baseName.substring(0, lastDotIndex) : baseName
    const extension = lastDotIndex !== -1 ? baseName.substring(lastDotIndex) : ''
    let fileName = baseName
    let counter = 1

    while (existingNames.has(fileName)) {
      fileName = `${nameWithoutExt} (${counter})${extension}`
      counter++
    }

    existingNames.add(fileName)
    return fileName
  }

  /**
   * ZIP 파일 생성 및 다운로드 함수
   */
  const createAndDownloadZip = async (
    files: FileWithMeta[],
    zipName: string,
    totalGroups: number,
    processedGroups: number,
    fileNames: string[],
  ): Promise<void> => {
    const zip = new JSZip()
    const folder = zip.folder(zipName)

    if (!folder) {
      throw new Error('ZIP 폴더 생성 실패')
    }

    const existingNames = new Set<string>()

    // 각 파일을 ZIP에 추가
    files.forEach((file) => {
      if (file.blob) {
        const fileName = generateFileNameWithNumbering(fileNames[file.index], existingNames)

        folder.file(fileName, file.blob)
      }
    })

    // 압축 시작 알림
    updateProgress('processing', (processedGroups * 100) / totalGroups, 100)

    // ZIP 생성 (진행 상황 업데이트 포함)
    const content = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'STORE', // 압축 없이 저장하여 메모리 사용 최소화
      },
      (metadata) => {
        const groupProgress = processedGroups + metadata.percent / 100
        const overallProgress = (groupProgress * 100) / totalGroups

        updateProgress('processing', overallProgress, 100)
      },
    )

    // 다운로드 준비
    updateProgress('processing', ((processedGroups + 0.9) * 100) / totalGroups, 100)

    // 다운로드 링크 생성 및 클릭
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `${zipName}.zip`
    document.body.appendChild(link)
    link.click()

    // 리소스 정리
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 500)
  }

  // 메인 실행 로직
  try {
    // 1. 모든 파일 다운로드
    const filesWithMeta = await downloadFiles(files)

    // 2. 파일을 크기 기준으로 그룹화
    const fileGroups = groupFilesBySize(filesWithMeta, limitSizeBytes)

    // 3. 각 그룹 순차적 처리
    let processedGroups = 0

    for (let i = 0; i < fileGroups.length; i++) {
      const group = fileGroups[i]
      const groupName = fileGroups.length > 1 ? `${baseFileName}_분할${i + 1}` : baseFileName

      await createAndDownloadZip(group, groupName, fileGroups.length, processedGroups, options?.fileNames || [])

      // 현재 그룹 처리 완료
      processedGroups++
      updateProgress('processing', (processedGroups * 100) / fileGroups.length, 100)

      // 브라우저가 다운로드를 처리할 시간 제공
      if (i < fileGroups.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // 4. 모든 다운로드 완료
    updateProgress('processing', 100, 100)
  } catch (error) {
    console.error('분할 다운로드 실패:', error)
    if (onProgress) {
      onProgress({
        percentage: 0,
        isError: true,
      })
    }
    throw error // 호출자에게 오류 전파
  }
}
