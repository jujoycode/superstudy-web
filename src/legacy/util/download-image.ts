export const toBlob = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      alert('파일을 불러오지 못했습니다. URL을 확인하시거나 나중에 다시 시도해주세요.');
      throw new Error(`해당 URL에서 파일을 불러오지 못하였습니다.`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error in toBlob:', error);
    throw error;
  }
};

/**
 * @param url - 파일 경로
 * @param fileName? - 파일 저장명
 */
export const downloadFile = async (url: string, fileName?: string) => {
  try {
    const blob = await toBlob(url);
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName ?? 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error in downloadFile:', error);
  }
};
