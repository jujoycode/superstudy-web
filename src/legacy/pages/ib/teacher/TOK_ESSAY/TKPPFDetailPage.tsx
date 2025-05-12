import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import TkppfIbSubmitInformPopup from '@/legacy/components/ib/tok/teacher/TkppfIbSubmitInformPopup'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useIBApproveComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBTKPPFCreate, useIBTKPPFRequestReject, useTKPPFGetByIBId } from '@/legacy/container/ib-tok-essay'
import { RequestCreateTKPPFDto, ResponseTKPPFDto, TKPPFContentResponseDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { meState } from 'src/store'
import { LocationState } from '@/legacy/type/ib'

type TKPPFKeys = 'sequence1' | 'sequence2' | 'sequence3'

export const TKPPFDetailPage = () => {
  const history = useHistory()
  const location = useLocation<LocationState>()
  const me = useRecoilValue(meState)

  const { ibId: idParam, tkppfId: tkppfIdParam } = useParams<{ ibId: string; tkppfId: string }>()

  const id = Number(idParam)
  const tkppfId = Number(tkppfIdParam)

  const { student: locationStudentData } = location.state || {}

  const { data: ibData, klassNum: ibKlassNum } = useIBGetById(id, {
    enabled: !locationStudentData,
  })
  const data = location.state?.data || ibData

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_TOK'

  const klassNum = ibKlassNum

  const [rejectModalOpen, setRejectModalOpen] = useState(false) // TKPPF 보완 요청 Modal
  const [rejectReason, setRejectReason] = useState('') // TKPPF 보완 요청 피드백
  const [ibModalType, setIbModalType] = useState<'CREATE' | 'VIEW' | null>(null) // IB Modal 타입 관리

  const { data: tkppf } = useTKPPFGetByIBId(id)

  // TKPPF 수정 api 호출
  const { createIBTKPPF } = useIBTKPPFCreate({
    onSuccess: () => {
      setAlertMessage(`TKPPF가\n수정되었습니다`)
    },
    onError: (error) => {
      console.error('TKPPF 수정 중 오류 발생:', error)
    },
  })

  // 보완 요청 api 호출
  const { requestIBTKPPFReject, isLoading } = useIBTKPPFRequestReject({
    onSuccess: () => {
      setAlertMessage(`TKPPF 보완을\n요청하였습니다`)
      setRejectModalOpen(!rejectModalOpen)
    },
  })

  // 완료 요청 api 호출
  const { approveIBProjectComplete } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage(`완료를\n승인하였습니다`)
    },
    onError: (error) => {
      console.error('완료 승인 중 오류 발생:', error)
    },
  })

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const handleIbModalOpen = (type: 'CREATE' | 'VIEW') => {
    setIbModalType(type) // 모달 타입 설정
  }

  const handleIbModalClose = () => {
    setIbModalType(null) // 모달 타입 초기화
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestCreateTKPPFDto>({
    defaultValues: {
      sequence1: {
        text: tkppf?.sequence1?.text || '',
      },
      sequence2: {
        text: tkppf?.sequence2?.text || '',
      },
      sequence3: {
        text: tkppf?.sequence3?.text || '',
      },
    },
  })

  const handleEditModeToggle = () => {
    if (!editMode && tkppf) {
      reset(tkppf)
    }
    setEditMode(!editMode)
  }

  const onSubmit = (data: RequestCreateTKPPFDto) => {
    if (id !== undefined) {
      createIBTKPPF({ ibId: id, data })
    }
    handleEditModeToggle()
  }

  useEffect(() => {
    if (tkppf) {
      reset(tkppf)
    }
  }, [tkppf, reset])

  if (me === undefined || ibData === undefined || tkppf === undefined) {
    return <div>접속 정보를 불러올 수 없습니다.</div>
  }

  return (
    <div className="col-span-6">
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="brown" size={24} type="solid_strong">
                      TOK
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      TKPPF
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/teacher/project',
                      'TOK 에세이': `/teacher/ib/tok/essay/${ibData.id}`,
                      'TKPPF 상세': `/teacher/ib/tok/tkppf/${id}/detail/${tkppfId}`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {`${data?.leader?.name}의 TOK 에세이 - TKPPF`}
                  </Typography>
                  <div className="text-16 text-primary-orange-800 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 font-semibold">
                    {klassNum} · {data?.leader?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        bottomBgColor="bg-primary-gray-50"
        bottomContent={
          <div className="flex flex-grow flex-col">
            <div className="flex h-full flex-row gap-4 py-6">
              <div className="flex w-[848px] flex-col justify-between rounded-xl bg-white p-6">
                {editMode ? (
                  <>
                    <form>
                      <div className="scroll-box flex h-full flex-col gap-10 overflow-auto">
                        <div className="flex flex-col gap-10">
                          {[1, 2, 3].map((num) => {
                            const sequenceKey = `sequence${num}` as keyof ResponseTKPPFDto

                            const sequence = tkppf[sequenceKey] as TKPPFContentResponseDto

                            // sequence가 없거나 text가 비어있으면 해당 차시를 렌더링하지 않음
                            if (!sequence?.text) return null

                            return (
                              <div key={num} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <Typography variant="title2" className="text-primary-gray-900">
                                    TKPPF {num}차
                                  </Typography>
                                  <Typography variant="caption" className="text-primary-gray-500">
                                    최초 저장일 : {format(new Date(sequence.createdAt), 'yyyy.MM.dd')}
                                  </Typography>
                                </div>
                                <TextareaV2
                                  value={sequence.text}
                                  placeholder="내용을 입력해주세요."
                                  className="h-[308px]"
                                  {...register(`${sequenceKey}.text` as `${TKPPFKeys}.text`)}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title1" className="text-primary-gray-900">
                        공식 TKPPF
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-10">
                      {[1, 2, 3].map((num) => {
                        const sequenceKey = `sequence${num}` as keyof ResponseTKPPFDto

                        const sequence = tkppf[sequenceKey] as TKPPFContentResponseDto

                        // sequence가 없거나 text가 비어있으면 해당 차시를 렌더링하지 않음
                        if (!sequence?.text) return null

                        return (
                          <div key={num} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <Typography variant="title2" className="text-primary-gray-900">
                                TKPPF {num}차
                              </Typography>
                              <Typography variant="caption" className="text-primary-gray-500">
                                최초 제출일 : {format(new Date(sequence.createdAt), 'yyyy.MM.dd')}
                              </Typography>
                            </div>
                            <div className="border-primary-gray-200 flex flex-col gap-4 rounded-lg border p-4">
                              <Typography variant="body2">{sequence.text}</Typography>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <footer className={`mt-10 flex flex-row items-center justify-between`}>
                  {editMode ? (
                    <>
                      <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => handleEditModeToggle()}>
                        취소
                      </ButtonV2>
                      <ButtonV2 size={40} variant="solid" color="orange100" onClick={handleSubmit(onSubmit)}>
                        저장하기
                      </ButtonV2>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center gap-2">
                        {/* {ibData?.status !== 'COMPLETE' && hasPermission && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={() => handleEditModeToggle()}
                            disabled={ibData?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )} */}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/teacher/ib/tok/essay/${ibData.id}`, { type: 'TKPPF' })}
                      >
                        목록 돌아가기
                      </ButtonV2>
                    </>
                  )}
                </footer>
              </div>
              <div className="flex h-[720px] w-[416px] flex-col gap-6 rounded-xl bg-white p-6">
                <Typography variant="title1" className="text-primary-gray-900">
                  진행기록
                </Typography>
                <div className="h-full w-full">
                  <Feedback
                    referenceId={tkppf.id}
                    referenceTable="TKPPF"
                    user={me}
                    useTextarea={ibData?.status !== 'COMPLETE'}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        floatingButton={
          hasPermission &&
          (data?.status === 'COMPLETE' ? (
            <ButtonV2
              className="w-[416px]"
              size={48}
              variant="solid"
              color="gray700"
              onClick={() => handleIbModalOpen('VIEW')}
            >
              TKPPF 정보 확인
            </ButtonV2>
          ) : ibData?.status === 'WAIT_COMPLETE' ? (
            <div>
              {tkppf?.academicIntegrityConsent ? (
                <ButtonV2
                  className="w-[416px]"
                  size={48}
                  variant="solid"
                  color="gray700"
                  onClick={() => handleIbModalOpen('CREATE')}
                >
                  TKPPF 정보 확인 및 수정
                </ButtonV2>
              ) : (
                <ButtonV2
                  className="w-[416px]"
                  size={48}
                  variant="solid"
                  color="orange800"
                  onClick={() => handleIbModalOpen('CREATE')}
                >
                  TKPPF 정보 기입
                </ButtonV2>
              )}
            </div>
          ) : null)
        }
      />
      {/* TKPPF 보완 요청 Modal */}
      <PopupModal
        modalOpen={rejectModalOpen}
        setModalClose={() => {
          setRejectModalOpen(false)
          setRejectReason('')
        }}
        title="TKPPF 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectReason.length).valueOf()}
            onClick={() => requestIBTKPPFReject(Number(id), { content: rejectReason })}
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-6">
          <Typography variant="body1" className="text-primary-gray-900">
            학생에게 TKPPF에 대한 피드백을 남겨주세요.
          </Typography>
          <TextareaV2
            placeholder="내용을 입력하세요."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </PopupModal>
      {ibModalType && tkppf && (
        <TkppfIbSubmitInformPopup
          IBData={data}
          ibId={id}
          tkppfData={tkppf}
          modalOpen={Boolean(ibModalType)}
          setModalClose={handleIbModalClose}
          type={ibModalType}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
