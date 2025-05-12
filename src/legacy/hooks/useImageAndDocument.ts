import { ChangeEvent, useState } from 'react';
import { DocumentObject } from 'src/type/document-object';
import { ImageObject } from 'src/type/image-object';
import { checkFileSizeLimit100MB, checkFileSizeLimit100MBex } from 'src/util/file';
import { Validator } from 'src/util/validator';

export enum fileType {
  ANY,
  IMAGES,
  PDF,
  PDFS,
}

function getAllFiles({
  imageObjectMap,
  documentObjectMap,
}: {
  imageObjectMap: Map<number, ImageObject>;
  documentObjectMap: Map<number, DocumentObject>;
}) {
  const imageFiles = [...imageObjectMap.values()]
    .filter((object) => !object.isDelete && object.image instanceof File)
    .map((object) => object.image) as File[];
  const documentFiles = [...documentObjectMap.values()]
    .filter((object) => !object.isDelete && object.document instanceof File)
    .map((object) => object.document) as File[];
  return [...imageFiles, ...documentFiles];
}

export function useImageAndDocument({ images = [], documents = [] }: { images?: string[]; documents?: string[] }) {
  const initImageObjectMap = () => new Map(images.map((image, i) => [i, { image, isDelete: false }]));
  const initDocumentObjectMap = () => new Map(documents.map((document, i) => [i, { document, isDelete: false }]));
  const [imageObjectMap, setImageObjectMap] = useState<Map<number, ImageObject>>(initImageObjectMap);
  const [documentObjectMap, setDocumentObjectMap] = useState<Map<number, DocumentObject>>(initDocumentObjectMap);

  function hasPDF() {
    const pdfFile = [...imageObjectMap.values()].find(
      (object) =>
        !object.isDelete && typeof object.image === 'string' && object.image.split('.').pop()?.toLowerCase() === 'pdf',
    );
    return !!pdfFile;
  }

  // HEIC 파일 검사 함수
  function isHeicFile(file: File): boolean {
    return file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif';
  }

  function addFiles(files: FileList, availableType?: fileType[]) {
    const allFiles = Array.from(files);

    // HEIC 파일 확인
    if (allFiles.some((file) => isHeicFile(file))) {
      return alert('HEIC 형식의 파일은 지원하지 않습니다. 다른 이미지 형식(JPG, PNG 등)으로 변환 후 업로드해 주세요.');
    }

    if (allFiles.some((file) => !Validator.fileNameRule(file.name))) {
      return alert('특수문자(%, &, ?, ~, +)가 포함된 파일명은 사용할 수 없습니다.');
    }

    if (!checkFileSizeLimit100MB(allFiles)) {
      return alert('100MB 이하의 이미지/문서 파일을 첨부할 수 있습니다.');
    }

    const newImageObjectMap = new Map(imageObjectMap);
    const newDocumentObjectMap = new Map(documentObjectMap);

    allFiles.forEach((file) => {
      if (availableType && !availableType.includes(fileType.ANY)) {
        if (file?.type?.includes('image') && !availableType.includes(fileType.IMAGES)) {
          return alert('이미지 파일은 업로드 할 수 없습니다.');
        }

        if (file?.type?.includes('pdf')) {
          if (!availableType.includes(fileType.PDFS)) {
            if (availableType.includes(fileType.PDF)) {
              if (hasPDF()) {
                return alert('PDF 파일은 1개만 업로드 할 수 없습니다.');
              }
            } else {
              return alert('PDF 파일은 업로드 할 수 없습니다.');
            }
          }
        }
      }

      if (file.type.includes('image')) {
        newImageObjectMap.set(newImageObjectMap.size, { image: file, isDelete: false });
      } else {
        newDocumentObjectMap.set(newDocumentObjectMap.size, { document: file, isDelete: false });
      }
    });

    setImageObjectMap(newImageObjectMap);
    setDocumentObjectMap(newDocumentObjectMap);
  }

  function addTargetFiles(files: FileList, targetKey: number) {
    const allFiles = Array.from(files);

    // HEIC 파일 확인
    if (allFiles.some((file) => isHeicFile(file))) {
      return alert('HEIC 형식의 파일은 지원하지 않습니다. 다른 이미지 형식(JPG, PNG 등)으로 변환 후 업로드해 주세요.');
    }

    if (allFiles.some((file) => !Validator.fileNameRule(file.name))) {
      return alert('특수문자(%, &, ?, ~, +)가 포함된 파일명은 사용할 수 없습니다.');
    }

    if (!checkFileSizeLimit100MB(allFiles)) {
      return alert('100MB 이하의 이미지/문서 파일을 첨부할 수 있습니다.');
    }

    const newImageObjectMap = new Map(imageObjectMap);

    let existingKeyFound = false;
    for (const [key, value] of newImageObjectMap.entries()) {
      if (value.targetKey === targetKey) {
        const firstFile = allFiles.find((file) => file.type.includes('image'));
        if (firstFile) {
          newImageObjectMap.set(key, { image: firstFile, isDelete: false, targetKey });
          existingKeyFound = true;
        }
        break;
      }
    }

    if (!existingKeyFound) {
      const firstFile = allFiles.find((file) => file.type.includes('image'));
      if (firstFile) {
        newImageObjectMap.set(newImageObjectMap.size, { image: firstFile, isDelete: false, targetKey });
      }
    }
    setImageObjectMap(newImageObjectMap);
  }

  function handleImageAdd(e: ChangeEvent<HTMLInputElement>, availableType?: fileType[]) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // HEIC 파일 확인
    if (Array.from(files).some((file) => isHeicFile(file))) {
      return alert('HEIC 형식의 파일은 지원하지 않습니다. 다른 이미지 형식(JPG, PNG 등)으로 변환 후 업로드해 주세요.');
    }

    if (!Validator.fileNameRule(files[0].name)) {
      return alert('특수문자(%, &, ?, ~, +)가 포함된 파일명은 사용할 수 없습니다.');
    }
    if (!checkFileSizeLimit100MBex(files)) {
      return alert('한번에 최대 100MB까지만 업로드 가능합니다.');
    }

    if (!checkFileSizeLimit100MB(getAllFiles({ imageObjectMap, documentObjectMap }))) {
      return alert('한번에 최대 100MB까지만 업로드 가능합니다.');
    }

    if (!files[0]?.type?.includes('image') && !files[0]?.type?.includes('pdf')) {
      return alert('업로드 불가능한 파일 형식입니다.');
    }

    if (availableType && !availableType.includes(fileType.ANY)) {
      if (files[0]?.type?.includes('image') && !availableType.includes(fileType.IMAGES)) {
        return alert('이미지 파일은 업로드 할 수 없습니다.');
      }

      if (files[0]?.type?.includes('pdf')) {
        if (!availableType.includes(fileType.PDFS)) {
          if (availableType.includes(fileType.PDF)) {
            if (hasPDF()) {
              return alert('PDF 파일은 1개만 업로드 할 수 없습니다.');
            }
          } else {
            return alert('PDF 파일은 업로드 할 수 없습니다.');
          }
        }
      }
    }

    const newImageObjectMap = new Map(imageObjectMap);
    newImageObjectMap.set(imageObjectMap.size, { image: files[0], isDelete: false });
    setImageObjectMap(newImageObjectMap);
  }

  function toggleImageDelete(key: number) {
    const newImageObjectMap = new Map(imageObjectMap);
    const obj = newImageObjectMap.get(key);

    // TODO 삭제했다가 삭제취소하면 PDF가 여러개 생길수 있는데, 일단 넘어가자
    if (obj) {
      obj.isDelete = !obj.isDelete;
      newImageObjectMap.set(key, obj);
    }
    setImageObjectMap(newImageObjectMap);
  }

  function handleDocumentAdd(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // HEIC 파일 확인
    if (Array.from(files).some((file) => isHeicFile(file))) {
      return alert('HEIC 형식의 파일은 지원하지 않습니다. 다른 이미지 형식(JPG, PNG 등)으로 변환 후 업로드해 주세요.');
    }

    for (const file of files) {
      if (!Validator.fileNameRule(file.name)) {
        return alert('특수문자(%, &, ?, ~)가 포함된 파일명은 사용할 수 없습니다.');
      }
    }

    if (!checkFileSizeLimit100MB(getAllFiles({ imageObjectMap, documentObjectMap }))) {
      return alert('한번에 최대 100MB까지만 업로드 가능합니다. 추가 파일은 올린 후 수정해서 넣어주세요.');
    }

    const newFileObjectMap = new Map(documentObjectMap);
    let index = newFileObjectMap.size;

    for (const file of files) {
      newFileObjectMap.set(index++, { document: file, isDelete: false });
    }

    setDocumentObjectMap(newFileObjectMap);
  }

  function toggleDocumentDelete(key: number) {
    const newDocumentObjectMap = new Map(documentObjectMap);
    const obj = newDocumentObjectMap.get(key);
    if (obj) {
      obj.isDelete = !obj.isDelete;
      newDocumentObjectMap.set(key, obj);
    }
    setDocumentObjectMap(newDocumentObjectMap);
  }

  function resetImages() {
    setImageObjectMap(new Map([]));
  }

  function resetDocuments() {
    setDocumentObjectMap(new Map([]));
  }

  return {
    imageObjectMap,
    documentObjectMap,
    setImageObjectMap,
    setDocumentObjectMap,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    addFiles,
    resetImages,
    resetDocuments,
    addTargetFiles,
  };
}
