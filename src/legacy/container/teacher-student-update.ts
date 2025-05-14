import { ChangeEvent, useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { useCounselingSendParentSignUpV2, useCounselingUpdateStudent } from '@/legacy/generated/endpoint'
import { UploadFileTypeEnum } from '@/legacy/generated/model'
import { useFileUpload } from '@/legacy/hooks/useFileUpload'
import { errorType } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { checkFileSizeLimit100MB } from '@/legacy/util/file'
import { Validator } from '@/legacy/util/validator'
import { useNotificationStore } from '@/stores2/notification'

export function useTeacherStudentUpdate() {
  const { setToast: setToastMsg } = useNotificationStore()

  const [isEditMode, setIsEditMode] = useState(false)
  const [studentInfo, setStudentInfo] = useState<any>()
  const [studentId, setStudentId] = useState<any>()
  const [name, setName] = useState(studentInfo?.name)
  const [nickName, setNickName] = useState(studentInfo?.nickName)
  const [phone, setPhone] = useState(studentInfo?.phone)
  const [barcode, setBarcode] = useState(studentInfo?.barcode)
  const [hopePath, setHopePath] = useState(studentInfo?.hopePath)
  const [hopeMajor, setHopeMajor] = useState(studentInfo?.hopeMajor)
  const [nokName, setNokName] = useState(studentInfo?.nokName)
  const [nokPhone, setNokPhone] = useState(studentInfo?.nokPhone)
  const [expired, setExpired] = useState(studentInfo?.expired)
  const [expiredReason, setExpiredReason] = useState(studentInfo?.expiredReason)
  const [, setNotAttend] = useState(studentInfo?.notAttend)
  const [profile, setProfile] = useState(studentInfo?.profile)
  const [birthDate, setBirthDate] = useState(
    studentInfo?.birthDate ? DateUtil.formatDate(studentInfo?.birthDate, DateFormat['YYYY-MM-DD']) : '',
  )

  const { handleUploadFile } = useFileUpload()

  useEffect(() => {
    if (studentId !== studentInfo?.id) {
      setName(studentInfo?.name)
      setNickName(studentInfo?.nickName)
      setStudentId(studentInfo?.id)
      setPhone(studentInfo?.phone)
      setBarcode(studentInfo?.barcode)
      setHopePath(studentInfo?.hopePath)
      setHopeMajor(studentInfo?.hopeMajor)
      setNokName(studentInfo?.nokName)
      setNokPhone(studentInfo?.nokPhone)
      setExpired(studentInfo?.expired)
      setExpiredReason(studentInfo?.expiredReason)
      setProfile(studentInfo?.profile)
      setBirthDate(studentInfo?.birthDate ? DateUtil.formatDate(studentInfo?.birthDate, DateFormat['YYYY-MM-DD']) : '')
      setIsEditMode(false)
    }
  }, [studentInfo])

  const { mutate: updateStudentMutate, isLoading } = useCounselingUpdateStudent({
    mutation: {
      onSuccess: () => {
        setIsEditMode(false)
        setToastMsg('학생 정보가 수정되었습니다.')
      },
      onError: (error) => {
        setToastMsg(error?.message || '학생 정보 수정 중 오류가 발생하였습니다.')
      },
    },
  })

  const updateStudent = () => {
    if (studentInfo) {
      updateStudentMutate({
        id: studentInfo.id,
        data: {
          name: name || '',
          nickName: nickName || '',
          phone: phone || '',
          barcode: barcode || '',
          hopePath: hopePath || '',
          hopeMajor: hopeMajor || '',
          profile: profile || '',
          nokName: nokName || '',
          nokPhone: nokPhone || '',
          expired: expired || false,
          expiredReason: expiredReason || '',
          birthDate: birthDate || '',
        },
      })
    }
  }

  const { mutate: sendParentSignUpV2Mutate } = useCounselingSendParentSignUpV2({
    mutation: {
      onSuccess: () => {
        alert('보호자 회원가입 메시지 발송이 완료되었습니다.')
      },
      onError: (error) => {
        const errorMsg: errorType | undefined = error?.response?.data as errorType
        alert(errorMsg?.message || '메시지 발송 중 오류가 발생하였습니다.')
      },
    },
  })

  const toggleImageDelete = () => {
    setProfile('')
  }

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const selectedImageFiles = (e.target as HTMLInputElement).files
    if (!selectedImageFiles || !selectedImageFiles.length) {
      return
    }

    if (!Validator.fileNameRule(selectedImageFiles[0].name)) {
      alert('특수문자(%, &, ?, ~)가 포함된 파일명은 사용할 수 없습니다.')
      return
    }

    if (!checkFileSizeLimit100MB([selectedImageFiles[0]])) {
      alert('한번에 최대 100MB까지만 업로드 가능합니다.')
      return
    }

    const imageFileNames = await handleUploadFile(UploadFileTypeEnum['userpictures'], [selectedImageFiles[0]])

    setProfile(imageFileNames[0])
  }

  return {
    isEditMode,
    setIsEditMode,
    name,
    setName,
    nickName,
    setNickName,
    phone,
    setPhone,
    barcode,
    setBarcode,
    hopePath,
    setHopePath,
    hopeMajor,
    setHopeMajor,
    nokName,
    setNokName,
    nokPhone,
    setNokPhone,
    expired,
    setExpired,
    expiredReason,
    setExpiredReason,
    setNotAttend,
    profile,
    setProfile,
    birthDate,
    setBirthDate,
    studentInfo,
    setStudentInfo,
    isLoading,
    updateStudent,
    sendParentSignUpV2Mutate,
    handleChangeImage,
    toggleImageDelete,
  }
}
