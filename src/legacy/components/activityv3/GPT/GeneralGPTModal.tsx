import { FC, useState } from 'react'
import { useRecoilState } from 'recoil'
import { twMerge } from 'tailwind-merge'

import { Avatar, Textarea } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { SuperModal } from '@/legacy/components/SuperModal'
import { useStudentRecordontrollerCreate, useStudentSelfAssessmentGetAnnualReview } from '@/legacy/generated/endpoint'
import {
  Counseling,
  ResponseStudentCardStudentDto,
  StudentSelfAssessment,
  TeacherStudentAssessment,
} from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { toastState } from '@/stores'

interface GeneralGPTModalProps {
  studentId: number
  studentSelfAssessment?: StudentSelfAssessment | undefined
  counselingData?: Counseling[] | undefined
  teacherStudentAssessment?: TeacherStudentAssessment | undefined
  selectedStudentIds: number[]
  setSelectedStudentIds: (ids: number[]) => void
  selectedCounselingIds: number[]
  setSelectedCounselingIds: (ids: number[]) => void
  selectedTeacherIds: number[]
  setSelectedTeacherIds: (ids: number[]) => void
  isStudentAssessmentSelected: boolean
  setStudentAssessmentSelected: (bool: boolean) => void
  isTeacherAssessmentSelected: boolean
  setTeacherAssessmentSelected: (bool: boolean) => void
  onClose: () => void
  studentInfo?: ResponseStudentCardStudentDto
}

export const GeneralGPTModal: FC<GeneralGPTModalProps> = ({
  studentId,
  studentSelfAssessment,
  counselingData,
  teacherStudentAssessment,
  selectedStudentIds,
  setSelectedStudentIds,
  selectedCounselingIds,
  setSelectedCounselingIds,
  selectedTeacherIds,
  setSelectedTeacherIds,
  isStudentAssessmentSelected,
  setStudentAssessmentSelected,
  isTeacherAssessmentSelected,
  setTeacherAssessmentSelected,
  onClose,
  studentInfo,
}) => {
  const { t, currentLang } = useLanguage()
  const [, setToastMsg] = useRecoilState(toastState)
  const [content, setContent] = useState('')
  const [question, setQuestion] = useState('')
  const [sentence, setSentence] = useState('')
  const [reportContents, setReportContents] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [selectedContentIndex, setSelectedContentIndex] = useState<number | undefined>()
  const [modalStep, setModalStep] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { mutate: getAnnualReview, isLoading } = useStudentSelfAssessmentGetAnnualReview({
    mutation: {
      onSuccess: (data: any) => {
        setReportContents((reportContents) => reportContents.concat({ type: 'content', data }))
        setConversationId(data.conversation_id)
      },
    },
  })

  const { mutate: createStudentRecord } = useStudentRecordontrollerCreate({
    mutation: {
      onSuccess: () => {
        setToastMsg('변경 사항이 저장되었습니다.')
        onClose()
        setContent('')
        localStorage.setItem('student_record_content', '')
        localStorage.setItem('student_record_type', '')
        setConversationId('')
        setModalOpen(false)
        setReportContents([])
        setQuestion('')
        setSentence('')
        setModalStep(1)
      },
      onError: (error) => {
        setToastMsg(error.message)
      },
    },
  })

  const handleSaveClick = () => {
    createStudentRecord({
      data: {
        content,
        type: '행동특성 및 종합의견',
        title: '',
        subject: '',
        creativeType: '',
      },
      params: { studentId },
    })
  }

  const handleQuestionSend = () => {
    if (!question) {
      alert('질문 내용을 입력해 주세요!')
      return
    }
    setReportContents((reportContents) => reportContents.concat({ type: 'question', question, sentence }))
    getAnnualReview({
      studentId,
      data: {
        conversationId,
        followUpQuestion: question,
        rewriteSentense: sentence,
        selfAssessmentKeywords: selectedStudentIds.map((sid) => studentSelfAssessment?.keywords?.[sid]?.keyword),
        selfAssessmentReport: isStudentAssessmentSelected ? studentSelfAssessment?.assessment || '' : '',
        teacherAssessmentKeywords: selectedTeacherIds.map((sid) => teacherStudentAssessment?.keywords?.[sid]?.keyword),
        teacherAssessmentReport: isTeacherAssessmentSelected ? teacherStudentAssessment?.assessment || '' : '',
        selectedCounseling:
          counselingData?.filter((data) => selectedCounselingIds.includes(data.id))?.map((el) => el.content) || [],
      },
    })
    setSentence('')
    setQuestion('')
  }

  const byteLength = new TextEncoder().encode(content).length
  const trimmedContent = content.replace(/ /g, '')
  const trimmedByteLength = new TextEncoder().encode(trimmedContent).length

  return (
    <>
      <div className="h-full w-full">
        <section className="flex h-full overflow-visible rounded-r-lg bg-[#e8ebf7] px-6 py-4">
          <div className="flex w-full rounded-lg bg-white">
            <div className={`flex h-full w-2/5 flex-col border-r border-gray-300 py-5`}>
              <div className="mb-2 h-full w-full overflow-hidden px-5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold">
                    행동특성 및 종합의견 초안 작성<span className="text-brandblue-1 ml-1 align-top text-sm">AI</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#666]">
                  선택한 기록을 기반으로 행동특성 및 종합의견 초안을 작성합니다.
                </div>
                <div className="h-screen-16 flex flex-col space-y-4 overflow-y-auto p-4">
                  {studentInfo && (
                    <>
                      <h1 className="text-xl font-bold text-gray-600">학생 진로진학 정보</h1>
                      <div className="flex flex-row gap-2">
                        <p className="font-semibold">희망 진로</p>
                        <p>{studentInfo.hopePath}</p>
                      </div>
                      <div className="flex flex-row gap-2">
                        <p className="font-semibold">희망 진학</p>
                        <p>{studentInfo.hopeMajor}</p>
                      </div>
                    </>
                  )}
                  <h1 className="text-xl font-bold text-gray-600">학생 자기 평가</h1>
                  <div>
                    {studentSelfAssessment?.keywords &&
                      Object.entries(studentSelfAssessment.keywords).map(([id, { keyword, reason }]) => (
                        <label key={id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedStudentIds.includes(Number(id))}
                            onChange={() =>
                              selectedStudentIds.includes(Number(id))
                                ? setSelectedStudentIds(selectedStudentIds.filter((el) => el !== Number(id)))
                                : setSelectedStudentIds(selectedStudentIds.concat(Number(id)))
                            }
                          />
                          <div>
                            {keyword} : {reason}
                          </div>
                        </label>
                      ))}
                    {studentSelfAssessment?.assessment && (
                      <>
                        <div className="mt-2 flex items-center space-x-2">
                          <Checkbox
                            checked={isStudentAssessmentSelected}
                            onChange={() => setStudentAssessmentSelected(!isStudentAssessmentSelected)}
                          />
                          <p className="text-sm text-gray-500">학생 자기 평가 내용</p>
                        </div>
                        <div className="mt-1 w-full rounded-lg border border-gray-300 p-2 whitespace-pre-line">
                          {studentSelfAssessment.assessment}
                        </div>
                      </>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-gray-600">학생 상담 기록</h1>
                  <div>
                    {counselingData?.map(({ id, content }) => (
                      <label key={id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedCounselingIds.includes(id)}
                          onChange={() =>
                            selectedCounselingIds.includes(id)
                              ? setSelectedCounselingIds(selectedCounselingIds.filter((el) => el !== id))
                              : setSelectedCounselingIds(selectedCounselingIds.concat(id))
                          }
                        />
                        <div>{content}</div>
                      </label>
                    ))}
                  </div>
                  <h1 className="text-xl font-bold text-gray-600">교사 학생 평가</h1>
                  <div>
                    {teacherStudentAssessment?.keywords &&
                      Object.entries(teacherStudentAssessment.keywords).map(([id, { keyword, reason }]) => (
                        <label key={id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedTeacherIds.includes(Number(id))}
                            onChange={() =>
                              selectedTeacherIds.includes(Number(id))
                                ? setSelectedTeacherIds(selectedTeacherIds.filter((el) => el !== Number(id)))
                                : setSelectedTeacherIds(selectedTeacherIds.concat(Number(id)))
                            }
                          />
                          <div>
                            {keyword} : {reason}
                          </div>
                        </label>
                      ))}
                    {teacherStudentAssessment?.assessment && (
                      <>
                        <div className="mt-2 flex items-center space-x-2">
                          <Checkbox
                            checked={isTeacherAssessmentSelected}
                            onChange={() => setTeacherAssessmentSelected(!isTeacherAssessmentSelected)}
                          />
                          <p className="text-sm text-gray-500">교사 학생 평가 내용</p>
                        </div>
                        <div className="mt-1 w-full rounded-lg border border-gray-300 p-2 whitespace-pre-line">
                          {teacherStudentAssessment.assessment}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="min-h-max px-5">
                <button
                  onClick={() => {
                    if (
                      !selectedStudentIds.length &&
                      (!isStudentAssessmentSelected || !studentSelfAssessment?.assessment) &&
                      !selectedTeacherIds.length &&
                      (!isTeacherAssessmentSelected || !teacherStudentAssessment?.assessment)
                    ) {
                      setToastMsg('초안을 작성하려면 데이터를 선택해주세요!')
                      return
                    }
                    getAnnualReview({
                      studentId,
                      data: {
                        selfAssessmentKeywords: selectedStudentIds.map(
                          (sid) => studentSelfAssessment?.keywords?.[sid]?.keyword,
                        ),
                        selfAssessmentReport: isStudentAssessmentSelected
                          ? studentSelfAssessment?.assessment || ''
                          : '',
                        teacherAssessmentKeywords: selectedTeacherIds.map(
                          (sid) => teacherStudentAssessment?.keywords?.[sid]?.keyword,
                        ),
                        teacherAssessmentReport: isTeacherAssessmentSelected
                          ? teacherStudentAssessment?.assessment || ''
                          : '',

                        selectedCounseling:
                          counselingData
                            ?.filter((data) => selectedCounselingIds.includes(data.id))
                            ?.map((el) => el.content) || [],
                      },
                    })
                  }}
                  disabled={
                    isLoading &&
                    !selectedStudentIds.length &&
                    !studentSelfAssessment &&
                    !isStudentAssessmentSelected &&
                    !selectedTeacherIds.length &&
                    !teacherStudentAssessment &&
                    !isTeacherAssessmentSelected
                  }
                  className="w-full rounded-lg bg-[#163192] py-2 text-base text-white disabled:bg-gray-500"
                >
                  행동특성 및 종합의견 초안 작성
                </button>
              </div>
            </div>
            <div className={`flex w-3/5 flex-col overflow-x-hidden overflow-y-auto p-5`}>
              {!reportContents[0] && !isLoading && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-10">
                  <Icon.AIRobot className="h-60 w-60" />
                  <h6 className="text-2xl font-bold text-[#466af0]">
                    {t('text_press_write_annual_review_record', '행동특성 및 종합의견 초안 작성을 눌러보세요!')}
                  </h6>
                </div>
              )}
              {reportContents[0] && (
                <div className="flex w-full flex-col overflow-y-auto pr-2">
                  <div className="text-xl font-bold">
                    {t('ai_drafted_annual_review_record', 'AI 작성 행동특성 및 종합의견 초안')}
                  </div>
                  {reportContents.map((_data, i) => {
                    if (_data.type === 'question') {
                      return (
                        <div key={_data.question} className="my-2 flex w-full items-start justify-end space-x-2">
                          <div className="mt-1 flex flex-col items-end">
                            {_data.sentence && <div className="text-14 text-gray-500">{_data.sentence}</div>}
                            <div> {_data.question}</div>
                          </div>
                          <Avatar size={8} />
                        </div>
                      )
                    }
                    const { data } = _data
                    const reportContent = data.content
                    const byteLength = new TextEncoder().encode(reportContent).length
                    const trimmedContent = reportContent.replaceAll(' ', '')
                    const trimmedByteLength = new TextEncoder().encode(trimmedContent).length

                    return (
                      <>
                        <div className="mt-2 flex w-full items-start space-x-2">
                          <Icon.AIRobot className="h-8 w-8" />
                          <div className="h-max w-full">
                            <div>
                              {i === reportContents.length - 1
                                ? reportContent.split('. ').map((el: string, i: number) => (
                                    <span
                                      className={twMerge(
                                        'cursor-pointer hover:bg-slate-200',
                                        el === sentence && 'bg-slate-300 hover:bg-slate-300',
                                      )}
                                      key={el}
                                      onClick={() => (sentence === el ? setSentence('') : setSentence(el))}
                                    >
                                      {el}
                                      {i !== reportContent.split('. ').length - 1 && '. '}
                                    </span>
                                  ))
                                : reportContent}
                            </div>
                            <div className="mt-2 flex w-full items-center justify-between pb-4 text-sm">
                              <div>
                                <span className="text-gray-500">{t('exclude_space_characters', '공백 제외')} </span>
                                {currentLang === 'en' && trimmedContent.length}
                                {currentLang !== 'en' && `${trimmedContent.length} 자`}
                                &nbsp;/&nbsp;{trimmedByteLength}
                                Byte <span className="text-gray-500">
                                  {t('include_space_characters', '공백 포함')}
                                </span>{' '}
                                {currentLang === 'en' && reportContent.length}
                                {currentLang !== 'en' && `${reportContent.length} 자`}
                                &nbsp;/&nbsp;
                                {byteLength}Byte
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })}
                  {isLoading && (
                    <div className="flex h-80 w-full flex-col items-center justify-center gap-10">
                      <Icon.Loader className="h-60 w-60" />
                      <h6 className="text-2xl font-bold text-[#466af0]">
                        {t(
                          'text_annual_review_record_with_ai',
                          '슈퍼스쿨 AI가 행동특성 및 종합의견 초안을 작성중입니다..',
                        )}
                      </h6>
                    </div>
                  )}
                </div>
              )}

              {!reportContents[0] && isLoading && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-10">
                  <Icon.Loader className="h-60 w-60" />
                  <h6 className="text-2xl font-bold text-[#466af0]">
                    {t('text_annual_review_record_with_ai', '슈퍼스쿨 AI가 행동특성 및 종합의견 초안을 작성중입니다..')}
                  </h6>
                </div>
              )}
              <div className="mt-2">
                {!!reportContents.length && !isLoading && (
                  <div className="flex items-center space-x-2 py-2">
                    <SearchInput
                      placeholder={t(
                        'chatbot_annual_review_record_prompt',
                        '챗봇과 대화를 통해 행동특성 및 종합의견을 보완해 보세요.',
                      )}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onSearch={handleQuestionSend}
                      className="w-full bg-gray-50 text-sm"
                    />
                    <Icon.Send onClick={handleQuestionSend} />
                  </div>
                )}
                <div className="mt-2 flex w-full justify-end space-x-2">
                  <button
                    children={t('exit', '나가기')}
                    onClick={() => setConfirmOpen(!confirmOpen)}
                    className="box-border rounded-md border-2 border-[#163192] px-14 py-2 text-base font-semibold"
                  />
                  {!!reportContents.length && (
                    <button
                      children={t('verb_save', '저장하기')}
                      onClick={() => setModalOpen(true)}
                      className="box-border rounded-md border-2 border-gray-500 bg-[#163192] px-14 py-2 text-base font-semibold text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {confirmOpen && (
          <ConfirmDialog
            cancelText={t('cancel', '취소')}
            confirmText={t('exit', '나가기')}
            description={t(
              'text_warning_unsaved_changes',
              '저장되지 않은 내용은 다시 불러올 수 없습니다.<br/> 한번 더 확인해 주세요.',
            )}
            message={t('text_unsaved_changes', '저장되지 않은 내용이 있습니다.')}
            onCancel={() => setConfirmOpen(!confirmOpen)}
            onConfirm={() => {
              onClose()
              setContent('')
            }}
          />
        )}
      </div>
      <SuperModal
        modalOpen={modalOpen}
        setModalClose={() => {
          setModalStep(1)
          setModalOpen(false)
          setSelectedContentIndex(undefined)
          setContent('')
        }}
        className="w-128 lg:w-256"
      >
        <div className="px-12 py-6">
          {modalStep === 1 && (
            <>
              <div className="h-screen-18 flex flex-col">
                <div>
                  <h1 className="text-xl font-bold">{t('annual_review_record_draft', '행동특성 및 종합의견 초안')}</h1>
                  <span className="text-sm text-gray-600">
                    {t(
                      'select_ai_draft_prompt',
                      'AI로 작성된 초안 중 하나를 선택해주세요. 선택 후 다음 단계에서 내용 수정이 가능합니다.',
                    )}
                  </span>
                </div>
                <div className="mt-2 h-full space-y-2 overflow-y-auto px-1">
                  {reportContents.map(({ data, type }, i) =>
                    type === 'content' ? (
                      <div className="flex w-full items-start space-x-2" key={JSON.stringify(data.report)}>
                        <Checkbox
                          className="mt-1"
                          checked={selectedContentIndex === i}
                          onChange={() =>
                            selectedContentIndex === i ? setSelectedContentIndex(undefined) : setSelectedContentIndex(i)
                          }
                        />
                        <div
                          className="cursor-pointer rounded-lg border border-gray-600 p-2"
                          onClick={() =>
                            selectedContentIndex === i ? setSelectedContentIndex(undefined) : setSelectedContentIndex(i)
                          }
                        >
                          {data.content}
                        </div>
                      </div>
                    ) : (
                      <></>
                    ),
                  )}
                </div>
              </div>
              <button
                children={t('next_short', '다음')}
                disabled={selectedContentIndex === undefined}
                onClick={() => {
                  if (selectedContentIndex !== undefined) {
                    setModalStep(2)
                    setContent(reportContents[selectedContentIndex].data.content)
                  }
                }}
                className="mt-4 box-border w-full rounded-md border-2 border-gray-500 bg-[#163192] px-14 py-2 text-base font-semibold text-white"
              />
            </>
          )}
          {modalStep === 2 && (
            <>
              <div>
                <div className="font-bold">{t('annual_review_record', '행동특성 및 종합의견 초안')}</div>
                <p className="mt-1 text-sm text-gray-500">원하는 부분을 수정할 수 있습니다</p>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-2 h-96 rounded-md"
                />
                <div className="mt-2 flex w-full items-center justify-between pb-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t('exclude_space_characters', '공백 제외')} </span>
                    {currentLang === 'en' && trimmedContent.length}
                    {currentLang !== 'en' && `${trimmedContent.length} 자`}
                    &nbsp;/&nbsp;{trimmedByteLength}
                    Byte <span className="text-gray-500">{t('include_space_characters', '공백 포함')}</span>{' '}
                    {currentLang === 'en' && content.length}
                    {currentLang !== 'en' && `${content.length} 자`}
                    &nbsp;/&nbsp;
                    {byteLength}Byte
                  </div>
                </div>
              </div>
              <button
                children={t('verb_save', '저장하기')}
                onClick={handleSaveClick}
                className="mt-4 box-border w-full rounded-md border-2 border-gray-500 bg-[#163192] px-14 py-2 text-base font-semibold text-white"
              />
            </>
          )}
        </div>
      </SuperModal>
    </>
  )
}
