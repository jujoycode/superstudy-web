import { useState } from 'react'
import { useParams } from 'react-router'
import { useHistory } from 'react-router-dom'
import Viewer from 'react-viewer'
import { useRecoilValue } from 'recoil'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { useTeacherBoardDetail } from '@/legacy/container/teacher-board-detail'
import { Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { meState } from '@/legacy/store'
import { DateFormat, DateUtil } from '@/legacy/util/date'

interface BoardDetailPageProps {
  page: number
  limit: number
}

export function BoardDetailPage({ page, limit }: BoardDetailPageProps) {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const me = useRecoilValue(meState)
  const { t } = useLanguage()

  const { board, isBoardLoading, images, Pdfs, documents, viewerImages, errorMessage, handleBoardDelete } =
    useTeacherBoardDetail(+id)

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const getFeedsDetail = () => {
    return (
      <FeedsDetail
        category1={board?.category || '학급게시판'}
        category1Color="mint_green"
        sendTo={
          (board?.toStudent ? t('student') : '') +
          (board?.toStudent && board?.toParent ? '/' : '') +
          (board?.toParent ? t('parent') : '')
        }
        sendToColor="gray-100"
        title={board?.title}
        contentText={board?.content}
        contentImages={board?.images}
        contentFiles={board?.files}
        writer={board?.writer?.name}
        createAt={DateUtil.formatDate(board?.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
      />
    )
  }

  return (
    <>
      {errorMessage && <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />}
      {/* Mobile V */}
      <div className="block md:hidden">
        <TopNavbar title={`${t('class_bulletin_board')}`} left={<BackButton />} />
        {board && (
          <>
            {getFeedsDetail()}
            <br />
            <br />
            <br />
          </>
        )}
      </div>

      {/* Desktop V */}
      {board && (
        <>
          <div className="hidden rounded-lg border bg-white p-5 md:block">
            {isBoardLoading && <Blank reversed text={`${t('loading_post')}`} />}
            <Section>
              <div className="flex w-full justify-between space-x-2">
                <div className="scroll-box w-full overflow-x-scroll">
                  <div className="flex min-w-max items-center space-x-2">
                    {board?.groupBoards?.map((groupBoard) => {
                      const newGroupBoard = groupBoard as unknown as {
                        id: number
                        group: { id: number; name: string }
                      }
                      return (
                        <span
                          key={newGroupBoard.group.id}
                          className="rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-500"
                        >
                          {newGroupBoard.group.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
                {(me?.role === Role.ADMIN || board?.writerId === me?.id) && (
                  <div className="font-base flex cursor-pointer space-x-4 text-gray-500">
                    <div
                      className="min-w-max text-gray-700"
                      onClick={() => push(`/teacher/board/${board?.id}/edit?page=${page}&limit=${limit}`)}
                    >
                      {t('edit')}
                    </div>
                    <div className="min-w-max text-red-400" onClick={() => setDeleteModalOpen(true)}>
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
                    {t('confirm_delete_class_bulletin_board')}
                  </div>
                  <Button.lg
                    children={t('delete_announcement')}
                    onClick={handleBoardDelete}
                    className="filled-primary"
                  />
                </Section>
              </SuperModal>
            </Section>
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
          <div className="absolute">
            <PdfViewer isOpen={hasPdfModalOpen} fileUrl={focusPdfFile} onClose={() => setPdfModalOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
