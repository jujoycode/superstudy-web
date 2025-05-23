import { useState } from 'react'
import { useParams } from 'react-router'
import Viewer from 'react-viewer'

import { useHistory } from '@/hooks/useHistory'
import { useUserStore } from '@/stores/user'
import { ErrorBlank, SuperModal } from '@/legacy/components'
import { BackButton, Blank, Label, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { PdfViewer } from '@/legacy/components/common/PdfViewer'
import { Routes } from '@/legacy/constants/routes'
import { useTeacherNewsletterDetail } from '@/legacy/container/teacher-newsletter-detail'
import { useNewsLettersUpdateEndAt } from '@/legacy/generated/endpoint'
import { NewsletterType, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { UserDatas } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function NewsletterDetailPage() {
  const { push } = useHistory()
  const { id } = useParams<{ id: string }>()
  const { me } = useUserStore()
  const { t } = useLanguage()

  const { mutate: updateEndAt } = useNewsLettersUpdateEndAt()

  const {
    newsletter,
    isLoading,
    viewerImages,
    isPublishModalOpen,
    errorMessage,
    setIsPublishModalOpen,
    handleNewsletterDelete,
    handleNewsletterPublish,
  } = useTeacherNewsletterDetail({ id: Number(id) })

  const [isEndAtModalOpen, setEndAtModalOpen] = useState(false)
  const [endAt, setEndAt] = useState(newsletter?.endAt || '')
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [focusPdfFile] = useState('')
  // 설문조사용도
  const [content] = useState<Record<string, string>>({})

  const getFeedsDetail = () => {
    return (
      <FeedsDetail
        category1={newsletter?.category || '가정통신문'}
        category1Color="amber-200"
        category2={newsletter?.type === NewsletterType.NOTICE ? '공지' : '설문'}
        category2Color="indigo-300"
        sendTo={
          (newsletter?.toStudent ? '학생' : '') +
          (newsletter?.toStudent && newsletter?.toParent ? '/' : '') +
          (newsletter?.toParent ? '보호자' : '')
        }
        sendToColor="gray-100"
        useSubmit={newsletter?.type !== NewsletterType.NOTICE}
        submitDate={DateUtil.formatDate(newsletter?.endAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
        submitYN={false}
        title={newsletter?.title}
        contentText={newsletter?.content}
        contentImages={newsletter?.images}
        contentFiles={newsletter?.files}
        contentSurvey={newsletter?.surveyContent}
        surveyResult={content}
        //writer={newsletter?.writer.name}
        createAt={DateUtil.formatDate(newsletter?.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
        isPreview={true}
      />
    )
  }

  return (
    <>
      {/* Mobile V */}
      <div className="block bg-white md:hidden">
        {isLoading && <Blank />}
        {errorMessage && <ErrorBlank text={errorMessage} />}
        <TopNavbar title={`${t('parent_letters')}`} left={<BackButton />} />
        {newsletter && (
          <>
            <div className="flex">
              {newsletter?.klasses
                ?.sort((a, b) => +a - +b)
                .map((klass) => (
                  <span
                    key={klass}
                    className="mt-2 ml-2 rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-500"
                  >
                    {klass}
                    {t('grade')}
                  </span>
                ))}
            </div>
            {getFeedsDetail()}
            <br />
            <br />
            <br />
          </>
        )}
      </div>

      <SuperModal
        modalOpen={isEndAtModalOpen}
        setModalClose={() => setEndAtModalOpen(false)}
        className="w-max"
        ablePropragation
      >
        <div className="px-12 py-6">
          <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">마감기한 수정</div>
          <label
            htmlFor="end_date"
            className="focus:border-primary-800 my-4 flex h-12 w-full cursor-pointer appearance-none items-center rounded-none border border-gray-200 bg-white px-4 placeholder-gray-400 outline-hidden focus:appearance-none focus:no-underline focus:ring-0 focus:outline-hidden sm:text-sm"
          >
            <input
              id="end_date"
              name="end_date"
              type="datetime-local"
              className="border-0 ring-0 outline-hidden focus:ring-0 focus:outline-hidden"
              value={endAt}
              onChange={(e) => {
                if (e.target.value > new Date().toISOString()) {
                  setEndAt(e.target.value)
                } else {
                  alert('마감기한으로 적절하지 않으므로 설정할 수 없습니다.')
                }
              }}
              pattern="\d{4}-\d{2}-\d{2}"
            />
          </label>
          <Button.lg
            children="변경하기"
            onClick={async () => {
              await updateEndAt({ id: Number(id), data: { endAt } })
              await setEndAtModalOpen(false)
            }}
            className="filled-primary w-full"
          />
        </div>
      </SuperModal>

      {/* Desktop V */}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {newsletter && (
        <>
          <div className="hidden md:block">
            <div className="rounded-lg border bg-white p-5">
              {isLoading && <Blank reversed />}
              {isLoading && <Blank reversed />}
              <Section>
                <div className="flex w-full justify-between space-x-2">
                  <div className="flex">
                    {!newsletter?.toPerson &&
                      newsletter?.klasses
                        ?.sort((a, b) => +a - +b)
                        .map((klass) => (
                          <span
                            key={klass}
                            className="mr-2 mb-2 rounded-full border border-gray-400 px-3 py-2 text-sm font-semibold text-gray-500"
                          >
                            {klass}
                            {t('grade')}
                          </span>
                        ))}
                  </div>
                  <div className="font-base flex cursor-pointer items-center space-x-4 text-gray-500">
                    {newsletter?.endAt && (
                      <div
                        className="rounded-xl border border-gray-300 px-2 py-1 text-gray-700"
                        onClick={() => setEndAtModalOpen(true)}
                      >
                        {t('end_date_update')}
                      </div>
                    )}
                    {!newsletter?.isPublished && (
                      <div
                        className="rounded-xl border border-gray-300 px-2 py-1 text-gray-700"
                        onClick={() => push(`${Routes.teacher.newsletter}/${id}/edit`)}
                      >
                        {t('edit')}
                      </div>
                    )}
                    {newsletter?.isPublished && (
                      <div
                        className="rounded-xl border border-blue-300 px-2 py-1 text-blue-700"
                        onClick={() => push(`${Routes.teacher.newsletter}/${id}/edit/reuse`)}
                      >
                        {t('reuse')}
                      </div>
                    )}
                    {(me?.role === Role.ADMIN || newsletter?.writerId === me?.id) && (
                      <div
                        className="cursor-pointer rounded-xl border border-red-300 px-2 py-1 text-red-400"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        {t('delete')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full justify-center">
                  <div className="w-[500px] rounded-lg border p-3">{getFeedsDetail()}</div>
                </div>
                <br />
                {newsletter?.toPerson && (
                  <>
                    <Label.col>
                      <Label.Text>* 수신자 확인</Label.Text>
                      <div className="overflow-y-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr>
                              <th className="w-14 border border-gray-300">번호</th>
                              <th className="w-14 min-w-max border-gray-300">이름</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newsletter?.userInfo.map((row: UserDatas | any) => (
                              <tr>
                                <td className="border border-gray-300 text-center">
                                  {row.sn === undefined ? row.children[0].studentNumber : row.sn}
                                </td>
                                <td className="border border-gray-300 text-center">
                                  {row.sn === undefined ? row.children[0].name + '(보:' + row.name + ')' : row.name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Label.col>
                  </>
                )}

                {newsletter?.isPublished === false && (
                  <Button.xl
                    children={t('publish')}
                    onClick={() => setIsPublishModalOpen(true)}
                    className="filled-primary w-full"
                  />
                )}

                <SuperModal
                  modalOpen={isPublishModalOpen}
                  setModalClose={() => setIsPublishModalOpen(false)}
                  className="w-100"
                >
                  <div className="px-12 py-6">
                    <div className="mb-4 w-full text-center text-lg font-bold text-gray-900">
                      {t('confirm_publish_parent_letter')}
                    </div>
                    <div className="mb-6 w-full text-center text-sm">{t('publish_warning')}</div>
                    <Button.xl
                      children={t('publish')}
                      onClick={handleNewsletterPublish}
                      className="filled-primary w-full"
                    />
                  </div>
                </SuperModal>
                <SuperModal
                  modalOpen={isDeleteModalOpen}
                  setModalClose={() => setDeleteModalOpen(false)}
                  className="w-max"
                >
                  <Section className="mt-7">
                    <div className="mb-6 w-full text-center text-lg font-bold text-gray-900">
                      {t('confirm_delete_parent_letter')}
                    </div>
                    <Button.xl
                      children={t('delete')}
                      onClick={() => handleNewsletterDelete(Number(id))}
                      className="filled-primary"
                    />
                  </Section>
                </SuperModal>
              </Section>
            </div>
          </div>
          <div className="absolute">
            <Viewer
              visible={hasImagesModalOpen}
              rotatable
              noImgDetails
              scalable={false}
              images={viewerImages}
              onChange={(_, index) => setActiveIndex(index)}
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
