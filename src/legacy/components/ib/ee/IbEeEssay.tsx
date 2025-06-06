import { ChangeEvent, PropsWithChildren, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import AlertV2 from '@/legacy/components/common/AlertV2'
import { ButtonV2 } from '@/legacy/components/common/ButtonV2'
import { Check } from '@/legacy/components/common/Check'
import { IBBlank } from '@/legacy/components/common/IBBlank'
import { ImageNFileUpload } from '@/legacy/components/common/ImageNFileUpload'
import { Input } from '@/legacy/components/common/Input'
import { Typography } from '@/legacy/components/common/Typography'
import { useCheckListGetByStudent } from '@/legacy/container/ib-checklist-find'
import { useIBCheckListUpdate, useIBCheckListUpdateByTeacher } from '@/legacy/container/ib-checklist-update'
import { useIBEssayCreate } from '@/legacy/container/ib-essay-create'
import { useIBEssayUpdate } from '@/legacy/container/ib-essay-update'
import { RequestEssayDto, ResponseEssayDto, UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { useImageAndDocument } from '@/legacy/hooks/useImageAndDocument'
import { getFileNameFromUrl } from '@/legacy/util/file'

import { PopupModal } from '../../PopupModal'

interface IbEeEssayProps {
  modalOpen: boolean
  setModalClose: () => void
  studentId: number
  projectId?: number
  essayData?: ResponseEssayDto
  onSuccess: (action: 'update' | 'update_check' | 'create') => void
  // type === 'create' 에세이 작성, 'update' 에세이 수정, 'view' 체크리스트 확인, 'update_check' 체크리스트 수정
  type: 'create' | 'update' | 'view' | 'update_check'
  user?: 'student' | 'teacher'
  ablePropragation?: boolean
}

export function IbEeEssay({
  modalOpen,
  setModalClose,
  type,
  projectId,
  essayData,
  studentId,
  user = 'student',
  onSuccess,
  ablePropragation = false,
}: PropsWithChildren<IbEeEssayProps>) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertDescription, setAlertDescription] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [checked, setChecked] = useState<boolean>(false)
  const [step, setStep] = useState<number>(0)
  const { CheckList, isLoading } = useCheckListGetByStudent(studentId, 'ESSAY')

  const { updateIBCheckList, isLoading: isUpdateCheckList } = useIBCheckListUpdate({
    onSuccess: () => {
      setModalClose()
      onSuccess('update_check')
    },
    onError: (error) => {
      console.error('체크리스트 수정 중 오류 발생:', error)
    },
  })

  const { updateIBCheckListByTeacher, isLoading: isUpdateCheckListTeacher } = useIBCheckListUpdateByTeacher({
    onSuccess: () => {
      setModalClose()
      onSuccess('update_check')
    },
    onError: (error) => {
      console.error('체크리스트 수정 중 오류 발생:', error)
    },
  })

  const { createIBEssay, isLoading: isCreateEssay } = useIBEssayCreate({
    onSuccess: () => {
      setModalClose()
      onSuccess('create')
    },
    onError: (error) => {
      console.error('에세이 생성 중 오류 발생:', error)
    },
  })

  const { updateIBEssay, isLoading: isUpdateEssay } = useIBEssayUpdate({
    onSuccess: () => {
      setModalClose()
      onSuccess('update')
    },
    onError: (error) => {
      console.error('에세이 수정 중 오류 발생:', error)
    },
  })

  useEffect(() => {
    if ((type === 'update' || type === 'update_check' || type === 'view') && CheckList) {
      const preselectedValues = CheckList.filter((item) => item.check).map((item) => item.id)
      setSelectedIds(preselectedValues)
    }

    if ((type === 'update' || type === 'update_check') && essayData) {
      setChecked(essayData?.academicIntegrityConsent)
    }
  }, [type, CheckList])

  const { documentObjectMap, handleDocumentAdd, resetDocuments } = useImageAndDocument({
    documents: essayData?.filePath ? [essayData.filePath] : undefined,
  })
  const { isUploadLoading, handleUploadFile } = useFileUpload()
  const handleGroupChange = (selectedValues: number[]) => {
    setSelectedIds(selectedValues)
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const handleDocumentAddWithLimit = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    const file = files[0]
    if (file.type !== 'application/pdf') {
      setAlertMessage(`지원하지 않는 파일 형식입니다.`)
      setAlertDescription(`PDF 파일만 업로드 할 수 있습니다.`)
      e.target.value = '' // 업로드 시도한 파일 초기화
      return
    }

    const oversizedFile = Array.from(files).find((file) => file.size > MAX_FILE_SIZE)
    if (oversizedFile) {
      setAlertMessage(`에세이 파일을 업로드할 수 없습니다.`)
      setAlertDescription(
        `에세이 파일 용량이 10MB를 넘어 업로드 할 수 없습니다.\n에세이 분량을 조절 후 다시 업로드하세요.`,
      )
      e.target.value = '' // 업로드 시도한 파일 초기화
      return
    }

    handleDocumentAdd(e)
  }

  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<RequestEssayDto>({
    defaultValues: (type === 'update' || type === 'update_check') && essayData ? essayData : {},
    mode: 'onChange',
  })

  const handleCharCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    e.target.value = value
  }

  const onSubmit = async (data: RequestEssayDto) => {
    const documentFiles = [...documentObjectMap.values()]
      .filter((value) => !value.isDelete && value.document instanceof File)
      .map((value) => value.document) as File[]
    const documentFileNames = await handleUploadFile(UploadFileTypeEnum['ib/essay/files'], documentFiles)
    const allIds = CheckList?.map((item) => item.id) || []
    const uncheckedIds = allIds.filter((id) => !selectedIds.includes(id))
    const _data = {
      ...data,
      filePath: documentFileNames[0],
      academicIntegrityConsent: checked,
    }

    if (type === 'update' || type === 'update_check') {
      if (essayData?.id !== undefined) {
        if (user === 'student') {
          updateIBCheckList({ location: 'ESSAY', checkedIds: selectedIds, uncheckedIds })
          updateIBEssay({ id: essayData?.id, data: _data })
        } else {
          updateIBCheckListByTeacher({ studentId, data: { location: 'ESSAY', checkedIds: selectedIds, uncheckedIds } })
          updateIBEssay({ id: essayData?.id, data: _data })
        }
      }
    } else {
      if (projectId !== undefined) {
        updateIBCheckList({ location: 'ESSAY', checkedIds: selectedIds, uncheckedIds })
        createIBEssay({ ibId: projectId, data: _data })
      }
    }
  }

  const content =
    type === 'update_check' ? (
      <>
        <section className="flex flex-col gap-4">
          <Check.Group selectedValues={selectedIds} onChange={handleGroupChange} className="flex flex-col gap-3">
            {CheckList?.map((item) => (
              <Check.Box key={item.id} label={item.content} size={20} value={item.id} checked={item.check} />
            ))}
          </Check.Group>
          <div className="flex flex-row items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <Typography variant="body3">에세이에 사용한 단어 수를 입력해주세요</Typography>
            <Input.Basic
              size={32}
              placeholder="예) 3600"
              type="text"
              inputMode="numeric"
              className="w-[200px]"
              onInput={handleCharCountChange}
              {...register('charCount', { valueAsNumber: true, required: true, validate: (value) => !!value })}
            />
          </div>
        </section>
        <section className="flex flex-col gap-4 py-8">
          <Typography variant="title3">학문적 진실성 동의</Typography>
          <Typography variant="body2" className="rounded-lg bg-gray-50 px-4 py-[13px]">
            소논문은 전적으로 학생 본인에 의해 쓰였으며, 인용하였다고 출처 표시를 한 부분을 제외하고 어떠한 부분도 다른
            저자(인공지능)의 자료를 사용하지 않았음을 약속합니다. 추후 학업적 진실성에 어긋난다고 확인되는 경우 IB
            졸업장이 취소될 수 있음을 인지하고 있습니다.
          </Typography>
          <span className="flex flex-row items-center justify-start gap-2">
            <Check.Basic checked={checked} onChange={() => setChecked(!checked)} />
            <Typography variant="title3" className="cursor-pointer" onClick={() => setChecked(!checked)}>
              위 내용을 확인 하였으며, 동의합니다.
            </Typography>
          </span>
        </section>
      </>
    ) : type === 'view' ? (
      <section className="flex flex-col gap-4">
        <Check.Group selectedValues={selectedIds} className="flex flex-col gap-3">
          {CheckList?.map((item) => (
            <Check.Box key={item.id} label={item.content} size={20} value={item.id} checked={item.check} disabled />
          ))}
        </Check.Group>
        <div className="flex flex-row items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <Typography variant="body3">에세이에 사용한 단어 수를 입력해주세요</Typography>
          <Input.Basic
            size={32}
            placeholder="예) 3600"
            type="number"
            className="w-[200px]"
            readonly
            value={essayData?.charCount}
          />
        </div>
      </section>
    ) : step === 0 ? (
      <>
        <section className="flex flex-col gap-4 border-b border-b-gray-100 pb-8">
          <Check.Group selectedValues={selectedIds} onChange={handleGroupChange} className="flex flex-col gap-3">
            {CheckList?.map((item) => <Check.Box label={item.content} size={20} key={item.id} value={item.id} />)}
          </Check.Group>
          <div className="flex flex-row items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <Typography variant="body3">에세이에 사용한 단어 수를 입력해주세요</Typography>
            <Input.Basic
              size={32}
              placeholder="예) 3600"
              type="text"
              inputMode="numeric"
              className="w-[200px]"
              onInput={handleCharCountChange}
              {...register('charCount', { valueAsNumber: true, required: true, validate: (value) => !!value })}
            />
          </div>
        </section>
        <section className="flex flex-col gap-4 py-8">
          <Typography variant="title3">학문적 진실성 동의</Typography>
          <Typography variant="body2" className="rounded-lg bg-gray-50 px-4 py-[13px]">
            소논문은 전적으로 학생 본인에 의해 쓰였으며, 인용하였다고 출처 표시를 한 부분을 제외하고 어떠한 부분도 다른
            저자(인공지능)의 자료를 사용하지 않았음을 약속합니다. 추후 학업적 진실성에 어긋난다고 확인되는 경우 IB
            졸업장이 취소될 수 있음을 인지하고 있습니다.
          </Typography>
          <span className="flex flex-row items-center justify-start gap-2">
            <Check.Basic checked={checked} onChange={() => setChecked(!checked)} />
            <Typography variant="title3" className="cursor-pointer" onClick={() => setChecked(!checked)}>
              위 내용을 확인 하였으며, 동의합니다.
            </Typography>
          </span>
        </section>
      </>
    ) : (
      <section className="flex flex-col gap-4">
        <Typography variant="body1">최대 10MB까지 PDF 파일만 첨부할 수 있습니다.</Typography>
        {[...documentObjectMap].length > 0 ? (
          <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            {[...documentObjectMap].map(([key, value]) => {
              return typeof value.document === 'string' ? (
                <Typography variant="body2" className="max-w-[427px] font-medium" key={key}>
                  {getFileNameFromUrl(value.document)}
                </Typography>
              ) : (
                <Typography variant="body2" className="max-w-[427px] font-medium" key={key}>
                  {value.document.name}
                </Typography>
              )
            })}
            <label className="cursor-pointer" onClick={() => resetDocuments()}>
              <div className="flex h-8 min-w-[64px] items-center rounded-[6px] border border-gray-400 bg-white px-3 text-[14px] font-medium text-gray-900 active:border-gray-100 active:bg-gray-400 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-200 disabled:text-gray-400">
                다시 첨부하기
              </div>
            </label>
          </div>
        ) : (
          <ImageNFileUpload accept=".pdf" onChange={handleDocumentAddWithLimit} />
        )}
      </section>
    )

  const footerButtons =
    type === 'view' ? null : type === 'update_check' ? (
      <ButtonV2
        type="submit"
        variant="solid"
        color="orange800"
        size={48}
        onClick={handleSubmit(onSubmit)}
        disabled={!isValid || !checked}
      >
        저장하기
      </ButtonV2>
    ) : step === 0 ? (
      <ButtonV2
        type="button"
        variant="solid"
        color="orange800"
        size={48}
        onClick={() => setStep(1)}
        disabled={!isValid || !checked}
      >
        다음
      </ButtonV2>
    ) : (
      <>
        {type === 'create' && (
          <ButtonV2 type="button" variant="solid" color="gray100" size={48} onClick={() => setStep(0)}>
            이전
          </ButtonV2>
        )}
        <ButtonV2
          type="submit"
          variant="solid"
          color="orange800"
          size={48}
          onClick={handleSubmit(onSubmit)}
          disabled={[...documentObjectMap.values()].length === 0 || isUploadLoading}
        >
          저장하기
        </ButtonV2>
      </>
    )

  return (
    <PopupModal
      modalOpen={modalOpen}
      setModalClose={setModalClose}
      title={
        type === 'update'
          ? '체크리스트 수정'
          : type === 'view'
            ? '체크리스트 확인'
            : step === 0
              ? '체크리스트 작성'
              : '에세이 업로드'
      }
      footerButtons={footerButtons}
      bottomBorder={type !== 'view' && step === 0}
      ablePropragation={ablePropragation}
    >
      <>
        {(isLoading || isUpdateCheckList || isUpdateCheckListTeacher || isCreateEssay || isUpdateEssay) && (
          <IBBlank type="section-opacity" />
        )}
        <form>{content}</form>
      </>
      {alertMessage && (
        <AlertV2
          confirmText="확인"
          message={alertMessage}
          description={alertDescription}
          onConfirm={() => {
            setAlertMessage(null)
            setAlertDescription(undefined)
          }}
        />
      )}
    </PopupModal>
  )
}
