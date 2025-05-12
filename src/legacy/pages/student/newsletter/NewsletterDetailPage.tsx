import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useHistory } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ErrorBlank } from '@/legacy/components/ErrorBlank'
import {
  BackButton,
  Blank,
  BottomFixed,
  CloseButton,
  Label,
  PhoneNumberField,
  Section,
  TopNavbar,
} from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { TextInput } from '@/legacy/components/common/TextInput'
import { Typography } from '@/legacy/components/common/Typography'
import { useStudentNewsletterAdd } from '@/legacy/container/student-newsletter-add'
import { useStudentNewsletterDetail } from '@/legacy/container/student-newsletter-detail'
import { NewsletterType, RequestUpsertStudentNewsletterDto, Role } from '@/legacy/generated/model'
import { useSignature } from '@/legacy/hooks/useSignature'
import { meState, toastState } from 'src/store'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { isPdfFile } from '@/legacy/util/file'
import { NewsletterAddPage } from './NewsletterAddPage'

export function NewsletterDetailPage() {
  const { push } = useHistory()
  let { id } = useParams<{ id: string }>()
  id = id.split('/')[0]

  const meRecoil = useRecoilValue(meState)

  const [nokName, setNokName] = useState('')

  const setToastMsg = useSetRecoilState(toastState)

  const [nokPhone, setNokPhone] = useState('')

  useEffect(() => {
    if (meRecoil) {
      setNokName(meRecoil?.role === Role.PARENT ? meRecoil?.name : meRecoil?.nokName)
      setNokPhone(meRecoil?.role === Role.PARENT ? meRecoil?.phone : meRecoil?.nokPhone)
    }
  }, [meRecoil])

  const {
    newsletter,
    studentNewsletter,
    isLoading,
    refetch,
    errorMessage: newsletterErrorMessage,
  } = useStudentNewsletterDetail(+id)

  const { canvasRef, sigPadData, clearSignature } = useSignature()
  const [openSignModal, setOpenSignModal] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const { upsertStudentNewsletter, isLoading: isLoadingAdd, errorMessage } = useStudentNewsletterAdd(newsletter?.id)

  const [content, setContent] = useState<any>(() => {
    return studentNewsletter?.content ? JSON.parse(studentNewsletter.content) : {}
  })

  useEffect(() => {
    if (studentNewsletter?.content) {
      setContent(JSON.parse(studentNewsletter.content))
    }
  }, [studentNewsletter])

  const [isUpdateState, setUpdateState] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasPdfModalOpen, setPdfModalOpen] = useState(false)
  const [focusPdfFile, setFocusPdfFile] = useState('')

  const isNotParent = meRecoil?.role !== Role.PARENT

  const images = newsletter?.images.filter((image) => !isPdfFile(image)) || []
  const Pdfs = newsletter?.images.filter((image) => isPdfFile(image)) || []
  const documents = newsletter?.files || []

  const handleSubmit = () => {
    const data: RequestUpsertStudentNewsletterDto = {
      nokName: nokName,
      nokPhone: nokPhone,
      newsletterId: newsletter?.id || 0,
      content: JSON.stringify(content),
      studentSignature: sigPadData,
    }

    const regExp = /^010(?:\d{4})\d{4}$/
    if (nokPhone && !regExp.test(nokPhone.replace(/-/g, ''))) {
      alert('보호자 연락처를 확인해 주세요.')
      return
    }

    // if (studentNewsletter) {
    //   upsertStudentNewsletter(data);
    //   setUpdateState(false);
    // } else {
    setOpenSignModal(true)
    //}
  }

  const buttonDisabled =
    isNotParent && !nokPhone && (newsletter?.surveyContent ? !Object.values(content).every((v) => v !== '') : false)

  const handleSubmitWithSign = () => {
    if (!sigPadData) {
      alert('서명이 없습니다. 서명을 해주세요.')
      return
    }

    const data: RequestUpsertStudentNewsletterDto = {
      nokName: nokName,
      nokPhone: nokPhone,
      newsletterId: newsletter?.id || 0,
      content: JSON.stringify(content),
      studentSignature: sigPadData,
    }
    upsertStudentNewsletter(data)
    setOpenSignModal(false)
    setConfirmModalOpen(false)
    setUpdateState(false)
  }

  if (isUpdateState && newsletter) {
    return (
      <NewsletterAddPage
        studentNewsletterData={studentNewsletter}
        newsletterData={newsletter}
        setUpdateState={(b: boolean) => {
          setUpdateState(b)
          setIsSubmitted(true)
          refetch()
        }}
      />
    )
  }

  return (
    <div>
      {isLoading && <Blank />}
      {newsletterErrorMessage && <ErrorBlank text={newsletterErrorMessage} />}
      <TopNavbar
        title="가정통신문"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      {newsletter && (
        <FeedsDetail
          category1={newsletter?.category || '가정통신문'}
          category1Color="light_golden"
          category2={newsletter?.type === NewsletterType.NOTICE ? '공지' : '설문'}
          category2Color="lavender_blue"
          sendTo={
            (newsletter?.toStudent ? '학생' : '') +
            (newsletter?.toStudent && newsletter?.toParent ? '/' : '') +
            (newsletter?.toParent ? '보호자' : '')
          }
          sendToColor="gray-100"
          useSubmit={newsletter?.type !== NewsletterType.NOTICE}
          submitDate={DateUtil.formatDate(newsletter?.endAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
          submitYN={studentNewsletter?.isSubmitted || false}
          submitText={
            studentNewsletter?.isSubmitted
              ? '제출일 ' + DateUtil.formatDate(studentNewsletter?.updatedAt || '', DateFormat['YYYY.MM.DD HH:mm'])
              : undefined
          }
          title={newsletter?.title}
          contentText={newsletter?.content}
          contentImages={newsletter?.images}
          contentFiles={newsletter?.files}
          contentSurvey={newsletter?.surveyContent}
          setSurveyResult={(c: any) => setContent(c)}
          surveyResult={content}
          writer={newsletter?.writerName}
          createAt={DateUtil.formatDate(newsletter?.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
          isPreview={studentNewsletter?.isSubmitted}
        />
      )}

      {newsletter?.type === 'STUDENT_PARENTS_SURVEY' &&
        newsletter?.endAt &&
        new Date(newsletter.endAt) > new Date() &&
        studentNewsletter?.isSubmitted && (
          <div className="w-full p-3">
            <Button.lg children="수정하기" onClick={() => setUpdateState(true)} className="filled-primary w-full" />
          </div>
        )}

      {newsletter?.type === 'STUDENT_PARENTS_SURVEY' && studentNewsletter?.isSubmitted !== true && (
        <div className="w-full p-3">
          {newsletter?.toParent && meRecoil?.role === Role.USER && (
            <>
              {(nokName === '' || nokPhone === '') && (
                <Typography variant="body2" className="text-red-700">
                  * 보호자 정보를 확인해주세요.
                </Typography>
              )}
              <Label.col>
                <Label.Text children="보호자 이름" />
                <TextInput value={nokName} disabled={true} className="border-gray-300" />
              </Label.col>
              <Label.col>
                <Label.Text children="보호자 연락처" />
                <PhoneNumberField value={nokPhone || '010'} disabled={true} />
              </Label.col>
            </>
          )}
          <Button.lg
            children="제출하기"
            disabled={buttonDisabled}
            onClick={() => {
              if (newsletter?.surveyContent) {
                const surveyContent = JSON.parse(newsletter.surveyContent)

                let noAnswer = { id: 0, title: '' }

                surveyContent.map((element: any) => {
                  if (element.required && noAnswer.id === 0) {
                    if (content[element.id.toString()] === undefined) {
                      noAnswer = element
                    }
                  }
                })

                if (noAnswer.id) {
                  setToastMsg(
                    `${noAnswer.id}번 질문의 답변이 입력되지 않았습니다.\n${noAnswer.title.length >= 20 ? noAnswer.title.slice(0, 20) + '...' : noAnswer.title}`,
                  )
                  return
                }
              }
              if (newsletter.endAt) {
                handleSubmit()
              } else {
                setConfirmModalOpen(true)
              }
            }}
            className="filled-primary w-full"
          />
          {errorMessage && <div className="text-red-600">{errorMessage}</div>}
          {confirmModalOpen && (
            <ConfirmDialog
              description={`한 번 제출하면 수정할 수 없습니다.\n제출하시겠습니까?`}
              message="설문 제출 안내"
              confirmText="확인"
              cancelText="취소"
              onConfirm={handleSubmit}
              onCancel={() => setConfirmModalOpen(false)}
              theme="secondary"
            />
          )}
        </div>
      )}

      <div className={openSignModal ? '' : 'hidden'}>
        <Blank text="" />
        <BottomFixed className="-bottom-4 z-100 rounded-xl">
          <div className="absolute top-2 right-3" onClick={() => setOpenSignModal(false)}>
            <CloseButton
              onClick={() => {
                setOpenSignModal(false)
                clearSignature()
              }}
            />
          </div>
          <Section>
            <div>
              <div className="text-xl font-bold text-gray-700">서명란</div>
              <div className="text-gray-500">아래 네모칸에 이름을 바르게 적어주세요.</div>
            </div>
            <canvas
              ref={canvasRef}
              width={window.innerWidth * 0.9}
              height={window.innerWidth * 0.4 > 280 ? 280 : window.innerWidth * 0.4}
              className="m-auto rounded-[30px] bg-[#F2F2F2]"
            />
            <div className="flex items-center justify-between space-x-2">
              <Button.lg children="다시하기" onClick={() => clearSignature()} className="outlined-primary w-full" />
              <Button.lg children="서명 제출하기" onClick={handleSubmitWithSign} className="filled-primary w-full" />
            </div>
          </Section>
          {isLoading && <Blank />}
        </BottomFixed>
      </div>
    </div>
  )
}
