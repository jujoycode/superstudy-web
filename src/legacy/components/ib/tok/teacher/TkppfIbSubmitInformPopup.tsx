import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { Input } from '@/legacy/components/common/Input'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useIBTKPPFUpdateInfo, useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { RequestTKPPFInfoUpdateDto, ResponseIBDto, ResponseTKPPFDto } from '@/legacy/generated/model'

interface TkppfListPopupProps {
  modalOpen: boolean
  setModalClose: () => void
  ibId: number
  tkppfData?: ResponseTKPPFDto
  IBData: ResponseIBDto
  type?: 'VIEW' | 'CREATE' | null
}

export default function TkppfIbSubmitInformPopup({
  modalOpen,
  setModalClose,
  ibId,
  IBData,
  type = 'CREATE',
  tkppfData,
}: TkppfListPopupProps) {
  const [tkppfState, setTkppfState] = useState<ResponseTKPPFDto | null>(tkppfData || null)
  const { data: fetchedTkppf } = useTKPPFGetByIBId(Number(ibId))
  const [academicIntegrityConsent, setAcademicIntegrityConsent] = useState<boolean>(
    tkppfState?.academicIntegrityConsent || false,
  )
  const [teacherFeedback, setTeacherFeedback] = useState<string>(tkppfState?.teacherFeedback || '')
  const [teacherSignature, setTeacherSignature] = useState<string>(tkppfState?.teacherSignature || '')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const { updateIBTKPPFInfo } = useIBTKPPFUpdateInfo({
    onSuccess: () => {
      setAlertMessage(`TKPPF 정보가\n저장되었습니다`)
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error)
    },
  })

  useEffect(() => {
    if (!tkppfData && fetchedTkppf) {
      setTkppfState(fetchedTkppf)
    }
  }, [tkppfData, fetchedTkppf])

  if (!tkppfState) {
    return <div>TKPPF 정보를 불러오지 못하였습니다.</div>
  }

  return (
    <PopupModal
      modalOpen={modalOpen}
      setModalClose={setModalClose}
      title="IB 제출정보 기입 및 확인"
      bottomBorder={false}
      containerClassName="px-0"
      headerClassName="px-8"
      footerClassName="px-8"
      {...(type !== 'VIEW' && {
        footerButtons: (
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!(academicIntegrityConsent && teacherFeedback && teacherSignature)}
            onClick={() => {
              const requestData: RequestTKPPFInfoUpdateDto = {
                teacherSignature: teacherSignature || '',
                teacherFeedback: teacherFeedback || '',
                academicIntegrityConsent,
              }

              updateIBTKPPFInfo({
                ibId,
                data: requestData,
              })
            }}
          >
            저장하기
          </ButtonV2>
        ),
      })}
    >
      <div className="flex flex-col">
        <div className="border-b border-b-gray-100 px-8 pb-8">
          {/* 학생 정보 */}
          <div className="flex flex-col justify-center gap-[8px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
            <Typography variant="title3" className="text-gray-900">
              {IBData?.leader.studentGroup.group.grade}
              {String(IBData?.leader.studentGroup.group.klass).padStart(2, '0')}
              {String(IBData?.leader.studentGroup.studentNumber).padStart(2, '0')}
              <span className="px-[6px] text-gray-400">·</span>
              {IBData?.leader.name}
            </Typography>
            <div className="flex flex-col gap-[2px]">
              <Typography variant="caption" className="w-[428px] text-gray-500">
                Candidate personal code: {'IBPSH394_312'}
              </Typography>
              <Typography variant="caption" className="w-[428px] text-gray-500">
                Session: {'November 2024'} · Candidate Session Number: {'061983-0001'}
              </Typography>
            </div>
          </div>
        </div>

        {/* 제출내역 */}
        <div className="mt-8 flex flex-col gap-3 border-b border-b-gray-100 px-8">
          <div className="flex justify-between">
            <Typography variant="title3" className="text-gray-900">
              제출내역
            </Typography>
          </div>

          {/* TKPPF 1차 */}
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Typography variant="title3" className="text-gray-900">
                TKPPF 1차
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                최초 제출일 : {format(new Date(tkppfState?.sequence1.createdAt), 'yyyy.MM.dd')}
              </Typography>
            </div>
            <Typography variant="body2" className="text-gray-700">
              {tkppfState?.sequence1.text}
            </Typography>
          </div>

          {/* TKPPF 2차 */}
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Typography variant="title3" className="text-gray-900">
                TKPPF 2차
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                최초 제출일 : {format(new Date(tkppfState?.sequence2.createdAt), 'yyyy.MM.dd')}
              </Typography>
            </div>
            <Typography variant="body2" className="text-gray-700">
              {tkppfState?.sequence2.text}
            </Typography>
          </div>

          {/* TKPPF 3차 */}
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Typography variant="title3" className="text-gray-900">
                TKPPF 3차
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                최초 제출일 : {format(new Date(tkppfState?.sequence3.createdAt), 'yyyy.MM.dd')}
              </Typography>
            </div>
            <Typography variant="body2" className="text-gray-700">
              {tkppfState?.sequence3.text}
            </Typography>
          </div>

          <div className="flex flex-col gap-3">
            <Typography variant="body2" className="rounded-lg bg-gray-50 px-4 py-[13px] text-gray-700">
              학생의 소논문이 학문적 진실성에 어긋나지 않고, 학생 스스로 힘으로 작성되었다는 것을 지도교사로서
              확인했습니다.
            </Typography>
            <div className="mb-8 flex items-center gap-2">
              <Check.Basic
                checked={academicIntegrityConsent}
                onChange={() => setAcademicIntegrityConsent(!academicIntegrityConsent)}
                disabled={type === 'VIEW'}
              />
              <Typography variant="title3" className="font-medium text-gray-900">
                위 내용을 확인 하였으며, 동의합니다.
              </Typography>
            </div>
          </div>
        </div>

        {/* 지도교사 의견 작성 */}
        <div className="mt-8 flex flex-col gap-3 px-8">
          <Typography variant="title3" className="text-gray-900">
            지도교사 의견 작성
          </Typography>
          {type === 'VIEW' ? (
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-100 p-4">
              {teacherFeedback}
            </div>
          ) : (
            <TextareaV2
              placeholder="지도 의견을 작성해주세요."
              readonlyBackground="bg-gray-100"
              className="h-[200px]"
              readonly={!academicIntegrityConsent}
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
            />
          )}
          <Input.Label
            label="지도교사 서명"
            size={40}
            type="text"
            placeholder="지도 의견 작성 후 자동으로 입력됩니다."
            value={teacherSignature}
            onChange={(e) => setTeacherSignature(e.target.value)}
            readonly={!academicIntegrityConsent}
            disabled={type === 'VIEW'}
          />
        </div>
      </div>
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setModalClose()} />}
    </PopupModal>
  )
}
