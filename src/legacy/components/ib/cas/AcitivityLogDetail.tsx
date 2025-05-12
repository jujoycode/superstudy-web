import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Linkify from 'react-linkify';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Viewer from 'react-viewer';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { useRecoilValue } from 'recoil';
import { Blank } from 'src/components/common';
import AlertV2 from 'src/components/common/AlertV2';
import { ButtonV2 } from 'src/components/common/ButtonV2';
import { IBBlank } from 'src/components/common/IBBlank';
import { Typography } from 'src/components/common/Typography';
import SVGIcon from 'src/components/icon/SVGIcon';
import { Constants } from 'src/constants';
import { useActivityLogGetById, useActivityLogUpdate } from 'src/container/ib-cas';
import { RequestIBActivityLogUpdateDto, ResponseIBDtoStatus, UploadFileTypeEnum } from 'src/generated/model';
import { useFileUpload } from 'src/hooks/useFileUpload';
import { fileType, useImageAndDocument } from 'src/hooks/useImageAndDocument';
import { meState } from 'src/store';
import { downloadFile } from 'src/util/download-image';
import { getFileNameFromUrl, isPdfFile } from 'src/util/file';
import { DocumentCard } from '../DocumentCard';
import { Feedback } from '../Feedback';
import { ImageCard } from '../ImageCard';
import { InputField } from '../InputField';

interface LocationState {
  page: number;
}

interface AcitivityLogDetailProps {
  type?: 'student' | 'teacher';
  status?: ResponseIBDtoStatus;
  hasPermission?: boolean;
}

const urlDecorator = (decoratedHref: string, decoratedText: string, key: number) => (
  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="underline">
    {decoratedText}
  </a>
);

function AcitivityLogDetail({ type = 'student', status, hasPermission = true }: AcitivityLogDetailProps) {
  const { id: idParam, activitylogId: activitylogIdParam } = useParams<{ id: string; activitylogId: string }>();
  const id = Number(idParam);
  const history = useHistory();
  const location = useLocation<LocationState>();
  const page = location.state.page;
  const activitylogId = Number(activitylogIdParam);
  const { data, isLoading } = useActivityLogGetById(id, activitylogId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const { updateActivityLog, isLoading: isUpdateLoading } = useActivityLogUpdate({
    onSuccess: () => {
      setAlertMessage(`활동일지가\n저장되었습니다`);
    },
    onError: (error) => {
      console.error('활동일지 수정 중 오류 발생:', error);
    },
  });
  const me = useRecoilValue(meState);
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false);
  const {
    addFiles,
    imageObjectMap,
    documentObjectMap,
    toggleDocumentDelete,
    toggleImageDelete,
    setDocumentObjectMap,
    setImageObjectMap,
  } = useImageAndDocument({
    images: data?.images,
    documents: data?.files,
  });
  const { handleUploadFile } = useFileUpload();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const viewerImages: ImageDecorator[] = [];
  if (data?.images) {
    for (const image of data.images) {
      if (isPdfFile(image) === false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        });
      }
    }
  }

  const [editMode, setEditMode] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestIBActivityLogUpdateDto>({
    defaultValues: data,
  });

  const title = watch('title');

  useEffect(() => {
    if (data) {
      reset(data);
      setImageObjectMap(new Map(data.images?.map((image, i) => [i, { image, isDelete: false }]) || []));
      setDocumentObjectMap(new Map(data.files?.map((file, i) => [i, { document: file, isDelete: false }]) || []));
    }
  }, [data, reset, editMode]);

  const onSubmit = async (data: RequestIBActivityLogUpdateDto) => {
    setIsSubmitLoading(true);

    try {
      const imageFiles = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && value.image instanceof File)
        .map((value) => value.image) as File[];
      const imageFileNames = await handleUploadFile(UploadFileTypeEnum['ib/activity/images'], imageFiles);
      // url image 처리
      const imageUrlNames = [...imageObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.image === 'string')
        .map((value) => value.image) as string[];
      const allImageNames = [...imageUrlNames, ...imageFileNames];
      // file document 처리
      const documentFiles = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && value.document instanceof File)
        .map((value) => value.document) as File[];
      const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/activity/files'], documentFiles);
      const documentUrlNames = [...documentObjectMap.values()]
        .filter((value) => !value.isDelete && typeof value.document === 'string')
        .map((value) => value.document) as string[];
      const allDocumentNames = [...documentUrlNames, ...documentFileNames];
      const _data = {
        ...data,
        files: allDocumentNames,
        images: allImageNames,
      };
      if (id !== undefined) {
        updateActivityLog({ ibId: id, activityLogId: activitylogId, data: _data });
        setEditMode(!editMode);
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (me == null || data === undefined) {
    return <IBBlank />;
  }
  return (
    <div className="flex flex-grow flex-col">
      {isSubmitLoading && <Blank />}
      {(isUpdateLoading || isLoading) && <IBBlank type="opacity" />}
      <div className="flex h-full flex-row gap-4">
        <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
          {editMode ? (
            <form>
              <div className="scroll-box flex max-h-[608px] flex-col gap-3 overflow-auto pb-8 pt-4">
                <InputField name="title" control={control} placeholder="제목을 입력해주세요" />
                <InputField
                  name="content"
                  control={control}
                  placeholder="내용을 입력해주세요"
                  type="textarea"
                  className="h-[308px]"
                />
                {/* <ImageNFileUpload multiple addFiles={addFiles} availableType={[fileType.ANY]} /> */}
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
            </form>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-col items-start gap-1 border-b border-b-primary-gray-100 pb-6">
                <Typography variant="title1">{data.title}</Typography>
                <Typography variant="body3" className="text-primary-gray-500">
                  {format(new Date(data.createdAt), 'yyyy.MM.dd')}
                </Typography>
              </div>
              <div className="pt-6">
                <Typography variant="body1">
                  <Linkify componentDecorator={urlDecorator}>{data.content}</Linkify>
                </Typography>
              </div>
              {!!data.images?.length || !!data.files?.length ? (
                <div className="flex flex-col gap-4 py-10">
                  {/* 이미지 컨테이너 */}
                  {!!data.images?.length && (
                    <div className="grid w-full flex-grow grid-flow-row grid-cols-6 gap-3">
                      {data.images.map((image: string, i: number) => (
                        <div
                          key={i}
                          className="h-30 w-30"
                          onClick={() => {
                            setActiveIndex(i);
                            setImagesModalOpen(true);
                          }}
                        >
                          <div className="aspect-square cursor-pointer rounded-lg">
                            <LazyLoadImage
                              src={`${Constants.imageUrl}${image}`}
                              alt=""
                              loading="lazy"
                              className="object-fit h-full w-full rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 파일 컨테이너 */}
                  {!!data.files?.length && (
                    <div className="flex flex-col gap-3">
                      {data.files.map((fileUrl: string, index) => (
                        <div
                          key={index}
                          className="flex h-12 w-max items-center gap-3 rounded-lg border border-primary-gray-200 bg-white px-4"
                        >
                          <SVGIcon.Link size={16} weight="bold" color="gray700" />
                          <button
                            className="text-[15px] text-[#121316]"
                            onClick={() => downloadFile(`${Constants.imageUrl}${fileUrl}`, getFileNameFromUrl(fileUrl))}
                          >
                            {getFileNameFromUrl(fileUrl)}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <footer className={`flex flex-row items-center justify-between`}>
            {editMode ? (
              <>
                <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                  취소
                </ButtonV2>
                <div className="flex flex-row items-center gap-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex h-10 min-w-[64px] items-center rounded-[6px] border border-primary-gray-400 px-3 text-[14px] font-medium text-primary-gray-900 active:border-primary-gray-100 active:bg-primary-gray-400 disabled:cursor-not-allowed disabled:border-primary-gray-100 disabled:bg-primary-gray-200 disabled:text-primary-gray-400">
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
                    size={40}
                    variant="solid"
                    color="orange100"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!title}
                  >
                    저장하기
                  </ButtonV2>
                </div>
              </>
            ) : (
              <>
                <div>
                  {status !== 'COMPLETE' &&
                    ((type === 'teacher' && hasPermission) || (type === 'student' && data.writer.id === me.id)) && (
                      <ButtonV2
                        size={40}
                        variant="outline"
                        color="gray400"
                        onClick={() => setEditMode(!editMode)}
                        disabled={status === 'WAIT_COMPLETE'}
                      >
                        수정
                      </ButtonV2>
                    )}
                </div>
                <ButtonV2
                  size={40}
                  variant="solid"
                  color="gray100"
                  onClick={() => {
                    if (type === 'student') {
                      history.push(`/ib/student/cas/${id}/activitylog`, { page: page });
                    } else {
                      history.push(`/teacher/ib/cas/${id}/activitylog`, { page: page });
                    }
                  }}
                >
                  목록 돌아가기
                </ButtonV2>
              </>
            )}
          </footer>
        </div>
        <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
          <Typography variant="title1">진행기록</Typography>
          <div className="h-full w-full">
            <Feedback
              referenceId={activitylogId}
              referenceTable="ACTIVITY_LOG"
              user={me}
              useTextarea={status !== 'COMPLETE'}
            />
          </div>
        </div>
      </div>
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(activeImage, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  );
}

export default AcitivityLogDetail;
