import clsx from 'clsx'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'

import { useHistory } from '@/hooks/useHistory'
import AlertV2 from '@/legacy/components/common/AlertV2'
import { BadgeV2 } from '@/legacy/components/common/BadgeV2'
import Breadcrumb from '@/legacy/components/common/Breadcrumb'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { TextareaV2 } from '@/legacy/components/common/TextareaV2'
import { Typography } from '@/legacy/components/common/Typography'
import RppfIbSubmitInformPopup from '@/legacy/components/ib/ee/RppfIbSubmitInformPopup'
import { Feedback } from '@/legacy/components/ib/Feedback'
import IBLayout from '@/legacy/components/ib/IBLayout'
import { PopupModal } from '@/legacy/components/PopupModal'
import { useIBApproveComplete } from '@/legacy/container/ib-project'
import { useIBGetById } from '@/legacy/container/ib-project-get-student'
import { useIBRPPFCreate } from '@/legacy/container/ib-rppf-create'
import { useRPPFGetById } from '@/legacy/container/ib-rppf-findId'
import { useRPPFUpdateRPPFStatusReject } from '@/legacy/generated/endpoint'
import { RequestCreateRPPFDto } from '@/legacy/generated/model'
import { usePermission } from '@/legacy/hooks/ib/usePermission'
import { useUserStore } from '@/stores2/user'

export const EERppfDetailPage = () => {
  const history = useHistory()
  const location = useLocation()
  const { me } = useUserStore()

  const { id, rppfId } = useParams<{ id: string; rppfId: string }>()

  const { student: locationStudentData } = location.state || {}

  const {
    data: ibData,
    klassNum: ibKlassNum,
    isLoading: isIBLoading,
  } = useIBGetById(Number(id), {
    enabled: !locationStudentData,
  })
  const data = location.state?.data || ibData

  const klassNum = location.state?.student.klassNum || ibKlassNum

  const permission = usePermission(data?.mentor ?? null, me?.id ?? 0)
  const hasPermission = permission[0] === 'mentor' || permission[1] === 'IB_EE'

  const [rejectModalOpen, setRejectModalOpen] = useState(false) // RPPF 보완 요청 Modal
  const [rejectReason, setRejectReason] = useState('') // RPPF 보완 요청 피드백
  const [ibModalType, setIbModalType] = useState<'CREATE' | 'VIEW' | null>(null) // IB Modal 타입 관리

  const { data: rppf, isLoading: isRPPFLoading } = useRPPFGetById(Number(id), Number(rppfId))

  const { createIBRPPF, isLoading: isCreateLoading } = useIBRPPFCreate({
    onSuccess: () => {
      setAlertMessage(`RPPF가\n수정되었습니다`)
    },
    onError: (error) => {
      console.error('RPPF 수정 중 오류 발생:', error)
    },
  })

  const { mutate: rejectPlan, isLoading: rejectPlanLoading } = useRPPFUpdateRPPFStatusReject({
    mutation: {
      onSuccess: () => {
        setAlertMessage(`RPPF 보완을\n요청하였습니다`)
        setRejectModalOpen(!rejectModalOpen)
      },
    },
  })

  const { approveIBProjectComplete, isLoading: isApproveCompleteLoading } = useIBApproveComplete({
    onSuccess: () => {
      setAlertMessage(`완료를\n승인하였습니다`)
    },
    onError: (error) => {
      console.error('완료 승인 중 오류 발생:', error)
    },
  })

  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [wordCounts, setWordCounts] = useState<number[]>([])
  const handleIbModalOpen = (type: 'CREATE' | 'VIEW') => {
    setIbModalType(type) // 모달 타입 설정
  }

  const handleIbModalClose = () => {
    setIbModalType(null) // 모달 타입 초기화
  }

  useEffect(() => {
    if (rppf?.contents) {
      const initialWordCounts = rppf.contents.map((content) => Number(content.wordCount) || 0)
      setWordCounts(initialWordCounts)
    }
  }, [rppf])

  const handleWordCountChange = (index: number, count: number) => {
    setWordCounts((prev) => {
      const updatedCounts = [...prev]
      updatedCounts[index] = count
      return updatedCounts
    })
  }

  const { register, handleSubmit } = useForm<RequestCreateRPPFDto>({
    defaultValues: {
      contents:
        rppf?.contents.map((data) => ({
          id: data.id,
          sequence: data.sequence,
          text: data.text || '',
          wordCount: Number(data.wordCount) || 0,
        })) || [],
    },
  })

  const onSubmit = (data: RequestCreateRPPFDto) => {
    const filteredContents = data.contents
      .map((content, index) => ({
        ...content,
        id: content.id,
        sequence: index + 1,
        wordCount: wordCounts[index],
      }))
      .filter((content) => content.text && content.text.trim() !== '')

    const updatedData = {
      ...data,
      contents: filteredContents,
    }

    if (id !== undefined) {
      createIBRPPF({ ibId: Number(id), data: updatedData })
    }
    setEditMode(!editMode)
  }

  if (me === undefined) {
    return <IBBlank />
  }

  return (
    <div className="col-span-6">
      {(isIBLoading || isRPPFLoading) && <IBBlank />}
      {(isCreateLoading || isApproveCompleteLoading || rejectPlanLoading) && <IBBlank type="opacity" />}
      <IBLayout
        topContent={
          <div>
            <div className="w-full pt-16 pb-6">
              <div className="flex flex-col items-start gap-3">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <BadgeV2 color="dark_green" size={24} type="solid_strong" className="px-[12.5px]">
                      EE
                    </BadgeV2>
                    <BadgeV2 color="gray" size={24} type="solid_regular">
                      RPPF
                    </BadgeV2>
                  </div>
                  <Breadcrumb
                    data={{
                      진행상태: '/teacher/project',
                      EE: `/teacher/ib/ee/${id}`,
                      'RPPF 상세': `/teacher/ib/ee/${id}/rppf/${rppfId}`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <Typography variant="heading" className="w-[692px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {`${data?.leader?.name}의 EE RPPF`}
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
                      <div className="scroll-box flex h-full flex-col gap-6 overflow-auto pt-4">
                        <div className="flex flex-row items-center justify-between">
                          <Typography variant="title1" className="text-primary-gray-900">
                            공식 RPPF
                          </Typography>
                          <div className="text-12 flex flex-row items-center">
                            <p className="text-primary-gray-500">총 단어 수</p>&nbsp;
                            <p className="text-primary-orange-800 font-medium">
                              {wordCounts.reduce((sum, count) => sum + count, 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          {rppf?.contents.map((content, index) => (
                            <div
                              className={clsx('flex flex-col gap-4', {
                                'pt-6': index === 0,
                                'py-10': index === 1,
                                'pb-10': index === 2,
                              })}
                              key={content.id}
                            >
                              <div className="flex items-center justify-between">
                                <Typography variant="title2" className="text-primary-gray-900">
                                  RPPF {content.sequence}차
                                </Typography>
                                <Typography variant="caption" className="text-primary-gray-500">
                                  최초 저장일 : {format(new Date(content.createdAt), 'yyyy.MM.dd')}
                                </Typography>
                              </div>
                              <input
                                type="hidden"
                                value={Number(content.id)} // Ensure id is an integer
                                {...register(`contents.${index}.id`, { valueAsNumber: true })}
                              />
                              <TextareaV2
                                showWordCount={true}
                                onWordCountChange={(count) => handleWordCountChange(index, count)}
                                value={content.text}
                                placeholder="내용을 입력해주세요."
                                className="h-[308px]"
                                {...register(`contents.${index}.text` as const)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                      <Typography variant="title1" className="text-primary-gray-900">
                        공식 RPPF
                      </Typography>
                      <div className="text-12 flex flex-row items-center">
                        <p className="text-primary-gray-500">총 단어 수</p>&nbsp;
                        <p className="text-primary-orange-800 font-medium">
                          {wordCounts.reduce((sum, count) => sum + count, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {rppf?.contents.map((content, index) => (
                        <div
                          className={clsx('flex flex-col gap-4', {
                            'pt-6': index === 0,
                            'py-10': index === 1,
                            'pb-10': index === 2,
                          })}
                          key={content.id}
                        >
                          <div className="flex items-center justify-between">
                            <Typography variant="title2" className="text-primary-gray-900">
                              RPPF {content.sequence}차
                            </Typography>
                            <Typography variant="caption" className="text-primary-gray-500">
                              최초 저장일 : {format(new Date(content.createdAt), 'yyyy.MM.dd')}
                            </Typography>
                          </div>
                          <div className="border-primary-gray-200 flex flex-col gap-4 rounded-lg border p-4">
                            <Typography variant="body2">{content.text}</Typography>
                            <div className="text-12 flex flex-row items-center">
                              <p className="text-primary-gray-500">단어 수</p>&nbsp;
                              <p className="text-primary-orange-800 font-medium">{content.wordCount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <footer className={`flex flex-row items-center justify-between`}>
                  {editMode ? (
                    <>
                      <ButtonV2 size={40} variant="solid" color="gray100" onClick={() => setEditMode(!editMode)}>
                        취소
                      </ButtonV2>
                      <ButtonV2 size={40} variant="solid" color="orange100" onClick={handleSubmit(onSubmit)}>
                        저장하기
                      </ButtonV2>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center gap-2">
                        {/* {data?.status !== 'COMPLETE' && hasPermission && (
                          <ButtonV2
                            size={40}
                            variant="outline"
                            color="gray400"
                            onClick={onEdit}
                            disabled={data?.status === 'WAIT_COMPLETE'}
                          >
                            수정
                          </ButtonV2>
                        )} */}
                      </div>
                      <ButtonV2
                        size={40}
                        variant="solid"
                        color="gray100"
                        onClick={() => history.push(`/teacher/ib/ee/${id}`, { type: 'RPPF' })}
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
                    referenceId={Number(rppfId)}
                    referenceTable="RPPF"
                    user={me}
                    useTextarea={data?.status !== 'COMPLETE'}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        floatingButton={
          hasPermission && (
            <div className="w-inherit fixed bottom-0 bg-white py-5">
              {data?.status === 'COMPLETE' ? (
                <div className="mx-auto flex w-[1280px] items-center justify-center">
                  <ButtonV2
                    className="w-[416px]"
                    size={48}
                    variant="solid"
                    color="gray700"
                    onClick={() => handleIbModalOpen('VIEW')}
                  >
                    IB제출정보 확인
                  </ButtonV2>
                </div>
              ) : rppf?.status === 'WAIT_COMPLETE' || rppf?.status === 'COMPLETE' ? (
                <>
                  {rppf?.academicIntegrityConsent ? (
                    <div className="mx-auto flex w-[1280px] items-center justify-end">
                      <div className="flex items-center gap-4">
                        <ButtonV2
                          className="w-[200px]"
                          size={48}
                          variant="solid"
                          color="gray700"
                          onClick={() => handleIbModalOpen('CREATE')}
                        >
                          IB제출정보 확인 및 수정
                        </ButtonV2>
                        <ButtonV2
                          className="w-[200px]"
                          size={48}
                          variant="solid"
                          color="orange800"
                          onClick={() => approveIBProjectComplete(Number(id))}
                        >
                          완료 승인
                        </ButtonV2>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto flex w-[1280px] items-center justify-end">
                      <div className="flex items-center gap-4">
                        <ButtonV2
                          className="w-[200px]"
                          size={48}
                          variant="solid"
                          color="gray700"
                          onClick={() => setRejectModalOpen(true)}
                        >
                          RPPF 보완요청
                        </ButtonV2>
                        <ButtonV2
                          className="w-[200px]"
                          size={48}
                          variant="solid"
                          color="orange800"
                          onClick={() => handleIbModalOpen('CREATE')}
                        >
                          IB제출정보 기입
                        </ButtonV2>
                      </div>
                    </div>
                  )}
                </>
              ) : rppf?.status === 'REJECT' ? (
                <div className="mx-auto flex w-[1280px] items-center justify-center">
                  <ButtonV2 variant="solid" color="gray700" size={48} className="w-[416px]" disabled={true}>
                    RPPF 보완요청
                  </ButtonV2>
                </div>
              ) : null}
            </div>
          )
        }
      />
      {/* RPPF 보완 요청 Modal */}
      <PopupModal
        modalOpen={rejectModalOpen}
        setModalClose={() => {
          setRejectModalOpen(false)
          setRejectReason('')
        }}
        title="RPPF 보완 요청"
        bottomBorder={false}
        footerButtons={
          <ButtonV2
            size={48}
            variant="solid"
            color="orange800"
            className="w-[88px]"
            disabled={!Boolean(rejectReason.length).valueOf()}
            onClick={() => rejectPlan({ ibId: Number(id), rppfId: Number(rppfId), data: { content: rejectReason } })}
          >
            전달하기
          </ButtonV2>
        }
      >
        <div className="flex flex-col gap-6">
          <Typography variant="body1" className="text-primary-gray-900">
            학생에게 RPPF에 대한 피드백을 남겨주세요.
          </Typography>
          <TextareaV2
            placeholder="내용을 입력하세요."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </PopupModal>
      {ibModalType && rppf && (
        <RppfIbSubmitInformPopup
          IBData={data}
          rppfId={Number(rppfId)}
          ibId={Number(id)}
          rppfData={rppf}
          modalOpen={Boolean(ibModalType)}
          setModalClose={handleIbModalClose}
          type={ibModalType}
        />
      )}
      {alertMessage && <AlertV2 message={alertMessage} confirmText="확인" onConfirm={() => setAlertMessage(null)} />}
    </div>
  )
}
