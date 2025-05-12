import { useState } from 'react'
import { useStudentPropertyCreateOrUpdate, useStudentPropertyFindByStudentId } from '@/legacy/generated/endpoint'

type Props = {
  studentId: number
}

export function useStudentPropertyUpdate({ studentId }: Props) {
  const [isEditMode, setIsEditMode] = useState(false)

  const [resolution, setResolution] = useState<any>({})
  const [hopeUnivMajor, setHopeUnivMajor] = useState<any>({})
  const [admission, setAdmission] = useState<any>({})
  const [joinGroup, setJoinGroup] = useState<any>({})
  const [schoolOrigin, setSchoolOrigin] = useState<any>({})
  const [extraCurricular, setExtraCurricular] = useState<any>({})
  const [selfStudy, setSelfStudy] = useState<any>({})

  const [motto, setMotto] = useState('')
  const [hopeCareerPath, setHopeCareerPath] = useState('')

  const [lastUpdateAt, setLastUpdateAt] = useState<string | undefined>()

  const { refetch } = useStudentPropertyFindByStudentId(studentId, {
    request: {
      headers: {
        'child-user-id': studentId,
      },
    },
    query: {
      onSuccess: (res) => {
        if (res) {
          setResolution(JSON.parse(res?.resolution || '{}'))
          setHopeUnivMajor(JSON.parse(res?.hopeUnivMajor || '{}'))
          setAdmission(JSON.parse(res?.admission || '{}'))
          setJoinGroup(JSON.parse(res?.joinGroup || '{}'))
          setSchoolOrigin(JSON.parse(res?.schoolOrigin || '{}'))
          setExtraCurricular(JSON.parse(res?.extraCurricular || '{}'))
          setSelfStudy(JSON.parse(res?.selfStudy || '{}'))

          setMotto(res?.motto || '')
          setHopeCareerPath(res?.hopeCareerPath || '')

          setLastUpdateAt(res.updatedAt)
        }
      },
      onError: () => {
        setResolution(JSON.parse('{}'))
        setHopeUnivMajor(JSON.parse('{}'))
        setExtraCurricular(JSON.parse('{}'))
        setAdmission(JSON.parse('{}'))
        setJoinGroup(JSON.parse('{}'))
        setSchoolOrigin(JSON.parse('{}'))
        setSelfStudy(JSON.parse('{}'))

        setMotto('')
        setHopeCareerPath('')
        setLastUpdateAt(undefined)
      },
    },
  })

  const { mutate: updateStudentPropertyMutate } = useStudentPropertyCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        setIsEditMode(false)
      },
    },
    request: {
      headers: {
        'child-user-id': studentId,
      },
    },
  })

  const updateStudentProperty = (
    resolution: string,
    hopeUnivMajor: string,
    admission: string,
    joinGroup: string,
    schoolOrigin: string,
    extraCurricular: string,
    selfStudy: string,
    motto: string,
    hopeCareerPath: string,
  ) => {
    updateStudentPropertyMutate({
      data: {
        studentId,
        resolution,
        hopeUnivMajor,
        admission,
        joinGroup,
        schoolOrigin,
        extraCurricular,
        selfStudy,
        motto,
        hopeCareerPath,
      },
    })
  }

  return {
    isEditMode,
    setIsEditMode,
    resolution,
    setResolution,
    hopeUnivMajor,
    setHopeUnivMajor,
    admission,
    setAdmission,
    joinGroup,
    setJoinGroup,
    schoolOrigin,
    setSchoolOrigin,
    extraCurricular,
    setExtraCurricular,
    selfStudy,
    setSelfStudy,

    motto,
    setMotto,
    hopeCareerPath,
    setHopeCareerPath,

    updateStudentProperty,
    refetch,

    lastUpdateAt,
  }
}
