import { useState } from 'react';
import { useParams } from 'react-router';
import Viewer from 'react-viewer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ErrorBlank, SuperModal } from 'src/components';
import { BackButton, Blank, Section, TopNavbar } from 'src/components/common';
import { Button } from 'src/components/common/Button';
import { FeedsDetail } from 'src/components/common/FeedsDetail';
import { PdfViewer } from 'src/components/common/PdfViewer';
import { useTeacherNoticeDetail } from 'src/container/teacher-notice-detail';
import { Code, Role } from 'src/generated/model';
import { useLanguage } from 'src/hooks/useLanguage';
import { isUpdateNoticeState, meState } from 'src/store';
import { DateFormat, DateUtil } from 'src/util/date';
import { NoticeAddPage } from './NoticeAddPage';
interface NoticeAddProps {
  categoryData?: Code[];
}

export function NoticeDetailPage({ categoryData }: NoticeAddProps) {
  const { id } = useParams<{ id: string }>();

  const me = useRecoilValue(meState);
  const [isUpdateNotice, setIsUpdateNotice] = useRecoilState(isUpdateNoticeState);
  const { notice, isNoticeLoading, images, Pdfs, files, viewerImages, errorMessage, handleNoticeDelete } =
    useTeacherNoticeDetail(+id);
  const { t } = useLanguage();

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false);
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false);
  const [focusPdfFile, setFocusPdfFile] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  if (isUpdateNotice) {
    return <NoticeAddPage noticeData={notice} categoryData={categoryData} />;
  }

  const getFeedsDetail = () => {
    return (
      <FeedsDetail
        category1={notice?.category}
        category1Color="peach_orange"
        sendTo={
          (notice?.toStudent ? t('student') : '') +
          (notice?.toStudent && notice?.toParent ? '/' : '') +
          (notice?.toParent ? t('parent') : '')
        }
        sendToColor="gray-100"
        title={notice?.title}
        contentText={notice?.content}
        contentImages={notice?.images}
        contentFiles={notice?.files}
        writer={notice?.user?.name}
        createAt={DateUtil.formatDate(notice?.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
      />
    );
  };

  return (
    <>
      {/* Mobile V */}
      <div className="block bg-white md:hidden">
        {isNoticeLoading && <Blank />}
        {errorMessage && <ErrorBlank text={errorMessage} />}
        <TopNavbar left={<BackButton />} title={`${t('notice')}`} />
        {notice && (
          <>
            {getFeedsDetail()}
            <br />
            <br />
            <br />
          </>
        )}
      </div>

      {/* Desktop V */}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {notice && (
        <>
          <div className="hidden rounded-lg border bg-white p-5 md:block">
            {isNoticeLoading && <Blank reversed />}

            <Section>
              <div className="flex w-full justify-between space-x-2">
                <div className="text-lg font-bold">{t('notice')}</div>

                {(me?.role === Role.ADMIN || (me?.canEditNotice && me?.id === notice?.userId)) && (
                  <div className="font-base flex cursor-pointer space-x-4 text-gray-500">
                    <div className="text-gray-700" onClick={() => setIsUpdateNotice(true)}>
                      {t('edit')}
                    </div>
                    <div className="cursor-pointer text-red-400" onClick={() => setDeleteModalOpen(true)}>
                      {t('delete')}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex w-full justify-center">
                <div className="w-[500px] rounded-lg border p-3">{getFeedsDetail()}</div>
              </div>

              <SuperModal
                modalOpen={isDeleteModalOpen}
                setModalClose={() => setDeleteModalOpen(false)}
                className="w-max"
              >
                <Section className="mt-7">
                  <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
                    {t('confirm_delete_announcement')}
                  </div>
                  <Button.xl children={t('delete')} onClick={handleNoticeDelete} className="filled-primary" />
                </Section>
              </SuperModal>
            </Section>
          </div>

          <div className="absolute">
            <Viewer
              visible={hasImagesModalOpen}
              rotatable
              noImgDetails={false}
              scalable={false}
              images={viewerImages}
              onChange={(activeImage, index) => setActiveIndex(index)}
              onClose={() => setImagesModalOpen(false)}
              activeIndex={activeIndex}
            />
          </div>
          <div className="absolute">
            <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
