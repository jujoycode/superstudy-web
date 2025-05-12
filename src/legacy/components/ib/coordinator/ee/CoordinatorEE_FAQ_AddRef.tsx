import { id } from 'date-fns/locale';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIBReferenceCreate, useIBReferenceUpdate } from 'src/container/ib-coordinator';
import {
  ReferenceInfoGetReferenceInfoListCategory,
  RequestCreateReferenceInfoDto,
  RequestReferenceInfoDto,
  ResponseReferenceInfoDto,
  UploadFileTypeEnum,
} from 'src/generated/model';
import { useFileUpload } from 'src/hooks/useFileUpload';
import { fileType, useImageAndDocument } from 'src/hooks/useImageAndDocument';
import AlertV2 from '../../../common/AlertV2';
import { ButtonV2 } from '../../../common/ButtonV2';
import { Typography } from '../../../common/Typography';
import ColorSVGIcon from '../../../icon/ColorSVGIcon';
import { DocumentCard } from '../../DocumentCard';
import { ImageCard } from '../../ImageCard';
import { InputField } from '../../InputField';

interface CoordinatorEE_FAQ_AddRefProps {
  modalOpen: boolean;
  setModalClose: () => void;
  handleBack?: () => void;
  onSuccess: () => void;
  ablePropragation?: boolean;
  type?: 'create' | 'update';
  category?: ReferenceInfoGetReferenceInfoListCategory;
  data?: ResponseReferenceInfoDto;
}

export function CoordinatorEE_FAQ_AddRef({
  modalOpen,
  setModalClose,
  handleBack,
  onSuccess,
  type = 'create',
  category = 'IB_ALL',
  data: FEFData,
  ablePropragation = false,
}: PropsWithChildren<CoordinatorEE_FAQ_AddRefProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<RequestCreateReferenceInfoDto>({
    mode: 'onChange',
    defaultValues:
      type === 'update' && FEFData
        ? FEFData
        : {
            title: '',
            content: '',
          },
  });

  const title = watch('title');
  const content = watch('content');
  const isDisabled = !title || !content;

  const { createIBReference, isLoading, isError, error } = useIBReferenceCreate({
    onSuccess: () => {
      setModalClose();
      onSuccess();
      setIsSave(false);
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error);
      setIsSave(false);
    },
  });

  const { handleUploadFile } = useFileUpload();
  const {
    addFiles,
    imageObjectMap,
    documentObjectMap,
    toggleDocumentDelete,
    toggleImageDelete,
    setDocumentObjectMap,
    setImageObjectMap,
  } = useImageAndDocument({ images: FEFData?.images, documents: FEFData?.files });

  const onSubmit = async (data: RequestReferenceInfoDto) => {
    setIsSave(true);
    const imageFiles = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && value.image instanceof File)
      .map((value) => value.image) as File[];
    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['ib/referenceinfo/images'], imageFiles);
    const imageUrlNames = [...imageObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.image === 'string')
      .map((value) => value.image) as string[];
    const allImageNames = [...imageUrlNames, ...imageFileNames];
    const documentFiles = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && value.document instanceof File)
      .map((value) => value.document) as File[];
    const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/referenceinfo/files'], documentFiles);
    const documentUrlNames = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && typeof value.document === 'string')
      .map((value) => value.document) as string[];
    const allDocumentNames = [...documentUrlNames, ...documentFileNames];
    const _data = {
      ...data,
      files: allDocumentNames,
      images: allImageNames,
    };

    const createData: RequestCreateReferenceInfoDto = {
      ...data,
      files: allDocumentNames,
      images: allImageNames,
      category: category,
    };
    if (id !== undefined) {
      if (type === 'create') {
        createIBReference(createData);
      } else {
        if (FEFData !== undefined) {
          updateIBReference({ id: Number(FEFData.id), data: _data });
        }
      }
    }
  };

  const { updateIBReference } = useIBReferenceUpdate({
    onSuccess: () => {
      setModalClose();
      onSuccess();
      setIsSave(false);
    },
    onError: (error) => {
      console.error('참고자료 업데이트 중 오류 발생:', error);
      setIsSave(false);
    },
  });

  const onPreview = () => {
    const formData = watch(); // react-hook-form으로 입력된 데이터 가져오기

    const previewData = {
      ...formData,
      images: imageObjectMap,
      files: Array.from(documentObjectMap.values())
        .filter((value) => !value.isDelete)
        .map((value) => value.document),
    };

    const previewWindow = window.open('/reference/preview', '_blank');

    if (previewWindow) {
      previewWindow.onload = () => {
        previewWindow.opener.previewData = {
          type: 'REF',
          data: previewData,
        };
      };
    }
  };

  useEffect(() => {
    if (FEFData) {
      reset(FEFData);
      setImageObjectMap(new Map(FEFData.images?.map((image, i) => [i, { image, isDelete: false }]) || []));
      setDocumentObjectMap(new Map(FEFData.files?.map((file, i) => [i, { document: file, isDelete: false }]) || []));
    }
  }, [FEFData, reset]);

  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black bg-opacity-50 ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          const target = e.target as HTMLElement;
          if (!target.closest('.allow-click')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }}
    >
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white`}>
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 px-8 pb-6 pt-8 backdrop-blur-[20px]">
          <Typography variant="title1" className="text-primary-gray-900">
            {type === 'create' ? '참고자료 작성' : '참고자료 수정'}
          </Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} />
        </div>

        <div className="scroll-box flex max-h-[608px] flex-col gap-3 overflow-auto px-8 pb-8 pt-4">
          <InputField name="title" control={control} placeholder="제목을 입력해주세요" />
          <InputField
            name="content"
            control={control}
            placeholder="내용을 입력해주세요"
            type="textarea"
            className="h-[308px]"
          />
          {[...imageObjectMap].length > 0 && (
            <div className="flex min-h-max w-full gap-3 overflow-x-auto">
              {[...imageObjectMap].map(([key, value]) => (
                <ImageCard key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
              ))}
            </div>
          )}
          {[...documentObjectMap].length > 0 && (
            <div className="flex flex-wrap gap-2">
              {[...documentObjectMap].map(([key, value]) => (
                <DocumentCard key={key} id={key} documentObjet={value} onDeleteClick={toggleDocumentDelete} />
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex h-[104px] justify-between border-t border-t-primary-gray-100 bg-white/70 px-8 pb-8 pt-6 backdrop-blur-[20px]">
          <div className="flex flex-row items-center gap-3">
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
              {type === 'create' ? '이전' : '취소'}
            </ButtonV2>
            <ButtonV2
              variant="outline"
              color="gray400"
              size={48}
              disabled={isDisabled}
              onClick={onPreview}
              className="text-primary-gray-700"
            >
              미리보기
            </ButtonV2>
          </div>
          <div className="flex flex-row items-center gap-3">
            <label htmlFor="file-upload" className="allow-click cursor-pointer">
              <div className="flex h-12 min-w-[64px] items-center rounded-[6px] border border-primary-gray-400 px-3 text-[16px] font-semibold text-primary-gray-700 active:border-primary-gray-100 active:bg-primary-gray-400 disabled:cursor-not-allowed disabled:border-primary-gray-100 disabled:bg-primary-gray-200 disabled:text-primary-gray-400">
                파일 첨부하기
              </div>
              <input
                type="file"
                id="file-upload"
                multiple
                name="file-upload"
                className="hidden"
                onChange={(e) => {
                  e.preventDefault();
                  const files = e.target.files;
                  if (!files) return;
                  addFiles(files, [fileType.ANY]);
                }}
              />
            </label>
            <ButtonV2
              type="submit"
              variant="solid"
              color="orange800"
              size={48}
              disabled={isDisabled || isSave}
              onClick={handleSubmit(onSubmit)}
            >
              저장하기
            </ButtonV2>
          </div>
        </div>
      </div>
      {isOpen && (
        <AlertV2 confirmText="확인" message={`참고자료가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
      )}
    </div>
  );
}
