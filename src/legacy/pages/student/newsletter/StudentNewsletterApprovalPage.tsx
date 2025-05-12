import { useState } from 'react'
import Linkify from 'react-linkify'
import { useParams } from 'react-router'
import { useHistory } from '@/hooks/useHistory'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, BottomFixed, CloseButton, Section, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { SuperSurveyComponent } from '@/legacy/components/survey/SuperSurveyComponent'
import { useParentStudentNewsletterApproval } from '@/legacy/container/parent-student-newsletter-approval'
import { useSignature } from '@/legacy/hooks/useSignature'
import { makeDateToString } from '@/legacy/util/time'

export function StudentNewsletterApprovalPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const { push } = useHistory()
  const { studentNewsletter, approveStudentNewsletter, isLoading, errorMessage } =
    useParentStudentNewsletterApproval(uuid)

  const { canvasRef, sigPadData, clearSignature } = useSignature()

  const student = studentNewsletter?.student
  const school = student?.school
  const newsletter = studentNewsletter?.newsletter

  const [openSign, setSign] = useState(false)
  const [isSuccess, setSuccess] = useState(false)

  const handleApproveSubmit = () => {
    if (!sigPadData) {
      alert('서명이 없습니다. 서명을 해주세요.')
      return
    }

    setSign(false)
    approveStudentNewsletter({ uuid, data: { parentSignature: sigPadData } })
      .then(() => {
        setSuccess(true)
      })
      .catch(() => {
        console.log('error')
      })
  }

  // if (!studentNewsletter) {
  //   return <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />;
  // }

  return (
    <>
      {isSuccess && (
        <Blank>
          <div className="flex flex-col">
            <div className="mb-5 text-white">정상적으로 제출되었습니다.</div>
            <Button.lg children="확인" onClick={() => push('/')} className="filled-gray-dark" />
          </div>
        </Blank>
      )}
      {errorMessage && <ErrorBlank text={errorMessage} />}
      {/*{error && (*/}
      {/*  <ErrorBlank*/}
      {/*    text={*/}
      {/*      error.message?.includes('Could not find any entity')*/}
      {/*        ? '해당하는 결석신고서를 찾을 수 없습니다.'*/}
      {/*        : error.message*/}
      {/*    }*/}
      {/*  />*/}
      {/*)}*/}
      <TopNavbar title={'가정통신문'} left={<BackButton className="h-15" />} />
      {studentNewsletter ? (
        <>
          <Section>
            {!studentNewsletter?.parentSignature ? (
              <div className="bg-light_orange mb-4 rounded-lg p-4 whitespace-pre-line">
                {`해당 가정통신문의 설문 내용에 귀하의 자녀 ${student?.name || ''} 학생이 답변하였습니다.
      내용확인 후 서명을 부탁드립니다.

      서명 요청자 :
      ${school?.name || ''} ${studentNewsletter?.studentGradeKlass || ''} ${student?.name || ''} 학생

      서명 참여자 :
      ${student?.nokName || ''} 보호자님 (${student?.nokPhone || ''})
      `}
              </div>
            ) : (
              <>
                <div>
                  <div className="bg-light_orange mb-4 rounded-lg p-4 whitespace-pre-line">
                    {`이 가정통신문의 답변 내용이 ${student?.nokName || ''}님의 서명을 받았습니다.`}
                  </div>
                </div>
                <div className="h-0.5 bg-gray-200" />
              </>
            )}
            <div>
              <h1 className="text-2xl font-semibold">{newsletter?.title}</h1>
              <div className="text-sm text-gray-500">
                {newsletter?.createdAt && makeDateToString(new Date(newsletter.createdAt), '.')}
              </div>
            </div>
            <div className="h-0.5 w-full bg-gray-100" />

            {newsletter?.images?.length ? (
              <>
                {newsletter.images.map((image, index) => (
                  <div key={index} className="w-full">
                    <ImageObjectComponent id={index} imageObjet={{ image, isDelete: false }} />
                  </div>
                ))}
              </>
            ) : null}

            {newsletter?.files?.length ? (
              <>
                {newsletter.files.map((file, index) => (
                  <DocumentObjectComponent key={index} id={index} documentObjet={{ document: file, isDelete: false }} />
                ))}
              </>
            ) : null}

            <div className="feedback_space text-grey-2 text-sm break-words break-all whitespace-pre-line">
              <Linkify>{newsletter?.content}</Linkify>
            </div>
          </Section>
          <SuperSurveyComponent
            surveyContent={newsletter?.surveyContent || ''}
            setContent={(c: any) => {}}
            content={JSON.parse(studentNewsletter?.content || '{}')}
          />
          <Section>
            {studentNewsletter?.parentSignature && (
              <div className="flex w-full flex-col items-end">
                <div className="mt-4 min-w-max text-right font-bold">보호자: {student?.nokName} (인)</div>
                <img src={studentNewsletter?.parentSignature} alt="" className="mt-2 w-[100px]" />
              </div>
            )}

            <div className="pb-12 whitespace-pre-line">{/* {`*해당 가정통신문의 학생 답변 내용입니다.`} */}</div>
            {studentNewsletter?.parentSignature ? (
              <>
                <div className="text-sm text-gray-500">승인 요청되었습니다.</div>
                <Button.lg children="서명 완료" className="filled-gray" />
              </>
            ) : (
              <Button.lg children="내용 확인하고 서명하기" onClick={() => setSign(true)} className="filled-primary" />
            )}
          </Section>
          <div className={openSign ? '' : 'hidden'}>
            <Blank text="" />
            <BottomFixed className="-bottom-4 z-100 rounded-xl">
              <div className="absolute top-2 right-3" onClick={() => setSign(false)}>
                <CloseButton
                  onClick={() => {
                    setSign(false)
                    clearSignature()
                  }}
                />
              </div>
              <Section>
                <div>
                  <div className="text-xl font-bold text-gray-700">보호자 서명란</div>
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
                  <Button.lg
                    children="서명 제출하기"
                    disabled={isLoading}
                    onClick={handleApproveSubmit}
                    className="filled-primary w-full"
                  />
                </div>
              </Section>
            </BottomFixed>
          </div>
        </>
      ) : (
        <ErrorBlank text="이미 삭제되었거나 더 이상 유효하지 않습니다." />
      )}
    </>
  )
}
