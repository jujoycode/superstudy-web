import JSZip from 'jszip';
import { Constants } from 'src/constants';
import { getFileNameFromUrl } from 'src/util/file';

/**
 * @param files - 압축해서 저장할 파일
 * @param title - 파일 저장명
 */

export const handleBulkDownload = async (files: string[], title: string) => {
  const zip = new JSZip();
  const folder = zip.folder(title);

  if (!folder) {
    console.error('Failed to create zip folder');
    return;
  }

  const filePromises = files.map((file) => {
    const url = `${Constants.imageUrl}${file}`;
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        folder.file(getFileNameFromUrl(file), blob);
      });
  });

  await Promise.all(filePromises);

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });
};

export interface BlobDownloadItem {
  blob: Blob;
  fileName: string;
  group?: string;
}

/**
 * Blob 데이터들을 ZIP 파일로 압축하여 다운로드합니다
 * @param files - Blob 데이터와 파일명을 포함하는 객체 배열
 * @param zipFileName - 다운로드될 ZIP 파일명
 * @param groupMapping - 파일 인덱스를 그룹 이름으로 매핑하는 객체
 */
export const handleBatchBlobDownload = async (
  files: BlobDownloadItem[],
  zipFileName: string,
  groupMapping?: { [key: string]: number[] },
) => {
  const zip = new JSZip();
  const mainFolder = zip.folder(zipFileName);

  if (!mainFolder) {
    console.error('ZIP 폴더 생성 실패');
    return;
  }

  try {
    // 그룹 매핑이 제공된 경우, 각 파일에 그룹 정보 추가
    if (groupMapping) {
      Object.entries(groupMapping).forEach(([groupName, indices]) => {
        indices.forEach((index) => {
          if (files[index]) {
            files[index].group = groupName;
          }
        });
      });
    }

    const groupedFiles: { [key: string]: BlobDownloadItem[] } = {};
    const ungroupedFiles: BlobDownloadItem[] = [];

    // 파일들을 그룹별로 분류
    files.forEach((file) => {
      if (file.group) {
        if (!groupedFiles[file.group]) {
          groupedFiles[file.group] = [];
        }
        groupedFiles[file.group].push(file);
      } else {
        ungroupedFiles.push(file);
      }
    });

    // 그룹별로 처리
    if (Object.keys(groupedFiles).length > 0) {
      for (const [groupName, groupFiles] of Object.entries(groupedFiles)) {
        if (groupFiles.length > 1) {
          // 그룹 내 파일이 여러 개인 경우 하위 zip 생성
          const groupZip = new JSZip();
          groupFiles.forEach(({ blob, fileName }) => {
            groupZip.file(fileName, blob);
          });

          // 그룹 zip 생성
          const groupZipBlob = await groupZip.generateAsync({ type: 'blob' });
          mainFolder.file(`${groupName}.zip`, groupZipBlob);
        } else if (groupFiles.length === 1) {
          // 그룹 내 파일이 하나인 경우 직접 저장
          mainFolder.file(groupFiles[0].fileName, groupFiles[0].blob);
        }
      }
    }

    // 그룹에 속하지 않은 파일들 처리
    ungroupedFiles.forEach(({ blob, fileName }) => {
      mainFolder.file(fileName, blob);
    });

    // ZIP 파일 생성 및 다운로드
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipFileName}.zip`;
    link.click();

    // 리소스 해제
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('ZIP 파일 생성 실패:', error);
  }
};
